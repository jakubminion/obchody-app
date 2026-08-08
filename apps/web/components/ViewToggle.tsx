'use client';

export type ViewMode = 'map' | 'list' | 'events';

interface Props {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const MODES: { mode: ViewMode; label: string }[] = [
  { mode: 'map', label: 'Mapa' },
  { mode: 'list', label: 'Seznam' },
  { mode: 'events', label: 'Akce' },
];

// Ported from moje-aplikace/src/components/ViewToggle.tsx — same
// Mapa/Seznam/Akce switch. A plain styled segmented control here rather
// than an imitation of the native glass-effect look, which doesn't have an
// honest web equivalent.
export function ViewToggle({ value, onChange }: Props) {
  return (
    <div
      className="pointer-events-auto absolute left-1/2 flex -translate-x-1/2 gap-1 rounded-full border border-border bg-surface/95 p-1 shadow-lg backdrop-blur"
      // calc(...) instead of a bottom-* utility — clears the iPhone home
      // indicator on notched devices (needs viewport-fit=cover, set in
      // app/layout.tsx's viewport export) while still leaving the same
      // 24px gap as before on browsers/devices without a safe-area inset.
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}
    >
      {MODES.map(({ mode, label }) => (
        <button
          key={mode}
          type="button"
          onClick={() => onChange(mode)}
          className={`min-h-11 rounded-full px-4 text-sm font-semibold transition ${
            value === mode ? 'bg-ink text-surface' : 'text-ink-secondary'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
