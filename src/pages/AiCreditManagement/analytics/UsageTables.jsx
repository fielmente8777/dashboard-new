import { ArrowDown, ArrowUp, ChevronsUpDown, Eye, Search } from "lucide-react";
import { useState } from "react";
import {
  KIND_LABELS,
  costText,
  formatCredits,
  formatTokens,
  providerLabel,
} from "../../../components/AiCredits/aiCredits";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import { Input } from "../../../components/ui/Field";
import Icon from "../../../components/ui/Icon";
import IconButton from "../../../components/ui/IconButton";
import { ErrorState } from "../../../components/ui/States";
import TablePagination from "../../../components/ui/TablePagination";
import useDebounce from "../../../hooks/useDebounce";
import { getApiErrorMessage } from "../../../redux/api/baseApi";
import {
  useGetAdminAiAnalyticsClientsQuery,
  useGetAdminAiAnalyticsModelsQuery,
} from "../../../redux/api/aiCreditsApi";


const SortHeader = ({ label, field, sort, onSort, align = "right" }) => {
  const active = sort.field === field;
  const icon = !active ? ChevronsUpDown : sort.order === "asc" ? ArrowUp : ArrowDown;
  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      aria-label={`Sort by ${label}`}
      className={`inline-flex items-center gap-1 uppercase tracking-wide hover:text-app-text ${align === "right" ? "ml-auto" : ""} ${active ? "text-app-text" : ""}`}
    >
      {label}
      <Icon icon={icon} size="sm" />
    </button>
  );
};

const useSort = (initial) => {
  const [sort, setSort] = useState({ field: initial, order: "desc" });
  const onSort = (field) =>
    setSort((prev) => ({ field, order: prev.field === field && prev.order === "desc" ? "asc" : "desc" }));
  return [sort, onSort];
};

const num = (key, format = formatCredits) => (row) => format(row[key]);

/** Provider / model table: requests, tokens, cost and credits, sortable and paged. */
export const ModelUsageTable = ({ range }) => {
  const [sort, onSort] = useSort("requests");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data, isFetching, error, refetch } = useGetAdminAiAnalyticsModelsQuery({
    ...range,
    sort: sort.field,
    order: sort.order,
    page,
    limit,
  });

  const head = (label, field) => <SortHeader label={label} field={field} sort={sort} onSort={(f) => { onSort(f); setPage(1); }} />;
  const columns = [
    {
      key: "model",
      header: "Provider / Model",
      className: "whitespace-nowrap",
      render: (r) => (
        <span>
          <span className="font-medium">{providerLabel(r.provider)}</span>
          <span className="text-app-text-muted"> · {r.model}</span>
          <span className="ml-2 text-xs text-app-text-faint">{KIND_LABELS[r.kind] ?? r.kind}</span>
        </span>
      ),
    },
    { key: "requests", header: head("Requests", "requests"), className: "text-right tabular-nums", render: (r) => (
      <span title={`${r.success} successful, ${r.failed} failed`}>
        {formatCredits(r.requests)}
        {r.failed > 0 && <span className="ml-1 text-xs text-red-600 dark:text-red-400">({formatCredits(r.failed)} failed)</span>}
      </span>
    ) },
    { key: "inputTokens", header: head("Input tokens", "inputTokens"), className: "text-right tabular-nums", render: num("inputTokens", formatTokens) },
    { key: "outputTokens", header: head("Output tokens", "outputTokens"), className: "text-right tabular-nums", render: num("outputTokens", formatTokens) },
    { key: "totalTokens", header: head("Total tokens", "totalTokens"), className: "text-right tabular-nums", render: (r) => (
      <span>
        {formatTokens(r.totalTokens)}
        {r.estimated > 0 && <span className="text-app-text-faint" title={`${r.estimated} call(s) estimated: the provider reported no usage`}>*</span>}
      </span>
    ) },
    { key: "cost", header: head("Cost", "cost"), className: "text-right tabular-nums whitespace-nowrap", render: (r) => (r.unpriced === r.requests && r.requests ? <Badge tone="amber">Unpriced</Badge> : costText(r.cost)) },
    { key: "credits", header: head("Credits used", "credits"), className: "text-right tabular-nums", render: num("credits") },
  ];

  return (
    <Card title="Usage by provider and model" description="Actual API calls (tokens reported by the provider) next to the wallet credits charged for them">
      {error ? (
        <ErrorState message={getApiErrorMessage(error, "Couldn't load model usage.")} onRetry={refetch} />
      ) : (
        <div className="space-y-3">
          <DataTable columns={columns} rows={data?.items ?? []} rowKey={(r) => `${r.provider}/${r.model}/${r.kind}`} loading={isFetching} emptyMessage="No AI API calls in this period" />
          <TablePagination
            page={page}
            limit={limit}
            total={data?.pagination?.total ?? 0}
            totalPages={data?.pagination?.totalPages}
            onPageChange={setPage}
            onLimitChange={(v) => { setLimit(v); setPage(1); }}
            itemLabel="models"
          />
          <p className="text-xs text-app-text-faint">* includes calls whose tokens were estimated because the provider reported no usage.</p>
        </div>
      )}
    </Card>
  );
};

