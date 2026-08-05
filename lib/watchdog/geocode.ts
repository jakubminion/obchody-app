import 'server-only';

// Ported from moje-aplikace/scripts/geocode-locations.mjs — same proven
// approach (query-variant fallback, Prague-district-only detection), just
// reusable as a server-side function instead of a one-off CLI script.

const NOMINATIM_UA = 'obchody-app-event-watchdog/1.0 (event candidate geocoding)';

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
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=cz&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { 'User-Agent': NOMINATIM_UA } });
  if (!res.ok) throw new Error(`Nominatim HTTP ${res.status} for "${query}"`);
  const results = (await res.json()) as { lat: string; lon: string }[];
  if (results.length === 0) return null;
  return { lat: Number(results[0].lat), lng: Number(results[0].lon) };
}

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  for (const [i, query] of queryVariants(address).entries()) {
    if (i > 0) await sleep(1100); // Nominatim usage policy: max 1 request/second
    const result = await geocodeOnce(query);
    if (result) return result;
  }
  return null;
}
