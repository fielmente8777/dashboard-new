import { useMemo, useState } from "react";
import {
  STATUS_TONES,
  capitalize,
  formatCredits,
  formatDate,
} from "../../../components/AiCredits/aiCredits";
import { usePagedRows } from "../../../components/AiCredits/usePagedRows";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import TablePagination from "../../../components/ui/TablePagination";
import Tabs from "../../../components/ui/Tabs";

const TYPE_TONES = { purchase: "blue", deduction: "gray", refund: "purple", adjustment: "sky" };

const FILTERS = [
  { value: "all", label: "All" },
  { value: "purchase", label: "Purchases" },
  { value: "deduction", label: "Deductions" },
  { value: "refund", label: "Refunds" },
  { value: "adjustment", label: "Adjustments" },
];

const columns = [
  { key: "id", header: "Transaction ID", className: "whitespace-nowrap font-mono text-xs!" },
  { key: "date", header: "Date", render: (row) => formatDate(row.date), className: "whitespace-nowrap" },
  {
    key: "type",
    header: "Type",
    render: (row) => <Badge tone={TYPE_TONES[row.type]}>{capitalize(row.type)}</Badge>,
  },
  { key: "description", header: "Description", className: "text-app-text-muted!" },
  {
    key: "credits",
    header: "Credits",
    render: (row) => (
      <span className={row.credits >= 0 ? "text-emerald-600 dark:text-emerald-400" : ""}>
        {row.credits >= 0 ? "+" : "−"}
        {formatCredits(Math.abs(row.credits))}
      </span>
    ),
    className: "text-right tabular-nums font-medium",
  },
  {
    key: "balanceAfter",
    header: "Balance After",
    render: (row) => formatCredits(row.balanceAfter),
    className: "text-right tabular-nums",
  },
  {
    key: "status",
    header: "Status",
    render: (row) => <Badge tone={STATUS_TONES[row.status]}>{capitalize(row.status)}</Badge>,
  },
];

const TransactionHistory = ({ transactions }) => {
  const [type, setType] = useState("all");
  const rows = useMemo(
    () => (type === "all" ? transactions : transactions.filter((row) => row.type === type)),
    [transactions, type],
  );
  const { pageRows, pagination } = usePagedRows(rows);

  return (
    <Card title="Transaction history" description="Recharges, usage and adjustments to your wallet">
      <div className="space-y-3">
        <div className="-mx-1 overflow-x-auto px-1">
          <Tabs tabs={FILTERS} value={type} onChange={setType} className="flex-nowrap" />
        </div>
        <DataTable
          columns={columns}
          rows={pageRows}
          rowKey={(row) => row.id}
          emptyMessage="No transactions of this type"
        />
        <TablePagination {...pagination} itemLabel="transactions" />
      </div>
    </Card>
  );
};

export default TransactionHistory;
