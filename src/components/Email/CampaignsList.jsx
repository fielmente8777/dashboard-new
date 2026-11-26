import { CircleCheck, Clock, Inbox, Loader2, Pause, RefreshCw, Search, Trash2, TriangleAlert, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useConfirm } from "../../context/ConfirmContext";
import { useToast } from "../../context/ToastContext";
import { deleteEmailCampaign } from "../../redux/api/emailMarketingApi";
import Button from "../ui/Button";
import { Input } from "../ui/Field";
import Icon from "../ui/Icon";
import BadAddressesDialog from "./BadAddressesDialog";
import CampaignDetail from "./CampaignDetail";
import SentMailList from "./SentMailList";

// the status filters, in this order; one shows only when some email has it
const FILTERS = [
  { value: "all", label: "All", icon: Inbox },
  { value: "sent", label: "Sent", icon: CircleCheck, tone: "text-emerald-600 dark:text-emerald-400" },
  { value: "sending", label: "Sending", icon: Loader2, tone: "text-amber-600 dark:text-amber-400", match: ["sending", "stopping"] },
  { value: "scheduled", label: "Scheduled", icon: Clock, tone: "text-blue-600 dark:text-blue-400" },
  { value: "paused", label: "Paused", icon: Pause, tone: "text-slate-500", match: ["paused", "draft"] },
  { value: "failed", label: "Failed", icon: TriangleAlert, tone: "text-red-500" },
];
const matches = (filter, status) => filter.value === "all" || (filter.match || [filter.value]).includes(status);
const canDelete = (c) => !["sending", "stopping"].includes(c.status);

// "just now" / "2 min ago" / "1 h ago" / "yesterday" / "3 days ago"
const ago = (time, now) => {
  if (!time) return "";
  const minutes = Math.floor((now - new Date(time).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
};

// the time now, every 30 seconds (for "updated x ago" and "x min ago")
const useNow = () => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);
  return now;
};

