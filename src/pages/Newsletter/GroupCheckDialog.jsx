import { Ban, CircleCheck, Download, FileSpreadsheet, MailX, ShieldAlert, Trash2, UserX } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import Chip from "../../components/ui/Chip";
import Dialog from "../../components/ui/Dialog";
import Notice from "../../components/ui/Notice";
import { Skeleton } from "../../components/ui/States";
import { useConfirm } from "../../context/ConfirmContext";
import { useToast } from "../../context/ToastContext";
import { newsletterError, useCheckNewsletterGroupsMutation, useCleanNewsletterGroupsMutation } from "../../redux/api/newsletterApi";
import MailboxCheckPanel from "./MailboxCheckPanel";
import { formatNumber } from "./newsletterUtils";

// what each member is, in words
const STATES = [
  { value: "good", label: "Good to send", icon: CircleCheck, tone: "text-emerald-600 dark:text-emerald-400" },
  { value: "bounced", label: "Bounced before", icon: Ban, tone: "text-red-600 dark:text-red-400" },
  { value: "cant_receive", label: "Can't receive email", icon: MailX, tone: "text-red-600 dark:text-red-400" },
  { value: "risky", label: "Risky (throwaway inbox)", icon: ShieldAlert, tone: "text-amber-600 dark:text-amber-400" },
  { value: "unsubscribed", label: "Unsubscribed", icon: UserX, tone: "text-slate-500" },
];
const LABEL = Object.fromEntries(STATES.map((s) => [s.value, s.label]));
const SHOWN = 200;
// can't be emailed: the "Bad emails" sheet
const BAD = ["bounced", "cant_receive", "risky"];

/**
 * Check & export a group (or several, or the whole list): every member as good, bounced before
 * (at any Eazotel hotel, or blocked by Amazon), can't receive email, risky or unsubscribed, so
 * the hotel sees before sending what would fail. "Remove" puts the bounced and can't-receive
 * ones on the do-not-email list. "Download" gives one Excel file with three sheets: Subscribed
 * (the clean list: only people who can be emailed), Unsubscribed (people who left), and Bad
 * emails (bounced, can't receive, throwaway inboxes, with why). The CSV is the clean list only.
 * A bad address taken off earlier is listed as a bad email, not as an unsubscribe.
 *   groups  the group names; [] = the whole list; null = closed
 */
