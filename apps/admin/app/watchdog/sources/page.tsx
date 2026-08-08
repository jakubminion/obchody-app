import Link from 'next/link';
import { supabaseAdmin } from '@kousek/db/admin';
import type { WatchSourceRow } from '@/lib/watchdog/types';
import { SourcesManager } from './SourcesManager';

export const dynamic = 'force-dynamic';

export default async function SourcesPage() {
  const { data, error } = await supabaseAdmin().from('watch_sources').select('*').order('name');
  if (error) throw error;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Zdroje</h1>
        <Link href="/watchdog" className="text-sm text-neutral-400 hover:text-neutral-700">
          ← Hlídač akcí
        </Link>
      </div>
      <SourcesManager sources={(data ?? []) as WatchSourceRow[]} />
    </div>
  );
}
