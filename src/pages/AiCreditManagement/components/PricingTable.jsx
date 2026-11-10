import { Pencil, Plus } from "lucide-react";
import {
  STATUS_TONES,
  capitalize,
  formatCredits,
  formatPrice,
  providerLabel,
} from "../../../components/AiCredits/aiCredits";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import IconButton from "../../../components/ui/IconButton";
import { ErrorState } from "../../../components/ui/States";
import { getApiErrorMessage } from "../../../redux/api/baseApi";

const per1M = (price, row) => (price > 0 ? `${formatPrice(price, row.currency)}` : "—");

// Provider prices per model, and how much provider cost one credit stands
// for. AI requests are charged from these; a model without an active row
// can't be used. onEdit(row) / onCreate() open the editor.
const PricingTable = ({ query, onEdit, onCreate }) => {
  const columns = [
    {
      key: "model",
      header: "Provider / Model",
      className: "whitespace-nowrap",
      render: (row) => (
        <span>
          <span className="font-medium">{providerLabel(row.provider)}</span>
          <span className="text-app-text-muted"> · {row.model}</span>
        </span>
      ),
    },
    { key: "inputPrice", header: "Input / 1M", className: "tabular-nums", render: (row) => per1M(row.inputPrice, row) },
    { key: "outputPrice", header: "Output / 1M", className: "tabular-nums", render: (row) => per1M(row.outputPrice, row) },
    { key: "embeddingPrice", header: "Embedding / 1M", className: "tabular-nums", render: (row) => per1M(row.embeddingPrice, row) },
    { key: "requestPrice", header: "Per request", className: "tabular-nums", render: (row) => per1M(row.requestPrice, row) },
    {
      key: "creditConversionRate",
      header: "Credit rate",
      className: "tabular-nums",
      render: (row) => `${formatCredits(row.creditConversionRate)} per ${row.currency}`,
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
      render: (row) => <IconButton icon={Pencil} label={`Edit ${row.provider} ${row.model} pricing`} onClick={() => onEdit(row)} />,
    },
  ];

  return (
    <Card
      title="AI provider pricing"
      description="Credits = provider cost (tokens, plus any per-request price) × credits per currency unit, rounded up to a whole credit"
      actions={
        <Button size="sm" icon={Plus} onClick={onCreate}>
          New model
        </Button>
      }
    >
      {query.error ? (
        <ErrorState message={getApiErrorMessage(query.error, "Couldn't load pricing.")} onRetry={query.refetch} />
      ) : (
        <DataTable
          columns={columns}
          rows={query.data ?? []}
          rowKey={(row) => row.id}
          loading={query.isLoading}
          emptyMessage="No models priced yet. AI still runs, charged at the fallback rates in Credit settings, until you add pricing."
        />
      )}
    </Card>
  );
};

export default PricingTable;
