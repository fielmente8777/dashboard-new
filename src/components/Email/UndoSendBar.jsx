import { Clock, Send, Undo2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useToast } from "../../context/ToastContext";
import { sendEmailCampaignNow, undoEmailCampaign } from "../../redux/api/emailMarketingApi";
import Button from "../ui/Button";
import { announceUndone, countdown } from "./undoSend";

const formatNumber = (n) => (n || 0).toLocaleString("en-IN");

/**
 * Right after Send: "Sending to 2,682 people in 4:59 · Undo · Send now". A new campaign waits a
 * few minutes on the server (gian campaignQueue) so a mistake can be caught. Undo cancels it
 * (nothing is sent) and the page opens the email again (announceUndone). Closing the bar
 * changes nothing: the campaign's card in Sent has the same Undo / Send now.
 *   queued   { campaignId, scheduledAt, count, label } or null
 *   onDone() the bar is finished (undone, sent now, started, or closed)
 */
export default function UndoSendBar({ queued, onDone }) {
  const { showToast } = useToast();
  const [now, setNow] = useState(Date.now());
  const [busy, setBusy] = useState("");
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  const startsAt = queued?.scheduledAt ? new Date(queued.scheduledAt).getTime() : 0;
  const left = startsAt - now;

  useEffect(() => {
    if (!queued) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(timer);
  }, [queued]);

  // started: say so for a moment, then go
  useEffect(() => {
    if (!queued || left > 0) return undefined;
    const timer = setTimeout(() => doneRef.current?.(), 4000);
    return () => clearTimeout(timer);
  }, [queued, left]);

  if (!queued) return null;
  const started = left <= 0;

  const undo = async () => {
    setBusy("undo");
    try {
      const result = await undoEmailCampaign({ campaignId: queued.campaignId });
      showToast({ message: "Not sent. Your email is open again to change.", type: "success", duration: 6000 });
      announceUndone(result?.restore);
      onDone?.();
    } catch (error) {
      showToast({ message: error?.message || "Couldn't undo. Use Pause on the campaign instead.", type: "error", duration: 6000 });
      onDone?.();
    } finally {
      setBusy("");
    }
  };

  const sendNow = async () => {
    setBusy("now");
    try {
      await sendEmailCampaignNow({ campaignId: queued.campaignId });
      showToast({ message: "Sending now.", type: "success" });
    } catch (error) {
      showToast({ message: error?.message || "Couldn't start it now. It starts by itself in a moment.", type: "error" });
    } finally {
      setBusy("");
      onDone?.();
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-3 bottom-4 z-[60] mx-auto flex max-w-xl flex-wrap items-center gap-x-3 gap-y-2 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-2xl sm:inset-x-0 dark:bg-slate-800"
    >
      <Clock className="size-4 shrink-0 opacity-80" aria-hidden />
      <p className="min-w-0 flex-1">
        {started ? (
          "Sending has started. Use Pause on the campaign to stop the rest."
        ) : (
          <>
            Sending to {formatNumber(queued.count)} {queued.count === 1 ? "person" : "people"}
            {queued.label ? ` (${queued.label})` : ""} in <b className="tabular-nums">{countdown(left)}</b>
          </>
        )}
      </p>
      {!started && (
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="secondary" icon={Undo2} loading={busy === "undo"} disabled={Boolean(busy)} onClick={undo}>
            Undo
          </Button>
          <Button size="sm" icon={Send} loading={busy === "now"} disabled={Boolean(busy)} onClick={sendNow}>
            Send now
          </Button>
        </div>
      )}
      <button
        type="button"
        onClick={() => onDone?.()}
        className="rounded-full p-1 text-white/70 hover:bg-white/10 hover:text-white"
        aria-label="Hide (the campaign still has Undo in Sent)"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
