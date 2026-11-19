import { Pencil, Plus } from "lucide-react";
import {
  STATUS_TONES,
  capitalize,
  formatCredits,
  formatMoney,
} from "../../../components/AiCredits/aiCredits";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import IconButton from "../../../components/ui/IconButton";
import { ErrorState } from "../../../components/ui/States";
import { getApiErrorMessage } from "../../../redux/api/baseApi";

// The recharge packages tenants can buy (inactive ones are hidden from them).
// query: the admin packages query; onEdit(pack) / onCreate() open the editor.
const CreditPackages = ({ query, onEdit, onCreate }) => {
  const columns = [
    {
      key: "name",
      header: "Package Name",
      className: "whitespace-nowrap font-medium",
      render: (row) => (
        <span className="flex items-center gap-2">
          {row.name}
          {row.popular && <Badge tone="blue">Popular</Badge>}
        </span>
      ),
    },
    { key: "credits", header: "Credits", className: "tabular-nums", render: (row) => formatCredits(row.credits) },
    {
      key: "price",
      header: "Price",
      className: "tabular-nums",
      render: (row) => formatMoney(row.price, row.currency),
    },
    {
      key: "perCredit",
      header: "Per 100 Credits",
      className: "tabular-nums text-app-text-muted!",
      render: (row) => formatMoney((row.price / row.credits) * 100, row.currency),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <Badge tone={STATUS_TONES[row.status]}>{capitalize(row.status)}</Badge>,
    },
    {
      key: "edit",
      header: <span className="sr-only">Edit</span>,
      className: "text-right",
      render: (row) => <IconButton icon={Pencil} label={`Edit ${row.name}`} onClick={() => onEdit(row)} />,
    },
  ];

  return (
    <Card
      title="Credit packages"
      description="Recharge options shown on every tenant's AI Wallet"
      actions={
        <Button size="sm" icon={Plus} onClick={onCreate}>
          New package
        </Button>
      }
    >
      {query.error ? (
        <ErrorState message={getApiErrorMessage(query.error, "Couldn't load packages.")} onRetry={query.refetch} />
      ) : (
        <DataTable
          columns={columns}
          rows={query.data ?? []}
          rowKey={(row) => row.id}
          loading={query.isLoading}
          emptyMessage="No packages yet. Tenants can't recharge until one is active."
        />
      )}
    </Card>
  );
};

export default CreditPackages;