// Every email sent, in one list (SentMailList), filtered by status and searched
// by subject, recipient or sender; a row opens that email in place of the list
// (the Gmail-style reading pane). The page owns which one is open
// (selectedId / onSelect), so other parts of it can open one too.
//   onRefresh() refreshing loadedAt   the always-visible Refresh and "Updated x ago"
export default function CampaignsList({ campaigns, loading, selectedId, onSelect, onChanged, onSendTo, onRefresh, refreshing = false, loadedAt }) {
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const now = useNow();
  // ticked rows, for deleting several at once
  const [picked, setPicked] = useState(() => new Set());
  const [deleting, setDeleting] = useState(false);
  const [badFor, setBadFor] = useState(null);
  // removed in this visit, shown before the reload brings the campaign's own note
  const [removedNow, setRemovedNow] = useState({});
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  // the tab an email opens on: "message" from the row, "report" from View report; kept while using the arrows
  const [openTab, setOpenTab] = useState("message");

  const filters = useMemo(
    () =>
      FILTERS.map((f) => ({ ...f, count: campaigns.filter((c) => matches(f, c.status)).length })).filter(
        (f) => f.value === "all" || f.count > 0,
      ),
    [campaigns],
  );

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filter = FILTERS.find((f) => f.value === status) || FILTERS[0];
    return campaigns.filter(
      (c) =>
        matches(filter, c.status) &&
        (!term ||
          [c.subject, c.name, c.snippet, c.fromEmail, c.sentFrom?.email, c.audienceLabel, ...(c.toPreview || []).flatMap((p) => [p.email, p.name])]
            .some((value) => value?.toLowerCase().includes(term))),
    );
  }, [campaigns, status, search]);

  // a ticked row that left the list (deleted, filtered out) is no longer ticked
  useEffect(() => {
    const ids = new Set(visible.map((c) => c._id));
    setPicked((current) => {
      const kept = [...current].filter((id) => ids.has(id));
      return kept.length === current.size ? current : new Set(kept);
    });
  }, [visible]);

  const toggle = (c) =>
    setPicked((current) => {
      const next = new Set(current);
      if (next.has(c._id)) next.delete(c._id);
      else next.add(c._id);
      return next;
    });
  const toggleAll = () => {
    const deletable = visible.filter(canDelete);
    setPicked((current) => (deletable.every((c) => current.has(c._id)) ? new Set() : new Set(deletable.map((c) => c._id))));
  };

  // one after the other (each removes its recipients); stops nothing if one fails
  const deletePicked = async () => {
    const ids = [...picked];
    const ok = await confirm(
      `${ids.length} email${ids.length === 1 ? "" : "s"} and their reports will be deleted. This can't be undone.`,
      { title: `Delete ${ids.length} email${ids.length === 1 ? "" : "s"}?`, confirmText: "Delete" },
    );
    if (!ok) return;
    setDeleting(true);
    let done = 0;
    const failed = [];
    for (const id of ids) {
      try {
        await deleteEmailCampaign({ campaignId: id });
        done += 1;
      } catch (error) {
        failed.push(error.message);
      }
    }
    setDeleting(false);
    setPicked(new Set());
    if (ids.includes(selectedId)) onSelect(null);
    showToast({
      type: failed.length ? "error" : "success",
      message: failed.length
        ? `${done} deleted, ${failed.length} could not be deleted (${failed[0]})`
        : `${done} email${done === 1 ? "" : "s"} deleted.`,
    });
    await onChanged?.();
  };

  const onDeleted = async (c) => {
    // the deleted one was open: close it
    if (selectedId === c._id) onSelect(null);
    await onChanged?.();
  };

  // an open email takes the list's place, like Gmail; the arrows go through the list as filtered
  if (selectedId) {
    const index = visible.findIndex((c) => c._id === selectedId);
    return (
      <CampaignDetail
        key={selectedId}
        campaignId={selectedId}
        initialTab={openTab}
        onTabChange={setOpenTab}
        onClose={() => onSelect(null)}
        onChanged={onChanged}
        onSendTo={onSendTo}
        position={index + 1}
        total={index >= 0 ? visible.length : 0}
        onPrev={index > 0 ? () => onSelect(visible[index - 1]._id) : undefined}
        onNext={index >= 0 && index < visible.length - 1 ? () => onSelect(visible[index + 1]._id) : undefined}
      />
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="hide-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1" role="tablist" aria-label="Filter by status">
          {filters.map((f) => {
            const on = status === f.value;
            const FilterIcon = f.icon;
            return (
              <button
                key={f.value}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setStatus(f.value)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  on
                    ? "bg-blue-500/10 text-blue-700 ring-1 ring-blue-500/30 dark:text-blue-300"
                    : "text-app-text-muted hover:bg-app-surface-secondary hover:text-app-text"
                }`}
              >
                <FilterIcon className={`size-3.5 ${on ? "" : f.tone || ""}`} />
                {f.label}
                <span className="tabular-nums opacity-70">{f.count}</span>
              </button>
            );
          })}
        </div>
        <div className="flex w-full items-center gap-2 lg:w-auto">
          {onRefresh && (
            <div className="flex shrink-0 items-center gap-1.5">
              <span className="hidden whitespace-nowrap text-xs text-app-text-muted sm:inline" title={loadedAt ? new Date(loadedAt).toLocaleString("en-IN") : undefined}>
                {loadedAt ? `Updated ${ago(loadedAt, now)}` : ""}
              </span>
              <Button size="sm" variant="secondary" icon={RefreshCw} loading={refreshing} onClick={onRefresh} title="Get the latest opens, clicks and delivery">
                Refresh
              </Button>
            </div>
          )}
          <div className="relative min-w-0 flex-1 lg:w-80 lg:flex-none">
            <Icon icon={Search} size="sm" tone="faint" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search emails"
              title="Search by subject, recipient or sender"
              aria-label="Search sent emails"
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {picked.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-blue-500/30! bg-blue-500/5 px-3 py-2 text-sm">
          <span className="font-medium text-app-text">{picked.size} selected</span>
          <Button size="sm" variant="ghost" icon={X} onClick={() => setPicked(new Set())} disabled={deleting}>
            Clear
          </Button>
          <Button size="sm" variant="danger" icon={Trash2} loading={deleting} onClick={deletePicked} className="ml-auto">
            Delete {picked.size}
          </Button>
        </div>
      )}

      <SentMailList
        campaigns={visible.map((c) =>
          removedNow[c._id] && !c.badAddresses?.removed ? { ...c, badAddresses: { removed: removedNow[c._id] } } : c,
        )}
        loading={loading}
        onOpen={(c, tab = "message") => {
          setOpenTab(tab);
          onSelect(c._id);
        }}
        onChanged={onChanged}
        onDeleted={onDeleted}
        emptyMessage="No emails match these filters"
        selected={picked}
        onToggle={toggle}
        onToggleAll={toggleAll}
        onBadAddresses={setBadFor}
        now={now}
      />

      <BadAddressesDialog
        campaign={badFor}
        onClose={() => setBadFor(null)}
        onRemoved={(c, count) => {
          setRemovedNow((m) => ({ ...m, [c._id]: count }));
          onChanged?.();
        }}
      />
    </section>
  );
}
