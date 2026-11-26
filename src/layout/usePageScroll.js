import { useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// where each visited page was scrolled to, by history entry (kept for the session)
const positions = new Map();

// The dashboard's pages scroll inside one box that stays on screen from page
// to page, so without this a new page opened as far down as the last one was.
// Opening a page starts it at the top; Back / Forward return to where that
// page was left. Changing only the query (a tab, a filter) keeps the place.
// Returns the ref for the scrolling box.
export const usePageScroll = () => {
  const ref = useRef(null);
  const { pathname, key } = useLocation();
  const navigationType = useNavigationType();

  useLayoutEffect(() => {
    const box = ref.current;
    if (!box) return undefined;
    const saved = navigationType === "POP" ? positions.get(key) : undefined;
    box.scrollTo({ top: saved ?? 0, left: 0, behavior: "instant" });
    // a page that is still loading may be too short to reach the old place yet
    const retry = saved ? requestAnimationFrame(() => box.scrollTo({ top: saved, behavior: "instant" })) : null;

    return () => {
      if (retry) cancelAnimationFrame(retry);
      positions.set(key, box.scrollTop);
    };
    // only a new page (pathname) resets the scroll, not a query change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return ref;
};
