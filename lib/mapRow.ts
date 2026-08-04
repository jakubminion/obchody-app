import type { Category, Location, PrimaryCategory, Shop, WeekdayHours } from './types';

interface LocationRow {
  id: string;
  shop_id: string;
  label: string | null;
  address: string;
  lat: number;
  lng: number;
  google_place_id: string | null;
  opening_hours: WeekdayHours[] | null;
  hours_unverified: boolean;
  city: string;
}

interface ShopRow {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  logotype_url: string | null;
  keyword_description: string;
  curator_note: string | null;
  primary_category: PrimaryCategory;
  tags: Category[];
  gift_price_min: number | null;
  gift_price_max: number | null;
  photos: string[];
  website_url: string | null;
  instagram_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
  locations: LocationRow[];
}

export function mapLocationRow(row: LocationRow): Location {
  return {
    id: row.id,
    label: row.label,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    googlePlaceId: row.google_place_id,
    openingHours: row.opening_hours,
    hoursUnverified: row.hours_unverified,
    city: row.city,
  };
}

export function mapShopRow(row: ShopRow): Shop {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    logoUrl: row.logo_url,
    logotypeUrl: row.logotype_url,
    keywordDescription: row.keyword_description,
    curatorNote: row.curator_note,
    primaryCategory: row.primary_category,
    tags: row.tags ?? [],
    giftPriceMin: row.gift_price_min,
    giftPriceMax: row.gift_price_max,
    photos: row.photos ?? [],
    websiteUrl: row.website_url,
    instagramUrl: row.instagram_url,
    published: row.published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    locations: (row.locations ?? []).map(mapLocationRow),
  };
}
