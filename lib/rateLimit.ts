import 'server-only';
import { supabaseAdmin } from './supabase';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS_PER_IP = 5;
const MAX_ATTEMPTS_GLOBAL = 50; // blunts distributed attempts across many IPs
const BASE_LOCK_MS = 15 * 60 * 1000;
const MAX_LOCK_MS = 4 * 60 * 60 * 1000; // repeat offenders back off up to 4h

interface AttemptRow {
  key: string;
  count: number;
  window_start: string;
  locked_until: string | null;
  consecutive_lockouts: number;
}

interface LimitCheck {
  allowed: boolean;
  retryAfterSeconds?: number;
}

async function getRow(key: string): Promise<AttemptRow | null> {
  const { data } = await supabaseAdmin.from('login_attempts').select('*').eq('key', key).maybeSingle();
  return data;
}

function isLocked(row: AttemptRow | null, now: Date): number | null {
  if (!row?.locked_until) return null;
  const lockedUntil = new Date(row.locked_until);
  if (lockedUntil <= now) return null;
  return Math.ceil((lockedUntil.getTime() - now.getTime()) / 1000);
}

// Read-only pre-check, called before comparing the password so a locked-out
// caller never even reaches the password comparison.
export async function checkRateLimit(ip: string): Promise<LimitCheck> {
  const now = new Date();
  const [ipRow, globalRow] = await Promise.all([getRow(`ip:${ip}`), getRow('global')]);

  const globalRetry = isLocked(globalRow, now);
  if (globalRetry !== null) return { allowed: false, retryAfterSeconds: globalRetry };

  const ipRetry = isLocked(ipRow, now);
  if (ipRetry !== null) return { allowed: false, retryAfterSeconds: ipRetry };

  return { allowed: true };
}

async function bumpCounter(key: string, maxAttempts: number, now: Date): Promise<void> {
  const row = await getRow(key);
  const windowExpired = !row || now.getTime() - new Date(row.window_start).getTime() > WINDOW_MS;
  const count = (windowExpired ? 0 : row!.count) + 1;
  const windowStart = windowExpired ? now.toISOString() : row!.window_start;

  if (count > maxAttempts) {
    const lockouts = (row?.consecutive_lockouts ?? 0) + 1;
    const lockMs = Math.min(BASE_LOCK_MS * 2 ** (lockouts - 1), MAX_LOCK_MS);
    await supabaseAdmin.from('login_attempts').upsert({
      key,
      count,
      window_start: windowStart,
      locked_until: new Date(now.getTime() + lockMs).toISOString(),
      consecutive_lockouts: lockouts,
    });
    return;
  }

  await supabaseAdmin.from('login_attempts').upsert({
    key,
    count,
    window_start: windowStart,
    locked_until: null,
    consecutive_lockouts: row?.consecutive_lockouts ?? 0,
  });
}

export async function recordLoginFailure(ip: string): Promise<void> {
  const now = new Date();
  await Promise.all([bumpCounter(`ip:${ip}`, MAX_ATTEMPTS_PER_IP, now), bumpCounter('global', MAX_ATTEMPTS_GLOBAL, now)]);
}

export async function clearLoginAttempts(ip: string): Promise<void> {
  await supabaseAdmin.from('login_attempts').delete().eq('key', `ip:${ip}`);
}
