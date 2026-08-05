import { describe, expect, it } from 'vitest';
import { buildFingerprint, normalizeForFingerprint } from '../fingerprint';

describe('normalizeForFingerprint', () => {
  it('strips diacritics', () => {
    expect(normalizeForFingerprint('Řemeslný trh')).toBe('remeslny trh');
  });

  it('lowercases and strips punctuation', () => {
    expect(normalizeForFingerprint('Dyzajn Market!')).toBe('dyzajn market');
  });

  it('strips "vol. N" suffixes', () => {
    expect(normalizeForFingerprint('Dyzajn Market vol. 3')).toBe('dyzajn market');
    expect(normalizeForFingerprint('Dyzajn Market vol 12')).toBe('dyzajn market');
  });

  it('strips "ročník N" and "N. ročník" suffixes', () => {
    expect(normalizeForFingerprint('Designblok ročník 25')).toBe('designblok');
    expect(normalizeForFingerprint('Designblok 25. ročník')).toBe('designblok');
  });

  it('collapses repeated whitespace from stripped suffixes', () => {
    expect(normalizeForFingerprint('Trh  vol. 2  na Vnitroblocku')).toBe('trh na vnitroblocku');
  });
});

describe('buildFingerprint', () => {
  it('produces the same fingerprint for near-duplicate scrapes of the same event', () => {
    const a = buildFingerprint({ title: 'Dyzajn Market vol. 3', startsAt: '2026-09-14T10:00:00.000Z', venueName: 'Vnitroblock' });
    const b = buildFingerprint({ title: 'dyzajn market, vol.3!', startsAt: '2026-09-14T18:30:00.000Z', venueName: 'vnitroblock' });
    expect(a).toBe(b); // same date (only day matters) and normalized title
  });

  it('produces different fingerprints for different dates', () => {
    const a = buildFingerprint({ title: 'LUSTR', startsAt: '2026-09-14T10:00:00.000Z', venueName: 'DOX' });
    const b = buildFingerprint({ title: 'LUSTR', startsAt: '2026-09-21T10:00:00.000Z', venueName: 'DOX' });
    expect(a).not.toBe(b);
  });

  it('produces different fingerprints for different titles', () => {
    const a = buildFingerprint({ title: 'MINT Market', startsAt: '2026-09-14T10:00:00.000Z', venueName: null });
    const b = buildFingerprint({ title: 'Dyzajn Market', startsAt: '2026-09-14T10:00:00.000Z', venueName: null });
    expect(a).not.toBe(b);
  });

  it('handles a null date without throwing', () => {
    const fp = buildFingerprint({ title: 'Nějaká akce', startsAt: null, venueName: null });
    expect(fp).toBe('nejaka akce|no-date');
  });

  // Regression: two live extraction runs against the real Designblok
  // calendar page returned differently-worded titles for the same
  // festival ("28. Designblok - ..." vs "Designblok 2026 – ...") *and*
  // venue lists that varied in both content and order between calls —
  // venue was dropped from the key entirely for that reason (see the
  // comment on buildFingerprint), so only title+date need to collapse.
  it('collapses a real observed LLM-wording variance for the same festival', () => {
    const a = buildFingerprint({
      title: 'Designblok 2026 – Prague International Design Festival',
      startsAt: '2026-10-07T00:00:00.000Z',
      venueName: 'Průmyslový palác / Výstaviště',
    });
    const b = buildFingerprint({
      title: '28. Designblok - Prague International Design Festival',
      startsAt: '2026-10-07T00:00:00.000Z',
      venueName: 'Výstaviště, Průmyslový palác a další lokace',
    });
    expect(a).toBe(b);
  });
});
