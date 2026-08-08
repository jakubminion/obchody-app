import type { WeekdayHours } from './types';

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function hoursForWeekday(hours: WeekdayHours[], weekday: number): WeekdayHours | undefined {
  return hours.find((h) => h.weekday === weekday);
}

export function isOpenNow(hours: WeekdayHours[] | null, now: Date = new Date()): boolean {
  if (!hours) return false;
  const today = hoursForWeekday(hours, now.getDay());
  if (!today) return false;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return today.intervals.some(
    (interval) => currentMinutes >= toMinutes(interval.open) && currentMinutes < toMinutes(interval.close),
  );
}
