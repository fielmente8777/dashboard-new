import Badge from "../../../components/ui/Badge";
import DataTable from "../../../components/ui/DataTable";
import { CampaignCard } from "../../../components/Marketing/MarketingParts";
import { formatDateTime } from "../../../utils/formateDate";
import { campaignStatus, formatNumber, percent } from "../broadcastUtils";

// a number with its share of a base underneath, e.g. 120 / 82%
const Rate = ({ value, of, className = "" }) => (
  <div className="tabular-nums">
    <span className={className}>{formatNumber(value)}</span>
    <span className="ml-1.5 text-xs text-app-text-muted">
      {percent(value, of)}%
    </span>
  </div>
);

const columns = [
  {
    key: "name",
    header: "Campaign",
    render: (row) => (
      <div className="min-w-0 max-w-64">
        <p className="truncate font-medium" title={row.name}>
          {row.name || "Untitled"}
        </p>
        <p className="truncate text-xs text-app-text-muted">
          {row.templateName || "—"}
        </p>
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (row) => {
      const { tone, label } = campaignStatus(row.status);
      return <Badge tone={tone}>{label}</Badge>;
    },
  },
  {
    key: "audience",
    header: "Audience",
    className: "tabular-nums",
    render: (row) => formatNumber(row.totalRecipients),
  },
  {
    key: "sent",
    header: "Sent",
    render: (row) => {
      const share = percent(row.sentCount, row.totalRecipients);
      return (
        <div className="w-28">
          <p className="text-sm tabular-nums">
            {formatNumber(row.sentCount)}
            <span className="text-app-text-muted">
              {" "}
              / {formatNumber(row.totalRecipients)}
            </span>
          </p>
          <div className="mt-1 h-1 overflow-hidden rounded-full bg-app-surface-secondary">
            <div
              className="h-full rounded-full bg-[var(--chart-1)]"
              style={{ width: `${share}%` }}
            />
          </div>
        </div>
      );
    },
  },
  {
    key: "delivered",
    header: "Delivered",
    render: (row) => <Rate value={row.deliveredCount} of={row.sentCount} />,
  },
  {
    key: "read",
    header: "Read",
    render: (row) => <Rate value={row.readCount} of={row.deliveredCount} />,
  },
  {
    key: "failed",
    header: "Failed",
    render: (row) => (
      <Rate
        value={row.failedCount}
        of={row.totalRecipients}
        className={row.failedCount ? "text-red-500" : ""}
      />
    ),
  },
  {
    key: "createdAt",
    header: "Created",
    className: "whitespace-nowrap text-app-text-muted!",
    render: (row) => (row.createdAt ? formatDateTime(row.createdAt) : "—"),
  },
];

// A table on wider screens; on phones, one card per campaign.
const CampaignTable = ({ campaigns, loading, onOpen, emptyMessage }) => (
  <>
    <div className="hidden md:block">
      <DataTable
        columns={columns}
        rows={campaigns}
        rowKey={(row) => row._id}
        loading={loading}
        onRowClick={onOpen}
        emptyMessage={emptyMessage}
      />
    </div>
    <div className="space-y-2 md:hidden">
      {loading ? (
        [0, 1, 2].map((i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-app-surface-secondary" />)
      ) : campaigns.length === 0 ? (
        <p className="rounded-xl border border-app-border! bg-app-surface p-6 text-center text-sm text-app-text-muted">
          {emptyMessage}
        </p>
      ) : (
        campaigns.map((row) => {
          const { tone, label } = campaignStatus(row.status);
          return (
            <CampaignCard
              key={row._id}
              title={row.name}
              subtitle={row.templateName}
              statusBadge={<Badge tone={tone}>{label}</Badge>}
              onOpen={() => onOpen(row)}
              date={row.createdAt ? formatDateTime(row.createdAt) : null}
              stats={[
                { label: "Audience", value: formatNumber(row.totalRecipients) },
                { label: "Delivered", value: `${percent(row.deliveredCount, row.sentCount)}%` },
                { label: "Read", value: `${percent(row.readCount, row.deliveredCount)}%` },
                {
                  label: "Failed",
                  value: formatNumber(row.failedCount),
                  className: row.failedCount ? "text-red-500" : "text-app-text",
                },
              ]}
            />
          );
        })
      )}
    </div>
  </>
);

export default CampaignTable;
