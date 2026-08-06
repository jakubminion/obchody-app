'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { constantTimePasswordEqual, createSessionCookieValue, SESSION_COOKIE_NAME } from '@/lib/auth';
import { checkRateLimit, clearLoginAttempts, recordLoginFailure } from '@/lib/rateLimit';

function formatRetry(seconds: number): string {
  const minutes = Math.ceil(seconds / 60);
  return minutes <= 1 ? 'za chvíli' : `za ${minutes} min`;
}

async function clientIp(): Promise<string> {
  const hdrs = await headers();
  // Vercel sets x-forwarded-for on every request; first entry is the client.
  return hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() || hdrs.get('x-real-ip') || 'unknown';
}

export async function login(_prevState: { error: string } | null, formData: FormData) {
  const ip = await clientIp();

  const limit = await checkRateLimit(ip);
  if (!limit.allowed) {
    return { error: `Příliš mnoho pokusů. Zkuste to znovu ${formatRetry(limit.retryAfterSeconds ?? 0)}.` };
  }

  const password = String(formData.get('password') ?? '');
  const adminPassword = process.env.ADMIN_PASSWORD ?? '';
  if (!password || !adminPassword || !constantTimePasswordEqual(password, adminPassword)) {
    await recordLoginFailure(ip);
    return { error: 'Nesprávné heslo.' };
  }

  await clearLoginAttempts(ip);
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, createSessionCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect('/');
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
  redirect('/login');
}
