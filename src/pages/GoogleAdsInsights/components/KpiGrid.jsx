import {
  BadgeCheck,
  Coins,
  Eye,
  IndianRupee,
  MousePointerClick,
  Percent,
  Receipt,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import StatCard from "../../../components/ui/StatCard";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatRoas,
  percentChange,
} from "../googleAdsUtils";

// `compare` is the totals key to compare with the previous period
const CARDS = [
  {
    label: "Impressions",
    icon: Eye,
    compare: "impressions",
    value: (t) => formatNumber(t.impressions),
  },
  {
    label: "Clicks",
    icon: MousePointerClick,
    compare: "clicks",
    value: (t) => formatNumber(t.clicks),
  },
  {
    label: "Cost",
    icon: Wallet,
    compare: "cost",
    lowerIsBetter: true,
    value: (t) => formatCurrency(t.cost),
  },
  {
    label: "Conversions",
    icon: BadgeCheck,
    compare: "conversions",
    value: (t) => formatNumber(t.conversions),
  },
  {
    label: "Conv. value",
    icon: Coins,
    compare: "conversionsValue",
    value: (t) => formatCurrency(t.conversionsValue),
  },
  { label: "CTR", icon: Percent, value: (_, d) => formatPercent(d.ctr) },
  {
    label: "Avg. CPC",
    icon: IndianRupee,
    value: (_, d) => formatCurrency(d.averageCpc),
  },
  {
    label: "Conv. rate",
    icon: Target,
    value: (_, d) => formatPercent(d.conversionRate),
  },
  {
    label: "Cost / conv.",
    icon: Receipt,
    value: (_, d) => formatCurrency(d.costPerConversion),
  },
  {
    label: "ROAS",
    icon: TrendingUp,
    value: (t, d) =>
      t.cost > 0 && t.conversionsValue > 0 ? formatRoas(d.roas) : "N/A",
  },
];

const KpiGrid = ({ totals, derived = {}, previousTotals }) => (
  <div className="anim-stagger grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
    {CARDS.map((card) => {
      const change = card.compare
        ? percentChange(totals[card.compare], previousTotals?.[card.compare])
        : null;

      return (
        <StatCard
          key={card.label}
          label={card.label}
          icon={card.icon}
          value={card.value(totals, derived)}
          {...(change != null && {
            growth: change,
            trend: change > 0 ? "up" : change < 0 ? "down" : "flat",
            caption: "vs previous period",
            lowerIsBetter: card.lowerIsBetter,
          })}
        />
      );
    })}
  </div>
);

export default KpiGrid;
