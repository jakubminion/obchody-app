'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';
import {
  createShop,
  deleteShop,
  removePhoto,
  saveShop,
  uploadLogo,
  uploadLogotype,
  uploadPhoto,
  addLocation,
  type ShopFormFields,
} from '../actions';
import { CATEGORIES, CATEGORY_LABELS, type Category, type Location, type Shop } from '@/lib/types';
import { LocationCard } from './LocationCard';

interface Props {
  shop: Shop | null; // null = creating a new shop
}

export function ShopEditor({ shop }: Props) {
  const router = useRouter();
  const isNew = shop === null;

  const [name, setName] = useState(shop?.name ?? '');
  const [categories, setCategories] = useState<Category[]>(shop?.categories ?? []);
  const [keywordDescription, setKeywordDescription] = useState(shop?.keywordDescription ?? '');
  const [curatorNote, setCuratorNote] = useState(shop?.curatorNote ?? '');
  const [giftPriceMin, setGiftPriceMin] = useState(shop?.giftPriceMin?.toString() ?? '');
  const [giftPriceMax, setGiftPriceMax] = useState(shop?.giftPriceMax?.toString() ?? '');
  const [websiteUrl, setWebsiteUrl] = useState(shop?.websiteUrl ?? '');
  const [instagramUrl, setInstagramUrl] = useState(shop?.instagramUrl ?? '');
  const [published, setPublished] = useState(shop?.published ?? false);

  const [logoUrl, setLogoUrl] = useState(shop?.logoUrl ?? null);
  const [logotypeUrl, setLogotypeUrl] = useState(shop?.logotypeUrl ?? null);
  const [photos, setPhotos] = useState(shop?.photos ?? []);
  const [locations, setLocations] = useState<Location[]>(shop?.locations ?? []);

  const [pending, startTransition] = useTransition();
  const [logoPending, setLogoPending] = useState(false);
  const [logotypePending, setLogotypePending] = useState(false);
  const [photoPending, setPhotoPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const logotypeInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  function toggleCategory(c: Category) {
    setCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  function fields(): ShopFormFields {
    return {
      name,
      categories,
      keywordDescription,
      curatorNote: curatorNote.trim() || null,
      giftPriceMin: giftPriceMin ? Number(giftPriceMin) : null,
      giftPriceMax: giftPriceMax ? Number(giftPriceMax) : null,
      websiteUrl: websiteUrl.trim() || null,
      instagramUrl: instagramUrl.trim() || null,
      published,
    };
  }

  function handleSave() {
    setError(null);
    setMessage(null);
    if (categories.length === 0) {
      setError('Vyberte alespoň jednu kategorii.');
      return;
    }
    startTransition(async () => {
      try {
        if (isNew) {
          await createShop(fields()); // redirects on success
        } else {
          await saveShop(shop.id, fields());
          setMessage('Uloženo.');
          router.refresh();
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Uložení se nezdařilo.');
      }
    });
  }

  function handleDeleteShop() {
    if (!shop) return;
    if (!confirm(`Opravdu smazat „${shop.name}“? Tuto akci nelze vrátit zpět.`)) return;
    startTransition(async () => {
      try {
        await deleteShop(shop.id); // redirects on success
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Smazání se nezdařilo.');
      }
    });
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!shop) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoPending(true);
    setError(null);
    try {
      const url = await uploadLogo(shop.id, file);
      setLogoUrl(`${url}?t=${Date.now()}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nahrání loga se nezdařilo.');
    } finally {
      setLogoPending(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  }

  async function handleLogotypeChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!shop) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setLogotypePending(true);
    setError(null);
    try {
      const result = await uploadLogotype(shop.id, file);
      setLogotypeUrl(`${result.url}?t=${Date.now()}`);
      router.refresh();
      const notes = [
        result.strippedBg && 'pozadí odstraněno',
        result.recolored && 'přebarveno na černou',
        result.uncertainBg && 'pozadí se nepodařilo automaticky odstranit — zkontrolujte',
      ]
        .filter(Boolean)
        .join(', ');
      setMessage(notes ? `Logotyp nahrán (${notes}).` : 'Logotyp nahrán.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nahrání logotypu se nezdařilo.');
    } finally {
      setLogotypePending(false);
      if (logotypeInputRef.current) logotypeInputRef.current.value = '';
    }
  }

  async function handlePhotoAdd(e: React.ChangeEvent<HTMLInputElement>) {
    if (!shop) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoPending(true);
    setError(null);
    try {
      await uploadPhoto(shop.id, file, photos);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nahrání fotky se nezdařilo.');
    } finally {
      setPhotoPending(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  }

  async function handlePhotoRemove(url: string) {
    if (!shop) return;
    setPhotos((prev) => prev.filter((p) => p !== url));
    try {
      await removePhoto(shop.id, url, photos);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Odebrání fotky se nezdařilo.');
    }
  }

  async function handleAddLocation() {
    if (!shop) return;
    try {
      const location = await addLocation(shop.id);
      setLocations((prev) => [...prev, location]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Přidání pobočky se nezdařilo.');
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <a href="/" className="mb-6 inline-block text-sm text-neutral-400 hover:text-neutral-700">
        ← Zpět na seznam
      </a>

      <h1 className="mb-6 text-2xl font-semibold text-neutral-900">
        {isNew ? 'Nový obchod' : shop.name}
      </h1>

      <section className="mb-8 space-y-4 rounded-xl border border-neutral-200 bg-white p-6">
        <label className="block text-sm">
          <span className="mb-1 block text-neutral-500">Název</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </label>

        <div className="text-sm">
          <span className="mb-1 block text-neutral-500">
            Kategorie {categories.length > 0 && <span className="text-neutral-400">(první = hlavní, určuje barvu na mapě)</span>}
          </span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const index = categories.indexOf(c);
              const active = index !== -1;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCategory(c)}
                  className={
                    active
                      ? 'rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white'
                      : 'rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 hover:border-neutral-400'
                  }
                >
                  {active && index === 0 ? '★ ' : ''}
                  {CATEGORY_LABELS[c]}
                </button>
              );
            })}
          </div>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block text-neutral-500">Klíčová slova (odděleno · )</span>
          <input
            value={keywordDescription}
            onChange={(e) => setKeywordDescription(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-neutral-500">Kurátorská poznámka</span>
          <textarea
            value={curatorNote}
            onChange={(e) => setCuratorNote(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm">
            <span className="mb-1 block text-neutral-500">Cena dárku od (Kč)</span>
            <input
              value={giftPriceMin}
              onChange={(e) => setGiftPriceMin(e.target.value)}
              inputMode="numeric"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-neutral-500">Cena dárku do (Kč)</span>
            <input
              value={giftPriceMax}
              onChange={(e) => setGiftPriceMax(e.target.value)}
              inputMode="numeric"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block text-neutral-500">Web</span>
          <input
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-neutral-500">Instagram</span>
          <input
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          Publikováno (viditelné v aplikaci)
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-emerald-600">{message}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={pending}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {pending ? 'Ukládám…' : isNew ? 'Vytvořit obchod' : 'Uložit změny'}
          </button>
          {!isNew && (
            <button
              type="button"
              onClick={handleDeleteShop}
              disabled={pending}
              className="ml-auto text-sm text-neutral-400 hover:text-red-600 disabled:opacity-50"
            >
              Smazat obchod
            </button>
          )}
        </div>
      </section>

      {!isNew && (
        <>
          <section className="mb-8 rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-neutral-900">Logo a logotyp</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="mb-2 text-xs text-neutral-500">Logo (čtvercová ikona)</p>
                {logoUrl && (
                  <div className="relative mb-2 h-16 w-16 overflow-hidden rounded-lg border border-neutral-200">
                    <Image src={logoUrl} alt="Logo" fill sizes="64px" className="object-cover" unoptimized />
                  </div>
                )}
                <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoChange} disabled={logoPending} className="text-xs" />
              </div>
              <div>
                <p className="mb-2 text-xs text-neutral-500">Logotyp (celé logo, automaticky upraveno)</p>
                {logotypeUrl && (
                  <div className="relative mb-2 h-16 w-40 overflow-hidden rounded-lg border border-neutral-200 bg-white">
                    <Image src={logotypeUrl} alt="Logotyp" fill sizes="160px" className="object-contain" unoptimized />
                  </div>
                )}
                <input
                  ref={logotypeInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogotypeChange}
                  disabled={logotypePending}
                  className="text-xs"
                />
                {logotypePending && <p className="mt-1 text-xs text-neutral-400">Zpracovávám…</p>}
              </div>
            </div>
          </section>

          <section className="mb-8 rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-neutral-900">Fotky</h2>
            <div className="mb-3 flex flex-wrap gap-3">
              {photos.map((url) => (
                <div key={url} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-neutral-200">
                  <Image src={url} alt="" fill sizes="80px" className="object-cover" unoptimized />
                  <button
                    type="button"
                    onClick={() => handlePhotoRemove(url)}
                    className="absolute right-1 top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white group-hover:flex"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoAdd} disabled={photoPending} className="text-xs" />
          </section>

          <section className="mb-8 rounded-xl border border-neutral-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-900">Pobočky ({locations.length})</h2>
              <button
                type="button"
                onClick={handleAddLocation}
                className="text-xs font-medium text-neutral-600 hover:text-neutral-900"
              >
                + Přidat pobočku
              </button>
            </div>
            <div className="space-y-4">
              {locations.map((location) => (
                <LocationCard
                  key={location.id}
                  shopId={shop.id}
                  location={location}
                  canDelete={locations.length > 1}
                  onDeleted={(id) => setLocations((prev) => prev.filter((l) => l.id !== id))}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
