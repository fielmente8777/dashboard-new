import Badge from "../../../components/ui/Badge";
import DataTable from "../../../components/ui/DataTable";
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

const CampaignTable = ({ campaigns, loading, onOpen, emptyMessage }) => (
  <DataTable
    columns={columns}
    rows={campaigns}
    rowKey={(row) => row._id}
    loading={loading}
    onRowClick={onOpen}
    emptyMessage={emptyMessage}
  />
);

export default CampaignTable;
