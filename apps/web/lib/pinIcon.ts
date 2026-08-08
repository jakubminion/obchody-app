// Classic google.maps.Marker (not AdvancedMarker) is used for all map pins
// — AdvancedMarker requires a `mapId`, and Google silently ignores the
// custom inline `styles` array (the branded cream/olive/rust palette)
// whenever a mapId is present (confirmed via the JS API's own console
// warning). Getting the real palette on the map matters more here than
// AdvancedMarker's DOM-content/CSS-animation niceties, so pins are
// rendered as generated SVG data-URI icons instead.
function svgIcon(svg: string, width: number, height: number, anchor: [number, number]): google.maps.Icon {
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(width, height),
    anchor: new google.maps.Point(anchor[0], anchor[1]),
  };
}

// Same teardrop + category-color + emoji design as
// moje-aplikace/src/components/MapPin.tsx's SVG.
export function shopPinIcon(color: string, emoji: string): google.maps.Icon {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="46" viewBox="0 0 34 46">
    <path d="M5 26 L29 26 L17 45 Z" fill="${color}" />
    <circle cx="17" cy="17" r="15" fill="${color}" stroke="#FFFFFF" stroke-width="2" />
    <text x="17" y="22" font-size="14" text-anchor="middle">${emoji}</text>
  </svg>`;
  return svgIcon(svg, 34, 46, [17, 45]);
}

// A solid dot with a static ring — the closest honest equivalent of the
// native app's looping pulse animation a static Marker icon can give.
export function eventLivePinIcon(accent: string): google.maps.Icon {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="19" fill="${accent}" opacity="0.28" />
    <circle cx="20" cy="20" r="12" fill="${accent}" opacity="0.45" />
    <circle cx="20" cy="20" r="7" fill="${accent}" stroke="#FFFFFF" stroke-width="2" />
  </svg>`;
  return svgIcon(svg, 40, 40, [20, 20]);
}

// Faint dashed ghost — same design as
// moje-aplikace/src/components/EventPinUpcoming.tsx.
export function eventUpcomingPinIcon(accent: string): google.maps.Icon {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" opacity="0.55">
    <circle cx="11" cy="11" r="9.25" fill="none" stroke="${accent}" stroke-width="1.5" stroke-dasharray="3 3" />
  </svg>`;
  return svgIcon(svg, 22, 22, [11, 11]);
}

// The user's own position — react-native-maps' showsUserLocation had no
// web equivalent to fall back on (Google Maps JS has no built-in "blue
// dot"), so this is a from-scratch marker. Always the raw palette orange
// (not the mode-aware `accent`, which is rust in light mode) — a "you are
// here" indicator should read the same vivid color in both themes.
export function userLocationPinIcon(orange: string): google.maps.Icon {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
    <circle cx="14" cy="14" r="13" fill="${orange}" opacity="0.22" />
    <circle cx="14" cy="14" r="7" fill="${orange}" stroke="#FFFFFF" stroke-width="2.5" />
  </svg>`;
  return svgIcon(svg, 28, 28, [14, 14]);
}
