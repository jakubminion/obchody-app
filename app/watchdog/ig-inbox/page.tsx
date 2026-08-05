'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { processIgInboxText } from '../actions';

export default function IgInboxPage() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleProcess() {
    setError(null);
    setResult(null);
    startTransition(async () => {
      try {
        const { processed, inserted } = await processIgInboxText(text);
        setResult(
          processed === 0
            ? 'Žádná nákupní akce v textu nenalezena.'
            : `${inserted} z ${processed} nákupních akcí přidáno do fronty (zbytek už tam byl).`,
        );
        setText('');
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Zpracování se nezdařilo.');
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">IG schránka</h1>
        <Link href="/watchdog" className="text-sm text-neutral-400 hover:text-neutral-700">
          ← Hlídač akcí
        </Link>
      </div>

      <p className="mb-4 text-sm text-neutral-500">
        Vlož text popisku Instagram příspěvku (klidně i s odkazem na příspěvek) a zpracuj ho stejnou extrakcí jako
        automatické zdroje.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        placeholder="https://instagram.com/p/... &#10;&#10;Text popisku..."
        className="mb-3 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      {result && <p className="mb-3 text-sm text-emerald-600">{result}</p>}

      <button
        type="button"
        onClick={handleProcess}
        disabled={pending || !text.trim()}
        className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
      >
        {pending ? 'Zpracovávám…' : 'Zpracovat'}
      </button>
    </div>
  );
}
