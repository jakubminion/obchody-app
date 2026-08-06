import 'server-only';

// Ported from moje-aplikace/scripts/geocode-locations.mjs — same proven
// approach (query-variant fallback, Prague-district-only detection), just
// reusable as a server-side function instead of a one-off CLI script.

// Nominatim's usage policy requires a User-Agent that identifies the app
// AND gives a way to contact its operator.
const NOMINATIM_UA = 'obchody-app-event-watchdog/1.0 (event candidate geocoding; contact: jakub.vranek@seznam.cz)';
const MIN_REQUEST_INTERVAL_MS = 1100; // policy: max 1 request/second

// Module-scope so the ≤1 req/s limit holds across the *whole* pipeline run,
// not just between the variant-fallback attempts for a single address —
// buildAndInsertCandidate() calls geocodeAddress() once per event on a
// source's page, back to back, and most addresses resolve on their first
// variant, so without a limiter shared across calls those would fire with
// no delay between them at all.
let lastRequestAt = 0;

async function throttle(): Promise<void> {
  const wait = lastRequestAt + MIN_REQUEST_INTERVAL_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastRequestAt = Date.now();
}

export interface GeocodeResult {
  lat: number;
  lng: number;
}

function cleanAddress(address: string): string {
  return address.replace(/\s*\([^)]*\)/g, '').trim();
}

function queryVariants(address: string): string[] {
  const clean = cleanAddress(address);
  const variants = [`${clean}, Czechia`];
  const parts = clean.split(',').map((p) => p.trim());
  if (parts.length >= 3) {
    variants.push(`${parts[0]}, ${parts[parts.length - 1]}, Czechia`);
  }
  if (!/praha/i.test(clean)) {
    variants.push(`${clean}, Praha, Czechia`);
  }
  return variants;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function geocodeOnce(query: string): Promise<GeocodeResult | null> {
  await throttle();
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=cz&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { 'User-Agent': NOMINATIM_UA } });
  if (!res.ok) throw new Error(`Nominatim HTTP ${res.status} for "${query}"`);
  const results = (await res.json()) as { lat: string; lon: string }[];
  if (results.length === 0) return null;
  return { lat: Number(results[0].lat), lng: Number(results[0].lon) };
}

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  for (const query of queryVariants(address)) {
    const result = await geocodeOnce(query);
    if (result) return result;
  }
  return null;
}
