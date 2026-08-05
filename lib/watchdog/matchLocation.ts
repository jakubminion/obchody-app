import 'server-only';
import { getShops } from '../data';
import { normalizeForFingerprint } from './fingerprint';

interface LocationCandidate {
  locationId: string;
  normalizedNames: string[];
}

let cache: LocationCandidate[] | null = null;

async function loadCandidates(): Promise<LocationCandidate[]> {
  if (cache) return cache;
  const shops = await getShops();
  cache = shops.flatMap((shop) =>
    shop.locations.map((location) => ({
      locationId: location.id,
      normalizedNames: [normalizeForFingerprint(shop.name), ...(location.label ? [normalizeForFingerprint(location.label)] : [])],
    })),
  );
  return cache;
}

// Small dataset (~50 locations) — normalized exact/substring match against
// each location's shop name or label. Good enough for the brief's stated
// goal ("Vnitroblock" links to the known location instead of a duplicate
// address); returns null (→ venue_unmatched flag) rather than guessing.
export async function matchVenueToLocation(venueName: string | null): Promise<string | null> {
  if (!venueName) return null;
  const normalizedVenue = normalizeForFingerprint(venueName);
  if (!normalizedVenue) return null;

  const candidates = await loadCandidates();

  for (const candidate of candidates) {
    if (candidate.normalizedNames.includes(normalizedVenue)) return candidate.locationId;
  }
  for (const candidate of candidates) {
    if (candidate.normalizedNames.some((name) => name.length > 3 && (normalizedVenue.includes(name) || name.includes(normalizedVenue)))) {
      return candidate.locationId;
    }
  }
  return null;
}
