'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export interface Coords {
  lat: number;
  lng: number;
}

// Ported from moje-aplikace/src/state/LocationContext.tsx — same shape,
// browser Geolocation API + localStorage instead of expo-location +
// AsyncStorage.
export const PRAGUE_CENTER: Coords = { lat: 50.0755, lng: 14.4378 };

const EXPLAINER_SEEN_KEY = 'location:explainerSeen:v1';

type PermissionState = 'undetermined' | 'granted' | 'denied';

interface LocationContextValue {
  hasSeenExplainer: boolean | null; // null while loading from storage
  permissionState: PermissionState;
  coords: Coords | null;
  effectiveCoords: Coords; // coords, or Prague fallback
  isUsingFallback: boolean;
  completeExplainer: () => void;
  refreshLocation: () => void;
}

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [hasSeenExplainer, setHasSeenExplainer] = useState<boolean | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState>('undetermined');
  const [coords, setCoords] = useState<Coords | null>(null);

  const fetchCurrentPosition = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => setCoords({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => setCoords(null),
      { enableHighAccuracy: false },
    );
  };

  const refreshLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.permissions) {
      // Permissions API isn't available (older Safari) — fall back to just
      // asking; the browser's own prompt/remembered-choice handles it.
      fetchCurrentPosition();
      return;
    }
    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      if (result.state === 'granted') {
        setPermissionState('granted');
        fetchCurrentPosition();
      } else if (result.state === 'denied') {
        setPermissionState('denied');
      }
    });
  };

  useEffect(() => {
    const seen = localStorage.getItem(EXPLAINER_SEEN_KEY) === 'true';
    setHasSeenExplainer(seen);
    if (seen) refreshLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const completeExplainer = () => {
    localStorage.setItem(EXPLAINER_SEEN_KEY, 'true');
    setHasSeenExplainer(true);
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setPermissionState('denied');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPermissionState('granted');
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => setPermissionState('denied'),
      { enableHighAccuracy: false },
    );
  };

  const value = useMemo<LocationContextValue>(
    () => ({
      hasSeenExplainer,
      permissionState,
      coords,
      effectiveCoords: coords ?? PRAGUE_CENTER,
      isUsingFallback: coords === null,
      completeExplainer,
      refreshLocation,
    }),
    [hasSeenExplainer, permissionState, coords],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocationContext(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return ctx;
}
