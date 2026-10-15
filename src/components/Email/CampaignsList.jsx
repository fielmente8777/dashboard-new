import { PenLine, RefreshCw, Send } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  CAMPAIGN_TONE,
  formatDate,
  rate,
} from "../../pages/EmailMarketing/emailUtils.js";
import { getEmailCampaigns } from "../../services/api/emailCampaign.js";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import DataTable from "../ui/DataTable";
import IconButton from "../ui/IconButton";
import { EmptyState, ErrorState } from "../ui/States";
import CampaignDetail from "./CampaignDetail";

const PAGE_SIZE = 20;

// Emails sent so far, with how they performed.
export default function CampaignsList({ onCompose }) {
  const [campaigns, setCampaigns] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const res = await getEmailCampaigns({ page, limit: PAGE_SIZE });
      setCampaigns(res?.doc || []);
      setTotal(res?.pagination?.total || 0);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const columns = [
    {
      key: "subject",
      header: "Email",
      render: (c) => (
        <div className="max-w-xs">
          <p className="truncate font-medium">{c.subject || "No subject"}</p>
          <p className="text-xs text-app-text-muted">{formatDate(c.createdAt, true)}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (c) => <Badge tone={CAMPAIGN_TONE[c.status] || "gray"}>{c.status}</Badge>,
    },
    { key: "recipients", header: "Recipients", render: (c) => (c.recipientCount ?? 0).toLocaleString("en-IN") },
    { key: "sent", header: "Sent", render: (c) => (c.stats?.sent ?? 0).toLocaleString("en-IN") },
    { key: "opened", header: "Opened", render: (c) => rate(c.stats?.opened, c.stats?.sent) },
    { key: "clicked", header: "Clicked", render: (c) => rate(c.stats?.clicked, c.stats?.sent) },
    {
      key: "failed",
      header: "Failed",
      render: (c) => (
        <span className={c.stats?.failed ? "text-red-500" : ""}>{c.stats?.failed ?? 0}</span>
      ),
    },
  ];

  if (failed) return <ErrorState message="Could not load your campaigns." onRetry={load} />;

  if (!loading && total === 0) {
    return (
      <EmptyState
        icon={Send}
        title="No campaigns yet"
        description="Every email you send shows up here with its opens and clicks."
        action={
          onCompose && (
            <Button size="sm" icon={PenLine} onClick={onCompose}>
              Write your first email
            </Button>
          )
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 text-xs text-app-text-muted">
        <span>{total.toLocaleString("en-IN")} campaigns · click one to see each recipient</span>
        <div className="flex items-center gap-1">
          <IconButton icon={RefreshCw} label="Refresh" onClick={load} disabled={loading} />
          {totalPages > 1 && (
            <>
              <Button size="sm" variant="ghost" onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>
                Previous
              </Button>
              <span>
                {page} / {totalPages}
              </span>
              <Button size="sm" variant="ghost" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}>
                Next
              </Button>
            </>
          )}
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={campaigns}
        rowKey={(c) => c._id}
        loading={loading}
        onRowClick={(c) => setSelectedId(c._id)}
      />

      {selectedId && <CampaignDetail campaignId={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
