'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { runWatchdogPipeline } from '@/lib/watchdog/pipeline';
import { sendDigestEmail } from '@/lib/watchdog/digest';
import { fetchAndExtractText } from '@/lib/watchdog/fetchSource';
import { extractCandidates, type ExtractedEvent } from '@/lib/watchdog/extract';
import { buildAndInsertCandidate } from '@/lib/watchdog/processCandidate';
import type { WatchSourceRow } from '@/lib/watchdog/types';

export async function runWatchdogNow(): Promise<{ sourcesChecked: number; newCandidates: number }> {
  await requireAuth();
  const summary = await runWatchdogPipeline();
  await sendDigestEmail(summary.newCandidates.map((c) => ({ id: c.id, title: c.title })));
  revalidatePath('/watchdog');
  revalidatePath('/watchdog/sources');
  return { sourcesChecked: summary.sourcesChecked, newCandidates: summary.newCandidates.length };
}

const REJECT_REASONS = ['není nákupní', 'mimo Prahu', 'duplicitní', 'špatná data', 'jiné'] as const;
export type RejectReason = (typeof REJECT_REASONS)[number];

export async function rejectCandidate(candidateId: string, reason: RejectReason): Promise<void> {
  await requireAuth();
  const { error } = await supabaseAdmin
    .from('event_candidates')
    .update({ status: 'rejected', rejected_reason: reason, reviewed_at: new Date().toISOString() })
    .eq('id', candidateId);
  if (error) throw error;
  revalidatePath('/watchdog');
}

export interface IgInboxResult {
  processed: number;
  inserted: number;
}

// The curator pastes a caption (optionally with the post URL somewhere in
// it); we regex out a URL if present for source_url, and run the same
// extraction + dedup path as the scheduled pipeline, with source_id null.
export async function processIgInboxText(pastedText: string): Promise<IgInboxResult> {
  await requireAuth();
  const trimmed = pastedText.trim();
  if (!trimmed) return { processed: 0, inserted: 0 };

  const urlMatch = trimmed.match(/https?:\/\/\S+/);
  const sourceUrl = urlMatch ? urlMatch[0] : null;

  const extracted: ExtractedEvent[] = await extractCandidates(trimmed, {
    name: 'Instagram inbox',
    url: sourceUrl ?? 'instagram-inbox',
  });
  const shoppable = extracted.filter((e) => e.is_shoppable);

  let inserted = 0;
  for (const event of shoppable) {
    const result = await buildAndInsertCandidate(event, {
      sourceId: null,
      sourceUrl,
      rawExcerpt: trimmed.slice(0, 4000),
    });
    if (result) inserted++;
  }

  revalidatePath('/watchdog');
  return { processed: shoppable.length, inserted };
}

export interface WatchSourceFormFields {
  name: string;
  type: WatchSourceRow['type'];
  url: string;
  active: boolean;
  notes: string | null;
}

export async function createSource(fields: WatchSourceFormFields): Promise<void> {
  await requireAuth();
  const { error } = await supabaseAdmin.from('watch_sources').insert(fields);
  if (error) throw error;
  revalidatePath('/watchdog/sources');
}

export async function updateSource(id: string, fields: WatchSourceFormFields): Promise<void> {
  await requireAuth();
  const { error } = await supabaseAdmin.from('watch_sources').update(fields).eq('id', id);
  if (error) throw error;
  revalidatePath('/watchdog/sources');
}

export async function deleteSource(id: string): Promise<void> {
  await requireAuth();
  const { error } = await supabaseAdmin.from('watch_sources').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/watchdog/sources');
}

export interface TestFetchResult {
  textPreview: string;
  extracted: ExtractedEvent[];
}

// Runs fetch+extract for one source live, without storing anything — lets
// the curator sanity-check extraction quality before trusting a source.
export async function testFetchSource(id: string): Promise<TestFetchResult> {
  await requireAuth();
  const { data: source, error } = await supabaseAdmin
    .from('watch_sources')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;

  const { text } = await fetchAndExtractText(source.url);
  const extracted = await extractCandidates(text, { name: source.name, url: source.url });
  return { textPreview: text.slice(0, 1000), extracted };
}
