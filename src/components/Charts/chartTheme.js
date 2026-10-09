// Shared look of every Recharts chart. The colours are CSS variables defined
// in index.css, so charts follow the light / dark theme on their own.

// Series colours, in the order they must be used. Give a colour to a thing
// (a channel, a metric), not to its position in a sorted list, so it keeps
// its colour when the data changes. More than 8 series: fold the rest into
// CHART_OTHER.
export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
];
export const CHART_OTHER = "var(--chart-other)";

export const axisProps = {
  tick: { fontSize: 11, fill: "var(--app-text-muted)" },
  axisLine: false,
  tickLine: false,
};

export const gridProps = { vertical: false, stroke: "var(--chart-grid)" };

export const tooltipProps = {
  contentStyle: {
    background: "var(--tooltip-bg)",
    border: "1px solid var(--tooltip-border)",
    borderRadius: 12,
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
    color: "var(--tooltip-text)",
    fontSize: 13,
  },
  itemStyle: { color: "var(--tooltip-text)" },
  labelStyle: { color: "var(--tooltip-label)", fontWeight: 600 },
  cursor: { stroke: "var(--chart-grid)", fill: "rgba(127,127,127,0.08)" },
};

// 12400 -> "12.4k"
export const formatCompact = (value) => {
  const number = Number(value) || 0;
  if (number >= 1_000_000) return `${(number / 1_000_000).toFixed(1)}M`;
  if (number >= 1_000) return `${(number / 1_000).toFixed(1)}k`;
  return Math.round(number).toLocaleString();
};

// 95 -> "1m 35s"
export const formatDuration = (seconds = 0) =>
  `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;

// "2026-10-08" -> "Oct 8"
export const formatDayLabel = (date) =>
  new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
