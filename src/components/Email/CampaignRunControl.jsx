import { Pause, Play, Send, Undo2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useToast } from "../../context/ToastContext";
import { sendEmailCampaignNow, startEmailCampaign, stopEmailCampaign, undoEmailCampaign } from "../../redux/api/emailMarketingApi";
import Button from "../ui/Button";
import { announceUndone, countdown } from "./undoSend";

// same as the server: no heartbeat for 3 minutes = nobody is sending it
const ALIVE_MS = 3 * 60 * 1000;

// The buttons on a campaign's card and page:
//  - "scheduled" (the few minutes before a new campaign starts): "Starts in 4:12", Undo
//    (cancel it, the email opens again in compose) and Send now;
//  - sending: Pause (the email in progress finishes, the rest wait);
//  - paused: Resume (only the ones not sent yet; nobody gets it twice).
export default function CampaignRunControl({ campaign, onChanged }) {
  const [busy, setBusy] = useState("");
  // status from our own Pause / Resume, until the list refresh catches up
  const [local, setLocal] = useState(null);
  const lock = useRef(false);
  const { showToast } = useToast();
  const [now, setNow] = useState(Date.now());

  useEffect(() => setLocal(null), [campaign.status]);

  const status = local || campaign.status;
  const scheduled = status === "scheduled";
  const startsAt = campaign.scheduledAt ? new Date(campaign.scheduledAt).getTime() : 0;

  // the countdown, and one refresh once it should have started
  useEffect(() => {
    if (!scheduled) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [scheduled]);
  const due = scheduled && startsAt > 0 && now >= startsAt;
  const refreshed = useRef(false);
  useEffect(() => {
    if (!due || refreshed.current) return undefined;
    refreshed.current = true;
    const timer = setTimeout(() => onChanged?.(), 5000);
    return () => clearTimeout(timer);
  }, [due, onChanged]);

  const act = async (event, name, job) => {
    event.stopPropagation();
    if (lock.current) return;
    lock.current = true;
    setBusy(name);
    try {
      await job();
      await onChanged?.();
    } catch (error) {
      setLocal(null);
      showToast({ type: "error", message: error.message || "Couldn't change the campaign. Refresh and try again." });
      onChanged?.();
    } finally {
      lock.current = false;
      setBusy("");
    }
  };

  if (scheduled) {
    const undo = (event) =>
      act(event, "undo", async () => {
        const result = await undoEmailCampaign({ campaignId: campaign._id });
        showToast({ type: "success", message: "Not sent. Your email is open again to change.", duration: 6000 });
        announceUndone(result?.restore);
      });
    const sendNow = (event) =>
      act(event, "now", async () => {
        await sendEmailCampaignNow({ campaignId: campaign._id });
        setLocal("sending");
        showToast({ type: "success", message: "Sending now." });
      });
    return (
      <div className="flex items-center gap-1.5" onKeyDown={(event) => event.stopPropagation()}>
        <span className="whitespace-nowrap text-xs tabular-nums text-app-text-muted">
          {due ? "Starting…" : `Starts in ${countdown(startsAt - now)}`}
        </span>
        <Button
          size="sm"
          variant="secondary"
          icon={Undo2}
          loading={busy === "undo"}
          disabled={Boolean(busy) || due}
          onClick={undo}
          title="Cancel: nothing is sent and the email opens again to change"
        >
          Undo
        </Button>
        <Button size="sm" icon={Send} loading={busy === "now"} disabled={Boolean(busy) || due} onClick={sendNow} title="Start sending now">
          Send now
        </Button>
      </div>
    );
  }

  if (!["sending", "stopping", "paused"].includes(status)) return null;

  const updated = new Date(campaign.updatedAt || 0).getTime();
  // "stopping" with no run behind it can be resumed
  const stuck = status === "stopping" && Date.now() - updated > ALIVE_MS;
  const pausing = status === "stopping" && !stuck;
  const sending = status === "sending";

  const change = (event) => {
    if (pausing) return;
    return act(event, "run", async () => {
      if (sending) {
        const result = await stopEmailCampaign({ campaignId: campaign._id });
        const next = result?.status || "stopping";
        setLocal(next);
        showToast({
          type: "success",
          message:
            next === "paused"
              ? "Paused. Press Resume to send the rest."
              : "Pausing. The email being sent right now finishes, the rest wait for Resume.",
        });
      } else {
        await startEmailCampaign({ campaignId: campaign._id });
        setLocal("sending");
        showToast({ type: "success", message: "Resumed. Only the emails not sent yet go out, nobody gets it twice." });
      }
    });
  };

  const label = pausing ? "Pausing…" : sending ? "Pause" : "Resume";
  return (
    <Button
      size="sm"
      variant={sending ? "secondary" : "primary"}
      icon={sending ? Pause : Play}
      loading={Boolean(busy) || pausing}
      disabled={pausing}
      onClick={change}
      onKeyDown={(event) => event.stopPropagation()}
      aria-label={`${label} campaign ${campaign.subject || ""}`}
      title={
        pausing
          ? "Waiting for the email in progress to finish"
          : sending
            ? "Pause sending. The rest wait until you press Resume."
            : "Send the rest. People who already got it are skipped."
      }
    >
      {label}
    </Button>
  );
}
