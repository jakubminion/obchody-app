// Fallback date parser — the LLM extraction step is the primary path (it
// resolves Czech date phrases into ISO dates directly, given the current
// date as context). This pure function exists to sanity-check/salvage a
// date when the LLM returns `starts_at: null` but the raw text plainly has
// one, so a real date doesn't get lost to `needs_date` unnecessarily.

const CZECH_MONTHS: Record<string, number> = {
  leden: 1, ledna: 1,
  únor: 2, února: 2,
  březen: 3, března: 3,
  duben: 4, dubna: 4,
  květen: 5, května: 5,
  červen: 6, června: 6,
  červenec: 7, července: 7,
  srpen: 8, srpna: 8,
  září: 9,
  říjen: 10, října: 10,
  listopad: 11, listopadu: 11,
  prosinec: 12, prosince: 12,
};

function resolveYear(month: number, day: number, explicitYear: number | undefined, reference: Date): number {
  if (explicitYear) return explicitYear;
  const year = reference.getFullYear();
  const candidate = new Date(Date.UTC(year, month - 1, day));
  // Roll forward a year if the date (at this year) has already passed —
  // matches the "future only" principle when no year is stated.
  return candidate.getTime() < reference.getTime() ? year + 1 : year;
}

function toIsoDate(year: number, month: number, day: number): string | null {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null; // invalid date, e.g. 31. 4.
  }
  return date.toISOString().slice(0, 10);
}

// Handles: "14. 9.", "14.9.2026", "12.–14. 9." (range — takes the start
// day), "so 14. září", "14. října 2026".
export function parseCzechDateHint(text: string, reference: Date = new Date()): string | null {
  const monthNamePattern = Object.keys(CZECH_MONTHS).join('|');

  const rangeMatch = text.match(/(\d{1,2})\.?\s*[–-]\s*(\d{1,2})\.\s*(\d{1,2})\.(?:\s*(\d{4}))?/);
  if (rangeMatch) {
    const day = Number(rangeMatch[1]);
    const month = Number(rangeMatch[3]);
    const year = resolveYear(month, day, rangeMatch[4] ? Number(rangeMatch[4]) : undefined, reference);
    const iso = toIsoDate(year, month, day);
    if (iso) return iso;
  }

  const monthNameMatch = text.match(new RegExp(`(\\d{1,2})\\.\\s*(${monthNamePattern})(?:\\s+(\\d{4}))?`, 'i'));
  if (monthNameMatch) {
    const day = Number(monthNameMatch[1]);
    const month = CZECH_MONTHS[monthNameMatch[2].toLowerCase()];
    const year = resolveYear(month, day, monthNameMatch[3] ? Number(monthNameMatch[3]) : undefined, reference);
    const iso = toIsoDate(year, month, day);
    if (iso) return iso;
  }

  const numericMatch = text.match(/(\d{1,2})\.\s*(\d{1,2})\.(?:\s*(\d{4}))?/);
  if (numericMatch) {
    const day = Number(numericMatch[1]);
    const month = Number(numericMatch[2]);
    if (month >= 1 && month <= 12) {
      const year = resolveYear(month, day, numericMatch[3] ? Number(numericMatch[3]) : undefined, reference);
      const iso = toIsoDate(year, month, day);
      if (iso) return iso;
    }
  }

  return null;
}
