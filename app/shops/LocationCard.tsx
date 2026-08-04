'use client';

import { useState, useTransition } from 'react';
import { deleteLocation, saveLocation } from '../actions';
import { OpeningHoursEditor } from './OpeningHoursEditor';
import type { Location } from '@/lib/types';

interface Props {
  shopId: string;
  location: Location;
  canDelete: boolean;
  onDeleted: (id: string) => void;
}

export function LocationCard({ shopId, location, canDelete, onDeleted }: Props) {
  const [label, setLabel] = useState(location.label ?? '');
  const [address, setAddress] = useState(location.address);
  const [lat, setLat] = useState(String(location.lat));
  const [lng, setLng] = useState(String(location.lng));
  const [city, setCity] = useState(location.city);
  const [googlePlaceId, setGooglePlaceId] = useState(location.googlePlaceId ?? '');
  const [hoursUnverified, setHoursUnverified] = useState(location.hoursUnverified);
  const [openingHours, setOpeningHours] = useState(location.openingHours);
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    setError(null);
    startTransition(async () => {
      try {
        await saveLocation(
          location.id,
          {
            label: label.trim() || null,
            address,
            lat: Number(lat),
            lng: Number(lng),
            city,
            googlePlaceId: googlePlaceId.trim() || null,
            hoursUnverified,
            openingHours,
          },
          shopId,
        );
        setSavedAt(Date.now());
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Uložení se nezdařilo.');
      }
    });
  }

  function handleDelete() {
    if (!confirm('Opravdu smazat tuto pobočku?')) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteLocation(location.id, shopId);
        onDeleted(location.id);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Smazání se nezdařilo.');
      }
    });
  }

  return (
    <div className="rounded-lg border border-neutral-200 p-4">
      <div className="mb-3 grid grid-cols-2 gap-3">
        <label className="text-xs text-neutral-500">
          Označení pobočky (např. „Letná“, prázdné pokud jediná)
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="mt-1 w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="text-xs text-neutral-500">
          Město
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="mt-1 w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="col-span-2 text-xs text-neutral-500">
          Adresa
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="text-xs text-neutral-500">
          Zeměpisná šířka (lat)
          <input
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            inputMode="decimal"
            className="mt-1 w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="text-xs text-neutral-500">
          Zeměpisná délka (lng)
          <input
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            inputMode="decimal"
            className="mt-1 w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="col-span-2 text-xs text-neutral-500">
          Google Place ID (volitelné)
          <input
            value={googlePlaceId}
            onChange={(e) => setGooglePlaceId(e.target.value)}
            className="mt-1 w-full rounded border border-neutral-300 px-2 py-1.5 text-sm"
          />
        </label>
      </div>

      <label className="mb-3 flex items-center gap-2 text-xs text-neutral-600">
        <input type="checkbox" checked={hoursUnverified} onChange={(e) => setHoursUnverified(e.target.checked)} />
        Otevírací doba není ověřená
      </label>

      <div className="mb-3">
        <OpeningHoursEditor value={openingHours} onChange={setOpeningHours} />
      </div>

      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={pending}
          className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {pending ? 'Ukládám…' : 'Uložit pobočku'}
        </button>
        {savedAt && <span className="text-xs text-emerald-600">Uloženo</span>}
        {canDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="ml-auto text-xs text-neutral-400 hover:text-red-600 disabled:opacity-50"
          >
            Smazat pobočku
          </button>
        )}
      </div>
    </div>
  );
}
