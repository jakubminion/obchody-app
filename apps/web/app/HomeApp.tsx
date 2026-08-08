'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { APIProvider, Map, useMap, type MapCameraChangedEvent } from '@vis.gl/react-google-maps';
import {
  applyPinSpread,
  distanceMeters,
  isEventLive,
  isEventRelevant,
  isEventUpcomingSoon,
  isOpenNow,
  nearestLocation,
  type AppEvent,
  type LocationPin,
  type PrimaryCategory,
  type Shop,
} from '@kousek/db';

import { CategoryFilterChips } from '../components/CategoryFilterChips';
import { EventListCard } from '../components/EventListCard';
import { EventPinLive } from '../components/EventPinLive';
import { EventPinUpcoming } from '../components/EventPinUpcoming';
import { LocationExplainer } from '../components/LocationExplainer';
import { MapPin } from '../components/MapPin';
import { ShopListTile } from '../components/ShopListTile';
import { ShopPreviewCard } from '../components/ShopPreviewCard';
import { ViewToggle, type ViewMode } from '../components/ViewToggle';
import { GOOGLE_MAPS_API_KEY } from '../lib/googleMapsKey';
import { LocationProvider, PRAGUE_CENTER, useLocationContext } from '../lib/LocationProvider';
import { pastelMapStyle, pastelMapStyleDark } from '../lib/mapStyle';
import { palette } from '../lib/palette';

const DEFAULT_ZOOM = 15;
const MAP_ID = 'kousek-map';

interface Props {
  shops: Shop[];
  events: AppEvent[];
}

// Ported from moje-aplikace/app/index.tsx's HomeScreen — same filters,
// same map/list/events pager, same pin-selection preview-card behavior.
export function HomeApp({ shops, events }: Props) {
  return (
    <LocationProvider>
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <HomeAppInner shops={shops} events={events} />
      </APIProvider>
    </LocationProvider>
  );
}

