// The single source of truth for the shops/locations shape — previously
// hand-duplicated (and drifting) between the admin panel and the mobile
// app. Both consumers import this instead of maintaining their own copy.
export type Category =
  | 'BOOKS'
  | 'CLOTHING'
  | 'MUSIC'
  | 'PRINTS'
  | 'JEWELRY'
  | 'PERFUME'
  | 'FLOWERS'
  | 'ANTIQUES'
  | 'COSMETICS'
  | 'CRAFT'
  | 'DESIGN';

export const CATEGORY_LABELS: Record<Category, string> = {
  BOOKS: 'Knihy',
  CLOTHING: 'Oblečení',
  MUSIC: 'Hudba',
  PRINTS: 'Tisky',
  JEWELRY: 'Šperky',
  PERFUME: 'Parfémy',
  FLOWERS: 'Květiny',
  ANTIQUES: 'Starožitnictví',
  COSMETICS: 'Kosmetika',
  CRAFT: 'Řemeslo',
  DESIGN: 'Design',
};

export const CATEGORIES: Category[] = [
  'BOOKS',
  'CLOTHING',
  'MUSIC',
  'PRINTS',
  'JEWELRY',
  'PERFUME',
  'FLOWERS',
  'ANTIQUES',
  'COSMETICS',
  'CRAFT',
  'DESIGN',
];

export type PrimaryCategory =
  | 'ART_BOOKS'
  | 'DESIGN_FASHION'
  | 'VINTAGE_ANTIQUES'
  | 'SCENT_BEAUTY'
  | 'SPECIALTY';

export const PRIMARY_CATEGORY_LABELS: Record<PrimaryCategory, string> = {
  ART_BOOKS: 'Umění a knihy',
  DESIGN_FASHION: 'Design a móda',
  VINTAGE_ANTIQUES: 'Vintage a starožitnosti',
  SCENT_BEAUTY: 'Parfémy a kosmetika',
  SPECIALTY: 'Speciality',
};

export const PRIMARY_CATEGORIES: PrimaryCategory[] = [
  'ART_BOOKS',
  'DESIGN_FASHION',
  'VINTAGE_ANTIQUES',
  'SCENT_BEAUTY',
  'SPECIALTY',
];

export interface OpeningInterval {
  open: string; // "HH:MM"
  close: string; // "HH:MM"
}

export interface WeekdayHours {
  weekday: number; // 0 = Sunday .. 6 = Saturday
  intervals: OpeningInterval[]; // empty = closed all day
}

export interface Location {
  id: string;
  label: string | null; // "Letná" / "CAMP" — shown only when the shop has >1 location
  address: string;
  lat: number;
  lng: number;
  googlePlaceId: string | null;
  openingHours: WeekdayHours[] | null; // null = genuinely unknown, not "closed"
  hoursUnverified: boolean;
  city: string;
}

export interface Shop {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  logotypeUrl: string | null; // full wordmark image
  keywordDescription: string;
  curatorNote: string | null;
  primaryCategory: PrimaryCategory;
  tags: Category[];
  giftPriceMin: number | null; // CZK
  giftPriceMax: number | null; // CZK
  photos: string[];
  websiteUrl: string | null;
  instagramUrl: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  locations: Location[]; // 1..n physical stores
}

export interface AppEvent {
  id: string;
  title: string;
  description: string | null;
  startsAt: string; // ISO date — the first day the event runs
  endsAt: string | null; // ISO date — the last day, or null if single-day
  opensTime: string | null; // "HH:MM", daily opening time within the date range
  closesTime: string | null; // "HH:MM", daily closing time within the date range
  venueName: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  imageUrl: string | null;
  sourceUrl: string | null;
}

// One entry per physical location, not per shop — a multi-branch shop
// contributes one LocationPin per branch.
export interface LocationPin {
  shop: Shop;
  location: Location;
}

export function emptyWeekdayHours(): WeekdayHours[] {
  return Array.from({ length: 7 }, (_, weekday) => ({ weekday, intervals: [] }));
}
