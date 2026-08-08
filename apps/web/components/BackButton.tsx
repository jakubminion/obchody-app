'use client';

import { useRouter } from 'next/navigation';

// Browser history back, not a Link to "/" — a Link would always land on
// the map view. Next's client router cache restores whichever HomeApp
// state (map with the preview card open, or the Seznam list at its
// scroll position) was actually showing when the user tapped through,
// so "back" genuinely means "back to wherever they came from."
export function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="Zpět"
      className="fixed left-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-surface/90 shadow-lg backdrop-blur"
      style={{ top: 'max(0.75rem, calc(env(safe-area-inset-top) + 0.5rem))' }}
    >
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth={2.5}>
        <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
