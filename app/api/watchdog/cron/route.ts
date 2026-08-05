import 'server-only';
import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { runWatchdogPipeline } from '@/lib/watchdog/pipeline';
import { sendDigestEmail } from '@/lib/watchdog/digest';

// No session cookie reaches this route (excluded from proxy.ts's matcher —
// Vercel Cron calls it directly), so it authenticates itself: Vercel sends
// `Authorization: Bearer $CRON_SECRET` automatically when CRON_SECRET is
// set as an env var, per Vercel's documented cron convention.
function isAuthorized(request: Request): boolean {
  const header = request.headers.get('authorization') ?? '';
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  const headerBuf = Buffer.from(header);
  const expectedBuf = Buffer.from(expected);
  if (headerBuf.length !== expectedBuf.length) return false;
  return timingSafeEqual(headerBuf, expectedBuf);
}

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || !isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const summary = await runWatchdogPipeline();
  await sendDigestEmail(summary.newCandidates.map((c) => ({ id: c.id, title: c.title })));

  return NextResponse.json({
    sourcesChecked: summary.sourcesChecked,
    newCandidates: summary.newCandidates.length,
  });
}
