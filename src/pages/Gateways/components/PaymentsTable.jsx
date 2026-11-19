import Badge from "../../../components/ui/Badge";
import DataTable from "../../../components/ui/DataTable";
import { PAYMENT_STATUS } from "../constants";

// Razorpay sends amounts in the smallest unit (paise) and dates in seconds
const formatAmount = (amount, currency = "INR") => {
  if (amount === undefined || amount === null) return "—";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
    }).format(amount / 100);
  } catch {
    return `${amount / 100} ${currency}`;
  }
};

const formatDateTime = (seconds) =>
  seconds
    ? new Date(seconds * 1000).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

const idClassName = "font-mono text-xs";

const COLUMNS = [
  {
    key: "created_at",
    header: "Date",
    className: "whitespace-nowrap",
    render: (row) => formatDateTime(row.created_at),
  },
  { key: "email", header: "Email" },
  { key: "contact", header: "Contact" },
  {
    key: "amount",
    header: "Amount",
    className: "whitespace-nowrap font-medium",
    render: (row) => formatAmount(row.amount, row.currency),
  },
  { key: "method", header: "Method", className: "uppercase" },
  { key: "vpa", header: "VPA" },
  { key: "order_id", header: "Order ID", className: idClassName },
  { key: "id", header: "Payment ID", className: idClassName },
  {
    key: "status",
    header: "Status",
    render: (row) => {
      const status = PAYMENT_STATUS[row.status];
      return (
        <Badge tone={status?.tone}>{status?.label || row.status || "—"}</Badge>
      );
    },
  },
];

const PaymentsTable = ({ payments, loading, emptyMessage }) => (
  <DataTable
    columns={COLUMNS}
    rows={payments}
    rowKey={(row, index) => row.id || index}
    loading={loading}
    emptyMessage={emptyMessage}
    skeletonRows={7}
  />
);

export default PaymentsTable;
