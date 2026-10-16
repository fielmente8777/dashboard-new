import { Search } from "lucide-react";
import Pagination from "../../../../components/Pagination";
import Badge from "../../../../components/ui/Badge";
import Card from "../../../../components/ui/Card";
import DataTable from "../../../../components/ui/DataTable";
import { Input } from "../../../../components/ui/Field";
import Icon from "../../../../components/ui/Icon";
import Tabs from "../../../../components/ui/Tabs";
import { timeAgo } from "../../../../utils/formateDate";
import { formatNumber, recipientStatus } from "../../broadcastUtils";

const when = (date) => (date ? timeAgo(date) : "—");

const columns = [
  {
    key: "name",
    header: "Contact",
    render: (row) => (
      <div className="flex items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-xs font-semibold text-blue-600 dark:text-blue-400">
          {row.name?.[0]?.toUpperCase() || "?"}
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium">
            {row.name || <span className="text-app-text-faint">Unknown</span>}
          </p>
          <p className="font-mono text-xs text-app-text-muted">{row.phone}</p>
        </div>
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (row) => {
      const { tone, label } = recipientStatus(row.status);
      return <Badge tone={tone}>{label}</Badge>;
    },
  },
  { key: "sentAt", header: "Sent", className: "whitespace-nowrap text-app-text-muted!", render: (row) => when(row.sentAt) },
  { key: "deliveredAt", header: "Delivered", className: "whitespace-nowrap text-app-text-muted!", render: (row) => when(row.deliveredAt) },
  { key: "readAt", header: "Read", className: "whitespace-nowrap text-app-text-muted!", render: (row) => when(row.readAt) },
  {
    key: "error",
    header: "Failure",
    render: (row) =>
      row.status === "failed" ? (
        <div className="max-w-xs text-xs">
          <p className="text-red-500">{when(row.failedAt)}</p>
          {row.error && (
            <p className="line-clamp-2 text-app-text-muted" title={row.error}>
              {row.error}
            </p>
          )}
        </div>
      ) : (
        <span className="text-app-text-faint">—</span>
      ),
  },
];

// Server-paged list of who the campaign went to. Clicking a row opens the
// WhatsApp chat with that number.
const RecipientsTable = ({
  tabs,
  status,
  onStatusChange,
  search,
  onSearchChange,
  recipients,
  loading,
  page,
  totalPages,
  total,
  onPageChange,
  onOpen,
}) => (
  <Card
    title="Recipients"
    description={`${formatNumber(total)} ${status === "all" ? "in total" : "match this filter"}`}
  >
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
      <Tabs tabs={tabs} value={status} onChange={onStatusChange} />
      <div className="relative w-full sm:w-64">
        <Icon
          icon={Search}
          size="sm"
          tone="faint"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
        />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search name or phone"
          aria-label="Search recipients"
          className="pl-9"
        />
      </div>
    </div>

    <DataTable
      columns={columns}
      rows={recipients}
      rowKey={(row) => row._id}
      loading={loading}
      onRowClick={onOpen}
      emptyMessage="No recipients match these filters"
    />

    <div className="mt-3 flex justify-end">
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        onPrev={() => onPageChange(page - 1)}
        onNext={() => onPageChange(page + 1)}
      />
    </div>
  </Card>
);

export default RecipientsTable;
