import { useState } from "react";
import { bucketLabel, dayLabel, niceMax, shortNumber } from "./analyticsFormat";

// Shared by the Sent tab's Performance card and one campaign's Report:
// headline tiles, ▲ / ▼ changes and a single-series bar chart with a hover tooltip.

// ▲ / ▼ against something before; `goodWhenUp` false for failures and unsubscribes
export function Delta({ now, before, points = false, goodWhenUp = true }) {
  if (!points && !before) return now ? <span className="text-app-text-muted">new</span> : null;
  const diff = points ? now - before : ((now - before) / before) * 100;
  if (Math.abs(diff) < (points ? 0.05 : 0.5)) return <span className="text-app-text-muted">no change</span>;
  const up = diff > 0;
  const good = up === goodWhenUp;
  return (
    <span className={`font-semibold ${good ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
      {up ? "▲" : "▼"} {points ? `${Math.abs(diff).toFixed(1)} pts` : `${Math.round(Math.abs(diff))}%`}
    </span>
  );
}

export function Kpi({ icon: KpiIcon, tone, label, value, caption, delta, title }) {
  return (
    <div className="min-w-0 rounded-xl border border-app-border! bg-app-surface p-3" title={title}>
      <p className="flex items-center gap-2 text-xs font-medium text-app-text-muted">
        <span className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${tone}`}>
          <KpiIcon className="size-3.5" />
        </span>
        <span className="truncate">{label}</span>
      </p>
      <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-app-text">{value}</p>
      <p className="mt-0.5 truncate text-xs text-app-text-muted">
        {delta}
        {delta && caption ? " · " : ""}
        {caption}
      </p>
    </div>
  );
}

// One series of bars, one axis; hover (or focus) a bar for its numbers.
//   buckets     [{ key, ... }]
//   value(b)    the bar's height
//   tooltip(b)  what the hover shows under the date
//   describe(b) the bar's screen-reader text
export function BarChart({ buckets, unit, value, tooltip, describe, className = "h-52" }) {
  const [hover, setHover] = useState(null);
  const top = niceMax(Math.max(0, ...buckets.map(value)));
  const ticks = [top, (top * 3) / 4, top / 2, top / 4, 0];
  const every = Math.max(1, Math.ceil(buckets.length / 6));
  const active = hover !== null ? buckets[hover] : null;
  // hours over several days: midnight shows the date, so the days can be told apart
  const spansDays = unit === "hour" && buckets.length > 24;
  const xLabel = (b) => (spansDays && b.key.endsWith(" 00") ? dayLabel(b.key, false) : bucketLabel(b.key, unit));

  return (
    <div className={`relative mt-3 select-none ${className}`} onMouseLeave={() => setHover(null)}>
      {ticks.map((t, i) => (
        <div key={i} className="absolute inset-x-0 flex items-center gap-2" style={{ top: `${(i / 4) * 85}%` }}>
          <span className="w-9 shrink-0 -translate-y-1/2 text-right text-[10px] tabular-nums text-app-text-faint">{shortNumber(Math.round(t))}</span>
          <span className="h-px flex-1 -translate-y-1/2 bg-app-border/70" />
        </div>
      ))}

      <div className="absolute bottom-[15%] left-11 right-0 top-0 flex items-end gap-[2px]">
        {buckets.map((b, i) => {
          const v = value(b);
          return (
            <div
              key={b.key}
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              tabIndex={0}
              aria-label={`${bucketLabel(b.key, unit, true)}: ${describe(b)}`}
              className="flex h-full flex-1 items-end outline-none"
            >
              <div
                className={`w-full rounded-t-[4px] transition-colors ${
                  hover === i ? "bg-blue-700 dark:bg-blue-400" : "bg-blue-600 dark:bg-blue-500"
                }`}
                style={{ height: v ? `${Math.max(2, (v / top) * 100)}%` : "2px", opacity: v ? 1 : 0.25 }}
              />
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-0 left-11 right-0 flex text-[10px] text-app-text-faint">
        {buckets.map((b, i) => (
          <span key={b.key} className="flex-1 overflow-visible whitespace-nowrap text-center">
            {spansDays ? (b.key.endsWith(" 00") || i === 0 ? xLabel(b) : "") : i % every === 0 ? xLabel(b) : ""}
          </span>
        ))}
      </div>

      {active && (
        <div
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] leading-snug text-white shadow-lg dark:bg-slate-700"
          style={{ left: `calc(2.75rem + (100% - 2.75rem) * ${(hover + 0.5) / buckets.length})` }}
        >
          <p className="text-white/70">{bucketLabel(active.key, unit, true)}</p>
          <p>{tooltip(active)}</p>
        </div>
      )}
    </div>
  );
}