/** Which clients use the most AI; onOpen(client) opens the client's call history. */
export const ClientUsageTable = ({ range, onOpen }) => {
  const [sort, onSort] = useSort("requests");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const term = useDebounce(search.trim(), 300);
  const { data, isFetching, error, refetch } = useGetAdminAiAnalyticsClientsQuery({
    ...range,
    search: term,
    sort: sort.field,
    order: sort.order,
    page,
    limit: 10,
  });

  const head = (label, field) => <SortHeader label={label} field={field} sort={sort} onSort={(f) => { onSort(f); setPage(1); }} />;
  const columns = [
    {
      key: "name",
      header: "Client",
      render: (r) => (
        <span className="block min-w-0">
          <span className="block font-medium">{r.name}</span>
          <span className="block font-mono text-xs text-app-text-faint">{r.tenantId}</span>
        </span>
      ),
    },
    {
      key: "models",
      header: "Providers / models",
      render: (r) => (
        <span className="flex flex-wrap gap-1">
          {r.models.map((m) => (
            <Badge key={`${m.provider}/${m.model}`}>{`${providerLabel(m.provider)} · ${m.model}`}</Badge>
          ))}
        </span>
      ),
    },
    { key: "requests", header: head("Requests", "requests"), className: "text-right tabular-nums", render: num("requests") },
    { key: "totalTokens", header: head("Tokens", "totalTokens"), className: "text-right tabular-nums", render: num("totalTokens", formatTokens) },
    { key: "cost", header: head("Cost", "cost"), className: "text-right tabular-nums whitespace-nowrap", render: (r) => costText(r.cost) },
    { key: "credits", header: head("Credits", "credits"), className: "text-right tabular-nums", render: num("credits") },
    {
      key: "open",
      header: <span className="sr-only">Open</span>,
      className: "text-right",
      render: (r) => <IconButton icon={Eye} label={`View ${r.name}'s API usage`} onClick={() => onOpen(r)} />,
    },
  ];

  return (
    <Card
      title="Usage by client"
      description="Which clients use the most AI"
      actions={
        <div className="relative sm:w-64">
          <Icon icon={Search} size="sm" tone="faint" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search client name or ID"
            aria-label="Search clients"
            className="pl-9"
          />
        </div>
      }
    >
      {error ? (
        <ErrorState message={getApiErrorMessage(error, "Couldn't load client usage.")} onRetry={refetch} />
      ) : (
        <div className="space-y-3">
          <DataTable columns={columns} rows={data?.items ?? []} rowKey={(r) => r.tenantId} loading={isFetching} emptyMessage="No client used AI in this period" />
          <TablePagination page={page} limit={10} total={data?.pagination?.total ?? 0} totalPages={data?.pagination?.totalPages} onPageChange={setPage} itemLabel="clients" />
        </div>
      )}
    </Card>
  );
};
