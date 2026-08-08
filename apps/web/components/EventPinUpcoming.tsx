'use client';

import { Marker } from '@vis.gl/react-google-maps';
import type { AppEvent } from '@kousek/db';
import { eventUpcomingPinIcon } from '../lib/pinIcon';

interface Props {
  event: AppEvent;
  position: { lat: number; lng: number };
  accent: string;
  onClick: (event: AppEvent) => void;
}

// Ported from moje-aplikace/src/components/EventPinUpcoming.tsx — an event
// happening within the next week: a faint dashed circle.
export function EventPinUpcoming({ event, position, accent, onClick }: Props) {
  return <Marker position={position} icon={eventUpcomingPinIcon(accent)} onClick={() => onClick(event)} />;
}
