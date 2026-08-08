import type { AppEvent } from '@kousek/db';

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAY_SHORT = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function eventStartDate(event: AppEvent): Date {
  return startOfDay(new Date(event.startsAt));
}

function eventEndDate(event: AppEvent): Date {
  return endOfDay(new Date(event.endsAt ?? event.startsAt));
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function shortDate(d: Date): string {
  return `${WEEKDAY_SHORT[d.getDay()]} ${d.getDate()}. ${d.getMonth() + 1}.`;
}

function fullDate(d: Date): string {
  return `${WEEKDAY_SHORT[d.getDay()]} ${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`;
}

// Ported from moje-aplikace/src/utils/eventStatus.ts's formatting half —
// the boolean logic (isEventLive etc.) moved to packages/db, this Czech
// text stays app-local, same split as openingStatus's formatting.
export function formatEventDateLabel(event: AppEvent, now: Date = new Date()): string {
  const start = eventStartDate(event);
  const end = eventEndDate(event);
  const tomorrow = new Date(startOfDay(now).getTime() + DAY_MS);

  if (isSameDay(start, end)) {
    if (isSameDay(start, now)) return 'Dnes';
    if (isSameDay(start, tomorrow)) return 'Zítra';
    return shortDate(start);
  }
  return `${start.getDate()}.–${end.getDate()}. ${end.getMonth() + 1}.`;
}

export function formatEventDateLabelFull(event: AppEvent): string {
  const start = eventStartDate(event);
  const end = eventEndDate(event);
  return isSameDay(start, end) ? fullDate(start) : `${fullDate(start)} – ${fullDate(end)}`;
}

export function formatEventHoursLabel(event: AppEvent): string | null {
  return event.opensTime && event.closesTime ? `${event.opensTime}–${event.closesTime}` : null;
}
