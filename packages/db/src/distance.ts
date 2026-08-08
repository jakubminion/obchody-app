import type { Location, Shop } from './types';

export interface Coords {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_M = 6371000;

export function distanceMeters(a: Coords, b: Coords): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));

  return EARTH_RADIUS_M * c;
}

export function nearestLocation(shop: Shop, from: Coords): { location: Location; distance: number } {
  let nearest = shop.locations[0];
  let nearestDistance = distanceMeters(from, nearest);
  for (const location of shop.locations.slice(1)) {
    const distance = distanceMeters(from, location);
    if (distance < nearestDistance) {
      nearest = location;
      nearestDistance = distance;
    }
  }
  return { location: nearest, distance: nearestDistance };
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    const rounded = Math.round(meters / 10) * 10;
    return `${rounded} m`;
  }
  const km = meters / 1000;
  const formatted = km.toFixed(1).replace('.', ',');
  return `${formatted} km`;
}
