import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import type { EventRow } from '@/lib/watchdog/types';

export const dynamic = 'force-dynamic';

function formatDateRange(event: EventRow): string {
  const start = new Date(event.starts_at).toLocaleDateString('cs-CZ');
  if (!event.ends_at) return start;
  const end = new Date(event.ends_at).toLocaleDateString('cs-CZ');
  return start === end ? start : `${start} – ${end}`;
}

export default async function EventsListPage() {
  const { data, error } = await supabaseAdmin
    .from('events')
    .select('*')
    .order('starts_at', { ascending: false });
  if (error) throw error;

  const events = (data ?? []) as EventRow[];

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Akce</h1>
          <p className="text-sm text-neutral-500">{events.length} akcí celkem</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/watchdog" className="text-neutral-500 hover:text-neutral-900">
            Hlídač akcí
          </Link>
          <Link href="/" className="text-neutral-400 hover:text-neutral-700">
            ← Obchody
          </Link>
        </div>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-neutral-400">Zatím žádné akce — schvalte kandidáty v Hlídači akcí.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Název</th>
                <th className="px-4 py-3 font-medium">Kdy</th>
                <th className="px-4 py-3 font-medium">Místo</th>
                <th className="px-4 py-3 font-medium">Stav</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <Link href={`/events/${event.id}`} className="font-medium text-neutral-900 hover:underline">
                      {event.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{formatDateRange(event)}</td>
                  <td className="px-4 py-3 text-neutral-600">{event.venue_name ?? '—'}</td>
                  <td className="px-4 py-3">
                    {event.published ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        Publikováno
                      </span>
                    ) : (
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500">
                        Skryto
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
