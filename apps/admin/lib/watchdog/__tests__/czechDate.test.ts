import { describe, expect, it } from 'vitest';
import { parseCzechDateHint } from '../czechDate';

const REFERENCE = new Date('2026-08-01T00:00:00.000Z');

describe('parseCzechDateHint', () => {
  it('parses a numeric day.month with an explicit year', () => {
    expect(parseCzechDateHint('Akce se koná 14.9.2026 od 10 hodin.', REFERENCE)).toBe('2026-09-14');
  });

  it('parses a numeric day. month. with no year, rolling forward from the reference date', () => {
    expect(parseCzechDateHint('Trh proběhne 14. 9. na Vnitroblocku.', REFERENCE)).toBe('2026-09-14');
  });

  it('rolls to next year when the stated day/month has already passed this year', () => {
    // Reference is Aug 2026; "14. 3." without a year has already passed this year.
    expect(parseCzechDateHint('Akce 14. 3. v CAMPu.', REFERENCE)).toBe('2027-03-14');
  });

  it('parses a date range, using the start day', () => {
    expect(parseCzechDateHint('Designblok probíhá 12.–14. 9. 2026 v Praze.', REFERENCE)).toBe('2026-09-12');
  });

  it('parses a Czech month name with weekday prefix', () => {
    expect(parseCzechDateHint('so 14. září od 9:00', REFERENCE)).toBe('2026-09-14');
  });

  it('parses a Czech month name with an explicit year', () => {
    expect(parseCzechDateHint('Otevřeno 3. října 2026.', REFERENCE)).toBe('2026-10-03');
  });

  it('returns null when there is no parseable date', () => {
    expect(parseCzechDateHint('Otevírací doba: út–pá 10–18.', REFERENCE)).toBeNull();
  });

  it('returns null for an invalid calendar date', () => {
    expect(parseCzechDateHint('31. 4. 2026 (neexistující datum)', REFERENCE)).toBeNull();
  });
});
