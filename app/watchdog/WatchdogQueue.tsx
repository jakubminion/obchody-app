'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { rejectCandidate, runWatchdogNow, type RejectReason } from './actions';
import type { EventCandidateRow } from '@/lib/watchdog/types';

const REJECT_REASONS: RejectReason[] = ['není nákupní', 'mimo Prahu', 'duplicitní', 'špatná data', 'jiné'];

const FLAG_LABELS: Record<string, string> = {
  needs_date: 'chybí datum',
  low_confidence: 'nízká jistota',
  venue_unmatched: 'nespárováno',
};

interface Props {
  candidates: EventCandidateRow[];
}

export function WatchdogQueue({ candidates }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [runResult, setRunResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleRunNow() {
    setError(null);
    setRunResult(null);
    startTransition(async () => {
      try {
        const result = await runWatchdogNow();
        setRunResult(`Zkontrolováno ${result.sourcesChecked} zdrojů, ${result.newCandidates} nových kandidátů.`);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Spuštění se nezdařilo.');
      }
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={handleRunNow}
          disabled={pending}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {pending ? 'Spouštím…' : 'Spustit teď'}
        </button>
        {runResult && <p className="text-sm text-emerald-600">{runResult}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      {candidates.length === 0 ? (
        <p className="text-sm text-neutral-400">Žádní čekající kandidáti.</p>
      ) : (
        <div className="space-y-4">
          {candidates.map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))}
        </div>
      )}
    </div>
  );
}

function CandidateCard({ candidate }: { candidate: EventCandidateRow }) {
  const [showExcerpt, setShowExcerpt] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleReject(reason: RejectReason) {
    startTransition(async () => {
      await rejectCandidate(candidate.id, reason);
      router.refresh();
    });
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-neutral-900">{candidate.title ?? '(bez názvu)'}</h2>
          <p className="text-sm text-neutral-500">
            {candidate.starts_at ? new Date(candidate.starts_at).toLocaleDateString('cs-CZ') : 'datum neznámé'}
            {candidate.ends_at ? ` – ${new Date(candidate.ends_at).toLocaleDateString('cs-CZ')}` : ''}
          </p>
        </div>
        {candidate.confidence !== null && (
          <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
            jistota {Math.round(candidate.confidence * 100)}%
          </span>
        )}
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-neutral-600">
        <span>{candidate.venue_name ?? candidate.address_raw ?? '—'}</span>
        {candidate.matched_location_id ? (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
            spárováno
          </span>
        ) : (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
            nespárováno
          </span>
        )}
        {candidate.flags
          .filter((f) => f !== 'venue_unmatched')
          .map((f) => (
            <span key={f} className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500">
              {FLAG_LABELS[f] ?? f}
            </span>
          ))}
      </div>

      {candidate.description && <p className="mb-3 text-sm text-neutral-700">{candidate.description}</p>}

      {candidate.image_url && (
        <div className="relative mb-3 h-32 w-full overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
          <Image src={candidate.image_url} alt="" fill sizes="600px" className="object-cover" unoptimized />
          <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
            neověřeno
          </span>
        </div>
      )}

      <div className="mb-3 flex items-center gap-3 text-xs">
        {candidate.source_url && (
          <a href={candidate.source_url} target="_blank" rel="noreferrer" className="text-neutral-500 underline">
            zdroj
          </a>
        )}
        {candidate.raw_excerpt && (
          <button type="button" onClick={() => setShowExcerpt((v) => !v)} className="text-neutral-500 underline">
            {showExcerpt ? 'skrýt text' : 'zobrazit text'}
          </button>
        )}
      </div>

      {showExcerpt && candidate.raw_excerpt && (
        <pre className="mb-3 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-neutral-50 p-3 text-xs text-neutral-600">
          {candidate.raw_excerpt}
        </pre>
      )}

      <div className="flex items-center gap-2">
        <Link
          href={`/events/new?candidateId=${candidate.id}`}
          className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800"
        >
          Schválit
        </Link>
        {!rejecting ? (
          <button
            type="button"
            onClick={() => setRejecting(true)}
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:border-neutral-400"
          >
            Zamítnout
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-1">
            {REJECT_REASONS.map((reason) => (
              <button
                key={reason}
                type="button"
                disabled={pending}
                onClick={() => handleReject(reason)}
                className="rounded-full border border-neutral-300 px-2 py-1 text-xs text-neutral-600 hover:border-red-400 hover:text-red-600 disabled:opacity-50"
              >
                {reason}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
