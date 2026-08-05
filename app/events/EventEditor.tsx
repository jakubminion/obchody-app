'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';
import {
  createEvent,
  deleteEvent,
  fetchAndStoreCandidateImage,
  saveEvent,
  uploadEventImage,
  type EventFormFields,
} from './actions';
import type { EventCandidateRow, EventRow } from '@/lib/watchdog/types';

export interface LocationOption {
  id: string;
  label: string;
  lat: number;
  lng: number;
}

interface Props {
  event: EventRow | null; // null = creating from a candidate (or blank)
  candidate: EventCandidateRow | null; // only set when arriving via ?candidateId=
  locationOptions: LocationOption[];
}

function isoToDateInput(iso: string | null): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

function dateInputToIso(value: string): string | null {
  if (!value) return null;
  return new Date(`${value}T00:00:00.000Z`).toISOString();
}

export function EventEditor({ event, candidate, locationOptions }: Props) {
  const router = useRouter();
  const isNew = event === null;
  const seed = event ?? candidate;

  const [title, setTitle] = useState(event?.title ?? candidate?.title ?? '');
  const [description, setDescription] = useState(event?.description ?? candidate?.description ?? '');
  const [startsAt, setStartsAt] = useState(isoToDateInput(event?.starts_at ?? candidate?.starts_at ?? null));
  const [endsAt, setEndsAt] = useState(isoToDateInput(event?.ends_at ?? candidate?.ends_at ?? null));
  const [opensTime, setOpensTime] = useState(event?.opens_time ?? candidate?.opens_time ?? '');
  const [closesTime, setClosesTime] = useState(event?.closes_time ?? candidate?.closes_time ?? '');
  const [venueName, setVenueName] = useState(event?.venue_name ?? candidate?.venue_name ?? '');
  const [locationId, setLocationId] = useState(event?.location_id ?? candidate?.matched_location_id ?? '');
  const [address, setAddress] = useState(event?.address ?? candidate?.address_raw ?? '');
  const [lat, setLat] = useState(event?.lat ?? candidate?.lat ?? null);
  const [lng, setLng] = useState(event?.lng ?? candidate?.lng ?? null);
  const [imageUrl, setImageUrl] = useState(event?.image_url ?? null);
  const [sourceUrl] = useState(event?.source_url ?? candidate?.source_url ?? null);
  const [published, setPublished] = useState(event?.published ?? false);

  const [pending, startTransition] = useTransition();
  const [imagePending, setImagePending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function fields(): EventFormFields {
    const iso = dateInputToIso(startsAt);
    if (!iso) throw new Error('Vyplňte datum začátku.');
    return {
      title,
      description: description.trim() || null,
      startsAt: iso,
      endsAt: dateInputToIso(endsAt),
      opensTime: opensTime || null,
      closesTime: closesTime || null,
      venueName: venueName.trim() || null,
      locationId: locationId || null,
      address: address.trim() || null,
      lat,
      lng,
      imageUrl,
      sourceUrl,
      published,
      candidateId: candidate?.id ?? event?.candidate_id ?? null,
    };
  }

  function handleSave() {
    setError(null);
    setMessage(null);
    try {
      const payload = fields();
      startTransition(async () => {
        try {
          if (isNew) {
            await createEvent(payload); // redirects on success
          } else {
            await saveEvent(event.id, payload);
            setMessage('Uloženo.');
            router.refresh();
          }
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Uložení se nezdařilo.');
        }
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Neplatný formulář.');
    }
  }

  function handleDelete() {
    if (!event) return;
    if (!confirm(`Opravdu smazat „${event.title}“?`)) return;
    startTransition(async () => {
      await deleteEvent(event.id); // redirects on success
    });
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!event) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePending(true);
    setError(null);
    try {
      const url = await uploadEventImage(event.id, file);
      setImageUrl(`${url}?t=${Date.now()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nahrání se nezdařilo.');
    } finally {
      setImagePending(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleFetchCandidateImage() {
    if (!event || !seed?.image_url) return;
    setImagePending(true);
    setError(null);
    try {
      const url = await fetchAndStoreCandidateImage(event.id, seed.image_url);
      setImageUrl(`${url}?t=${Date.now()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Stažení obrázku se nezdařilo.');
    } finally {
      setImagePending(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <a href="/watchdog" className="mb-6 inline-block text-sm text-neutral-400 hover:text-neutral-700">
        ← Hlídač akcí
      </a>

      <h1 className="mb-6 text-2xl font-semibold text-neutral-900">{isNew ? 'Nová akce' : title}</h1>

      <section className="mb-8 space-y-4 rounded-xl border border-neutral-200 bg-white p-6">
        <label className="block text-sm">
          <span className="mb-1 block text-neutral-500">Název</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-neutral-500">Popis</span>
          <textarea
            value={description ?? ''}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </label>

        <div className="text-sm">
          <span className="mb-1 block text-neutral-500">Dny konání</span>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              placeholder="Konec (nepovinné)"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <span className="mt-1 block text-xs text-neutral-400">
            Necháte-li konec prázdný, akce se bere jako jednodenní.
          </span>
        </div>

        <div className="text-sm">
          <span className="mb-1 block text-neutral-500">Otevírací doba (denně, nepovinné)</span>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="time"
              value={opensTime}
              onChange={(e) => setOpensTime(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
            <input
              type="time"
              value={closesTime}
              onChange={(e) => setClosesTime(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <span className="mt-1 block text-xs text-neutral-400">
            Odděleno od dnů konání — u vícedenní akce platí stejná doba každý den (např. trh 12.–14. 9. otevřený
            10:00–18:00). Necháte-li prázdné, bere se akce jako otevřená po celou dobu konání.
          </span>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block text-neutral-500">Místo (název)</span>
          <input
            value={venueName ?? ''}
            onChange={(e) => setVenueName(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-neutral-500">Spárovaný obchod / pobočka (nepovinné)</span>
          <select
            value={locationId}
            onChange={(e) => {
              const id = e.target.value;
              setLocationId(id);
              // The matched location's own coordinates are more trustworthy
              // than a geocoded address_raw guess — take precedence once a
              // location is explicitly picked.
              const picked = locationOptions.find((opt) => opt.id === id);
              if (picked) {
                setLat(picked.lat);
                setLng(picked.lng);
              }
            }}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="">— nespárováno —</option>
            {locationOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-neutral-500">Adresa</span>
          <input
            value={address ?? ''}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </label>

        <p className="text-xs text-neutral-400">
          {lat !== null && lng !== null ? (
            <>Souřadnice nastaveny — akce se zobrazí na mapě ({lat.toFixed(4)}, {lng.toFixed(4)}).</>
          ) : (
            'Chybí souřadnice — akce se na mapě nezobrazí, dokud nevyberete spárované místo.'
          )}
        </p>

        {sourceUrl && (
          <p className="text-xs text-neutral-400">
            Zdroj:{' '}
            <a href={sourceUrl} target="_blank" rel="noreferrer" className="underline">
              {sourceUrl}
            </a>
          </p>
        )}

        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          Publikováno
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-emerald-600">{message}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={pending || !title}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {pending ? 'Ukládám…' : isNew ? 'Vytvořit akci' : 'Uložit změny'}
          </button>
          {!isNew && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={pending}
              className="ml-auto text-sm text-neutral-400 hover:text-red-600 disabled:opacity-50"
            >
              Smazat akci
            </button>
          )}
        </div>
      </section>

      {!isNew && (
        <section className="mb-8 rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-neutral-900">Obrázek</h2>
          {imageUrl && (
            <div className="relative mb-3 h-32 w-full overflow-hidden rounded-lg border border-neutral-200">
              <Image src={imageUrl} alt="" fill sizes="600px" className="object-cover" unoptimized />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} disabled={imagePending} className="text-xs" />
            {seed?.image_url && (
              <button
                type="button"
                onClick={handleFetchCandidateImage}
                disabled={imagePending}
                className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:border-neutral-400 disabled:opacity-50"
              >
                Stáhnout plakát organizátora
              </button>
            )}
          </div>
          {imagePending && <p className="mt-1 text-xs text-neutral-400">Zpracovávám…</p>}
        </section>
      )}
    </div>
  );
}
