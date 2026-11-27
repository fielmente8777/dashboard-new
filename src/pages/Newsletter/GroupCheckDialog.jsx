import { Ban, CircleCheck, Download, FileSpreadsheet, MailX, ShieldAlert, Trash2, UserX } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import Chip from "../../components/ui/Chip";
import Dialog from "../../components/ui/Dialog";
import Notice from "../../components/ui/Notice";
import { Skeleton } from "../../components/ui/States";
import { useConfirm } from "../../context/ConfirmContext";
import { useToast } from "../../context/ToastContext";
import { newsletterError, useCheckNewsletterGroupsMutation, useCleanNewsletterGroupsMutation } from "../../redux/api/newsletterApi";
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

/**
 * Check & export a group (or several): every member as good, bounced before (at any Eazotel
 * hotel, or blocked by Amazon), can't receive email, risky or unsubscribed, so the hotel sees
 * before sending what would fail. "Remove" puts the bounced and can't-receive ones on the
 * do-not-email list; "Export" downloads the clean list (or the whole report) as Excel / CSV.
 *   groups  the group names, null = closed
 */
export default function GroupCheckDialog({ groups, onClose }) {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [check, { isLoading: checking }] = useCheckNewsletterGroupsMutation();
  const [clean, { isLoading: cleaning }] = useCleanNewsletterGroupsMutation();
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState("");
  const open = Array.isArray(groups) && groups.length > 0;
  const key = open ? groups.join("|") : "";

  const run = async (names) => {
    setData(null);
    try {
      setData(await check({ groups: names }).unwrap());
    } catch (error) {
      showToast({ message: newsletterError(error, "Couldn't check the group."), type: "error" });
    }
  };

  useEffect(() => {
    if (!key) return;
    setFilter("");
    run(key.split("|"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const rows = useMemo(() => (data?.rows || []).filter((r) => !filter || r.state === filter), [data, filter]);
  const bad = (data?.counts?.bounced || 0) + (data?.counts?.cant_receive || 0);
  const title = groups?.length === 1 ? `Check “${groups[0]}”` : `Check ${groups?.length || 0} groups`;

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

  /** downloads the members (only the good ones, or all with their state) */
  const exportList = async (format, onlyGood) => {
    const XLSX = await import("xlsx");
    const list = (data?.rows || []).filter((r) => !onlyGood || r.state === "good");
    const sheet = XLSX.utils.json_to_sheet(
      list.map((r) =>
        onlyGood
          ? { Email: r.email, Name: r.name || "", Groups: r.groups.join(", ") }
          : { Email: r.email, Name: r.name || "", Groups: r.groups.join(", "), Status: LABEL[r.state], Why: r.reason || "", "Did you mean": r.suggestion || "" },
      ),
    );
    const name = `${(groups.length === 1 ? groups[0] : "groups").replace(/[^\w-]+/g, "-")}-${onlyGood ? "clean" : "checked"}-${new Date().toISOString().slice(0, 10)}`;
    if (format === "csv") {
      const blob = new Blob(["﻿", XLSX.utils.sheet_to_csv(sheet)], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement("a"), { href: url, download: `${name}.csv` });
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } else {
      const book = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(book, sheet, onlyGood ? "Clean list" : "Checked list");
      XLSX.writeFile(book, `${name}.xlsx`);
    }
    showToast({ message: `${formatNumber(list.length)} addresses exported`, type: "success" });
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
          <Button variant="secondary" size="sm" icon={FileSpreadsheet} disabled={!data} onClick={() => exportList("xlsx", true)}>
            Export clean list (Excel)
          </Button>
          <Button variant="secondary" size="sm" icon={Download} disabled={!data} onClick={() => exportList("csv", true)}>
            CSV
          </Button>
          <Button variant="ghost" size="sm" disabled={!data} onClick={() => exportList("xlsx", false)}>
            Full report
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
              {formatNumber(data.counts.good)} good to send{data.counts.unsubscribed ? `, ${formatNumber(data.counts.unsubscribed)} unsubscribed (never emailed)` : ""}.
            </Notice>
          )}
          {data.partial && <p className="text-xs text-amber-600">The address check was busy: only unsubscribes are shown. Check again in a minute.</p>}

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
                  <span className="shrink-0 text-xs text-app-text-muted">{s.label}</span>
                </li>
              );
            })}
            {!rows.length && <li className="px-3 py-6 text-center text-sm text-app-text-muted">No one here.</li>}
          </ul>
          {rows.length > SHOWN && (
            <p className="text-xs text-app-text-muted">Showing {SHOWN} of {formatNumber(rows.length)}. The export has all of them.</p>
          )}
        </div>
      ) : null}
    </Dialog>
  );
}
