import {
  BadgeCheck,
  Eye,
  MousePointerClick,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Icon from "../../../components/ui/Icon";
import StatCard from "../../../components/ui/StatCard";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatRoas,
  percentChange,
} from "../googleAdsUtils";

// the four numbers people look at first; `key` is the totals field
const HEADLINE = [
  { key: "cost", label: "Spend", icon: Wallet, format: formatCurrency, lowerIsBetter: true },
  { key: "clicks", label: "Clicks", icon: MousePointerClick, format: formatNumber },
  { key: "impressions", label: "Impressions", icon: Eye, format: formatNumber },
  { key: "conversions", label: "Conversions", icon: BadgeCheck, format: formatNumber },
];

// how well the money worked; `key` is the derived field
const EFFICIENCY = [
  { key: "ctr", label: "CTR", hint: "Clicks ÷ impressions", format: formatPercent },
  { key: "averageCpc", label: "Avg. CPC", hint: "Cost per click", format: formatCurrency, lowerIsBetter: true },
  { key: "conversionRate", label: "Conv. rate", hint: "Conversions ÷ clicks", format: formatPercent },
  { key: "costPerConversion", label: "Cost / conv.", hint: "Spend per conversion", format: formatCurrency, lowerIsBetter: true },
  { key: "roas", label: "ROAS", hint: "Conversion value ÷ spend", format: formatRoas },
];

// change against the previous period, coloured by whether it is good
const Change = ({ value, lowerIsBetter }) => {
  if (value == null || value === 0) return null;
  const good = lowerIsBetter ? value < 0 : value > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        good ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
      }`}
    >
      <Icon icon={value > 0 ? TrendingUp : TrendingDown} size="sm" />
      {Math.abs(value)}%
    </span>
  );
};

const KpiGrid = ({ totals, derived = {}, previous }) => {
  const prevTotals = previous?.totals;
  const prevDerived = previous?.derived;
  const hasRoas = totals.cost > 0 && totals.conversionsValue > 0;

  return (
    <div className="space-y-3">
      <div className="anim-stagger grid grid-cols-2 gap-3 xl:grid-cols-4">
        {HEADLINE.map((card) => {
          const change = percentChange(totals[card.key], prevTotals?.[card.key]);
          return (
            <StatCard
              key={card.key}
              label={card.label}
              icon={card.icon}
              value={card.format(totals[card.key])}
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

      <dl className="grid grid-cols-2 divide-app-border! overflow-hidden rounded-xl border border-app-border! bg-app-surface sm:grid-cols-3 lg:grid-cols-5 lg:divide-x">
        {EFFICIENCY.map((item) => {
          const missing = item.key === "roas" && !hasRoas;
          return (
            <div key={item.key} className="px-4 py-3" title={item.hint}>
              <dt className="text-xs font-medium text-app-text-muted">{item.label}</dt>
              <dd className="mt-1 flex items-baseline gap-2">
                <span className="text-lg font-semibold tabular-nums text-app-text">
                  {missing ? "—" : item.format(derived[item.key])}
                </span>
                {!missing && (
                  <Change
                    value={percentChange(derived[item.key], prevDerived?.[item.key])}
                    lowerIsBetter={item.lowerIsBetter}
                  />
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
};

export default KpiGrid;
