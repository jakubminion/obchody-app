import type { LocationPin } from './types';

// Every location always gets its own pin (no clustering) — this nudges
// only the pins in a tight real-world cluster apart, by a tiny,
// deterministic amount that fades out as the user zooms in, so branches
// literally metres apart (e.g. three shops on the same street) don't
// render on top of each other and become untappable, while a user zoomed
// in enough to actually navigate always sees each pin at its real
// position, and only the city-wide view sees the spread.
const OVERLAP_THRESHOLD_METERS = 30;
const MAX_SPREAD_METERS = 12;
const CITY_ZOOM_DELTA = 0.03; // matches the map's initial/reset region

const METERS_PER_DEG_LAT = 111_320;
const EARTH_RADIUS_METERS = 6_371_000;

function haversineMeters(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h));
}

// Deterministic 0..1 from a string — no external dependency, stable across
// reloads since it only depends on the location id.
function hashToUnit(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h / 0xffffffff;
}

export interface SpreadPin extends LocationPin {
  spreadLat: number;
  spreadLng: number;
}

export function applyPinSpread(pins: LocationPin[], latitudeDelta: number): SpreadPin[] {
  const groups: LocationPin[][] = [];
  const assigned = new Set<number>();

  for (let i = 0; i < pins.length; i++) {
    if (assigned.has(i)) continue;
    const group = [pins[i]];
    assigned.add(i);
    for (let j = i + 1; j < pins.length; j++) {
      if (assigned.has(j)) continue;
      const dist = haversineMeters(pins[i].location.lat, pins[i].location.lng, pins[j].location.lat, pins[j].location.lng);
      if (dist <= OVERLAP_THRESHOLD_METERS) {
        group.push(pins[j]);
        assigned.add(j);
      }
    }
    groups.push(group);
  }

  // 1 at city-wide zoom, shrinking to 0 as the user zooms in past it —
  // never grows past 1 if the user is zoomed further out than that.
  const zoomFactor = Math.min(1, latitudeDelta / CITY_ZOOM_DELTA);

  const result: SpreadPin[] = [];
  for (const group of groups) {
    if (group.length === 1 || zoomFactor === 0) {
      for (const pin of group) result.push({ ...pin, spreadLat: pin.location.lat, spreadLng: pin.location.lng });
      continue;
    }

    // Target: an evenly-spaced circle around the cluster's own centroid —
    // deliberately independent of the members' real micro-positions, so
    // separation is exactly `radiusMeters` between neighbors regardless of
    // how the real addresses happen to sit relative to each other.
    // Interpolating real position -> target by zoomFactor means a user
    // zoomed in close always sees the true position, and only the
    // city-wide view sees the clean spread.
    const sorted = [...group].sort((a, b) => a.location.id.localeCompare(b.location.id));
    const centroidLat = sorted.reduce((sum, p) => sum + p.location.lat, 0) / sorted.length;
    const centroidLng = sorted.reduce((sum, p) => sum + p.location.lng, 0) / sorted.length;
    const metersPerDegLng = METERS_PER_DEG_LAT * Math.cos((centroidLat * Math.PI) / 180);
    const baseAngle = hashToUnit(sorted.map((p) => p.location.id).join('|')) * Math.PI * 2;

    sorted.forEach((pin, idx) => {
      const angle = baseAngle + (idx * (2 * Math.PI)) / sorted.length;
      const targetLat = centroidLat + (Math.sin(angle) * MAX_SPREAD_METERS) / METERS_PER_DEG_LAT;
      const targetLng = centroidLng + (Math.cos(angle) * MAX_SPREAD_METERS) / metersPerDegLng;
      result.push({
        ...pin,
        spreadLat: pin.location.lat + zoomFactor * (targetLat - pin.location.lat),
        spreadLng: pin.location.lng + zoomFactor * (targetLng - pin.location.lng),
      });
    });
  }

  return result;
}
