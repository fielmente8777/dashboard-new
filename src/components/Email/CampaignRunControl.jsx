import { Play, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useToast } from "../../context/ToastContext";
import { startEmailCampaign, stopEmailCampaign } from "../../redux/api/emailMarketingApi";
import Button from "../ui/Button";

// same as the server: no heartbeat for 3 minutes = nobody is sending it
const ALIVE_MS = 3 * 60 * 1000;

export default function CampaignRunControl({ campaign, onChanged }) {
  const [busy, setBusy] = useState(false);
  // status from our own Stop / Start, until the list refresh catches up
  const [local, setLocal] = useState(null);
  const lock = useRef(false);
  const { showToast } = useToast();

  useEffect(() => setLocal(null), [campaign.status]);

  const status = local || campaign.status;
  if (!["sending", "stopping", "paused"].includes(status)) return null;

  const updated = new Date(campaign.updatedAt || 0).getTime();
  // "stopping" with no run behind it can be started again
  const stuck = status === "stopping" && Date.now() - updated > ALIVE_MS;
  const stopping = status === "stopping" && !stuck;
  const sending = status === "sending";

  const change = async (event) => {
    event.stopPropagation();
    if (lock.current || stopping) return;
    lock.current = true;
    setBusy(true);
    try {
      if (sending) {
        const result = await stopEmailCampaign({ campaignId: campaign._id });
        const next = result?.status || "stopping";
        setLocal(next);
        showToast({
          type: "success",
          message:
            next === "paused"
              ? "Campaign stopped. Press Start to send the pending emails."
              : "Stopping. The email being sent right now finishes, the rest wait for Start.",
        });
      } else {
        await startEmailCampaign({ campaignId: campaign._id });
        setLocal("sending");
        showToast({ type: "success", message: "Started again. Only pending emails are sent, nobody gets it twice." });
      }
      await onChanged?.();
    } catch (error) {
      setLocal(null);
      showToast({ type: "error", message: error.message || "Couldn't change the campaign. Refresh and try again." });
      onChanged?.();
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };

  const label = stopping ? "Stopping…" : sending ? "Stop" : "Start";
  return (
    <Button
      size="sm"
      variant={sending ? "danger" : "secondary"}
      icon={sending ? Square : Play}
      loading={busy || stopping}
      disabled={stopping}
      onClick={change}
      onKeyDown={(event) => event.stopPropagation()}
      aria-label={`${label} campaign ${campaign.subject || ""}`}
      title={
        stopping
          ? "Waiting for the email in progress to finish"
          : sending
            ? "Stop sending. Pending emails wait until you press Start."
            : "Send the pending emails. Already sent people are skipped."
      }
    >
      {label}
    </Button>
  );
}