function HomeAppInner({ shops, events }: Props) {
  const router = useRouter();
  const map = useMap(MAP_ID);
  const { hasSeenExplainer, effectiveCoords, isUsingFallback, completeExplainer } = useLocationContext();

  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [selectedPrimaryCategories, setSelectedPrimaryCategories] = useState<PrimaryCategory[]>([]);
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [latitudeDelta, setLatitudeDelta] = useState(0.02);
  const [isDark, setIsDark] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const accentColor = isDark ? palette.orange : palette.rust;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  // Recenter once geolocation resolves — mirrors the native app's effect
  // on `coords` in LocationContext.
  useEffect(() => {
    if (map) map.panTo(effectiveCoords);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, effectiveCoords.lat, effectiveCoords.lng]);

  const filteredShops = useMemo(() => {
    return shops.filter((shop) => {
      if (selectedPrimaryCategories.length > 0 && !selectedPrimaryCategories.includes(shop.primaryCategory)) {
        return false;
      }
      if (openNowOnly && !shop.locations.some((l) => isOpenNow(l.openingHours, now))) return false;
      return true;
    });
  }, [shops, selectedPrimaryCategories, openNowOnly, now]);

  const locationPins = useMemo<LocationPin[]>(() => {
    const pins: LocationPin[] = [];
    for (const shop of filteredShops) {
      for (const location of shop.locations) {
        if (openNowOnly && !isOpenNow(location.openingHours, now)) continue;
        pins.push({ shop, location });
      }
    }
    return pins;
  }, [filteredShops, openNowOnly, now]);

  const spreadPins = useMemo(() => applyPinSpread(locationPins, latitudeDelta), [locationPins, latitudeDelta]);

  const sortedShops = useMemo(() => {
    return filteredShops
      .map((shop) => {
        const { location, distance } = nearestLocation(shop, effectiveCoords);
        return { shop, location, distance };
      })
      .sort((a, b) => a.distance - b.distance);
  }, [filteredShops, effectiveCoords]);

  const relevantEvents = useMemo(
    () =>
      events
        .filter((e) => isEventRelevant(e, now))
        .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()),
    [events, now],
  );
  const hasCoords = (e: AppEvent) => e.lat !== null && e.lng !== null;
  const liveEvents = useMemo(
    () => relevantEvents.filter((e) => hasCoords(e) && isEventLive(e, now)),
    [relevantEvents, now],
  );
  const upcomingSoonEvents = useMemo(
    () => relevantEvents.filter((e) => hasCoords(e) && !isEventLive(e, now) && isEventUpcomingSoon(e, now)),
    [relevantEvents, now],
  );

  const selectedShop = useMemo(
    () => filteredShops.find((s) => s.id === selectedShopId) ?? null,
    [filteredShops, selectedShopId],
  );
  const selectedLocation = useMemo(() => {
    if (!selectedShop) return null;
    return selectedShop.locations.find((l) => l.id === selectedLocationId) ?? selectedShop.locations[0];
  }, [selectedShop, selectedLocationId]);
  const selectedDistance = selectedLocation
    ? distanceMeters(effectiveCoords, { lat: selectedLocation.lat, lng: selectedLocation.lng })
    : null;

  const handleSelectShop = useCallback(
    (shop: Shop, location: typeof shop.locations[number]) => {
      setSelectedShopId(shop.id);
      setSelectedLocationId(location.id);
      // Shift the map center south of the pin so it lands in the upper
      // half of the screen, clear of the preview card below it — same
      // math as the native app's handleSelectShop.
      if (map) {
        map.panTo({ lat: location.lat - latitudeDelta * 0.22, lng: location.lng });
      }
    },
    [map, latitudeDelta],
  );

  const handleRecenter = useCallback(() => {
    if (map) {
      map.panTo(effectiveCoords);
      map.setZoom(DEFAULT_ZOOM);
    }
  }, [map, effectiveCoords]);

  const handleCameraChanged = useCallback((ev: MapCameraChangedEvent) => {
    const { bounds } = ev.detail;
    setLatitudeDelta(bounds.north - bounds.south);
  }, []);

  const handleOpenEvent = useCallback((event: AppEvent) => router.push(`/akce/${event.id}`), [router]);

  if (hasSeenExplainer === null) {
    return null;
  }
  if (hasSeenExplainer === false) {
    return <LocationExplainer onContinue={completeExplainer} />;
  }

  return (
    <div className="flex h-dvh flex-col">
      <div
        className="flex flex-col gap-2.5 pb-2.5"
        style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top))' }}
      >
        {viewMode !== 'events' && (
          <CategoryFilterChips
            selected={selectedPrimaryCategories}
            onToggle={(c) =>
              setSelectedPrimaryCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))
            }
            onClear={() => setSelectedPrimaryCategories([])}
          />
        )}
        <div className="flex items-center justify-between px-4">
          <span className="text-sm font-medium text-ink">
            {viewMode === 'events' ? 'Probíhá dnes' : 'Otevřeno teď'}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={openNowOnly}
            onClick={() => setOpenNowOnly((v) => !v)}
            className="relative h-7 w-12 rounded-full transition"
            style={{ backgroundColor: openNowOnly ? 'var(--accent)' : 'var(--border)' }}
          >
            <span
              className="absolute top-0.5 h-6 w-6 rounded-full bg-surface transition-all"
              style={{ left: openNowOnly ? '22px' : '2px' }}
            />
          </button>
        </div>
      </div>

      <div className="relative flex-1">
        {viewMode === 'map' ? (
          <div className="absolute inset-0">
            <Map
              id={MAP_ID}
              defaultCenter={PRAGUE_CENTER}
              defaultZoom={DEFAULT_ZOOM}
              styles={isDark ? pastelMapStyleDark : pastelMapStyle}
              disableDefaultUI
              gestureHandling="greedy"
              style={{ width: '100%', height: '100%' }}
              onCameraChanged={handleCameraChanged}
              onClick={() => {
                setSelectedShopId(null);
                setSelectedLocationId(null);
              }}
            >
              {spreadPins.map((pin) => (
                <MapPin
                  key={pin.location.id}
                  shop={pin.shop}
                  location={pin.location}
                  position={{ lat: pin.spreadLat, lng: pin.spreadLng }}
                  onClick={handleSelectShop}
                />
              ))}
              {upcomingSoonEvents.map((event) => (
                <EventPinUpcoming
                  key={event.id}
                  event={event}
                  position={{ lat: event.lat!, lng: event.lng! }}
                  accent={accentColor}
                  onClick={handleOpenEvent}
                />
              ))}
              {liveEvents.map((event) => (
                <EventPinLive
                  key={event.id}
                  event={event}
                  position={{ lat: event.lat!, lng: event.lng! }}
                  accent={accentColor}
                  onClick={handleOpenEvent}
                />
              ))}
            </Map>

            <button
              type="button"
              onClick={handleRecenter}
              aria-label="Moje poloha"
              className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-surface shadow-lg"
            >
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth={2}>
                <circle cx={12} cy={12} r={3} />
                <path d="M12 2v3M12 19v3M22 12h-3M5 12H2" />
              </svg>
            </button>

            {selectedShop && selectedLocation && (
              <ShopPreviewCard shop={selectedShop} location={selectedLocation} distanceMeters={isUsingFallback ? null : selectedDistance} />
            )}
          </div>
        ) : viewMode === 'list' ? (
          <div className="h-full overflow-y-auto overscroll-y-contain px-4 pb-24 pt-1">
            {sortedShops.length === 0 ? (
              <EmptyState title="Žádné obchody" body="Zkuste změnit vybrané kategorie." />
            ) : (
              <div className="flex flex-col gap-3.5">
                {sortedShops.map(({ shop, location, distance }) => (
                  <ShopListTile
                    key={shop.id}
                    shop={shop}
                    distanceMeters={isUsingFallback ? null : distance}
                    locationLabel={shop.locations.length > 1 ? location.label : null}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-full overflow-y-auto overscroll-y-contain px-4 pb-24 pt-1">
            {relevantEvents.length === 0 ? (
              <EmptyState title="Žádné nadcházející akce" body="Zatím tu nic nemáme — zkuste to prosím později." />
            ) : (
              <div className="flex flex-col gap-3.5">
                {relevantEvents.map((event) => (
                  <EventListCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <ViewToggle value={viewMode} onChange={setViewMode} />
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1.5 pt-20 text-center">
      <p className="text-base font-semibold text-ink">{title}</p>
      <p className="text-sm text-ink-tertiary">{body}</p>
    </div>
  );
}
