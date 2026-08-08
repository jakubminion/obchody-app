'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@kousek/db/admin';
import { uploadToBucket, extFromMime } from '@/lib/storage';
import { buildFingerprint } from '@/lib/watchdog/fingerprint';

export interface EventFormFields {
  title: string;
  description: string | null;
  startsAt: string; // ISO date — the first day the event runs
  endsAt: string | null; // ISO date — the last day, or null if single-day
  opensTime: string | null; // "HH:MM", daily opening time within the date range
  closesTime: string | null; // "HH:MM", daily closing time within the date range
  venueName: string | null;
  locationId: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  imageUrl: string | null;
  sourceUrl: string | null;
  published: boolean;
  candidateId: string | null;
}

function toRow(fields: EventFormFields) {
  return {
    title: fields.title,
    description: fields.description,
    starts_at: fields.startsAt,
    ends_at: fields.endsAt,
    opens_time: fields.opensTime,
    closes_time: fields.closesTime,
    venue_name: fields.venueName,
    location_id: fields.locationId,
    address: fields.address,
    lat: fields.lat,
    lng: fields.lng,
    image_url: fields.imageUrl,
    source_url: fields.sourceUrl,
    published: fields.published,
    candidate_id: fields.candidateId,
    fingerprint: buildFingerprint({ title: fields.title, startsAt: fields.startsAt, venueName: fields.venueName }),
  };
}

export async function createEvent(fields: EventFormFields): Promise<never> {
  await requireAuth();
  const { data, error } = await supabaseAdmin().from('events').insert(toRow(fields)).select('id').single();
  if (error) throw error;

  if (fields.candidateId) {
    const { error: candidateError } = await supabaseAdmin()
      .from('event_candidates')
      .update({ status: 'approved', reviewed_at: new Date().toISOString() })
      .eq('id', fields.candidateId);
    if (candidateError) throw candidateError;
  }

  revalidatePath('/watchdog');
  revalidatePath('/events');
  redirect(`/events/${data.id}`);
}

export async function saveEvent(id: string, fields: EventFormFields): Promise<void> {
  await requireAuth();
  const { error } = await supabaseAdmin().from('events').update(toRow(fields)).eq('id', id);
  if (error) throw error;
  revalidatePath(`/events/${id}`);
  revalidatePath('/events');
}

export async function deleteEvent(id: string): Promise<never> {
  await requireAuth();
  const { error } = await supabaseAdmin().from('events').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/events');
  redirect('/events');
}

export async function uploadEventImage(eventId: string, file: File): Promise<string> {
  await requireAuth();
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = extFromMime(file.type);
  const url = await uploadToBucket('event-images', `${eventId}.${ext}`, buffer, file.type || 'image/jpeg');
  revalidatePath(`/events/${eventId}`);
  return url;
}

// Curator's deliberate choice to fetch-and-store an organizer's poster —
// attribution is kept via the event's own source_url field. Never done
// automatically by the pipeline itself.
export async function fetchAndStoreCandidateImage(eventId: string, imageUrl: string): Promise<string> {
  await requireAuth();
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`Nepodařilo se stáhnout obrázek (HTTP ${res.status}).`);
  const contentType = res.headers.get('content-type') ?? 'image/jpeg';
  const buffer = Buffer.from(await res.arrayBuffer());
  const ext = extFromMime(contentType);
  const url = await uploadToBucket('event-images', `${eventId}.${ext}`, buffer, contentType);
  revalidatePath(`/events/${eventId}`);
  return url;
}
