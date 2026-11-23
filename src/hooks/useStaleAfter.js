import { useCallback, useEffect, useState } from "react";

// Says when data on screen has got old, so the page can offer a Refresh
// instead of polling the server. The timer runs only in the browser: it
// never makes a request, the user decides when to load again.
//
//   const { stale, loadedAt, markFresh } = useStaleAfter(30_000, { enabled });
//   - call markFresh() every time the data has just been loaded
//   - stale turns true `ms` after the last load (never while !enabled)
//   - loadedAt is when it was last loaded, for "updated 2 min ago"
export default function useStaleAfter(ms, { enabled = true } = {}) {
  const [loadedAt, setLoadedAt] = useState(() => Date.now());
  const [stale, setStale] = useState(false);

  const markFresh = useCallback(() => {
    setLoadedAt(Date.now());
    setStale(false);
  }, []);

  useEffect(() => {
    if (!enabled || !ms) {
      setStale(false);
      return undefined;
    }
    const wait = Math.max(0, loadedAt + ms - Date.now());
    const timer = setTimeout(() => setStale(true), wait);
    return () => clearTimeout(timer);
  }, [enabled, ms, loadedAt]);

  return { stale, loadedAt, markFresh };
}
