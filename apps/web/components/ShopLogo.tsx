import type { Shop } from '@kousek/db';
import { PRIMARY_CATEGORIES } from '../lib/primaryCategories';

interface Props {
  shop: Shop;
  size?: number;
}

// Ported from moje-aplikace/src/components/ShopLogo.tsx, simplified: the
// native version colors by the shop's first *tag* (CATEGORIES); this web
// pass doesn't have the 11-tag color set ported yet (only the 5 primary
// categories, see lib/primaryCategories.ts), so it colors by primaryCategory
// instead — same palette family, just one level up the taxonomy.
export function ShopLogo({ shop, size = 48 }: Props) {
  if (shop.logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={shop.logoUrl} alt="" style={{ width: size, height: size, borderRadius: size * 0.22 }} className="object-cover" />;
  }

  const initial = shop.name.trim().charAt(0).toUpperCase();
  const color = PRIMARY_CATEGORIES[shop.primaryCategory].color;

  return (
    <div
      className="flex shrink-0 items-center justify-center text-white"
      style={{ width: size, height: size, borderRadius: size * 0.22, backgroundColor: color, fontSize: size * 0.42, fontWeight: 600 }}
    >
      {initial}
    </div>
  );
}
