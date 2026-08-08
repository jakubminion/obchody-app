import type { ViewMode } from '../components/ViewToggle';

// HomeApp's viewMode is plain component state — when the user opens a
// shop/event detail page, HomeApp unmounts, and Next's back navigation
// remounts it fresh (the client router cache doesn't restore client
// useState across a full unmount/remount here). sessionStorage is what
// actually survives that round trip, so the back button can return to
// "wherever they came from" instead of always resetting to the map.
const KEY = 'kousek:lastView';

export function rememberView(mode: ViewMode) {
  if (typeof window !== 'undefined') sessionStorage.setItem(KEY, mode);
}

// Consumed once, not just read — a stale value shouldn't stick around and
// hijack a later, unrelated fresh visit to "/".
export function consumeRememberedView(): ViewMode {
  if (typeof window === 'undefined') return 'map';
  const stored = sessionStorage.getItem(KEY);
  sessionStorage.removeItem(KEY);
  return stored === 'list' || stored === 'events' ? stored : 'map';
}
