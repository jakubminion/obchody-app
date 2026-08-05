import { getShops } from '@/lib/data';
import { supabaseAdmin } from '@/lib/supabase';
import type { EventCandidateRow } from '@/lib/watchdog/types';
import { EventEditor, type LocationOption } from '../EventEditor';

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: Promise<{ candidateId?: string }>;
}) {
  const { candidateId } = await searchParams;

  let candidate: EventCandidateRow | null = null;
  if (candidateId) {
    const { data, error } = await supabaseAdmin
      .from('event_candidates')
      .select('*')
      .eq('id', candidateId)
      .maybeSingle();
    if (error) throw error;
    candidate = data as EventCandidateRow | null;
  }

  const shops = await getShops();
  const locationOptions: LocationOption[] = shops.flatMap((shop) =>
    shop.locations.map((location) => ({
      id: location.id,
      label: location.label ? `${shop.name} · ${location.label}` : shop.name,
    })),
  );

  return <EventEditor event={null} candidate={candidate} locationOptions={locationOptions} />;
}
