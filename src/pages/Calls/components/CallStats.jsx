import { CalendarClock, Phone, PhoneCall, PhoneMissed, Timer } from "lucide-react";
import { useMemo } from "react";
import Icon from "../../../components/ui/Icon";
import { Skeleton } from "../../../components/ui/States";
import { formatDuration } from "../../../components/Charts/chartTheme";
import { useGetCallAnalyticsQuery } from "../../../redux/api/callsApi";
import { getDateRange } from "../../../utils/dateRange";

// The summary figures are either plain numbers or { value, change, trend }.
const valueOf = (metric) =>
  metric !== null && typeof metric === "object" ? metric.value : metric;

const CARDS = [
  {
    key: "totalCalls",
    label: "Total calls",
    icon: Phone,
    tone: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300",
  },
  {
    key: "successfulCalls",
    label: "Answered",
    icon: PhoneCall,
    tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    caption: (summary) =>
      valueOf(summary.successRate) !== undefined
        ? `${valueOf(summary.successRate)}% success rate`
        : "",
  },
  {
    key: "missedCalls",
    label: "Missed",
    icon: PhoneMissed,
    tone: "bg-red-500/10 text-red-600 dark:text-red-300",
    caption: (summary) =>
      valueOf(summary.missedRate) !== undefined
        ? `${valueOf(summary.missedRate)}% of calls`
        : "",
  },
  {
    key: "followUps",
    label: "Follow ups",
    icon: CalendarClock,
    tone: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
  },
  {
    key: "totalTalkTime",
    label: "Talk time",
    icon: Timer,
    tone: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
    format: formatDuration,
  },
];

// The headline call numbers for the last 30 days, above the calls list.
// The full breakdown is on the Analytics tab.
const CallStats = ({ hid }) => {
  // fixed for the life of the page, so the request is not repeated
  const range = useMemo(() => getDateRange("30days"), []);
  const analytics = useGetCallAnalyticsQuery({ hid, ...range }, { skip: !hid });
  const summary = analytics.data?.summary || {};
  const loading = analytics.isLoading || analytics.isUninitialized;

  // the numbers are a nice-to-have: without them the list still works
  if (analytics.isError) return null;

  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-app-text-faint">
        Last 30 days
      </p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {CARDS.map((card, index) => {
          const raw = valueOf(summary[card.key]);
          const caption = card.caption?.(summary);
          return (
            <div
              key={card.key}
              className={`flex min-w-0 items-center gap-3 rounded-xl border border-app-border! bg-app-surface p-4 ${index === 0 ? "col-span-2 md:col-span-1" : ""}`}
            >
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${card.tone}`}
              >
                <Icon icon={card.icon} size="lg" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-medium uppercase tracking-wide text-app-text-muted">
                  {card.label}
                </span>
                {loading ? (
                  <Skeleton className="mt-1.5 h-6 w-12" />
                ) : (
                  <span className="mt-0.5 block text-xl font-semibold tabular-nums text-app-text">
                    {card.format
                      ? card.format(raw || 0)
                      : Number(raw || 0).toLocaleString()}
                  </span>
                )}
                {caption && !loading && (
                  <span className="block truncate text-xs text-app-text-faint">
                    {caption}
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CallStats;
