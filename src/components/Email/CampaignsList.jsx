import { List, Search, Table2 } from "lucide-react";
import { useMemo, useState } from "react";
import EmailCampaignTable from "../../pages/EmailMarketing/components/EmailCampaignTable.jsx";
import { campaignStatus } from "../../pages/EmailMarketing/emailUtils.js";
import { Input } from "../ui/Field";
import Icon from "../ui/Icon";
import Tabs from "../ui/Tabs";
import CampaignDetail from "./CampaignDetail";
import SentMailList from "./SentMailList";

// the chosen look of the list, remembered on this device
const LAYOUT_KEY = "email-sent-layout";
const readLayout = () => {
  try {
    return localStorage.getItem(LAYOUT_KEY) === "table" ? "table" : "mail";
  } catch {
    return "mail";
  }
};

// Emails sent so far, filtered by status and searched by subject or recipient;
// a row opens that email (the message, then who got it and what they did).
// Two looks: a Gmail-style list (default) or the numbers table. The page owns
// which one is open (selectedId / onSelect), so other parts of it can open one too.
export default function CampaignsList({ campaigns, loading, selectedId, onSelect, onChanged }) {
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [layout, setLayout] = useState(readLayout);

  const chooseLayout = (next) => {
    setLayout(next);
    try {
      localStorage.setItem(LAYOUT_KEY, next);
    } catch {
      // private mode: just for this visit
    }
  };

  // one tab per status the campaigns actually have
  const tabs = useMemo(() => {
    const counts = campaigns.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {});
    return [
      { value: "all", label: `All (${campaigns.length})` },
      ...Object.keys(counts).map((value) => ({
        value,
        label: `${campaignStatus(value).label} (${counts[value]})`,
      })),
    ];
  }, [campaigns]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return campaigns.filter(
      (c) =>
        (status === "all" || c.status === status) &&
        (!term ||
          [c.subject, c.name, c.snippet, c.fromEmail, c.sentFrom?.email, ...(c.toPreview || []).flatMap((p) => [p.email, p.name])]
            .some((value) => value?.toLowerCase().includes(term))),
    );
  }, [campaigns, status, search]);

  const onDeleted = async (c) => {
    // the deleted one was open: close it
    if (selectedId === c._id) onSelect(null);
    await onChanged?.();
  };

  const layoutButton = (value, icon, label) => (
    <button
      type="button"
      onClick={() => chooseLayout(value)}
      aria-pressed={layout === value}
      title={label}
      aria-label={label}
      className={`flex size-8 items-center justify-center rounded-md transition ${
        layout === value ? "bg-app-surface text-app-text shadow-sm" : "text-app-text-muted hover:text-app-text"
      }`}
    >
      <Icon icon={icon} size="sm" />
    </button>
  );

  // an open email takes the list's place, like Gmail; the arrows go through the list as filtered
  if (selectedId) {
    const index = visible.findIndex((c) => c._id === selectedId);
    return (
      <CampaignDetail
        key={selectedId}
        campaignId={selectedId}
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
        <div className="hide-scrollbar -mx-1 overflow-x-auto px-1">
          <Tabs tabs={tabs} value={status} onChange={setStatus} className="w-max" />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full lg:w-72">
            <Icon
              icon={Search}
              size="sm"
              tone="faint"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subject or recipient"
              aria-label="Search sent emails"
              className="pl-9"
            />
          </div>
          <div className="hidden shrink-0 rounded-lg bg-app-surface-secondary p-0.5 ring-1 ring-app-border md:flex">
            {layoutButton("mail", List, "Inbox view")}
            {layoutButton("table", Table2, "Numbers table")}
          </div>
        </div>
      </div>

      {layout === "table" ? (
        <EmailCampaignTable
          campaigns={visible}
          onChanged={onChanged}
          loading={loading}
          onOpen={(c) => onSelect(c._id)}
          onDeleted={onDeleted}
          emptyMessage="No emails match these filters"
        />
      ) : (
        <SentMailList
          campaigns={visible}
          loading={loading}
          onOpen={(c) => onSelect(c._id)}
          onChanged={onChanged}
          onDeleted={onDeleted}
          emptyMessage="No emails match these filters"
        />
      )}

    </section>
  );
}
