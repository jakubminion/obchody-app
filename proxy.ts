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
    // Everything except /login, the watchdog cron endpoint (no session
    // cookie — authenticated by its own bearer-secret check instead),
    // static assets, and the favicon.
    '/((?!login|api/watchdog|_next/static|_next/image|favicon.ico).*)',
  ],
};
