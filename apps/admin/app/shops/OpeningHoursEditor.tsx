'use client';

import { emptyWeekdayHours, type OpeningInterval, type WeekdayHours } from '@kousek/db';

const WEEKDAY_NAMES = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'];
// Display Monday first even though weekday 0 = Sunday internally.
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

interface Props {
  value: WeekdayHours[] | null;
  onChange: (value: WeekdayHours[] | null) => void;
}

export function OpeningHoursEditor({ value, onChange }: Props) {
  const known = value !== null;
  const hours = value ?? emptyWeekdayHours();

  function updateDay(weekday: number, intervals: OpeningInterval[]) {
    const next = hours.map((d) => (d.weekday === weekday ? { ...d, intervals } : d));
    onChange(next);
  }

  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm text-neutral-700">
        <input
          type="checkbox"
          checked={known}
          onChange={(e) => onChange(e.target.checked ? emptyWeekdayHours() : null)}
        />
        Otevírací doba je známá
      </label>

      {known && (
        <div className="space-y-2 rounded-lg border border-neutral-200 p-3">
          {DISPLAY_ORDER.map((weekday) => {
            const day = hours.find((d) => d.weekday === weekday)!;
            const closed = day.intervals.length === 0;
            return (
              <div key={weekday} className="flex items-center gap-3 text-sm">
                <span className="w-20 shrink-0 text-neutral-600">{WEEKDAY_NAMES[weekday]}</span>
                <label className="flex items-center gap-1 text-xs text-neutral-500">
                  <input
                    type="checkbox"
                    checked={!closed}
                    onChange={(e) =>
                      updateDay(weekday, e.target.checked ? [{ open: '09:00', close: '18:00' }] : [])
                    }
                  />
                  otevřeno
                </label>
                {!closed && (
                  <div className="flex flex-1 flex-wrap items-center gap-2">
                    {day.intervals.map((interval, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <input
                          type="time"
                          value={interval.open}
                          onChange={(e) => {
                            const next = [...day.intervals];
                            next[idx] = { ...next[idx], open: e.target.value };
                            updateDay(weekday, next);
                          }}
                          className="rounded border border-neutral-300 px-1.5 py-0.5 text-xs"
                        />
                        <span className="text-neutral-400">–</span>
                        <input
                          type="time"
                          value={interval.close}
                          onChange={(e) => {
                            const next = [...day.intervals];
                            next[idx] = { ...next[idx], close: e.target.value };
                            updateDay(weekday, next);
                          }}
                          className="rounded border border-neutral-300 px-1.5 py-0.5 text-xs"
                        />
                        {day.intervals.length > 1 && (
                          <button
                            type="button"
                            onClick={() => updateDay(weekday, day.intervals.filter((_, i) => i !== idx))}
                            className="text-neutral-400 hover:text-red-600"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => updateDay(weekday, [...day.intervals, { open: '09:00', close: '18:00' }])}
                      className="text-xs text-neutral-400 hover:text-neutral-700"
                    >
                      + interval
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
