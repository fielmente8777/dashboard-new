import { Eye, MinusCircle, PlusCircle, ReceiptText, Search } from "lucide-react";
import {
  STATUS_TONES,
  capitalize,
  creditState,
  formatCredits,
  formatDate,
} from "../../../components/AiCredits/aiCredits";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import { Input } from "../../../components/ui/Field";
import Icon from "../../../components/ui/Icon";
import IconButton from "../../../components/ui/IconButton";
import SelectMenu from "../../../components/ui/SelectMenu";
import TablePagination from "../../../components/ui/TablePagination";

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
];

const LEVEL_FILTERS = [
  { value: "all", label: "All balances" },
  { value: "healthy", label: "Healthy" },
  { value: "low", label: "Low" },
  { value: "critical", label: "Critical" },
  { value: "empty", label: "Empty" },
];

const LEVEL_TONES = { healthy: "", low: "text-amber-600 dark:text-amber-400", critical: "text-red-600 dark:text-red-400", empty: "text-red-600 dark:text-red-400" };

// Every client and its AI wallet; filtering and paging happen on the server.
// onAction(action, tenant), action: "wallet" | "add" | "deduct" | "transactions"
const TenantCreditsTable = ({ tenants, pagination, filters, onFiltersChange, loading, thresholds, onAction }) => {
  const columns = [
    { key: "name", header: "Tenant Name", className: "whitespace-nowrap font-medium" },
    { key: "tenantId", header: "Tenant ID", className: "font-mono text-xs! text-app-text-muted!" },
    {
      key: "availableCredits",
      header: "Available",
      className: "text-right tabular-nums",
      render: (row) => (
        <span className={`font-semibold ${LEVEL_TONES[creditState(row.availableCredits, thresholds)]}`}>
          {formatCredits(row.availableCredits)}
        </span>
      ),
    },
    { key: "totalPurchased", header: "Purchased", className: "text-right tabular-nums", render: (row) => formatCredits(row.totalPurchased) },
    { key: "totalUsed", header: "Used", className: "text-right tabular-nums", render: (row) => formatCredits(row.totalUsed) },
    { key: "lastRecharge", header: "Last Recharge", className: "whitespace-nowrap", render: (row) => formatDate(row.lastRecharge) },
    {
      key: "walletStatus",
      header: "Wallet Status",
      render: (row) => <Badge tone={STATUS_TONES[row.walletStatus]}>{capitalize(row.walletStatus)}</Badge>,
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      render: (row) => (
        <div className="flex justify-end gap-0.5">
          <IconButton icon={Eye} label="View wallet" onClick={() => onAction("wallet", row)} />
          <IconButton icon={PlusCircle} label="Add credits" tone="success" onClick={() => onAction("add", row)} />
          <IconButton icon={MinusCircle} label="Deduct credits" tone="danger" onClick={() => onAction("deduct", row)} />
          <IconButton icon={ReceiptText} label="View transactions" onClick={() => onAction("transactions", row)} />
        </div>
      ),
    },
  ];

  return (
    <Card title="Tenant credits" description="Every tenant's AI wallet">
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative sm:w-72">
            <Icon icon={Search} size="sm" tone="faint" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={filters.search}
              onChange={(e) => onFiltersChange({ search: e.target.value })}
              placeholder="Search tenant name or ID"
              aria-label="Search tenants"
              className="pl-9"
            />
          </div>
          <SelectMenu label="Wallet status" options={STATUS_FILTERS} value={filters.status} onChange={(status) => onFiltersChange({ status })} className="sm:w-44" />
          <SelectMenu label="Balance" options={LEVEL_FILTERS} value={filters.level} onChange={(level) => onFiltersChange({ level })} className="sm:w-44" />
        </div>

        <DataTable
          columns={columns}
          rows={tenants}
          rowKey={(row) => row.tenantId}
          loading={loading}
          emptyMessage="No tenants match these filters"
        />
        <TablePagination {...pagination} itemLabel="tenants" />
      </div>
    </Card>
  );
};

export default TenantCreditsTable;
