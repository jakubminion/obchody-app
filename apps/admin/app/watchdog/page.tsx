import Link from 'next/link';
import { supabaseAdmin } from '@kousek/db/admin';
import type { EventCandidateRow } from '@/lib/watchdog/types';
import { WatchdogQueue } from './WatchdogQueue';

export const dynamic = 'force-dynamic';

export default async function WatchdogPage() {
  const { data, error } = await supabaseAdmin()
    .from('event_candidates')
    .select('*')
    .eq('status', 'pending')
    .order('starts_at', { ascending: true, nullsFirst: false });
  if (error) throw error;

  const candidates = (data ?? []) as EventCandidateRow[];

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Hlídač akcí</h1>
          <p className="text-sm text-neutral-500">{candidates.length} čeká na schválení</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/events" className="text-neutral-500 hover:text-neutral-900">
            Akce
          </Link>
          <Link href="/watchdog/sources" className="text-neutral-500 hover:text-neutral-900">
            Zdroje
          </Link>
          <Link href="/watchdog/ig-inbox" className="text-neutral-500 hover:text-neutral-900">
            IG schránka
          </Link>
          <Link href="/" className="text-neutral-400 hover:text-neutral-700">
            ← Obchody
          </Link>
        </div>
      </div>

      <WatchdogQueue candidates={candidates} />
    </div>
  );
}
