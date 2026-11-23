import { useCallback, useEffect, useRef, useState } from "react";
import { createEmailDraft, deleteEmailDraft, updateEmailDraft } from "../../redux/api/emailMarketingApi";

// how long after the last change the draft is saved, like Gmail
const SAVE_DELAY_MS = 1500;

// Gmail-style drafts for the compose window (gian /email-marketing/drafts).
//
//   enabled         false: does nothing (e.g. the Newsletter page)
//   initialId       the draft being continued, if any
//   buildPayload()  the compose window's content now
//   hasContent(p)   whether it is worth keeping (an untouched window is not)
//   onCreated(id)   after the first save made a new draft (refresh the list)
//
// Saves run one after another, never twice at once, and a change that was
// already saved is not sent again. block() stops saving (while sending);
// discard() stops it for good and deletes the draft.
export function useDraftAutosave({ enabled, initialId = null, buildPayload, hasContent, onCreated }) {
  const idRef = useRef(initialId);
  const timerRef = useRef(null);
  const queueRef = useRef(Promise.resolve());
  const lastJsonRef = useRef(null);
  const blockedRef = useRef(false);
  const latest = useRef({ buildPayload, hasContent, onCreated });
  const [status, setStatus] = useState(initialId ? "saved" : "idle"); // idle | saving | saved | error
  const [error, setError] = useState("");

  useEffect(() => {
    latest.current = { buildPayload, hasContent, onCreated };
  });

  // a draft opened again is already saved as it is
  useEffect(() => {
    if (initialId) lastJsonRef.current = JSON.stringify(latest.current.buildPayload());
  }, [initialId]);

  const save = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = null;
    queueRef.current = queueRef.current.then(async () => {
      if (!enabled || blockedRef.current) return;
      const payload = latest.current.buildPayload();
      if (!idRef.current && !latest.current.hasContent(payload)) return;
      const json = JSON.stringify(payload);
      if (json === lastJsonRef.current) return;

      setStatus("saving");
      try {
        if (idRef.current) {
          try {
            await updateEmailDraft(idRef.current, payload);
          } catch (err) {
            // deleted meanwhile (sent or discarded in another tab): save it as a new draft
            if (err?.status !== 404) throw err;
            idRef.current = null;
          }
        }
        if (!idRef.current) {
          const result = await createEmailDraft(payload);
          idRef.current = result?.draft?._id || null;
          latest.current.onCreated?.(idRef.current);
        }
        lastJsonRef.current = json;
        setStatus("saved");
        setError("");
      } catch (err) {
        setStatus("error");
        setError(err?.message || "Couldn't save the draft.");
      }
    });
    return queueRef.current;
  }, [enabled]);

  const schedule = useCallback(() => {
    if (!enabled || blockedRef.current) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(save, SAVE_DELAY_MS);
  }, [enabled, save]);

  const block = useCallback(() => {
    blockedRef.current = true;
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const unblock = useCallback(() => {
    blockedRef.current = false;
  }, []);

  // thrown away (Discard) or sent: no more saving, and the draft goes
  const discard = useCallback(async () => {
    block();
    await queueRef.current;
    const id = idRef.current;
    idRef.current = null;
    if (id) await deleteEmailDraft(id).catch(() => {});
    return Boolean(id);
  }, [block]);

  // closed some other way (page left) with a change still waiting: save it
  useEffect(
    () => () => {
      if (timerRef.current && !blockedRef.current) save();
    },
    [save],
  );

  return {
    status,
    error,
    schedule,
    save,
    block,
    unblock,
    discard,
    hasDraft: () => Boolean(idRef.current),
  };
}
