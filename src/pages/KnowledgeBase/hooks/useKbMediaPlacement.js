import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { useToast } from "../../../context/ToastContext";
import { mediaFileUrl, useGetLibraryPlacementsQuery, useGetMediaDraftPlacementsQuery } from "../../../redux/api/mediaApi";
import { findImagePath, placeImagesInKb, removeImageFromKb } from "../utils/placeMedia";

// Lets the Media tab (inside the Knowledge Base editor) move an image in the
// document and show where it sits. null outside the editor.
export const KbPlacementContext = createContext(null);
export const useKbPlacement = () => useContext(KbPlacementContext);

const describe = (places) => [...new Set(places)].join(", ");
const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

// Shows images in the Knowledge Base document where their title points:
//   title "Aroha Palms Majestic" -> Rooms › Inventory › Aroha Palms Majestic › images
// Like any other edit, the document keeps them only after "Save changes".
export default function useKbMediaPlacement({ draftId, count, kb, setKb }) {
  const { showToast } = useToast();
  const kbRef = useRef(kb);
  kbRef.current = kb;
  const handled = useRef(new Set()); // each image is placed once per editor session (removing it by hand sticks)

  const placeNew = useCallback(
    (placements, message) => {
      const fresh = (placements || []).filter((p) => !handled.current.has(p.assetId));
      if (!fresh.length) return;
      fresh.forEach((p) => handled.current.add(p.assetId));
      const { kb: next, places } = placeImagesInKb(kbRef.current, fresh.map((p) => ({ ...p, url: mediaFileUrl(p.url) })));
      if (!places.length) return;
      kbRef.current = next;
      setKb(next);
      showToast({ message: message(places), type: "success" });
    },
    [setKb, showToast],
  );

  // 1) saved library images whose title matches an item (a room, an outlet...)
  const { data: library } = useGetLibraryPlacementsQuery();
  useEffect(() => {
    placeNew(
      library?.map((p) => ({ ...p, matchOnly: true })),
      (places) => `${plural(places.length, "file")} from the Media library shown under ${describe(places)} (matched by title). Click Save changes to keep them there.`,
    );
  }, [library, placeNew]);

  // 2) images imported in this editor session (refetched whenever their number changes)
  const { data: drafts } = useGetMediaDraftPlacementsQuery({ draftId, count }, { skip: !count });
  useEffect(() => {
    placeNew(drafts, (places) => `${plural(places.length, "file")} added to ${describe(places)}. Click Save changes to keep them.`);
  }, [drafts, placeNew]);

  // 3) an image saved in the Media drawer: move it to where its title / collection points
  const placeAsset = useCallback(
    (asset, { moved = true } = {}) => {
      const url = mediaFileUrl(asset?.kbUrl);
      if (!url) return;
      handled.current.add(asset.id);
      if (!moved && findImagePath(kbRef.current, url)) return; // unchanged and already placed
      const cleared = removeImageFromKb(kbRef.current, url);
      const { kb: next, places } = placeImagesInKb(cleared, [{ category: asset.category, match: [asset.title, asset.subCategory], mediaKind: asset.mediaKind, roomIdentifier: asset.roomInfo?.identifier, url }]);
      if (next === kbRef.current) return;
      kbRef.current = next;
      setKb(next);
      showToast({
        message: places.length
          ? `File now in ${describe(places)} in the Knowledge Base. Click Save changes to keep it.`
          : "File removed from the Knowledge Base sections. Click Save changes to keep this.",
        type: "success",
      });
    },
    [setKb, showToast],
  );

  // 4) an image deleted in the Media drawer
  const unplaceAsset = useCallback(
    (asset) => {
      const next = removeImageFromKb(kbRef.current, mediaFileUrl(asset?.kbUrl));
      if (next === kbRef.current) return;
      kbRef.current = next;
      setKb(next);
    },
    [setKb],
  );

  // where an image sits in the document, e.g. ["Rooms", "Inventory", "Aroha Palms Majestic", "Images"]
  const pathOf = useCallback((asset) => findImagePath(kb, mediaFileUrl(asset?.kbUrl)), [kb]);

  return useMemo(() => ({ placeAsset, unplaceAsset, pathOf }), [placeAsset, unplaceAsset, pathOf]);
}
