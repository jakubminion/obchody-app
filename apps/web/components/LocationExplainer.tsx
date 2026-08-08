'use client';

interface Props {
  onContinue: () => void;
}

// Ported from moje-aplikace/src/components/LocationExplainer.tsx.
export function LocationExplainer({ onContinue }: Props) {
  return (
    <div
      className="absolute inset-0 z-30 flex flex-col justify-between bg-background px-6"
      style={{
        paddingTop: 'max(2.5rem, env(safe-area-inset-top))',
        paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))',
      }}
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <div className="mb-2 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-ink">
          <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="var(--surface)" strokeWidth={2}>
            <path d="M12 22s7-7.58 7-12.5A7 7 0 0 0 5 9.5C5 14.42 12 22 12 22Z" />
            <circle cx={12} cy={9.5} r={2.5} />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-ink">Kousek od vás</h1>
        <p className="max-w-xs text-[15px] leading-relaxed text-ink-secondary">
          Abychom vám mohli ukázat vybrané obchody ve vašem okolí a jejich vzdálenost, potřebujeme znát vaši
          polohu. Polohu nikam neukládáme ani nesledujeme.
        </p>
      </div>
      <button
        type="button"
        onClick={onContinue}
        className="rounded-xl bg-ink py-4 text-base font-semibold text-surface"
      >
        Pokračovat
      </button>
    </div>
  );
}
