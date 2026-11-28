import { useEffect, useRef } from "react";

// "Undo send": an undone campaign gives back what its compose window held (`restore`). Undo
// can be pressed in the bar after sending or on the campaign's card deep in the Sent list,
// so instead of passing a callback through every level, it is announced on the page and the
// page that owns the compose window opens it again.
const EVENT = "eazotel:email-undone";

export const announceUndone = (restore) => {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { restore: restore || {} } }));
};

// handler(restore): open the compose window with it
export function useOnUndone(handler) {
  const latest = useRef(handler);
  useEffect(() => {
    latest.current = handler;
  }, [handler]);
  useEffect(() => {
    const listener = (event) => latest.current?.(event.detail?.restore || {});
    window.addEventListener(EVENT, listener);
    return () => window.removeEventListener(EVENT, listener);
  }, []);
}

// the compose window's `compose` state from what Undo gave back (ComposeEmail initialDraft)
export const composeFromRestore = (restore) => ({
  key: `undo-${Date.now()}`,
  batchId: restore.recipientBatchId || null,
  count: restore.recipientCount || 0,
  label: restore.recipientLabel || "",
  template: null,
  draft: {
    subject: restore.subject || "",
    previewText: restore.previewText || "",
    fromEmail: restore.fromEmail || "",
    toEmails: Array.isArray(restore.toEmails) ? restore.toEmails : [],
    bodyHtml: restore.bodyHtml || "",
    template: restore.template?.html ? restore.template : null,
  },
});

// "4:59"
export const countdown = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};
