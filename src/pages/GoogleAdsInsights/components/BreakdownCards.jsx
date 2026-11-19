import { Monitor } from "lucide-react";
import { CHART_COLORS } from "../../../components/Charts/chartTheme";
import DonutChart from "../../../components/Charts/DonutChart";
import Card from "../../../components/ui/Card";
import ProgressList from "../../../components/ui/ProgressList";
import { EmptyState } from "../../../components/ui/States";
import { DEVICES, formatNumber, formatPercent } from "../googleAdsUtils";

// a device keeps its colour whatever its share is
const DEVICE_COLORS = {
  Mobile: CHART_COLORS[0],
  Desktop: CHART_COLORS[2],
  Tablet: CHART_COLORS[3],
  "Smart TV": CHART_COLORS[4],
  Other: CHART_COLORS[6],
};

// Impressions → clicks → conversions, with the rate between each step.
const FunnelCard = ({ totals, derived }) => {
  const steps = [
    {
      label: "Impressions",
      value: totals.impressions || 0,
      color: CHART_COLORS[0],
    },
    {
      label: "Clicks",
      value: totals.clicks || 0,
      color: CHART_COLORS[6],
      rate: derived.ctr,
      rateLabel: "CTR",
    },
    {
      label: "Conversions",
      value: totals.conversions || 0,
      color: CHART_COLORS[2],
      rate: derived.conversionRate,
      rateLabel: "Conv. rate",
    },
  ];
  const max = Math.max(steps[0].value, 1);

  return (
    <Card
      title="Conversion funnel"
      description="Impressions → clicks → conversions"
    >
      <ul className="space-y-4">
        {steps.map((step) => (
          <li key={step.label}>
            <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
              <span className="text-app-text">{step.label}</span>
              <span className="font-semibold tabular-nums text-app-text">
                {formatNumber(step.value)}
                {step.rateLabel && (
                  <span className="ml-2 text-xs font-normal text-app-text-muted">
                    {step.rateLabel} {formatPercent(step.rate)}
                  </span>
                )}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-app-surface-secondary">
              <div
                className="anim-grow-x h-full rounded-full"
                // log scale: conversions are often <1% of impressions and would vanish
                style={{
                  width: `${step.value ? Math.max((Math.log10(step.value + 1) / Math.log10(max + 1)) * 100, 3) : 0}%`,
                  backgroundColor: step.color,
                }}
              />
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-app-text-faint">
        Bars use a log scale so small steps stay visible.
      </p>
    </Card>
  );
};

const DevicesCard = ({ rows }) => {
  const totals = {};
  rows.forEach((row) => {
    const name = DEVICES[String(row.device)] || "Other";
    totals[name] = (totals[name] || 0) + (row.clicks || 0);
  });
  const slices = Object.entries(totals)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value, color: DEVICE_COLORS[name] }));

  return (
    <Card title="Clicks by device" description="Where people clicked your ads">
      {slices.length ? (
        <div className="space-y-4">
          <DonutChart
            data={slices}
            centerLabel="Clicks"
            unit="clicks"
            height={180}
          />
          <ProgressList
            showShare
            total={slices.reduce((sum, s) => sum + s.value, 0)}
            items={slices.map((s) => ({
              label: s.name,
              value: s.value,
              color: s.color,
            }))}
          />
        </div>
      ) : (
        <EmptyState
          icon={Monitor}
          title="No device data"
          description="Try a sync, or pick a wider date range."
        />
      )}
    </Card>
  );
};

// (search impression share is not synced from Google, so it has no card)
const BreakdownCards = ({ totals, derived, devices }) => (
  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
    <FunnelCard totals={totals} derived={derived} />
    <DevicesCard rows={devices} />
  </div>
);

export default BreakdownCards;
