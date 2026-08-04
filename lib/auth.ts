import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'obchody_admin_session';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function sign(value: string): string {
  return createHmac('sha256', process.env.SESSION_SECRET!).update(value).digest('hex');
}

// value = "<issuedAtMs>.<hmac(issuedAtMs)>" — no user identity to carry
// since this is a single shared-password admin, just a proof the request
// went through /login within the TTL window.
export function createSessionCookieValue(): string {
  const issuedAt = Date.now().toString();
  return `${issuedAt}.${sign(issuedAt)}`;
}

export function isValidSessionValue(value: string | undefined): boolean {
  if (!value) return false;
  const [issuedAt, signature] = value.split('.');
  if (!issuedAt || !signature) return false;
  const expected = sign(issuedAt);
  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signature);
  if (expectedBuf.length !== actualBuf.length) return false;
  if (!timingSafeEqual(expectedBuf, actualBuf)) return false;
  return Date.now() - Number(issuedAt) < SESSION_TTL_MS;
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;

// Every Server Action that mutates data must call this first — Proxy
// (proxy.ts) gates page navigation, but Next.js explicitly documents that
// Server Actions are reachable directly by POST even if a page route is
// excluded from the Proxy matcher, so each action re-checks independently.
export async function requireAuth(): Promise<void> {
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;
  if (!isValidSessionValue(value)) {
    throw new Error('Unauthorized');
  }
}
