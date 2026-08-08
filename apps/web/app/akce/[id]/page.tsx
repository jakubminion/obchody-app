import Image from 'next/image';
import { notFound } from 'next/navigation';
import { isEventLive, mapEventRow, supabasePublic, type AppEvent } from '@kousek/db';
import { formatEventDateLabelFull, formatEventHoursLabel } from '../../../lib/eventFormat';

export const revalidate = 3600;

async function getAllIds(): Promise<string[]> {
  const { data, error } = await supabasePublic().from('events').select('id').eq('published', true);
  if (error) throw error;
  return (data ?? []).map((row) => row.id as string);
}

export async function generateStaticParams() {
  const ids = await getAllIds();
  return ids.map((id) => ({ id }));
}

async function getEventById(id: string): Promise<AppEvent | null> {
  const { data, error } = await supabasePublic()
    .from('events')
    .select('*')
    .eq('id', id)
    .eq('published', true)
    .maybeSingle();
  if (error) throw error;
  return data ? mapEventRow(data) : null;
}

function directionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export default async function EventPage(props: PageProps<'/akce/[id]'>) {
  const { id } = await props.params;
  const event = await getEventById(id);
  if (!event) notFound();

  const live = isEventLive(event);
  const hoursLabel = formatEventHoursLabel(event);
  const hasCoords = event.lat !== null && event.lng !== null;

  return (
    <main className="mx-auto max-w-2xl pb-16">
      {event.imageUrl && (
        <div className="relative aspect-[4/3] w-full bg-border">
          <Image src={event.imageUrl} alt="" fill sizes="(max-width: 672px) 100vw, 672px" priority className="object-cover" />
        </div>
      )}

      <div className="flex flex-col gap-1.5 p-5">
        {live && (
          <span className="mb-1.5 inline-flex w-fit items-center gap-1.5 rounded-xl bg-accent px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            <span className="text-xs font-bold text-white">Dnes</span>
          </span>
        )}

        <h1 className="text-2xl font-bold text-ink">{event.title}</h1>

        <hr className="my-2.5 border-border" />

        <p className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary">Kdy</p>
        <p className="mt-0.5 text-[15px] text-ink">{formatEventDateLabelFull(event)}</p>
        {hoursLabel && (
          <>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-ink-tertiary">Otevírací doba</p>
            <p className="mt-0.5 text-[15px] text-ink">{hoursLabel}</p>
          </>
        )}

        {(event.venueName || event.address) && (
          <>
            <hr className="my-2.5 border-border" />
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary">Místo</p>
            {event.venueName && <p className="mt-0.5 text-[15px] text-ink">{event.venueName}</p>}
            {event.address && <p className="text-[13px] text-ink-secondary">{event.address}</p>}
          </>
        )}

        {event.description && (
          <>
            <hr className="my-2.5 border-border" />
            <p className="text-[15px] leading-relaxed text-ink">{event.description}</p>
          </>
        )}

        {hasCoords && (
          <a
            href={directionsUrl(event.lat!, event.lng!)}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-ink py-3.5 text-[15px] font-semibold text-surface"
          >
            Navigovat
          </a>
        )}

        {event.sourceUrl && (
          <a
            href={event.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex items-center justify-center gap-1.5 py-2 text-[13px] text-ink-secondary"
          >
            Zdroj
          </a>
        )}
      </div>
    </main>
  );
}
