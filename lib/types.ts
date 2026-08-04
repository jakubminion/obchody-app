export type Category =
  | 'ART_PRINTS'
  | 'BOOKSTORE'
  | 'PERFUMERY'
  | 'DESIGN_CONCEPT'
  | 'SECONDHAND_VINTAGE'
  | 'VINYL_MUSIC'
  | 'CRAFT_SPECIALTY'
  | 'BEAUTY_COSMETICS'
  | 'PLANTS_FLOWERS';

export const CATEGORY_LABELS: Record<Category, string> = {
  ART_PRINTS: 'Art & tisky',
  SECONDHAND_VINTAGE: 'Second hand & vintage',
  BOOKSTORE: 'Knihkupectví',
  CRAFT_SPECIALTY: 'Řemeslo & speciality',
  PLANTS_FLOWERS: 'Rostliny & květiny',
  DESIGN_CONCEPT: 'Design & concept story',
  PERFUMERY: 'Parfumérie',
  VINYL_MUSIC: 'Vinyl & hudba',
  BEAUTY_COSMETICS: 'Krása & kosmetika',
};

export const CATEGORIES: Category[] = [
  'ART_PRINTS',
  'BOOKSTORE',
  'PERFUMERY',
  'DESIGN_CONCEPT',
  'SECONDHAND_VINTAGE',
  'VINYL_MUSIC',
  'CRAFT_SPECIALTY',
  'BEAUTY_COSMETICS',
  'PLANTS_FLOWERS',
];

export interface OpeningInterval {
  open: string;
  close: string;
}

export interface WeekdayHours {
  weekday: number; // 0 = Sunday .. 6 = Saturday
  intervals: OpeningInterval[];
}

export interface Location {
  id: string;
  label: string | null;
  address: string;
  lat: number;
  lng: number;
  googlePlaceId: string | null;
  openingHours: WeekdayHours[] | null;
  hoursUnverified: boolean;
  city: string;
}

export interface Shop {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  logotypeUrl: string | null;
  keywordDescription: string;
  curatorNote: string | null;
  category: Category;
  giftPriceMin: number | null;
  giftPriceMax: number | null;
  photos: string[];
  websiteUrl: string | null;
  instagramUrl: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  locations: Location[];
}

export function emptyWeekdayHours(): WeekdayHours[] {
  return Array.from({ length: 7 }, (_, weekday) => ({ weekday, intervals: [] }));
}
