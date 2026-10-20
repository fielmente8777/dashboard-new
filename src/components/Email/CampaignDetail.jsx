import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  CAMPAIGN_TONE,
  formatDate,
  rate,
  RECIPIENT_TONE,
} from "../../pages/EmailMarketing/emailUtils.js";
import {
  getCampaignRecipients,
  getEmailCampaign,
} from "../../redux/api/emailMarketingApi";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import DataTable from "../ui/DataTable";
import Dialog from "../ui/Dialog";
import IconButton from "../ui/IconButton";
import { Skeleton } from "../ui/States";
import Tabs from "../ui/Tabs";

const FILTERS = [
  { value: "", label: "All" },
  { value: "sent", label: "Sent" },
  { value: "opened", label: "Opened" },
  { value: "clicked", label: "Clicked" },
  { value: "failed", label: "Failed" },
  { value: "pending", label: "Pending" },
];

const STATS = [
  { key: "sent", label: "Sent" },
  { key: "delivered", label: "Delivered" },
  { key: "opened", label: "Opened", showRate: true },
  { key: "clicked", label: "Clicked", showRate: true },
  { key: "failed", label: "Failed", danger: true },
  { key: "unsubscribed", label: "Unsubscribed" },
];

const PAGE_SIZE = 50;

// One campaign: totals and how each recipient's email went.
export default function CampaignDetail({ campaignId, onClose }) {
  const [campaign, setCampaign] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const loadCampaign = useCallback(async () => {
    try {
      const res = await getEmailCampaign({ campaignId });
      setCampaign(res?.doc || null);
    } catch {
      // the header falls back to "Campaign"
    }
  }, [campaignId]);

  const loadRecipients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCampaignRecipients({ campaignId, status: filter, page, limit: PAGE_SIZE });
      setRecipients(res?.doc || []);
      setTotal(res?.pagination?.total || 0);
    } catch {
      setRecipients([]);
    } finally {
      setLoading(false);
    }
  }, [campaignId, filter, page]);

  useEffect(() => {
    loadCampaign();
  }, [loadCampaign]);

  useEffect(() => {
    loadRecipients();
  }, [loadRecipients]);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const stats = campaign?.stats || {};

  const columns = [
    {
      key: "who",
      header: "Recipient",
      render: (r) => (
        <div className="max-w-xs">
          <p className="truncate font-medium">{r.name || r.email}</p>
          {r.name && <p className="truncate text-xs text-app-text-muted">{r.email}</p>}
        </div>
      ),
    },
    { key: "status", header: "Status", render: (r) => <Badge tone={RECIPIENT_TONE[r.status] || "gray"}>{r.status}</Badge> },
    { key: "sentAt", header: "Sent", render: (r) => formatDate(r.sentAt, true) },
    {
      key: "error",
      header: "Problem",
      render: (r) =>
        r.error ? (
          <span className="block max-w-56 truncate text-red-500" title={r.error}>
            {r.error}
          </span>
        ) : (
          "—"
        ),
    },
  ];

  return (
    <Dialog
      open
      onClose={onClose}
      size="lg"
      title={campaign?.subject || "Campaign"}
      description={
        campaign
          ? `${(campaign.recipientCount ?? 0).toLocaleString("en-IN")} recipients · ${formatDate(campaign.createdAt, true)}`
          : "Loading…"
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          {campaign ? (
            <Badge tone={CAMPAIGN_TONE[campaign.status] || "gray"}>{campaign.status}</Badge>
          ) : (
            <Skeleton className="h-5 w-16" />
          )}
          <IconButton
            icon={RefreshCw}
            label="Refresh"
            onClick={() => {
              loadCampaign();
              loadRecipients();
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {STATS.map(({ key, label, showRate, danger }) => (
            <div key={key} className="rounded-lg border border-app-border! px-3 py-2.5">
              <p className="text-xs text-app-text-muted">{label}</p>
              <p className={`mt-0.5 text-lg font-semibold ${danger && stats[key] ? "text-red-500" : "text-app-text"}`}>
                {(stats[key] ?? 0).toLocaleString("en-IN")}
                {showRate && (
                  <span className="ml-1.5 text-xs font-normal text-app-text-muted">
                    {rate(stats[key], stats.sent)}
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>

        <Tabs tabs={FILTERS} value={filter} onChange={setFilter} />

        <DataTable
          columns={columns}
          rows={recipients}
          rowKey={(r) => r._id}
          loading={loading}
          emptyMessage={filter ? `No recipients are “${filter}”.` : "No recipients."}
        />

        {totalPages > 1 && (
          <div className="flex items-center justify-end gap-2 text-xs text-app-text-muted">
            <Button size="sm" variant="ghost" onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>
              Previous
            </Button>
            {page} / {totalPages}
            <Button size="sm" variant="ghost" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}>
              Next
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  );
}
