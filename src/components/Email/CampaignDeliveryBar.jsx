import { CircleAlert, Loader2, PauseCircle, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useConfirm } from "../../context/ConfirmContext";
import { useToast } from "../../context/ToastContext";
import { getCampaignDelivery, retryEmailCampaign } from "../../redux/api/emailMarketingApi";
import Button from "../ui/Button";

const n = (value) => (value ?? 0).toLocaleString("en-IN");

// Under a campaign's totals: what didn't go out and a button to send it again.
//  - failed (network, rate, unknown errors) -> "Retry failed"
//  - paused (daily limit reached, mailbox login refused) -> "Resume"
//  - stuck on "sending" after a server restart -> "Resume"
// Bounced / invalid addresses are counted but never sent again. People who
// already got the email never get it twice. While sending it refreshes itself.
// onChanged() reloads the campaign's totals and recipients.
export default function CampaignDeliveryBar({ campaignId, onChanged }) {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [info, setInfo] = useState(null);
  const [retrying, setRetrying] = useState(false);

  const load = useCallback(async () => {
    try {
      setInfo(await getCampaignDelivery({ campaignId }));
    } catch {
      setInfo(null); // older server: no bar
    }
  }, [campaignId]);

  useEffect(() => {
    load();
  }, [load]);

  // follow a run in progress: totals and the bar every 5 s
  const sending = info?.status === "sending" && !info?.stuck;
  useEffect(() => {
    if (!sending) return undefined;
    const timer = setInterval(() => {
      load();
      onChanged?.();
    }, 5000);
    return () => clearInterval(timer);
  }, [sending, load, onChanged]);

  if (!info) return null;
  const { pending, failedRetryable, failedPermanent, status, pauseReason, stuck, canRetry } = info;

  if (sending) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-blue-200! bg-blue-50 px-3 py-2.5 text-sm text-blue-800 dark:border-blue-500/30! dark:bg-blue-500/10 dark:text-blue-300">
        <Loader2 className="size-4 shrink-0 animate-spin" />
        Sending… {n(pending)} still to go. This page updates by itself.
      </div>
    );
  }

  if (!canRetry && !failedPermanent) return null;

  const total = pending + failedRetryable;
  const label = failedRetryable && !pending ? "Retry failed" : "Resume sending";

  const retry = async () => {
    const parts = [];
    if (failedRetryable) parts.push(`${n(failedRetryable)} that failed`);
    if (pending) parts.push(`${n(pending)} not sent yet`);
    const ok = await confirm(
      `Send this email to ${parts.join(" and ")}? People who already got it won't get it again.${
        failedPermanent ? ` ${n(failedPermanent)} bounced or invalid address(es) are skipped.` : ""
      }`,
      { title: `${label} (${n(total)})`, confirmText: label },
    );
    if (!ok) return;
    setRetrying(true);
    try {
      const result = await retryEmailCampaign({ campaignId });
      showToast({ message: `Sending to ${n(result?.total)} recipient(s) again.`, type: "success" });
      await load();
      onChanged?.();
    } catch (error) {
      showToast({ message: error?.message || "Couldn't send again. Please try later.", type: "error", duration: 6000 });
      load();
    } finally {
      setRetrying(false);
    }
  };

  const paused = status === "paused" || stuck;
  const Icon = paused ? PauseCircle : CircleAlert;

  return (
    <div
      className={`flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2.5 text-sm ${
        paused
          ? "border-amber-200! bg-amber-50 text-amber-900 dark:border-amber-500/30! dark:bg-amber-500/10 dark:text-amber-200"
          : "border-red-200! bg-red-50 text-red-800 dark:border-red-500/30! dark:bg-red-500/10 dark:text-red-300"
      }`}
    >
      <Icon className="size-4 shrink-0" />
      <div className="min-w-0 flex-1 leading-snug">
        {canRetry ? (
          <p className="font-medium">
            {[
              failedRetryable && `${n(failedRetryable)} failed`,
              pending && `${n(pending)} not sent yet`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        ) : (
          <p className="font-medium">All reachable recipients got this email.</p>
        )}
        {stuck && <p className="text-xs opacity-80">Sending was interrupted. Resume to continue where it stopped.</p>}
        {pauseReason && !stuck && <p className="text-xs opacity-80">{pauseReason}</p>}
        {failedPermanent > 0 && (
          <p className="text-xs opacity-80">{n(failedPermanent)} bounced or invalid address(es) won't be retried.</p>
        )}
      </div>
      {canRetry && (
        <Button size="sm" icon={RotateCcw} onClick={retry} loading={retrying}>
          {label} ({n(total)})
        </Button>
      )}
    </div>
  );
}
