import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isValidSessionValue, SESSION_COOKIE_NAME } from './lib/auth';

export function proxy(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (isValidSessionValue(session)) {
    return NextResponse.next();
  }
  const loginUrl = new URL('/login', request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    // Everything except /login itself, static assets, and the favicon.
    '/((?!login|_next/static|_next/image|favicon.ico).*)',
  ],
};
