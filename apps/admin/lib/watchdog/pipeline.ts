import 'server-only';
import * as Sentry from '@sentry/nextjs';
import { supabaseAdmin } from '@kousek/db/admin';
import { fetchAndExtractText } from './fetchSource';
import { extractCandidates } from './extract';
import { buildAndInsertCandidate } from './processCandidate';
import type { EventCandidateRow, PipelineRunSummary, WatchSourceRow } from './types';

// Orchestrates one full run: fetch every active source → skip if content
// unchanged since last run → extract shoppable candidates via the LLM →
// dedup/geocode/insert. Shared by the cron route and the "Spustit teď"
// admin action, so both paths behave identically.
export async function runWatchdogPipeline(): Promise<PipelineRunSummary> {
  const { data: sources, error } = await supabaseAdmin()
    .from('watch_sources')
    .select('*')
    .eq('active', true);
  if (error) throw error;

  const newCandidates: EventCandidateRow[] = [];
  let sourcesChecked = 0;

  for (const source of (sources ?? []) as WatchSourceRow[]) {
    sourcesChecked++;
    try {
      const { text, hash } = await fetchAndExtractText(source.url);

      if (hash === source.last_content_hash) {
        // Unchanged since last check — skip the LLM call entirely, just
        // record that we checked.
        await supabaseAdmin()
          .from('watch_sources')
          .update({ last_checked_at: new Date().toISOString() })
          .eq('id', source.id);
        continue;
      }

      const extracted = await extractCandidates(text, { name: source.name, url: source.url });
      const shoppable = extracted.filter((e) => e.is_shoppable);

      let insertedForSource = 0;
      for (const event of shoppable) {
        const inserted = await buildAndInsertCandidate(event, {
          sourceId: source.id,
          sourceUrl: source.url,
          rawExcerpt: text.slice(0, 4000),
        });
        if (inserted) {
          newCandidates.push(inserted);
          insertedForSource++;
        }
      }

      await supabaseAdmin()
        .from('watch_sources')
        .update({
          last_checked_at: new Date().toISOString(),
          last_content_hash: hash,
          consecutive_empty_runs: insertedForSource > 0 ? 0 : source.consecutive_empty_runs + 1,
        })
        .eq('id', source.id);
    } catch (err) {
      // One bad source (dead link, layout change, transient network error)
      // must not abort the whole run — but it must still be visible
      // somewhere the curator will actually see it, not just a Vercel log.
      console.error(`Watchdog: failed to process source "${source.name}" (${source.url}):`, err);
      Sentry.captureException(err, { extra: { sourceId: source.id, sourceName: source.name, sourceUrl: source.url } });
    }
  }

  return { sourcesChecked, newCandidates };
}
