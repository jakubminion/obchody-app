import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

// Next.js calls this for errors during rendering/Server Actions that
// aren't otherwise caught — this is what makes a failing Server Action
// (e.g. a broken saveShop/saveEvent call) show up in Sentry without the
// curator or me needing to go read Vercel's function logs.
export const onRequestError = Sentry.captureRequestError;
