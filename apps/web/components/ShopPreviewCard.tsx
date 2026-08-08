'use client';

import Link from 'next/link';
import type { Location, Shop } from '@kousek/db';
import { formatDistance } from '@kousek/db';
import { ShopLogo } from './ShopLogo';

interface Props {
  shop: Shop;
  location: Location;
  distanceMeters: number | null;
}

// Ported from moje-aplikace/src/components/{ShopPreviewCard,ShopCardBody}.tsx
// (merged into one file — web has only this one consumer, unlike mobile
// where ShopCardBody was split out for reuse elsewhere).
export function ShopPreviewCard({ shop, location, distanceMeters }: Props) {
  return (
    <Link
      href={`/obchod/${shop.slug}`}
      className="pointer-events-auto absolute bottom-24 left-4 right-4 z-20 flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-lg"
    >
      {shop.logotypeUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={shop.logotypeUrl} alt="" className="h-8 w-8 shrink-0 object-contain" />
      ) : (
        <ShopLogo shop={shop} size={52} />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-ink">
          {shop.name}
          {location.label ? ` · ${location.label}` : ''}
        </p>
        <p className="truncate text-xs text-ink-secondary">{shop.keywordDescription}</p>
        <div className="mt-0.5 flex gap-2.5">
          {distanceMeters !== null && (
            <span className="text-[11px] font-medium text-ink-tertiary">{formatDistance(distanceMeters)}</span>
          )}
          {shop.giftPriceMin !== null && shop.giftPriceMax !== null && (
            <span className="text-[11px] font-medium text-ink-tertiary">
              dárek od {shop.giftPriceMin}–{shop.giftPriceMax} Kč
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
