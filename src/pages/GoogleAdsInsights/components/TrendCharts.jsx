import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CHART_COLORS,
  axisProps,
  formatCompact,
  formatDayLabel,
  gridProps,
  tooltipProps,
} from "../../../components/Charts/chartTheme";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import { formatCurrency, formatNumber, formatRoas } from "../googleAdsUtils";

// one colour per metric, the same on every chart of the page
const COLORS = {
  clicks: CHART_COLORS[0],
  conversions: CHART_COLORS[2],
  cost: CHART_COLORS[1],
  conversionsValue: CHART_COLORS[6],
};

const TrendChart = ({ data, series, format, id }) => (
  <div className="h-72">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <defs>
          {series.map((s) => (
            <linearGradient
              key={s.key}
              id={`${id}-${s.key}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={COLORS[s.key]} stopOpacity={0.22} />
              <stop offset="100%" stopColor={COLORS[s.key]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid {...gridProps} />
        <XAxis
          dataKey="date"
          {...axisProps}
          tickFormatter={formatDayLabel}
          minTickGap={24}
        />
        <YAxis {...axisProps} width={48} tickFormatter={formatCompact} />
        <Tooltip
          {...tooltipProps}
          labelFormatter={formatDayLabel}
          formatter={(v) => format(v)}
        />
        <Legend
          iconType="circle"
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
        />
        {series.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={COLORS[s.key]}
            strokeWidth={2}
            fill={`url(#${id}-${s.key})`}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

const TrendCharts = ({ series, roas, showRoas }) => (
  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
    <Card title="Engagement" description="Clicks and conversions per day">
      <TrendChart
        id="ads-engagement"
        data={series}
        format={formatNumber}
        series={[
          { key: "clicks", label: "Clicks" },
          { key: "conversions", label: "Conversions" },
        ]}
      />
    </Card>
    <Card
      title="Spend vs. revenue"
      description="Daily cost against conversion value (₹)"
      actions={showRoas && <Badge tone="green">ROAS {formatRoas(roas)}</Badge>}
    >
      <TrendChart
        id="ads-spend"
        data={series}
        format={formatCurrency}
        series={[
          { key: "cost", label: "Cost" },
          { key: "conversionsValue", label: "Conv. value" },
        ]}
      />
    </Card>
  </div>
);

export default TrendCharts;
