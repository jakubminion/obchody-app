// Same hex values as app/globals.css's CSS custom properties — duplicated
// here because the Google Maps style JSON needs literal hex strings at
// map-init time, not something read out of computed CSS. Keep both in
// sync if the palette ever changes (ported from
// moje-aplikace/src/constants/theme.ts).
export const palette = {
  orange: '#F25C05',
  forest: '#3E592A',
  brownRed: '#592D14',
  cream: '#F2E6C2',
  charcoal: '#252426',
  rust: '#A6440C',
  darkOlive: '#323E28',
  creamOlive: '#98A076',
  creamRust: '#CC9567',
} as const;
