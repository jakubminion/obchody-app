import { notFound } from 'next/navigation';
import {
  mapShopRow,
  openingStatus,
  supabasePublic,
  type Location,
  type Shop,
  type WeekdayHours,
} from '@kousek/db';
import { BackButton } from '../../../components/BackButton';
import { PhotoGallery } from '../../../components/PhotoGallery';
import { ShopLogo } from '../../../components/ShopLogo';

export const revalidate = 3600;

const WEEKDAY_NAMES = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'];
const WEEKDAY_DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

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

function directionsUrl(location: Location): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
}

export default async function ShopPage(props: PageProps<'/obchod/[slug]'>) {
  const { slug } = await props.params;
  const shop = await getShopBySlug(slug);
  if (!shop) notFound();

  const location = shop.locations[0];
  const otherLocations = shop.locations.slice(1);
  const now = new Date();
  const status = openingStatus(location.openingHours, now);

  return (
    <main className="mx-auto max-w-2xl pb-16">
      <BackButton />
      <PhotoGallery photos={shop.photos} />

      <div className="flex flex-col gap-2 p-5">
        <div className="flex items-center gap-3">
          {shop.logotypeUrl ? (
            <div className="flex flex-1 flex-col items-start gap-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={shop.logotypeUrl} alt={shop.name} className="h-16 w-auto max-w-full object-contain" />
              <p className="text-sm font-medium text-ink-secondary">
                {shop.name}
                {location.label ? ` · ${location.label}` : ''}
              </p>
            </div>
          ) : (
            <>
              <ShopLogo shop={shop} size={56} />
              <p className="flex-1 text-xl font-bold text-ink">
                {shop.name}
                {location.label ? ` · ${location.label}` : ''}
              </p>
            </>
          )}
        </div>

        <p className="mt-1.5 text-[15px] font-bold" style={{ color: 'var(--accent)' }}>
          {shop.keywordDescription}
        </p>
        {shop.curatorNote && <p className="text-[15px] leading-relaxed text-ink">{shop.curatorNote}</p>}
        {shop.giftPriceMin !== null && shop.giftPriceMax !== null && (
          <p className="mt-1 text-[15px] font-semibold text-ink">
            Pěkný dárek koupíte od {shop.giftPriceMin} do {shop.giftPriceMax} Kč.
          </p>
        )}

        <hr className="my-2.5 border-border" />

        <p className="text-[15px] font-semibold" style={{ color: 'var(--color-forest)' }}>
          {statusLabel(status)}
        </p>
        {location.openingHours && (
          <div className="mt-2 flex flex-col gap-1">
            {WEEKDAY_DISPLAY_ORDER.map((weekday) => {
              const day = (location.openingHours as WeekdayHours[]).find((h) => h.weekday === weekday);
              const label = WEEKDAY_NAMES[weekday];
              const text =
                day && day.intervals.length > 0
                  ? day.intervals.map((i) => `${i.open}–${i.close}`).join(', ')
                  : 'Zavřeno';
              const isToday = weekday === now.getDay();
              return (
                <div key={weekday} className="flex justify-between text-[13px]">
                  <span className={isToday ? 'font-bold text-ink underline' : 'text-ink-secondary'}>{label}</span>
                  <span className={isToday ? 'font-bold text-ink underline' : 'font-medium text-ink'}>{text}</span>
                </div>
              );
            })}
          </div>
        )}

        <hr className="my-2.5 border-border" />

        <p className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary">Adresa</p>
        <p className="text-[15px] text-ink">{location.address}</p>

        <a
          href={directionsUrl(location)}
          target="_blank"
          rel="noreferrer"
          className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-ink py-3.5 text-[15px] font-semibold text-surface"
        >
          Navigovat
        </a>

        {otherLocations.length > 0 && (
          <>
            <hr className="my-2.5 border-border" />
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary">Další pobočky</p>
            <div className="mt-1.5 flex flex-col gap-2.5">
              {otherLocations.map((other) => (
                <div key={other.id} className="flex items-center gap-2.5 rounded-xl border border-border bg-surface p-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{other.label ?? shop.name}</p>
                    <p className="text-xs text-ink-secondary">{other.address}</p>
                    <p className="text-xs font-medium" style={{ color: 'var(--color-forest)' }}>
                      {statusLabel(openingStatus(other.openingHours, now))}
                    </p>
                  </div>
                  <a
                    href={directionsUrl(other)}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Navigovat"
                    className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-background"
                  >
                    →
                  </a>
                </div>
              ))}
            </div>
          </>
        )}

        {(shop.websiteUrl || shop.instagramUrl) && (
          <div className="mt-1 flex gap-3">
            {shop.websiteUrl && (
              <a
                href={shop.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border py-3 text-sm font-medium text-ink"
              >
                Web
              </a>
            )}
            {shop.instagramUrl && (
              <a
                href={shop.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border py-3 text-sm font-medium text-ink"
              >
                Instagram
              </a>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
