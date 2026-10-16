import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import EmailCampaignTable from "../../pages/EmailMarketing/components/EmailCampaignTable.jsx";
import { campaignStatus } from "../../pages/EmailMarketing/emailUtils.js";
import { Input } from "../ui/Field";
import Icon from "../ui/Icon";
import Tabs from "../ui/Tabs";
import CampaignDetail from "./CampaignDetail";

// Emails sent so far, filtered by status and searched by subject; a row
// opens that campaign's recipients.
export default function CampaignsList({ campaigns, loading }) {
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  // one tab per status the campaigns actually have
  const tabs = useMemo(() => {
    const counts = campaigns.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {});
    return [
      { value: "all", label: "All" },
      ...Object.keys(counts).map((value) => ({
        value,
        label: campaignStatus(value).label,
        count: counts[value],
      })),
    ];
  }, [campaigns]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return campaigns.filter(
      (c) =>
        (status === "all" || c.status === status) &&
        (!term ||
          c.subject?.toLowerCase().includes(term) ||
          c.name?.toLowerCase().includes(term)),
    );
  }, [campaigns, status, search]);

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs tabs={tabs} value={status} onChange={setStatus} />
        <div className="relative w-full sm:w-64">
          <Icon
            icon={Search}
            size="sm"
            tone="faint"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by subject"
            aria-label="Search campaigns"
            className="pl-9"
          />
        </div>
      </div>

      <EmailCampaignTable
        campaigns={visible}
        loading={loading}
        onOpen={(c) => setSelectedId(c._id)}
        emptyMessage="No campaigns match these filters"
      />

      {selectedId && <CampaignDetail campaignId={selectedId} onClose={() => setSelectedId(null)} />}
    </section>
  );
}
