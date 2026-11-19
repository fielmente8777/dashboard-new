import { ChevronRight } from "lucide-react";
import Icon from "../ui/Icon";

const formatNumber = (value) => (value || 0).toLocaleString("en-IN");
const percent = (part, whole) => (whole > 0 ? Math.round(((part || 0) / whole) * 100) : 0);

// How far messages got, step by step: each step shows its count, how many of
// the step before it made it (the "rate"), and a bar against the first step.
//   steps:  [{ label, value, icon, rateLabel? }]  first step is the base
//   aside:  { label, value, hint } - e.g. failed / bounced, shown apart in red
//   note:   a line under the steps, e.g. why a step is missing
const FunnelCard = ({ title = "How your messages did", steps, aside, note, loading }) => {
  const base = steps[0]?.value || 0;

  return (
    <section className="rounded-2xl border border-app-border! bg-app-surface p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-app-text">{title}</h2>
        <span className="text-xs text-app-text-muted">All campaigns</span>
      </div>

      <div
        style={{ "--steps": steps.length }}
        className="grid grid-cols-2 gap-x-3 gap-y-5 lg:grid-cols-[repeat(var(--steps),minmax(0,1fr))] lg:gap-0"
      >
        {steps.map((step, index) => {
          const previous = steps[index - 1];
          const share = base ? Math.max(2, percent(step.value, base)) : 0;
          return (
            <div key={step.label} className={`relative min-w-0 ${index > 0 ? "lg:border-l lg:border-app-border! lg:pl-5" : ""} lg:pr-5`}>
              {index > 0 && (
                <span className="absolute -left-2.5 top-1 hidden size-5 items-center justify-center rounded-full border border-app-border! bg-app-surface text-app-text-faint lg:flex">
                  <ChevronRight className="size-3" />
                </span>
              )}
              <p className="flex items-center gap-1.5 truncate text-[11px] font-medium uppercase tracking-wide text-app-text-muted">
                {step.icon && <Icon icon={step.icon} size="sm" tone="faint" />}
                {step.label}
              </p>
              {loading ? (
                <div className="mt-2 h-7 w-20 animate-pulse rounded bg-app-surface-secondary" />
              ) : (
                <p className="mt-1.5 text-2xl font-semibold tabular-nums text-app-text">{formatNumber(step.value)}</p>
              )}
              <p className="mt-0.5 h-4 text-xs text-app-text-muted">
                {previous && !loading && (
                  <>
                    <span className="font-semibold text-app-text">{percent(step.value, previous.value)}%</span>{" "}
                    {step.rateLabel || `of ${previous.label.toLowerCase()}`}
                  </>
                )}
              </p>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-app-surface-secondary">
                <div
                  className="h-full rounded-full bg-[var(--chart-1)] transition-[width] duration-700"
                  style={{ width: loading ? "0%" : `${share}%`, opacity: 1 - index * 0.15 }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {note && <p className="mt-4 text-xs text-app-text-muted">{note}</p>}

      {aside && !loading && aside.value > 0 && (
        <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg bg-red-500/[0.06] px-3 py-2 text-xs text-red-700 dark:text-red-400">
          <span className="font-semibold tabular-nums">{formatNumber(aside.value)}</span>
          {aside.label}
          {aside.hint && <span className="text-app-text-muted">· {aside.hint}</span>}
        </p>
      )}
    </section>
  );
};

export default FunnelCard;
