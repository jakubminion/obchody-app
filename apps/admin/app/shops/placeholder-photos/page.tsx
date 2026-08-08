import Link from 'next/link';
import { getShops, hasRealPhotos } from '@/lib/data';
import { UnpublishButton } from './UnpublishButton';

export const dynamic = 'force-dynamic';

export default async function PlaceholderPhotosPage() {
  const shops = await getShops();
  const needsReview = shops.filter((s) => !hasRealPhotos(s.photos));

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/" className="mb-6 inline-block text-sm text-neutral-400 hover:text-neutral-700">
        ← Obchody
      </Link>
      <h1 className="mb-1 text-2xl font-semibold text-neutral-900">Fotky před beta</h1>
      <p className="mb-8 text-sm text-neutral-500">
        {needsReview.length} obchodů bez reálných fotek — rozhodněte, co skrýt před spuštěním bety. Nic se
        neskrývá automaticky.
      </p>

      {needsReview.length === 0 ? (
        <p className="rounded-xl border border-neutral-200 bg-white p-6 text-sm text-neutral-500">
          Všechny obchody mají reálné fotky.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Název</th>
                <th className="px-4 py-3 font-medium">Fotky</th>
                <th className="px-4 py-3 font-medium">Stav</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {needsReview.map((shop) => (
                <tr key={shop.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <Link href={`/shops/${shop.id}`} className="font-medium text-neutral-900 hover:underline">
                      {shop.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {shop.photos.length === 0 ? (
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500">
                        Chybí
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Zástupné ({shop.photos.length})
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
                  <td className="px-4 py-3 text-right">
                    {shop.published && <UnpublishButton shopId={shop.id} shopName={shop.name} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
