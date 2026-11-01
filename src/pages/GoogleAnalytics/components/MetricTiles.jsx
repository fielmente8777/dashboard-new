import { Area, AreaChart, ResponsiveContainer } from "recharts";
import Icon from "../../../components/ui/Icon";
import { METRICS, changeOf, formatMetric, totalOf } from "../analyticsUtils";
import Delta from "./Delta";

// Daily values of one metric as a tiny filled line, no axes.
const Sparkline = ({ rows, metric, id }) => (
  <div className="h-10">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={rows} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={metric.color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={metric.color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey={metric.key}
          stroke={metric.color}
          strokeWidth={1.75}
          fill={`url(#${id})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

// The headline metrics of the range. Each tile shows the total, the change
// against the previous period and a sparkline; picking one charts it.
const MetricTiles = ({ rows, previousRows, value, onChange }) => (
  <div role="tablist" aria-label="Metric" className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">
    {METRICS.map((metric) => {
      const active = metric.key === value;
      const total = totalOf(rows, metric);
      const before = previousRows.length ? totalOf(previousRows, metric) : null;

      return (
        <button
          key={metric.key}
          type="button"
          role="tab"
          aria-selected={active}
          onClick={() => onChange(metric.key)}
          className={`group relative overflow-hidden rounded-xl border bg-app-surface p-4 text-left transition ${
            active
              ? "border-transparent! ring-2"
              : "border-app-border! hover:-translate-y-0.5 hover:shadow-md"
          }`}
          style={active ? { "--tw-ring-color": metric.color } : undefined}
        >
          <span
            className="absolute inset-x-0 top-0 h-0.5 transition-opacity"
            style={{ backgroundColor: metric.color, opacity: active ? 1 : 0 }}
          />
          <span className="flex items-center justify-between gap-2">
            <span className="truncate text-xs font-medium text-app-text-muted">{metric.label}</span>
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded-lg"
              style={{
                color: metric.color,
                backgroundColor: `color-mix(in srgb, ${metric.color} 14%, transparent)`,
              }}
            >
              <Icon icon={metric.icon} size="sm" />
            </span>
          </span>
          <span className="mt-2 block text-2xl font-semibold tabular-nums tracking-tight text-app-text">
            {formatMetric(metric, total)}
          </span>
          <span className="mt-1 flex items-center gap-1.5">
            <Delta value={before == null ? null : changeOf(total, before)} />
          </span>
          <span className="mt-2 block">
            <Sparkline rows={rows} metric={metric} id={`ga-spark-${metric.key}`} />
          </span>
        </button>
      );
    })}
  </div>
);

export default MetricTiles;
