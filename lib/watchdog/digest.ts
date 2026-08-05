import 'server-only';
import { Resend } from 'resend';

export interface DigestCandidate {
  id: string;
  title: string | null;
}

// No-ops (with a console warning) until RESEND_API_KEY / WATCHDOG_DIGEST_EMAIL
// are set — the pipeline works without them, the curator just won't get a
// weekly nudge and has to check /watchdog manually.
export async function sendDigestEmail(newCandidates: DigestCandidate[]): Promise<void> {
  if (newCandidates.length === 0) return;

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.WATCHDOG_DIGEST_EMAIL;
  if (!apiKey || !toEmail) {
    console.warn(
      `Watchdog: ${newCandidates.length} new candidate(s) found, but RESEND_API_KEY/WATCHDOG_DIGEST_EMAIL aren't set — skipping the digest email.`,
    );
    return;
  }

  const resend = new Resend(apiKey);
  const titles = newCandidates.map((c) => `- ${c.title ?? '(bez názvu)'}`).join('\n');

  await resend.emails.send({
    from: process.env.WATCHDOG_FROM_EMAIL ?? 'onboarding@resend.dev',
    to: toEmail,
    subject: `Hlídač akcí: ${newCandidates.length} nových kandidátů`,
    text: `Nalezeno ${newCandidates.length} nových kandidátů na akce:\n\n${titles}\n\nZkontrolovat: https://obchody-app-ivee.vercel.app/watchdog`,
  });
}
