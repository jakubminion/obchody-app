'use client';

import { Marker } from '@vis.gl/react-google-maps';
import type { Location, Shop } from '@kousek/db';
import { PRIMARY_CATEGORIES } from '../lib/primaryCategories';
import { shopPinIcon } from '../lib/pinIcon';

interface Props {
  shop: Shop;
  location: Location;
  position: { lat: number; lng: number };
  onClick: (shop: Shop, location: Location) => void;
}

// Ported from moje-aplikace/src/components/MapPin.tsx — same teardrop +
// category-color + emoji design, as a classic Marker icon (see
// lib/pinIcon.ts for why not AdvancedMarker).
export function MapPin({ shop, location, position, onClick }: Props) {
  const meta = PRIMARY_CATEGORIES[shop.primaryCategory];

  return (
    <Marker
      position={position}
      icon={shopPinIcon(meta.color, meta.icon)}
      onClick={() => onClick(shop, location)}
    />
  );
}
