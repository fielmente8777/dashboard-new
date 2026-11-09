import { ChevronRight, CloudDownload } from "lucide-react";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import Icon from "../../../components/ui/Icon";
import { ErrorState } from "../../../components/ui/States";
import {
  formatCompact,
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercent,
} from "../googleAdsUtils";

const TITLES = {
  campaign: { title: "Campaigns", noun: "campaign", empty: "No campaigns in this account yet. Sync to pull them from Google Ads." },
  adgroup: { title: "Ad groups", noun: "ad group", empty: "This campaign has no ad groups." },
  ad: { title: "Ads", noun: "ad", empty: "This ad group has no ads." },
};

const num = (header, key, format) => ({
  key,
  header,
  className: "text-right tabular-nums",
  render: (row) =>
    row[key] ? format(row[key]) : <span className="text-app-text-faint">—</span>,
});

const columns = (level, selectedId) => [
  {
    key: "name",
    header: TITLES[level].noun,
    render: (row) => (
      <span className="flex min-w-0 items-center gap-2">
        <span
          className={`size-2 shrink-0 rounded-full ${row.paused ? "bg-amber-500" : "bg-emerald-500"}`}
          title={row.paused ? "Paused" : "Active"}
        />
        <span className="block max-w-80 truncate font-medium" title={row.name}>
          {row.name}
        </span>
        {row.paused && <Badge tone="amber">Paused</Badge>}
        {row.id === selectedId && <Badge tone="blue">Selected</Badge>}
      </span>
    ),
  },
  num("Impr.", "impressions", formatCompact),
  num("Clicks", "clicks", formatNumber),
  num("CTR", "ctr", formatPercent),
  num("Avg. CPC", "averageCpc", formatCurrency),
  num("Spend", "cost", formatCurrency),
  num("Conv.", "conversions", formatNumber),
  num("Cost / conv.", "costPerConversion", formatCurrency),
  {
    key: "lastActivity",
    header: "Last active",
    className: "whitespace-nowrap text-right text-xs text-app-text-muted",
    render: (row) => (row.lastActivity ? formatDate(row.lastActivity) : "Never"),
  },
  ...(level === "ad"
    ? []
    : [
        {
          key: "open",
          header: "",
          className: "w-8",
          render: () => <Icon icon={ChevronRight} tone="faint" size="sm" />,
        },
      ]),
];

// The children of what is selected, with their numbers for the date range.
// A row opens that campaign / ad group / ad.
const BreakdownTable = ({ breakdown, scopeName, selectedId, onOpen, onSync, syncing }) => {
  const { level, rows, loading, fetching, error, refetch, levelSynced } = breakdown;
  const showSyncHint = !loading && !error && rows.length > 0 && !levelSynced;
  const { title, empty } = TITLES[level];
  const active = rows.filter((r) => r.clicks || r.impressions || r.cost).length;

  return (
    <Card
      title={scopeName ? `${title} in ${scopeName}` : title}
      description={
        rows.length
          ? `${rows.length} ${rows.length === 1 ? TITLES[level].noun : `${TITLES[level].noun}s`}, ${active} with activity in this period · highest spend first`
          : undefined
      }
    >
      {showSyncHint && (
        <div className="mb-4 flex flex-col gap-3 rounded-lg border border-blue-500/30! bg-blue-500/5 p-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-sm text-app-text">
            <CloudDownload className="mt-0.5 size-4 shrink-0 text-blue-500" />
            <span>
              {TITLES[level].title} numbers haven&apos;t been synced from Google Ads yet. Sync once to
              fetch them for the last 90 days.
            </span>
          </p>
          <Button size="sm" icon={CloudDownload} loading={syncing} onClick={onSync} className="shrink-0">
            Sync now
          </Button>
        </div>
      )}
      {error ? (
        <ErrorState message={`Couldn't load the ${title.toLowerCase()}.`} onRetry={refetch} />
      ) : (
        <div className={`transition-opacity ${fetching && !loading ? "opacity-60" : ""}`}>
          <DataTable
            columns={columns(level, selectedId)}
            rows={rows}
            rowKey={(row) => row.id}
            onRowClick={onOpen}
            loading={loading}
            emptyMessage={empty}
          />
        </div>
      )}
    </Card>
  );
};

export default BreakdownTable;
