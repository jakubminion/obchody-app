import type { WeekdayHours } from './types';

// A discriminated result, not a formatted string — display text is a UI
// concern, and each app (mobile, web) picks its own Czech phrasing for the
// same underlying fact. Ported from the mobile app's openingStatus(), which
// returned pre-formatted strings tied to its own i18n module; that
// coupling doesn't belong in a package shared with a second app.
export type OpeningStatus =
  | { kind: 'unknown' }
  | { kind: 'open'; closesAt: string }
  | { kind: 'closed-opens-today'; opensAt: string }
  | { kind: 'closed-opens-tomorrow'; opensAt: string }
  | { kind: 'closed-indefinite' };

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function hoursForWeekday(hours: WeekdayHours[], weekday: number): WeekdayHours | undefined {
  return hours.find((h) => h.weekday === weekday);
}

export function openingStatus(hours: WeekdayHours[] | null, now: Date = new Date()): OpeningStatus {
  if (!hours) {
    return { kind: 'unknown' };
  }

  const currentWeekday = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const today = hoursForWeekday(hours, currentWeekday);
  if (today) {
    for (const interval of today.intervals) {
      const open = toMinutes(interval.open);
      const close = toMinutes(interval.close);
      if (currentMinutes >= open && currentMinutes < close) {
        return { kind: 'open', closesAt: interval.close };
      }
    }
    const nextToday = today.intervals
      .filter((interval) => toMinutes(interval.open) > currentMinutes)
      .sort((a, b) => toMinutes(a.open) - toMinutes(b.open))[0];
    if (nextToday) {
      return { kind: 'closed-opens-today', opensAt: nextToday.open };
    }
  }

  for (let offset = 1; offset <= 7; offset += 1) {
    const weekday = (currentWeekday + offset) % 7;
    const dayHours = hoursForWeekday(hours, weekday);
    const firstInterval = dayHours?.intervals
      .slice()
      .sort((a, b) => toMinutes(a.open) - toMinutes(b.open))[0];
    if (firstInterval) {
      if (offset === 1) {
        return { kind: 'closed-opens-tomorrow', opensAt: firstInterval.open };
      }
      return { kind: 'closed-indefinite' };
    }
  }

  return { kind: 'closed-indefinite' };
}