export default function GroupCheckDialog({ groups, onClose }) {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [check, { isLoading: checking }] = useCheckNewsletterGroupsMutation();
  const [clean, { isLoading: cleaning }] = useCleanNewsletterGroupsMutation();
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState("");
  const open = Array.isArray(groups);
  const everyone = open && groups.length === 0;
  // "#" so the whole list ([]) still has a key to check by
  const key = open ? `#${groups.join("|")}` : "";

  const run = async (names) => {
    setData(null);
    try {
      setData(await check({ groups: names }).unwrap());
    } catch (error) {
      showToast({ message: newsletterError(error, "Couldn't check the group."), type: "error" });
    }
  };

  // the group names behind the key ([] = whole list)
  const names = useMemo(() => (key ? key.slice(1).split("|").filter(Boolean) : []), [key]);

  useEffect(() => {
    if (!key) return;
    setFilter("");
    run(names);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // after a mailbox check: the same groups again, without clearing what is on screen first
  const recheck = useCallback(async () => {
    try {
      setData(await check({ groups: names }).unwrap());
    } catch {
      // the old result stays; the toast already said how the mailbox check ended
    }
  }, [check, names]);

  const rows = useMemo(() => (data?.rows || []).filter((r) => !filter || r.state === filter), [data, filter]);
  // bad addresses still on the list (the ones taken off before are skipped by campaigns already)
  const bad = Math.max(0, (data?.counts?.bounced || 0) + (data?.counts?.cant_receive || 0) - (data?.alreadyRemoved || 0));
  const title = everyone ? "Check your whole list" : groups?.length === 1 ? `Check “${groups[0]}”` : `Check ${groups?.length || 0} groups`;
  const fileBase = `${(everyone ? "email-list" : groups?.length === 1 ? groups[0] : "groups").replace(/[^\w-]+/g, "-")}-${new Date().toISOString().slice(0, 10)}`;

  const removeBad = async () => {
    const ok = await confirm(
      `Take ${formatNumber(bad)} ${bad === 1 ? "address" : "addresses"} off your list? They bounced before or can't receive email. They go on your do-not-email list (never emailed again) and on Email marketing → Wrong emails.`,
      { title: "Remove addresses that would fail", confirmText: "Remove" },
    );
    if (!ok) return;
    try {
      const { removed } = await clean({ groups, states: ["bounced", "cant_receive"] }).unwrap();
      showToast({ message: `${formatNumber(removed)} taken off your list`, type: "success" });
      await run(groups);
    } catch (error) {
      showToast({ message: newsletterError(error), type: "error" });
    }
  };

  /** one Excel file: Subscribed (clean) · Unsubscribed · Bad emails */
  const downloadExcel = async () => {
    const XLSX = await import("xlsx");
    const all = data?.rows || [];
    const good = all.filter((r) => r.state === "good");
    const left = all.filter((r) => r.state === "unsubscribed");
    const wrong = all.filter((r) => BAD.includes(r.state));
    // an empty sheet still says why it is empty
    const sheet = (rows, empty) => XLSX.utils.json_to_sheet(rows.length ? rows : [empty]);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      book,
      sheet(good.map((r) => ({ Email: r.email, Name: r.name || "", Groups: r.groups.join(", ") })), { Email: "No one here can be emailed" }),
      "Subscribed (clean)",
    );
    XLSX.utils.book_append_sheet(
      book,
      sheet(left.map((r) => ({ Email: r.email, Name: r.name || "", Groups: r.groups.join(", "), Why: r.reason || "" })), { Email: "No one unsubscribed" }),
      "Unsubscribed",
    );
    XLSX.utils.book_append_sheet(
      book,
      sheet(
        wrong.map((r) => ({
          Email: r.email,
          Name: r.name || "",
          Groups: r.groups.join(", "),
          Problem: LABEL[r.state],
          Why: r.reason || "",
          "Did you mean": r.suggestion || "",
          "Off your list": r.onDoNotEmail ? "Yes" : "Not yet",
        })),
        { Email: "No bad emails" },
      ),
      "Bad emails",
    );
    XLSX.writeFile(book, `${fileBase}.xlsx`);
    showToast({
      message: `Downloaded: ${formatNumber(good.length)} subscribed, ${formatNumber(left.length)} unsubscribed, ${formatNumber(wrong.length)} bad`,
      type: "success",
    });
  };

  /** only the people who can be emailed, as CSV (for other email tools) */
  const downloadCsv = async () => {
    const XLSX = await import("xlsx");
    const list = (data?.rows || []).filter((r) => r.state === "good");
    const csv = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(list.map((r) => ({ Email: r.email, Name: r.name || "", Groups: r.groups.join(", ") }))));
    const url = URL.createObjectURL(new Blob(["﻿", csv], { type: "text/csv;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `${fileBase}-subscribed.csv` });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    showToast({ message: `${formatNumber(list.length)} subscribed addresses downloaded`, type: "success" });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      sheetOnPhone
      title={title}
      description="Every address checked before you send: who already bounced (at any hotel), whose domain can't receive email, and who unsubscribed."
      footer={
        <div className="flex w-full flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={FileSpreadsheet}
            disabled={!data}
            onClick={downloadExcel}
            title="One Excel file with three sheets: Subscribed (clean), Unsubscribed, Bad emails"
          >
            Download list (Excel)
          </Button>
          <Button variant="ghost" size="sm" icon={Download} disabled={!data} onClick={downloadCsv} title="Only the people who can be emailed">
            Subscribed only (CSV)
          </Button>
          <Button className="ml-auto" onClick={onClose}>
            Done
          </Button>
        </div>
      }
    >
      {checking && !data ? (
        <div className="space-y-2">
          <p className="text-sm text-app-text-muted">Checking every address (domains, earlier bounces, unsubscribes)…</p>
          <Skeleton className="h-10" />
          <Skeleton className="h-40" />
        </div>
      ) : data ? (
        <div className="space-y-4">
          {bad > 0 ? (
            <Notice
              tone="warning"
              icon={Ban}
              title={`${formatNumber(bad)} would fail if you send now`}
              actions={
                <Button size="sm" variant="danger" icon={Trash2} loading={cleaning} onClick={removeBad}>
                  Remove them
                </Button>
              }
            >
              They bounced before or their domain can&apos;t receive email. Campaigns skip them anyway; removing them keeps your list and your counts clean.
            </Notice>
          ) : (
            <Notice tone="info" icon={CircleCheck} title="No address would bounce">
              {formatNumber(data.counts.good)} good to send
              {data.counts.unsubscribed ? `, ${formatNumber(data.counts.unsubscribed)} unsubscribed` : ""}
              {data.alreadyRemoved ? `, ${formatNumber(data.alreadyRemoved)} bad addresses already taken off` : ""}. Campaigns never email the
              unsubscribed or bad ones.
            </Notice>
          )}
          {data.partial && <p className="text-xs text-amber-600">The address check was busy: only unsubscribes are shown. Check again in a minute.</p>}
          {!data.partial && <MailboxCheckPanel groups={names} mailbox={data.mailbox} onFinished={recheck} />}

          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap" role="group" aria-label="Show">
            <Chip className="shrink-0" selected={!filter} onClick={() => setFilter("")}>
              All <span className="tabular-nums opacity-70">{formatNumber(data.total)}</span>
            </Chip>
            {STATES.filter((s) => data.counts[s.value]).map((s) => (
              <Chip key={s.value} className="shrink-0 whitespace-nowrap" selected={filter === s.value} onClick={() => setFilter(s.value)}>
                <s.icon className={`size-3.5 ${s.tone}`} aria-hidden /> {s.label} <span className="tabular-nums opacity-70">{formatNumber(data.counts[s.value])}</span>
              </Chip>
            ))}
          </div>

          <ul className="max-h-[45vh] divide-y divide-app-border overflow-y-auto rounded-xl border border-app-border">
            {rows.slice(0, SHOWN).map((r) => {
              const s = STATES.find((x) => x.value === r.state);
              return (
                <li key={r.email} className="flex items-start gap-2 px-3 py-2 text-sm">
                  <s.icon className={`mt-0.5 size-4 shrink-0 ${s.tone}`} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-app-text">{r.email}</span>
                    {(r.reason || r.suggestion) && (
                      <span className="block break-words text-xs text-app-text-muted">
                        {r.reason}
                        {r.suggestion ? ` · did you mean ${r.suggestion}?` : ""}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-right text-xs text-app-text-muted">
                    {s.label}
                    {r.onDoNotEmail && r.state !== "unsubscribed" && <span className="block">already off your list</span>}
                  </span>
                </li>
              );
            })}
            {!rows.length && <li className="px-3 py-6 text-center text-sm text-app-text-muted">No one here.</li>}
          </ul>
          {rows.length > SHOWN && (
            <p className="text-xs text-app-text-muted">Showing {SHOWN} of {formatNumber(rows.length)}. The download has all of them.</p>
          )}
        </div>
      ) : null}
    </Dialog>
  );
}
