import { useCallback, useEffect, useRef, useState } from "react";

// A list read a page at a time with a cursor (gian answers { items, next, note }).
//   const feed = usePagedFeed(trigger, args, key)
//   trigger - an RTK lazy query trigger; args - its arguments without `after`;
//   key     - changes when the list must start over (property, platform, dates).
// feed: { items, note, loading, loadingMore, error, hasMore, loadMore, reload }
export const usePagedFeed = (trigger, args, key, skip = false) => {
  const [state, setState] = useState({ items: [], next: null, note: null, loading: true, loadingMore: false, error: null });
  const run = useRef(0);
  const argsRef = useRef(args);
  argsRef.current = args;

  const fetchPage = useCallback(
    async (after, append) => {
      const id = ++run.current;
      setState((s) => ({ ...s, loading: !append, loadingMore: append, error: null }));
      try {
        const page = await trigger({ ...argsRef.current, after }, true).unwrap();
        if (id !== run.current) return; // a newer list was asked for meanwhile
        setState((s) => ({
          items: append ? [...s.items, ...(page?.items || [])] : page?.items || [],
          next: page?.next || null,
          note: page?.note || null,
          loading: false,
          loadingMore: false,
          error: null,
        }));
      } catch (error) {
        if (id !== run.current) return;
        setState((s) => ({ ...s, loading: false, loadingMore: false, error }));
      }
    },
    [trigger],
  );

  useEffect(() => {
    if (skip) return;
    fetchPage(null, false);
  }, [key, skip, fetchPage]);

  return {
    ...state,
    hasMore: Boolean(state.next),
    loadMore: () => state.next && !state.loadingMore && fetchPage(state.next, true),
    reload: () => fetchPage(null, false),
  };
};
