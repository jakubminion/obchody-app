import { palette } from './palette';

// Ported verbatim from moje-aplikace/src/constants/mapStyle.ts — Google's
// MapTypeStyle[] JSON format is identical between the Maps JavaScript API
// and react-native-maps, so no translation was needed, only the import.
export const pastelMapStyle: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: palette.cream }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6D6858' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: palette.cream }, { weight: 3 }] },

  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: palette.charcoal }],
  },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },

  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'poi.park',
    elementType: 'geometry.fill',
    stylers: [{ color: palette.creamOlive }, { visibility: 'on' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: palette.forest }, { visibility: 'on' }],
  },

  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#E1D6B5' }] },
  { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ color: palette.orange }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: palette.brownRed }] },
  { featureType: 'road.arterial', elementType: 'geometry.fill', stylers: [{ color: '#FCF9F5' }] },
  { featureType: 'road.local', stylers: [{ visibility: 'simplified' }] },

  { featureType: 'transit', stylers: [{ visibility: 'off' }] },

  { featureType: 'water', elementType: 'geometry', stylers: [{ color: palette.creamRust }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: palette.cream }] },
];

export const pastelMapStyleDark: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: palette.charcoal }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#BEB59B' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: palette.charcoal }, { weight: 3 }] },

  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: palette.cream }],
  },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },

  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'poi.park',
    elementType: 'geometry.fill',
    stylers: [{ color: '#253519' }, { visibility: 'on' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: palette.cream }, { visibility: 'on' }],
  },

  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#444138' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#3D3B39' }] },
  { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ color: '#913703' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#612502' }] },
  { featureType: 'road.arterial', elementType: 'geometry.fill', stylers: [{ color: '#2E2C2A' }] },
  { featureType: 'road.local', stylers: [{ visibility: 'simplified' }] },

  { featureType: 'transit', stylers: [{ visibility: 'off' }] },

  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#2C160A' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: palette.cream }] },
];
