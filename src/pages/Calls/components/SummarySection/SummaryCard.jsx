import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

const SummaryCard = ({
  title,
  metric,
  icon,
  bg,
  iconColor,
  formatter,
  reverseTrend = false,
}) => {
  const Icon = icon;
  const value = formatter ? formatter(metric.value) : metric.value;

  const hasComparison =
    metric.change !== undefined && metric.trend !== undefined;

  const positive = reverseTrend
    ? metric.trend === "down"
    : metric.trend === "up";

  const trendColor =
    metric.trend === "neutral"
      ? "text-slate-500"
      : positive
        ? "text-green-600"
        : "text-red-600";

  const TrendIcon =
    metric.trend === "neutral"
      ? Minus
      : positive
        ? ArrowUpRight
        : ArrowDownRight;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md h-full">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <h2 className="mt-2 text-3xl font-bold text-slate-900">{value}</h2>

          {hasComparison && (
            <div
              className={`mt-4 flex items-center gap-1 text-sm ${trendColor}`}
            >
              <TrendIcon size={16} />

              <span className="font-semibold">{Math.abs(metric.change)}%</span>

              <span className="text-slate-500 whitespace-nowrap">
                vs previous period
              </span>
            </div>
          )}
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}
        >
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
