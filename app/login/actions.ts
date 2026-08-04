'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSessionCookieValue, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function login(_prevState: { error: string } | null, formData: FormData) {
  const password = String(formData.get('password') ?? '');
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return { error: 'Nesprávné heslo.' };
  }
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
