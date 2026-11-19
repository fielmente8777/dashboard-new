import { Activity, Clock, Eye, MousePointerClick, UserPlus, Users } from "lucide-react";
import {
  CHART_COLORS,
  CHART_OTHER,
  formatCompact,
  formatDuration,
} from "../../components/Charts/chartTheme";
import { addDays, parseISODate, toISODate } from "../../utils/datePresets";

// The daily metrics of the overview report. Each keeps its own colour;
// `average` metrics are averaged over the range instead of summed.
export const METRICS = [
  { key: "users", label: "Active users", icon: Users },
  { key: "newUsers", label: "New users", icon: UserPlus },
  { key: "sessions", label: "Sessions", icon: Activity },
  { key: "pageViews", label: "Page views", icon: Eye },
  { key: "eventCount", label: "Events", icon: MousePointerClick },
  { key: "avgSessionDuration", label: "Avg. session", icon: Clock, average: true },
].map((metric, index) => ({ ...metric, color: CHART_COLORS[index] }));

export const metricByKey = (key) => METRICS.find((metric) => metric.key === key);

export const totalOf = (rows, metric) => {
  const sum = rows.reduce((total, row) => total + (row[metric.key] || 0), 0);
  return metric.average && rows.length ? sum / rows.length : sum;
};

export const formatMetric = (metric, value) =>
  metric.average ? formatDuration(value) : formatCompact(value);

// percentage change from `before` to `now`; null when there is nothing to
// compare against
export const changeOf = (now, before) =>
  before ? ((now - before) / before) * 100 : null;

// The range of the same length just before `range` ("YYYY-MM-DD" dates).
export const previousRange = ({ start, end }) => {
  const from = parseISODate(start);
  const to = parseISODate(end);
  const days = Math.round((to - from) / 86_400_000) + 1;
  return {
    start: toISODate(addDays(from, -days)),
    end: toISODate(addDays(from, -1)),
  };
};

// a channel always has the same colour, whatever its rank
const CHANNEL_COLORS = {
  "Organic Search": CHART_COLORS[0],
  Direct: CHART_COLORS[1],
  "Organic Social": CHART_COLORS[2],
  Referral: CHART_COLORS[3],
  Social: CHART_COLORS[4],
  Email: CHART_COLORS[5],
  "Paid Search": CHART_COLORS[6],
  Display: CHART_COLORS[7],
};
export const channelColor = (name) => CHANNEL_COLORS[name] || CHART_OTHER;

// "IN" -> 🇮🇳
export const flagEmoji = (code) => {
  if (!code || code.length !== 2) return "🌍";
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((char) => 0x1f1a5 + char.charCodeAt(0)),
  );
};

export const percent = (value, total) => (total ? (value / total) * 100 : 0);
