import Badge from "../../../components/ui/Badge";
import DataTable from "../../../components/ui/DataTable";
import { campaignStatus, formatDate, formatNumber, percent } from "../emailUtils";

// a number with its share of a base next to it, e.g. 120 82%
const Rate = ({ value, of, className = "" }) => (
  <div className="tabular-nums">
    <span className={className}>{formatNumber(value)}</span>
    <span className="ml-1.5 text-xs text-app-text-muted">{percent(value, of)}%</span>
  </div>
);

const columns = [
  {
    key: "subject",
    header: "Campaign",
    render: (row) => (
      <div className="min-w-0 max-w-64">
        <p className="truncate font-medium" title={row.subject}>
          {row.subject || row.name || "No subject"}
        </p>
        <p className="truncate text-xs text-app-text-muted">{row.fromEmail || "—"}</p>
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
    render: (row) => formatNumber(row.recipientCount),
  },
  {
    key: "sent",
    header: "Sent",
    render: (row) => {
      const share = percent(row.stats?.sent, row.recipientCount);
      return (
        <div className="w-28">
          <p className="text-sm tabular-nums">
            {formatNumber(row.stats?.sent)}
            <span className="text-app-text-muted"> / {formatNumber(row.recipientCount)}</span>
          </p>
          <div className="mt-1 h-1 overflow-hidden rounded-full bg-app-surface-secondary">
            <div className="h-full rounded-full bg-[var(--chart-1)]" style={{ width: `${share}%` }} />
          </div>
        </div>
      );
    },
  },
  {
    key: "opened",
    header: "Opened",
    render: (row) => <Rate value={row.stats?.opened} of={row.stats?.sent} />,
  },
  {
    key: "clicked",
    header: "Clicked",
    render: (row) => <Rate value={row.stats?.clicked} of={row.stats?.opened} />,
  },
  {
    key: "failed",
    header: "Failed",
    render: (row) => (
      <Rate
        value={row.stats?.failed}
        of={row.recipientCount}
        className={row.stats?.failed ? "text-red-500" : ""}
      />
    ),
  },
  {
    key: "createdAt",
    header: "Created",
    className: "whitespace-nowrap text-app-text-muted!",
    render: (row) => formatDate(row.createdAt, true),
  },
];

const EmailCampaignTable = ({ campaigns, loading, onOpen, emptyMessage }) => (
  <DataTable
    columns={columns}
    rows={campaigns}
    rowKey={(row) => row._id}
    loading={loading}
    onRowClick={onOpen}
    emptyMessage={emptyMessage}
  />
);

export default EmailCampaignTable;
