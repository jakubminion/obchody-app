import Image from 'next/image';
import Link from 'next/link';
import type { AppEvent } from '@kousek/db';
import { isEventLive } from '@kousek/db';
import { formatEventDateLabel, formatEventHoursLabel } from '../lib/eventFormat';
import { rememberView } from '../lib/lastView';

interface Props {
  event: AppEvent;
}

// Ported from moje-aplikace/src/components/EventListItem.tsx — image (or a
// calendar-icon placeholder), a "Dnes" live badge, title, venue, date/hours.
export function EventListCard({ event }: Props) {
  const live = isEventLive(event);
  const dateLabel = formatEventDateLabel(event);
  const hoursLabel = formatEventHoursLabel(event);

  return (
    <Link
      href={`/akce/${event.id}`}
      onClick={() => rememberView('events')}
      className="block overflow-hidden rounded-[20px] border border-border bg-surface"
    >
      <div className="relative aspect-[4/3] w-full bg-border">
        {event.imageUrl ? (
          <Image src={event.imageUrl} alt="" fill sizes="(max-width: 640px) 100vw, 640px" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-background text-accent">
            <CalendarIcon />
          </div>
        )}

        {live && (
          <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-xl bg-accent px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            <span className="text-[11px] font-bold text-white">Dnes</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-0.5 p-3">
        <span className="text-base font-bold text-ink">{event.title}</span>
        {event.venueName && <span className="text-xs text-ink-secondary">{event.venueName}</span>}
        <div className="mt-0.5 flex gap-2.5">
          <span className={`text-xs font-semibold ${live ? 'text-accent' : 'text-ink-tertiary'}`}>{dateLabel}</span>
          {hoursLabel && <span className="text-xs font-medium text-ink-tertiary">{hoursLabel}</span>}
        </div>
      </div>
    </Link>
  );
}

function CalendarIcon() {
  return (
    <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x={3} y={5} width={18} height={16} rx={2} />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}
