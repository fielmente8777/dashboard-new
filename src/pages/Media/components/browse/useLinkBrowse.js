import { useCallback, useEffect, useRef, useState } from "react";
import useDebounce from "../../../../hooks/useDebounce";
import { useBrowseMediaLinkMutation } from "../../../../redux/api/mediaApi";
import { initialSelection, selectedImages, toRequest } from "./browseSelection";

// Browses every pasted link as soon as it is pasted (listing only, nothing is
// downloaded): folders to choose from, or a preview of the images.
export default function useLinkBrowse(links) {
  const [browse] = useBrowseMediaLinkMutation();
  const [entries, setEntries] = useState({}); // link -> { status, data, error, sel }
  const settled = useDebounce(links, 500);
  const started = useRef(new Set());

  useEffect(() => {
    settled.forEach((link) => {
      if (started.current.has(link)) return;
      started.current.add(link);
      setEntries((e) => ({ ...e, [link]: { status: "loading", sel: initialSelection() } }));
      browse(link)
        .unwrap()
        .then((data) => setEntries((e) => ({ ...e, [link]: { ...e[link], status: "ready", data } })))
        .catch((err) => {
          started.current.delete(link); // try again if pasted again
          setEntries((e) => ({ ...e, [link]: { ...e[link], status: "error", error: err?.data?.error || "This link could not be read." } }));
        });
    });
  }, [settled, browse]);

  const setSelection = useCallback((link, update) => setEntries((e) => ({ ...e, [link]: { ...e[link], sel: update(e[link].sel) } })), []);

  const current = links.map((link) => ({ link, ...(entries[link] || { status: "loading", sel: initialSelection() }) }));
  const ready = current.filter((c) => c.status === "ready");
  // a link with folders needs at least one folder chosen; a preview needs at least one image
  const missingChoice = ready.filter((c) => !selectedImages(c.data, c.sel).length);

  return {
    entries: current,
    setSelection,
    loading: current.some((c) => c.status === "loading"),
    missingChoice,
    selections: ready.map((c) => toRequest(c.link, c.data, c.sel)).filter(Boolean),
    selectedCount: ready.reduce((n, c) => n + selectedImages(c.data, c.sel).length, 0),
  };
}
