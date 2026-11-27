import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useGetSuggestionsQuery } from "../../redux/api/suggestionsApi";
import { selectHid } from "../../redux/slice/UserSlice";

/** the typed text, settled for a moment, so the server is asked once per pause */
const useSettled = (value, ms = 220) => {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);
  return settled;
};

/**
 * Suggestions under an email / phone field, like Gmail's.
 *
 *   const s = useSuggestions({ type: "email", query: draft, exclude: chips, open: focused });
 *   <input onKeyDown={(e) => s.onKeyDown(e, pick)} ... />
 *   <SuggestionMenu state={s} anchorRef={wrapperRef} onPick={pick} />
 *
 * The list floats over everything (a portal under the field), so dialogs never clip it.
 */
export const useSuggestions = ({ type = "email", query = "", exclude = [], open = false }) => {
  const hid = useSelector(selectHid);
  const q = useSettled(query.trim());
  const { data = [], isFetching } = useGetSuggestionsQuery({ type, q, hid }, { skip: !open });
  const taken = new Set(exclude.map((x) => String(x).toLowerCase()));
  const items = data.filter((s) => !taken.has(String(s.value).toLowerCase()));
  const [active, setActive] = useState(0);
  useEffect(() => setActive(0), [q, open]);

  // ↑ ↓ to move, Enter / Tab to pick; returns true when the key was used
  const onKeyDown = useCallback(
    (e, pick) => {
      if (!open || !items.length) return false;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => (i + 1) % items.length);
        return true;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => (i - 1 + items.length) % items.length);
        return true;
      }
      // Enter picks the highlighted one only while the list is open and something is typed or chosen
      if ((e.key === "Enter" || e.key === "Tab") && items[active] && (query.trim() || e.key === "Enter")) {
        e.preventDefault();
        pick(items[active]);
        return true;
      }
      return false;
    },
    [open, items, active, query],
  );

  return { items: open ? items : [], active, setActive, onKeyDown, loading: isFetching, type };
};
