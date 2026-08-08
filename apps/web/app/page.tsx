import Link from 'next/link';
import { mapShopRow, PRIMARY_CATEGORY_LABELS, supabasePublic, type Shop } from '@kousek/db';

export const revalidate = 3600;

async function getShops(): Promise<Shop[]> {
  const { data, error } = await supabasePublic()
    .from('shops')
    .select('*, locations(*)')
    .eq('published', true)
    .order('name');
  if (error) throw error;
  return (data ?? []).map(mapShopRow);
}

export default async function HomePage() {
  const shops = await getShops();

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-3xl font-bold text-ink">Kousek</h1>
      <p className="mt-2 text-ink-secondary">
        Kurátorský průvodce krásnými nezávislými obchody v Praze.
      </p>

      <ul className="mt-10 flex flex-col gap-4">
        {shops.map((shop) => (
          <li key={shop.id}>
            <Link
              href={`/obchod/${shop.slug}`}
              className="block rounded-xl border border-border bg-surface p-4 transition hover:opacity-90"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-semibold text-ink">{shop.name}</span>
                <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-ink-tertiary">
                  {PRIMARY_CATEGORY_LABELS[shop.primaryCategory]}
                </span>
              </div>
              <p className="mt-1 text-sm text-ink-secondary">{shop.keywordDescription}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
