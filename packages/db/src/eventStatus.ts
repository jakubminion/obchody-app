import type { AppEvent } from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

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

export function isEventRelevant(event: AppEvent, now: Date = new Date()): boolean {
  return eventEndDate(event).getTime() >= now.getTime();
}

// Date-only — "live" means today falls within the event's date range.
// Deliberately ignores opensTime/closesTime (shown separately as plain
// info) so the badge/pin/filter never disagree with each other over an
// hours edge case.
export function isEventLive(event: AppEvent, now: Date = new Date()): boolean {
  const start = eventStartDate(event);
  const end = eventEndDate(event);
  return now.getTime() >= start.getTime() && now.getTime() <= end.getTime();
}

export function isEventUpcomingSoon(event: AppEvent, now: Date = new Date(), withinDays = 7): boolean {
  const start = eventStartDate(event);
  return start.getTime() > now.getTime() && start.getTime() <= now.getTime() + withinDays * DAY_MS;
}
