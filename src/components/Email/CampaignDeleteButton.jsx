import { Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { useConfirm } from "../../context/ConfirmContext";
import { useToast } from "../../context/ToastContext";
import { deleteEmailCampaign } from "../../redux/api/emailMarketingApi";
import Button from "../ui/Button";

// same as the server: no heartbeat for 3 minutes = nobody is sending it
const ALIVE_MS = 3 * 60 * 1000;

// Deletes a campaign after asking. Not offered while it is still going out
// (Stop it first); gian answers 409 if it started meanwhile.
// iconOnly: just the bin (in table rows); the label stays for screen readers
export default function CampaignDeleteButton({ campaign, onDeleted, size = "sm", iconOnly = false }) {
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const { confirm } = useConfirm();
  const { showToast } = useToast();

  const updated = new Date(campaign.updatedAt || 0).getTime();
  const live = ["sending", "stopping"].includes(campaign.status) && Date.now() - updated < ALIVE_MS;
  const name = campaign.subject || campaign.name || "this campaign";

  const remove = async (event) => {
    event.stopPropagation();
    if (lock.current || live) return;
    const ok = await confirm(
      `“${name}” and its list of recipients and results will be removed. Emails already sent stay in your guests' inboxes. This can't be undone.`,
      { title: "Delete campaign?", confirmText: "Delete" },
    );
    if (!ok) return;
    lock.current = true;
    setBusy(true);
    try {
      await deleteEmailCampaign({ campaignId: campaign._id });
      showToast({ type: "success", message: "Campaign deleted." });
      await onDeleted?.(campaign);
    } catch (error) {
      showToast({ type: "error", message: error.message || "Couldn't delete the campaign. Refresh and try again." });
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };

  return (
    <Button
      size={size}
      variant="ghost"
      icon={Trash2}
      loading={busy}
      disabled={live}
      onClick={remove}
      onKeyDown={(event) => event.stopPropagation()}
      className="text-red-500! hover:bg-red-500/10!"
      aria-label={`Delete campaign ${name}`}
      title={live ? "Stop the campaign first, then delete it" : "Delete this campaign"}
    >
      {iconOnly ? null : "Delete"}
    </Button>
  );
}
