export interface WatchSourceRow {
  id: string;
  name: string;
  type: 'website' | 'rss' | 'newsletter' | 'instagram';
  url: string;
  active: boolean;
  last_checked_at: string | null;
  last_content_hash: string | null;
  consecutive_empty_runs: number;
  notes: string | null;
}

export type CandidateFlag = 'needs_date' | 'low_confidence' | 'venue_unmatched';

export interface EventCandidateRow {
  id: string;
  fingerprint: string;
  source_id: string | null;
  source_url: string | null;
  raw_excerpt: string | null;
  title: string | null;
  description: string | null;
  starts_at: string | null;
  ends_at: string | null;
  opens_time: string | null;
  closes_time: string | null;
  venue_name: string | null;
  address_raw: string | null;
  lat: number | null;
  lng: number | null;
  matched_location_id: string | null;
  image_url: string | null;
  confidence: number | null;
  flags: CandidateFlag[];
  status: 'pending' | 'approved' | 'rejected';
  rejected_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export interface EventRow {
  id: string;
  fingerprint: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  opens_time: string | null;
  closes_time: string | null;
  venue_name: string | null;
  location_id: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  image_url: string | null;
  source_url: string | null;
  candidate_id: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface PipelineRunSummary {
  sourcesChecked: number;
  newCandidates: EventCandidateRow[];
}

const LOW_CONFIDENCE_THRESHOLD = 0.5;

export { LOW_CONFIDENCE_THRESHOLD };
