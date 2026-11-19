import { useEffect, useState } from "react";
import {
  KIND_LABELS,
  costText,
  STATUS_TONES,
  formatCredits,
  formatDateTime,
  formatPrice,
  formatTokens,
  providerLabel,
  serviceLabel,
} from "../../../components/AiCredits/aiCredits";
import Badge from "../../../components/ui/Badge";
import DataTable from "../../../components/ui/DataTable";
import Drawer from "../../../components/ui/Drawer";
import { ErrorState, Skeleton } from "../../../components/ui/States";
import TablePagination from "../../../components/ui/TablePagination";
import { getApiErrorMessage } from "../../../redux/api/baseApi";
import { useGetAdminAiAnalyticsClientQuery } from "../../../redux/api/aiCreditsApi";

const modelColumns = [
  { key: "model", header: "Provider / Model", className: "whitespace-nowrap", render: (r) => `${providerLabel(r.provider)} · ${r.model}` },
  { key: "requests", header: "Requests", className: "text-right tabular-nums", render: (r) => `${formatCredits(r.requests)}${r.failed ? ` (${r.failed} failed)` : ""}` },
  { key: "totalTokens", header: "Tokens", className: "text-right tabular-nums", render: (r) => formatTokens(r.totalTokens) },
  { key: "cost", header: "Cost", className: "text-right tabular-nums whitespace-nowrap", render: (r) => costText(r.cost) },
  { key: "credits", header: "Credits", className: "text-right tabular-nums", render: (r) => formatCredits(r.credits) },
];

const callColumns = [
  { key: "date", header: "Time", className: "whitespace-nowrap", render: (c) => formatDateTime(c.date) },
  { key: "service", header: "Feature", className: "whitespace-nowrap", render: (c) => serviceLabel(c.service) },
  {
    key: "model",
    header: "Provider / Model",
    className: "whitespace-nowrap",
    render: (c) => `${providerLabel(c.provider)} · ${c.model} (${KIND_LABELS[c.kind] ?? c.kind})`,
  },
  {
    key: "tokens",
    header: "Tokens in / out",
    className: "text-right tabular-nums whitespace-nowrap",
    render: (c) =>
      c.kind === "stt"
        ? c.metrics?.audioBytes
          ? `${Math.round(c.metrics.audioBytes / 1024)} KB audio`
          : "—"
        : `${formatTokens(c.inputTokens)} / ${formatTokens(c.outputTokens)}${c.usageSource === "estimated" ? " (est.)" : ""}`,
  },
  {
    key: "cost",
    header: "Cost",
    className: "text-right tabular-nums",
    render: (c) => (c.priced ? formatPrice(c.cost, c.costCurrency) : "Unpriced"),
  },
  {
    key: "status",
    header: "Status",
    render: (c) => (
      <Badge tone={STATUS_TONES[c.status === "success" ? "completed" : "failed"]}>
        {c.status === "success" ? "Success" : `Failed${c.httpStatus ? ` (${c.httpStatus})` : ""}`}
      </Badge>
    ),
  },
];

// One client's API usage in the selected period: per model, and every call.
const ClientUsageDrawer = ({ client, range, onClose }) => {
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [client?.tenantId]);
  const { data, isLoading, isFetching, error, refetch } = useGetAdminAiAnalyticsClientQuery(
    { tenantId: client?.tenantId, ...range, page, limit: 15 },
    { skip: !client },
  );
  if (!client) return null;

  return (
    <Drawer open title={data?.name ?? client.name} description={`${client.tenantId} · API usage`} onClose={onClose}>
      {isLoading ? (
        <Skeleton className="h-64" />
      ) : error ? (
        <ErrorState message={getApiErrorMessage(error, "Couldn't load this client's usage.")} onRetry={refetch} />
      ) : (
        <div className="space-y-5">
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-app-text">By provider and model</h3>
            <DataTable columns={modelColumns} rows={data.byModel} rowKey={(r) => `${r.provider}/${r.model}/${r.kind}`} emptyMessage="No AI calls in this period" />
          </section>
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-app-text">Every API call</h3>
            <DataTable columns={callColumns} rows={data.calls.items} rowKey={(c) => c.id} loading={isFetching} emptyMessage="No AI calls in this period" />
            <TablePagination
              page={page}
              limit={15}
              total={data.calls.pagination.total}
              totalPages={data.calls.pagination.totalPages}
              onPageChange={setPage}
              itemLabel="calls"
            />
          </section>
        </div>
      )}
    </Drawer>
  );
};

export default ClientUsageDrawer;
