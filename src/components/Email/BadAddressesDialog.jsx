import { CheckCircle2, MailX } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext";
import { getBadAddresses, removeBadAddresses } from "../../redux/api/emailMarketingApi";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import Icon from "../ui/Icon";
import { Skeleton } from "../ui/States";

// A campaign's wrong email addresses (the receiving server said they don't
// exist, or they aren't valid addresses) and one button to stop emailing them.
// They go on the hotel's do-not-email list, which every campaign checks before
// sending, whatever list they came from. Failures that were not the address's
// fault (daily limit, server busy) are counted and left alone.
//   onRemoved(campaign, removedCount)   after a successful remove (the list reloads)
export default function BadAddressesDialog({ campaign, onClose, onRemoved }) {
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    if (!campaign) return;
    let off = false;
    setData(null);
    setError(null);
    getBadAddresses({ campaignId: campaign._id })
      .then((doc) => !off && setData(doc || { wrong: [], otherFailed: 0, total: 0 }))
      .catch((e) => !off && setError(e.message || "Could not load the failed addresses."));
    return () => {
      off = true;
    };
  }, [campaign]);

  const toRemove = (data?.wrong || []).filter((w) => !w.removed);

  const remove = async () => {
    setRemoving(true);
    try {
      const doc = await removeBadAddresses({ campaignId: campaign._id });
      showToast({
        type: "success",
        message: doc?.removed
          ? `${doc.removed} wrong address${doc.removed === 1 ? "" : "es"} removed. Future emails skip them.`
          : "These addresses were already removed.",
      });
      await onRemoved?.(campaign, (data?.wrong || []).length);
      onClose();
    } catch (e) {
      showToast({ type: "error", message: e.message || "Could not remove the addresses." });
    } finally {
      setRemoving(false);
    }
  };

  return (
    <Dialog
      open={Boolean(campaign)}
      onClose={removing ? () => {} : onClose}
      title="Wrong email addresses"
      description={campaign?.subject || campaign?.name}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={removing}>
            Close
          </Button>
          <Button variant="danger" icon={MailX} loading={removing} disabled={!toRemove.length} onClick={remove}>
            {toRemove.length ? `Remove ${toRemove.length} address${toRemove.length === 1 ? "" : "es"}` : "Nothing to remove"}
          </Button>
        </>
      }
    >
      {error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : !data ? (
        <Skeleton className="h-40" />
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-app-text-muted">
            {data.total
              ? "These emails could not be delivered because the address is wrong. Removing them stops every future email (any list, lead or upload) from going to them. Leads keep their details, and you can add an address back from the Newsletter page."
              : "No wrong addresses in this campaign."}
            {data.otherFailed > 0 &&
              ` ${data.otherFailed} other email${data.otherFailed === 1 ? "" : "s"} failed for a reason that isn't the address (for example the daily limit); ${data.otherFailed === 1 ? "it is" : "they are"} not removed.`}
          </p>
          {data.total > 0 && (
            <ul className="max-h-80 divide-y divide-app-border overflow-y-auto rounded-lg border border-app-border!">
              {data.wrong.map((w) => (
                <li key={w.email} className="flex items-start gap-3 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-app-text">{w.email}</p>
                    <p className="truncate text-xs text-app-text-muted" title={w.reason}>
                      {w.name ? `${w.name} · ` : ""}
                      {w.reason}
                    </p>
                  </div>
                  {w.removed && (
                    <span className="inline-flex shrink-0 items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                      <Icon icon={CheckCircle2} size="xs" /> Removed
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Dialog>
  );
}
