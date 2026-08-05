import { describe, expect, it } from 'vitest';
import { buildFingerprint } from '../fingerprint';

// The real dedup check (buildAndInsertCandidate) queries Supabase directly,
// which isn't worth mocking here — this tests the mechanism dedup actually
// relies on: that buildFingerprint is stable enough to catch true repeats
// (same event, reworded/rescraped) while not colliding on real
// coincidences (same venue hosting different events on different weeks).

function simulateDedupRun(existingFingerprints: Set<string>, incoming: { title: string; startsAt: string | null; venueName: string | null }[]) {
  const inserted: string[] = [];
  for (const event of incoming) {
    const fp = buildFingerprint(event);
    if (existingFingerprints.has(fp)) continue;
    existingFingerprints.add(fp);
    inserted.push(fp);
  }
  return inserted;
}

describe('fingerprint-based dedup', () => {
  it('never inserts the same event twice across two pipeline runs (idempotency)', () => {
    const seen = new Set<string>();
    const run1 = [{ title: 'Dyzajn Market', startsAt: '2026-09-14T10:00:00.000Z', venueName: 'Vnitroblock' }];
    const firstRunInserted = simulateDedupRun(seen, run1);
    expect(firstRunInserted).toHaveLength(1);

    // Second run re-scrapes the identical page — same event, same fingerprint.
    const secondRunInserted = simulateDedupRun(seen, run1);
    expect(secondRunInserted).toHaveLength(0);
  });

  it('does not resurface a fingerprint the curator already rejected (rejection memory)', () => {
    // A rejected candidate's fingerprint stays in event_candidates (status
    // changes, the row and its fingerprint don't disappear) — simulated
    // here as already being in the "existing" set regardless of status.
    const alreadySeen = new Set([buildFingerprint({ title: 'Vintage Sample Sale', startsAt: '2026-09-20T00:00:00.000Z', venueName: 'Pragovka' })]);
    const inserted = simulateDedupRun(alreadySeen, [
      { title: 'vintage sample sale!', startsAt: '2026-09-20T15:00:00.000Z', venueName: 'pragovka' },
    ]);
    expect(inserted).toHaveLength(0);
  });

  it('treats the same venue hosting different events on different dates as distinct', () => {
    const seen = new Set<string>();
    const week1 = simulateDedupRun(seen, [{ title: 'MINT Market', startsAt: '2026-09-07T00:00:00.000Z', venueName: 'CAMP' }]);
    const week2 = simulateDedupRun(seen, [{ title: 'MINT Market', startsAt: '2026-09-14T00:00:00.000Z', venueName: 'CAMP' }]);
    expect(week1).toHaveLength(1);
    expect(week2).toHaveLength(1);
  });
});
