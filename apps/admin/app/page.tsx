import Link from 'next/link';
import { getShops, hasRealPhotos } from '@/lib/data';
import { PRIMARY_CATEGORY_LABELS } from '@kousek/db';
import { logout } from './login/actions';

// Always fetch live — this must never serve a build-time snapshot of the
// shop list.
export const dynamic = 'force-dynamic';

export default async function ShopsListPage() {
  const shops = await getShops();
  const realPhotoCount = shops.filter((s) => hasRealPhotos(s.photos)).length;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Obchody</h1>
          <p className="text-sm text-neutral-500">
            {shops.length} obchodů celkem · {realPhotoCount}/{shops.length} má reálné fotky
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/shops/placeholder-photos" className="text-sm text-neutral-500 hover:text-neutral-900">
            Fotky před beta{shops.length - realPhotoCount > 0 ? ` (${shops.length - realPhotoCount})` : ''}
          </Link>
          <Link href="/events" className="text-sm text-neutral-500 hover:text-neutral-900">
            Akce
          </Link>
          <Link href="/watchdog" className="text-sm text-neutral-500 hover:text-neutral-900">
            Hlídač akcí
          </Link>
          <Link
            href="/shops/new"
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            + Nový obchod
          </Link>
          <form action={logout}>
            <button type="submit" className="text-sm text-neutral-400 hover:text-neutral-700">
              Odhlásit
            </button>
          </form>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Název</th>
              <th className="px-4 py-3 font-medium">Kategorie</th>
              <th className="px-4 py-3 font-medium">Pobočky</th>
              <th className="px-4 py-3 font-medium">Fotky</th>
              <th className="px-4 py-3 font-medium">Stav</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {shops.map((shop) => (
              <tr key={shop.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <Link href={`/shops/${shop.id}`} className="font-medium text-neutral-900 hover:underline">
                    {shop.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {PRIMARY_CATEGORY_LABELS[shop.primaryCategory]}
                </td>
                <td className="px-4 py-3 text-neutral-600">{shop.locations.length}</td>
                <td className="px-4 py-3">
                  {shop.photos.length === 0 ? (
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500">
                      Chybí
                    </span>
                  ) : hasRealPhotos(shop.photos) ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      Reálné ({shop.photos.length})
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                      Zástupné
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {shop.published ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      Publikováno
                    </span>
                  ) : (
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500">
                      Koncept
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
