'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import {
  createSource,
  deleteSource,
  testFetchSource,
  updateSource,
  type WatchSourceFormFields,
} from '../actions';
import type { WatchSourceRow } from '@/lib/watchdog/types';

const TYPES: WatchSourceRow['type'][] = ['website', 'rss', 'newsletter', 'instagram'];

interface Props {
  sources: WatchSourceRow[];
}

export function SourcesManager({ sources }: Props) {
  const router = useRouter();
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {sources.map((source) => (
          <SourceRow key={source.id} source={source} onChanged={() => router.refresh()} />
        ))}
      </div>

      {showNew ? (
        <SourceForm
          onSave={async (fields) => {
            await createSource(fields);
            setShowNew(false);
            router.refresh();
          }}
          onCancel={() => setShowNew(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setShowNew(true)}
          className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
        >
          + Nový zdroj
        </button>
      )}
    </div>
  );
}

function SourceRow({ source, onChanged }: { source: WatchSourceRow; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleTest() {
    setTestResult(null);
    startTransition(async () => {
      try {
        const result = await testFetchSource(source.id);
        setTestResult(
          `${result.extracted.length} kandidát(ů) nalezeno. Náhled textu: ${result.textPreview.slice(0, 200)}…`,
        );
      } catch (e) {
        setTestResult(`Chyba: ${e instanceof Error ? e.message : 'neznámá'}`);
      }
    });
  }

  function handleDelete() {
    if (!confirm(`Smazat zdroj „${source.name}“?`)) return;
    startTransition(async () => {
      await deleteSource(source.id);
      onChanged();
    });
  }

  if (editing) {
    return (
      <SourceForm
        initial={source}
        onSave={async (fields) => {
          await updateSource(source.id, fields);
          setEditing(false);
          onChanged();
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-neutral-900">{source.name}</span>
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">{source.type}</span>
            {!source.active && (
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-400">neaktivní</span>
            )}
            {source.consecutive_empty_runs >= 2 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                {source.consecutive_empty_runs}× bez výsledku
              </span>
            )}
          </div>
          <a href={source.url} target="_blank" rel="noreferrer" className="text-xs text-neutral-500 underline">
            {source.url}
          </a>
          <p className="text-xs text-neutral-400">
            {source.last_checked_at
              ? `Naposledy zkontrolováno: ${new Date(source.last_checked_at).toLocaleString('cs-CZ')}`
              : 'Zatím nezkontrolováno'}
          </p>
        </div>
        <div className="flex shrink-0 gap-2 text-xs">
          <button type="button" onClick={handleTest} disabled={pending} className="text-neutral-500 hover:text-neutral-900">
            Test fetch
          </button>
          <button type="button" onClick={() => setEditing(true)} className="text-neutral-500 hover:text-neutral-900">
            Upravit
          </button>
          <button type="button" onClick={handleDelete} disabled={pending} className="text-neutral-400 hover:text-red-600">
            Smazat
          </button>
        </div>
      </div>
      {testResult && <p className="mt-2 text-xs text-neutral-600">{testResult}</p>}
    </div>
  );
}

function SourceForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: WatchSourceRow;
  onSave: (fields: WatchSourceFormFields) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [type, setType] = useState<WatchSourceRow['type']>(initial?.type ?? 'website');
  const [url, setUrl] = useState(initial?.url ?? '');
  const [active, setActive] = useState(initial?.active ?? true);
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    setError(null);
    startTransition(async () => {
      try {
        await onSave({ name, type, url, active, notes: notes.trim() || null });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Uložení se nezdařilo.');
      }
    });
  }

  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
      <label className="block text-sm">
        <span className="mb-1 block text-neutral-500">Název</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-neutral-500">URL</span>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-neutral-500">Typ</span>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as WatchSourceRow['type'])}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm text-neutral-700">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
        Aktivní
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-neutral-500">Poznámky</span>
        <textarea
          value={notes ?? ''}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={pending || !name || !url}
          className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          Uložit
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-600"
        >
          Zrušit
        </button>
      </div>
    </div>
  );
}
