import { CircleCheck, Clock, Inbox, Loader2, Pause, Search, TriangleAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "../ui/Field";
import Icon from "../ui/Icon";
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

// Every email sent, in one list (SentMailList), filtered by status and searched
// by subject, recipient or sender; a row opens that email in place of the list
// (the Gmail-style reading pane). The page owns which one is open
// (selectedId / onSelect), so other parts of it can open one too.
export default function CampaignsList({ campaigns, loading, selectedId, onSelect, onChanged }) {
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
        <div className="relative w-full lg:w-80">
          <Icon icon={Search} size="sm" tone="faint" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subject, recipient or sender"
            aria-label="Search sent emails"
            className="pl-9"
          />
        </div>
      </div>

      <SentMailList
        campaigns={visible}
        loading={loading}
        onOpen={(c, tab = "message") => {
          setOpenTab(tab);
          onSelect(c._id);
        }}
        onChanged={onChanged}
        onDeleted={onDeleted}
        emptyMessage="No emails match these filters"
      />
    </section>
  );
}
