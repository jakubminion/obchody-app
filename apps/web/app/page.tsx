import { mapEventRow, mapShopRow, supabasePublic, type AppEvent, type Shop } from '@kousek/db';
import { HomeApp } from './HomeApp';

// SSR, not SSG — this feeds a live map/list, and the admin panel writes to
// these same tables; a static/ISR page doesn't fit "live" the way the
// SEO-critical /obchod/[slug] pages do.
export const dynamic = 'force-dynamic';

async function getShops(): Promise<Shop[]> {
  const { data, error } = await supabasePublic()
    .from('shops')
    .select('*, locations(*)')
    .eq('published', true)
    .order('name');
  if (error) throw error;
  return (data ?? []).map(mapShopRow);
}

async function getEvents(): Promise<AppEvent[]> {
  const { data, error } = await supabasePublic().from('events').select('*').eq('published', true);
  if (error) throw error;
  return (data ?? []).map(mapEventRow);
}

export default async function HomePage() {
  const [shops, events] = await Promise.all([getShops(), getEvents()]);
  return <HomeApp shops={shops} events={events} />;
}
