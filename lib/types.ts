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
  categories: Category[];
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
