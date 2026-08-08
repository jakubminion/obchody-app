import { notFound } from 'next/navigation';
import { getShops } from '@/lib/data';
import { supabaseAdmin } from '@kousek/db/admin';
import type { EventRow } from '@/lib/watchdog/types';
import { EventEditor, type LocationOption } from '../EventEditor';

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data, error } = await supabaseAdmin().from('events').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  if (!data) notFound();

  const shops = await getShops();
  const locationOptions: LocationOption[] = shops.flatMap((shop) =>
    shop.locations.map((location) => ({
      id: location.id,
      label: location.label ? `${shop.name} · ${location.label}` : shop.name,
      lat: location.lat,
      lng: location.lng,
    })),
  );

  return <EventEditor event={data as EventRow} candidate={null} locationOptions={locationOptions} />;
}
