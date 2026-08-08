import Image from 'next/image';
import Link from 'next/link';
import type { Shop } from '@kousek/db';
import { formatDistance } from '@kousek/db';
import { rememberView } from '../lib/lastView';

interface Props {
  shop: Shop;
  distanceMeters: number | null;
  locationLabel?: string | null;
}

// Ported from moje-aplikace/src/components/ShopListItem.tsx — full-bleed
// photo, dark gradient, white-ink logotype watermark, name/keyword/
// distance. Fixed colors (not theme-reactive) on purpose, same as the
// native version: this tile is always a photo with a dark overlay, never
// the app background, so it stays legible the same way in both themes.
// Favorites are out of scope for this pass (no account-free heart yet).
export function ShopListTile({ shop, distanceMeters, locationLabel }: Props) {
  const photo = shop.photos[0];

  return (
    <Link
      href={`/obchod/${shop.slug}`}
      onClick={() => rememberView('list')}
      className="relative block aspect-[4/3] overflow-hidden rounded-[20px] bg-border"
    >
      {photo && (
        <Image src={photo} alt="" fill sizes="(max-width: 640px) 100vw, 640px" className="object-cover" />
      )}

      {shop.logotypeUrl && (
        <div className="absolute left-0 right-0 top-0 h-16 bg-gradient-to-b from-black/50 to-transparent px-3.5 pt-3.5">
          {/* eslint-disable-next-line @next/next/no-img-element -- small watermark, not worth Next's image pipeline */}
          <img
            src={shop.logotypeUrl}
            alt=""
            className="h-[34px] w-auto max-w-[200px] object-contain object-left"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/70 via-black/5 to-transparent px-3.5 pb-3 pt-10">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-sm font-semibold text-white">
            {shop.name}
            {locationLabel ? ` · ${locationLabel}` : ''}
          </span>
          <span className="truncate text-xs text-white/85">{shop.keywordDescription}</span>
        </div>
        {distanceMeters !== null && (
          <span className="shrink-0 text-xs font-semibold text-white">{formatDistance(distanceMeters)}</span>
        )}
      </div>
    </Link>
  );
}
