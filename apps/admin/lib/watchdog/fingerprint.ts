// Dedup key for event candidates — this is what implements "rejection
// memory" (brief principle 4): once a fingerprint exists in either
// event_candidates or events, a matching future extraction is skipped.

// Same diacritics-stripping approach as slugify() in app/actions.ts, plus
// stripping of recurring edition/volume suffixes so "Dyzajn Market vol. 2"
// and "Dyzajn Market vol. 3" don't collide, but "Dyzajn Market" scraped
// twice with slightly different whitespace/casing does.
export function normalizeForFingerprint(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics first — "ročník" becomes "rocnik" below
    .toLowerCase()
    .replace(/\bvol\.?\s*\d+\b/g, '')
    .replace(/\brocnik\s*\d+\b/g, '')
    .replace(/\b\d+\.\s*rocnik\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export interface FingerprintInput {
  title: string;
  startsAt: string | null; // ISO date or null
  // Accepted but deliberately unused below — see the comment on
  // buildFingerprint. Kept in the input shape so call sites don't need to
  // change if venue ever becomes usable again.
  venueName: string | null;
}

// The LLM extractor doesn't word two calls against the same real event
// identically — observed live against a real multi-venue festival page
// (Designblok): title varied ("28. Designblok - ..." vs "Designblok 2026
// – ..."), and — more persistently — the venue list varied in both
// content *and order* between calls ("Průmyslový palác / Výstaviště" vs
// "Výstaviště, Průmyslový palác a další lokace"), so no normalization of
// the venue string stayed stable across repeated extractions of the same
// event. Title-normalization fixes (leading edition number, bare year)
// are cheap and kept below; venue was dropped from the key entirely
// rather than chasing an ever-more-elaborate venue-matching heuristic —
// the brief itself lists venue as parenthetical ("title + date (+
// venue)"), and a same-title/same-day collision between two genuinely
// different events is a much rarer failure than the duplicate leakage
// this caused in practice.
function normalizeTitle(title: string): string {
  const withoutEdition = title.replace(/^\d+\.\s*/, '');
  const withoutYear = withoutEdition.replace(/\b(19|20)\d{2}\b/g, '');
  return normalizeForFingerprint(withoutYear);
}

export function buildFingerprint({ title, startsAt }: FingerprintInput): string {
  const datePart = startsAt ? startsAt.slice(0, 10) : 'no-date';
  return `${normalizeTitle(title)}|${datePart}`;
}
