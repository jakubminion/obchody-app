import { PRIMARY_CATEGORY_LABELS, type PrimaryCategory } from '@kousek/db';
import { palette } from './palette';

export interface PrimaryCategoryMeta {
  label: string;
  color: string;
  icon: string;
}

// Ported from moje-aplikace/src/constants/primaryCategories.ts. Only hues
// dark/saturated enough for a white icon on top (≥3:1) are used here —
// creamOlive/creamRust are map-fill-only, see mapStyle.ts.
export const PRIMARY_CATEGORIES: Record<PrimaryCategory, PrimaryCategoryMeta> = {
  ART_BOOKS: { label: PRIMARY_CATEGORY_LABELS.ART_BOOKS, color: palette.orange, icon: '📚' },
  DESIGN_FASHION: { label: PRIMARY_CATEGORY_LABELS.DESIGN_FASHION, color: palette.brownRed, icon: '🧵' },
  VINTAGE_ANTIQUES: { label: PRIMARY_CATEGORY_LABELS.VINTAGE_ANTIQUES, color: palette.rust, icon: '🕰️' },
  SCENT_BEAUTY: { label: PRIMARY_CATEGORY_LABELS.SCENT_BEAUTY, color: palette.darkOlive, icon: '🧴' },
  SPECIALTY: { label: PRIMARY_CATEGORY_LABELS.SPECIALTY, color: palette.forest, icon: '⭐' },
};

export const PRIMARY_CATEGORY_ORDER: PrimaryCategory[] = [
  'ART_BOOKS',
  'DESIGN_FASHION',
  'VINTAGE_ANTIQUES',
  'SCENT_BEAUTY',
  'SPECIALTY',
];
