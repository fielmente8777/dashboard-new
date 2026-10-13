import { Megaphone } from "lucide-react";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import { EmptyState } from "../../../components/ui/States";
import {
  formatCompact,
  formatCurrencyCompact,
  formatNumber,
  formatPercent,
  formatRoas,
} from "../googleAdsUtils";

const columns = (selected) => [
  {
    key: "name",
    header: "Campaign",
    render: (row) => (
      <span className="flex items-center gap-2">
        <span className="block max-w-72 truncate font-medium" title={row.name}>
          {row.name}
        </span>
        {row.campaignId === selected && <Badge tone="blue">Selected</Badge>}
      </span>
    ),
  },
  {
    key: "impressions",
    header: "Impr.",
    className: "text-right tabular-nums",
    render: (r) => formatCompact(r.impressions),
  },
  {
    key: "clicks",
    header: "Clicks",
    className: "text-right tabular-nums",
    render: (r) => formatCompact(r.clicks),
  },
  {
    key: "ctr",
    header: "CTR",
    className: "text-right tabular-nums",
    render: (r) => formatPercent(r.ctr),
  },
  {
    key: "cost",
    header: "Cost",
    className: "text-right tabular-nums",
    render: (r) => formatCurrencyCompact(r.cost),
  },
  {
    key: "conversions",
    header: "Conv.",
    className: "text-right tabular-nums",
    render: (r) => formatNumber(r.conversions),
  },
  {
    key: "roas",
    header: "ROAS",
    className: "text-right",
    render: (r) =>
      r.roas > 0 ? (
        <Badge tone={r.roas >= 1 ? "green" : "red"}>{formatRoas(r.roas)}</Badge>
      ) : (
        <span className="text-xs text-app-text-muted">N/A</span>
      ),
  },
];

// Every enabled campaign of the account for the date range, biggest spend
// first. Clicking one narrows the page to it.
const CampaignTable = ({ query, onSelect, selected }) => (
  <Card
    title="Campaign comparison"
    description="Ranked by spend · click a campaign to focus on it"
  >
    {!query.isFetching && !query.data?.length ? (
      <EmptyState
        icon={Megaphone}
        title="No campaigns to compare"
        description="Try a sync to pull your campaigns from Google Ads."
      />
    ) : (
      <DataTable
        columns={columns(selected)}
        rows={query.data || []}
        rowKey={(row) => row.campaignId}
        onRowClick={(row) => onSelect(row.campaignId)}
        loading={query.isFetching && !query.data}
      />
    )}
  </Card>
);

export default CampaignTable;
