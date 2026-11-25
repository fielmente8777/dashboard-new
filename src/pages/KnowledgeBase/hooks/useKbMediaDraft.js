import { useEffect, useRef, useState } from "react";
import { useConfirm } from "../../../context/ConfirmContext";
import { useAdoptMediaDraftsMutation, useGetMediaDraftQuery, usePublishMediaDraftMutation } from "../../../redux/api/mediaApi";
import { discardDraft, newDraftId } from "../../Media/review/discardDraft";

// Images imported in the Knowledge Base editor wait for "Save changes".
// Saved -> published into the Knowledge Base. Left without saving -> deleted.
export default function useKbMediaDraft() {
  const { confirm } = useConfirm();
  const [draftId] = useState(newDraftId);
  const { data: count = 0 } = useGetMediaDraftQuery(draftId);
  const [publishDraft, { isLoading: publishing }] = usePublishMediaDraftMutation();
  const [adopt] = useAdoptMediaDraftsMutation();
  const unsaved = useRef(0);
  unsaved.current = count;
  const mounted = useRef(false);

  // images left unsaved by a closed session (left while its import was still finishing,
  // tab crash) would be invisible: bring them into this session so they can be saved
  const adopted = useRef(false);
  useEffect(() => {
    if (adopted.current) return;
    adopted.current = true;
    adopt(draftId).catch(() => undefined);
  }, [adopt, draftId]);

  useEffect(() => {
    mounted.current = true;
    // closing / reloading the tab: warn, and drop the draft if they leave anyway
    const warn = (e) => {
      if (!unsaved.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    const drop = () => unsaved.current && discardDraft(draftId);
    window.addEventListener("beforeunload", warn);
    window.addEventListener("pagehide", drop);
    return () => {
      window.removeEventListener("beforeunload", warn);
      window.removeEventListener("pagehide", drop);
      // editor closed (navigation): unsaved images are removed. Deferred so a
      // development remount (React StrictMode) does not discard a live session.
      mounted.current = false;
      setTimeout(() => {
        if (!mounted.current) discardDraft(draftId);
      }, 0);
    };
  }, [draftId]);

  /** After a successful "Save changes". Returns how many images were published. */
  const publish = async () => (unsaved.current ? (await publishDraft(draftId).unwrap()).published : 0);

  /** Back / Start over: confirm when there are unsaved images, then discard them. */
  const leave = async (proceed) => {
    if (unsaved.current) {
      const ok = await confirm(
        `${unsaved.current} imported image${unsaved.current === 1 ? " is" : "s are"} not saved. Leave and remove ${unsaved.current === 1 ? "it" : "them"}?`,
        { title: "Unsaved images", confirmText: "Leave and remove" },
      );
      if (!ok) return;
      await discardDraft(draftId);
    }
    proceed();
  };

  return { draftId, count, publishing, publish, leave };
}
