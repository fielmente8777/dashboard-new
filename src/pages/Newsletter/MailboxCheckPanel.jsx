import { Loader2, MailSearch } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Button from "../../components/ui/Button";
import Notice from "../../components/ui/Notice";
import { useConfirm } from "../../context/ConfirmContext";
import { useToast } from "../../context/ToastContext";
import { newsletterError, useGetMailboxCheckQuery, useStartMailboxCheckMutation } from "../../redux/api/newsletterApi";
import { formatNumber } from "./newsletterUtils";

const money = (usd) => `US$${Number(usd || 0).toFixed(2)}`;

/**
 * "Check mailboxes" inside the list check: the free checks find dead domains and earlier
 * bounces, but not a mailbox that was closed later on a working domain (someone who left a
 * company, a deleted Hotmail account). Amazon can tell without sending anything, for US$0.01 an
 * address. Only the good addresses nothing proves are paid for: an email delivered or opened in
 * the last 60 days, or an Amazon check in the last 90 days, makes it free.
 *   groups      the groups checked ([] = whole list)
 *   mailbox     the server's plan: { total, toCheck, proven, cached, costUsd, job }
 *   onFinished  a run ended: check the list again (the missing ones now show as bounced)
 */
export default function MailboxCheckPanel({ groups, mailbox, onFinished }) {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [start, { isLoading: starting }] = useStartMailboxCheckMutation();
  const [job, setJob] = useState(mailbox?.job ?? null);
  useEffect(() => setJob(mailbox?.job ?? null), [mailbox]);

  const running = job?.status === "running";
  // progress every 5 s while it runs, nothing otherwise
  const poll = useGetMailboxCheckQuery(undefined, { skip: !running, pollingInterval: running ? 5000 : 0 });
  useEffect(() => {
    if (poll.data?.job) setJob(poll.data.job);
  }, [poll.data]);

  // running -> finished: say so once and show the list with the results
  const wasRunning = useRef(running);
  useEffect(() => {
    if (wasRunning.current && job && job.status !== "running") {
      showToast({
        message:
          job.status === "done"
            ? `Mailboxes checked: ${formatNumber(job.missing)} don't exist, ${formatNumber(job.risky)} risky`
            : job.error || "The mailbox check stopped.",
        type: job.status === "done" ? "success" : "error",
        duration: 6000,
      });
      onFinished?.();
    }
    wasRunning.current = running;
  }, [job, running, onFinished, showToast]);

  if (!mailbox) return null;
  const { toCheck = 0, proven = 0, cached = 0, costUsd = 0 } = mailbox;

  const run = async () => {
    const minutes = Math.max(1, Math.ceil(toCheck / 240));
    const ok = await confirm(
      `Amazon checks whether each of these ${formatNumber(toCheck)} mailboxes still exists, without sending them anything. It costs about ${money(costUsd)} (US$0.01 per address) and takes about ${minutes} ${minutes === 1 ? "minute" : "minutes"}. You can close this window while it runs.`,
      { title: "Check mailboxes", confirmText: `Check ${formatNumber(toCheck)} · ${money(costUsd)}` },
    );
    if (!ok) return;
    try {
      const result = await start({ groups }).unwrap();
      if (!result?.job) {
        showToast({ message: "Nothing to check: every address was reached or checked lately." });
        onFinished?.();
        return;
      }
      setJob(result.job);
    } catch (error) {
      showToast({ message: newsletterError(error, "Couldn't start the mailbox check."), type: "error", duration: 6000 });
    }
  };

  if (running) {
    const share = job.total ? Math.round((job.checked / job.total) * 100) : 0;
    return (
      <div className="rounded-xl border border-blue-200! bg-blue-50 px-3 py-2.5 text-sm text-blue-900 dark:border-blue-500/30! dark:bg-blue-500/10 dark:text-blue-200">
        <p className="flex items-center gap-2 font-medium">
          <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
          Checking mailboxes with Amazon: {formatNumber(job.checked)} of {formatNumber(job.total)}
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-blue-100 dark:bg-blue-500/20">
          <div className="h-full rounded-full bg-blue-600 transition-all dark:bg-blue-400" style={{ width: `${share}%` }} />
        </div>
        <p className="mt-1.5 text-xs opacity-80">
          {formatNumber(job.missing)} don&apos;t exist so far. You can close this window; it keeps going.
        </p>
      </div>
    );
  }

  const last =
    job &&
    (job.status === "done"
      ? `Last mailbox check ${new Date(job.finishedAt || job.startedAt).toLocaleDateString()}: ${formatNumber(job.checked)} checked, ${formatNumber(job.missing)} don't exist, ${formatNumber(job.risky)} risky (${money(job.costUsd)}).`
      : job.error || "The last mailbox check stopped before the end.");

  if (toCheck === 0) {
    return last ? <p className="text-xs text-app-text-muted">{last}</p> : null;
  }

  return (
    <Notice
      tone="info"
      icon={MailSearch}
      title={`${formatNumber(toCheck)} ${toCheck === 1 ? "address" : "addresses"} not reached lately`}
      actions={
        <Button size="sm" variant="secondary" icon={MailSearch} loading={starting} onClick={run}>
          Check mailboxes · {money(costUsd)}
        </Button>
      }
    >
      No email to them was delivered or opened in the last 60 days, so a mailbox closed since then (someone who left a company, a deleted
      account) would bounce. Amazon can check each one without sending anything, for US$0.01 an address.
      {proven + cached > 0 && ` ${formatNumber(proven + cached)} reached or checked lately are skipped for free.`}
      {last && <span className="mt-1 block text-xs opacity-80">{last}</span>}
    </Notice>
  );
}
