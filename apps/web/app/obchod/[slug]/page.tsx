import { notFound } from 'next/navigation';
import {
  mapShopRow,
  openingStatus,
  PRIMARY_CATEGORY_LABELS,
  supabasePublic,
  type Shop,
} from '@kousek/db';

export const revalidate = 3600;

async function getAllSlugs(): Promise<string[]> {
  const { data, error } = await supabasePublic().from('shops').select('slug').eq('published', true);
  if (error) throw error;
  return (data ?? []).map((row) => row.slug as string);
}

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

async function getShopBySlug(slug: string): Promise<Shop | null> {
  const { data, error } = await supabasePublic()
    .from('shops')
    .select('*, locations(*)')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();
  if (error) throw error;
  return data ? mapShopRow(data) : null;
}

// Ported from moje-aplikace/src/i18n/strings.ts's openingStatus* templates —
// packages/db's openingStatus() returns a discriminated fact, this is the
// one place that turns it into Czech text for this app.
function statusLabel(status: ReturnType<typeof openingStatus>): string {
  switch (status.kind) {
    case 'open':
      return `Otevřeno · Zavírá v ${status.closesAt}`;
    case 'closed-opens-today':
      return `Zavřeno · Otevírá v ${status.opensAt}`;
    case 'closed-opens-tomorrow':
      return `Zavřeno · Otevírá zítra v ${status.opensAt}`;
    case 'closed-indefinite':
      return 'Zavřeno';
    case 'unknown':
      return 'Otevírací doba neověřena';
  }
}

export default async function ShopPage(props: PageProps<'/obchod/[slug]'>) {
  const { slug } = await props.params;
  const shop = await getShopBySlug(slug);
  if (!shop) notFound();

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">
        {PRIMARY_CATEGORY_LABELS[shop.primaryCategory]}
      </p>
      <h1 className="mt-1 text-3xl font-bold text-ink">{shop.name}</h1>
      <p className="mt-2 text-ink-secondary">{shop.keywordDescription}</p>

      {shop.curatorNote && <p className="mt-6 text-ink">{shop.curatorNote}</p>}

      <div className="mt-8 flex flex-col gap-4">
        {shop.locations.map((location) => (
          <div key={location.id} className="rounded-xl border border-border bg-surface p-4">
            {location.label && <p className="text-sm font-semibold text-ink">{location.label}</p>}
            <p className="text-sm text-ink-secondary">{location.address}</p>
            <p className="mt-1 text-sm font-medium text-ink">
              {statusLabel(openingStatus(location.openingHours))}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
