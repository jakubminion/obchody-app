import 'server-only';
import { supabaseAdmin } from '@kousek/db/admin';
import { buildFingerprint } from './fingerprint';
import { matchVenueToLocation } from './matchLocation';
import { geocodeAddress } from './geocode';
import type { ExtractedEvent } from './extract';
import type { CandidateFlag, EventCandidateRow } from './types';
import { LOW_CONFIDENCE_THRESHOLD } from './types';

export interface ProcessOptions {
  sourceId: string | null;
  sourceUrl: string | null;
  rawExcerpt?: string | null;
}

// Dedup + geocode/venue-match + flag + insert for one extracted event.
// Returns null if it's a duplicate (fingerprint already exists in either
// event_candidates or events — this is what makes both rejection memory
// and re-running the pipeline idempotent).
export async function buildAndInsertCandidate(
  extracted: ExtractedEvent,
  options: ProcessOptions,
): Promise<EventCandidateRow | null> {
  const fingerprint = buildFingerprint({
    title: extracted.title,
    startsAt: extracted.starts_at,
    venueName: extracted.venue_name,
  });

  const [{ data: existingCandidate }, { data: existingEvent }] = await Promise.all([
    supabaseAdmin().from('event_candidates').select('id').eq('fingerprint', fingerprint).maybeSingle(),
    supabaseAdmin().from('events').select('id').eq('fingerprint', fingerprint).maybeSingle(),
  ]);
  if (existingCandidate || existingEvent) return null;

  let lat: number | null = null;
  let lng: number | null = null;
  const matchedLocationId = await matchVenueToLocation(extracted.venue_name);
  if (!matchedLocationId && extracted.address_raw) {
    const geocoded = await geocodeAddress(extracted.address_raw);
    if (geocoded) {
      lat = geocoded.lat;
      lng = geocoded.lng;
    }
  }

  const flags: CandidateFlag[] = [];
  if (!extracted.starts_at) flags.push('needs_date');
  if (extracted.confidence < LOW_CONFIDENCE_THRESHOLD) flags.push('low_confidence');
  if (!matchedLocationId) flags.push('venue_unmatched');

  const { data, error } = await supabaseAdmin()
    .from('event_candidates')
    .insert({
      fingerprint,
      source_id: options.sourceId,
      source_url: options.sourceUrl,
      raw_excerpt: options.rawExcerpt ?? null,
      title: extracted.title,
      description: extracted.description,
      starts_at: extracted.starts_at,
      ends_at: extracted.ends_at,
      venue_name: extracted.venue_name,
      address_raw: extracted.address_raw,
      lat,
      lng,
      matched_location_id: matchedLocationId,
      image_url: extracted.image_url,
      confidence: extracted.confidence,
      flags,
    })
    .select()
    .single();
  if (error) throw error;
  return data as EventCandidateRow;
}
