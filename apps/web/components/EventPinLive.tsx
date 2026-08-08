'use client';

import { Marker } from '@vis.gl/react-google-maps';
import type { AppEvent } from '@kousek/db';
import { eventLivePinIcon } from '../lib/pinIcon';

interface Props {
  event: AppEvent;
  position: { lat: number; lng: number };
  accent: string;
  onClick: (event: AppEvent) => void;
}

// Ported from moje-aplikace/src/components/EventPinLive.tsx. A classic
// Marker icon can't do the native app's looping pulse animation (see
// lib/pinIcon.ts) — a static layered-ring icon is the closest honest
// equivalent. `accent` is passed in (rather than read from CSS) because
// it's baked into a generated image, not styled — the caller picks the
// light/dark value.
export function EventPinLive({ event, position, accent, onClick }: Props) {
  return <Marker position={position} icon={eventLivePinIcon(accent)} onClick={() => onClick(event)} />;
}
