import { useId, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatNumber } from "../../pages/EmailMarketing/emailUtils.js";
import { bucketLabel, dayLabel, shortNumber } from "./analyticsFormat";

// Shared by the Sent tab's Performance card and one campaign's Report:
// headline tiles, ▲ / ▼ changes and a trend chart with a crosshair tooltip.

// ▲ / ▼ against something before, as a small pill; `goodWhenUp` false for failures and unsubscribes
export function Delta({ now, before, points = false, goodWhenUp = true }) {
  if (!points && !before) return now ? <span className="text-app-text-muted">New</span> : null;
  const diff = points ? now - before : ((now - before) / before) * 100;
  if (Math.abs(diff) < (points ? 0.05 : 0.5)) return <span className="text-app-text-muted">No change</span>;
  const up = diff > 0;
  const good = up === goodWhenUp;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-px font-semibold tabular-nums ${
        good ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"
      }`}
    >
      {up ? "▲" : "▼"} {points ? `${Math.abs(diff).toFixed(1)} pts` : `${Math.round(Math.abs(diff))}%`}
    </span>
  );
}

// a headline number: label and icon, the number, then its change and a note on their own lines
export function Kpi({ icon: KpiIcon, tone, label, value, caption, delta, title }) {
  return (
    <div className="flex min-w-0 flex-col rounded-xl border border-app-border! bg-app-surface p-3 sm:p-4" title={title}>
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-xs font-medium text-app-text-muted">{label}</p>
        <span className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${tone}`} aria-hidden>
          <KpiIcon className="size-3.5" />
        </span>
      </div>
      <p className="mt-1 text-xl font-bold tabular-nums tracking-tight text-app-text sm:text-2xl">{value}</p>
      <div className="mt-auto space-y-0.5 pt-1 text-[11px] leading-snug">
        {delta && <p>{delta}</p>}
        {caption && (
          <p className="truncate text-app-text-muted" title={caption}>
            {caption}
          </p>
        )}
      </div>
    </div>
  );
}

// Change over time as smooth areas on one axis, like the trend charts of
// Mailchimp or Google Analytics: a 2px line over a soft fill, a dashed grid,
// and a crosshair with every series' numbers on hover (a tap on phones).
// A legend with each series' total sits above it; "Table" shows the numbers.
//   buckets   [{ key, ... }]  ("2026-11-17" or "2026-11-17 14")
//   series    [{ key, label, color }]  color: a --chart-n var, fixed per thing
//             (Sent = 1, Opened = 2, Clicked = 3 wherever they appear)
//   height    the plot's height in px
export function TrendChart({ buckets, unit, series, height = 220, className = "" }) {
  const gradientId = useId().replace(/:/g, "");
  const [asTable, setAsTable] = useState(false);
  const totals = series.map((s) => buckets.reduce((sum, b) => sum + (b[s.key] || 0), 0));

  // at most ~6 labels; hours over several days label each midnight with its date
  const spansDays = unit === "hour" && buckets.length > 24;
  const ticks = useMemo(() => {
    const keys = buckets.map((b) => b.key);
    const pool = spansDays ? keys.filter((k, i) => i === 0 || k.endsWith(" 00")) : keys;
    const every = Math.max(1, Math.ceil(pool.length / 6));
    return pool.filter((_, i) => i % every === 0);
  }, [buckets, spansDays]);
  // round y steps (1, 2, 2.5 or 5 × 10ⁿ), about four of them: 0 · 1k · 2k · 3k
  const yTicks = useMemo(() => {
    const top = Math.max(0, ...buckets.flatMap((b) => series.map((s) => b[s.key] || 0)));
    if (top <= 4) return [0, 1, 2, 3, 4];
    const raw = top / 4;
    const power = 10 ** Math.floor(Math.log10(raw));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * power).find((v) => v >= raw);
    return Array.from({ length: Math.ceil(top / step) + 1 }, (_, i) => i * step);
  }, [buckets, series]);
  const xLabel = (key) => (spansDays && key.endsWith(" 00") ? dayLabel(key, false) : bucketLabel(key, unit));

  return (
    <div className={`mt-3 ${className}`}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {series.map((s, i) => (
          <span key={s.key} className="inline-flex items-center gap-1.5 text-xs text-app-text-muted">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: s.color }} aria-hidden />
            {s.label}
            <b className="font-semibold tabular-nums text-app-text">{formatNumber(totals[i])}</b>
          </span>
        ))}
        <button
          type="button"
          onClick={() => setAsTable((v) => !v)}
          aria-pressed={asTable}
          className="ml-auto text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          {asTable ? "Chart" : "Table"}
        </button>
      </div>

      {asTable ? (
        <div className="mt-2 overflow-auto rounded-lg border border-app-border!" style={{ maxHeight: height }}>
          <table className="w-full text-xs tabular-nums">
            <thead className="sticky top-0 bg-app-surface-secondary text-app-text-muted">
              <tr>
                <th className="px-3 py-1.5 text-left font-medium">{unit === "hour" ? "Hour" : "Day"}</th>
                {series.map((s) => (
                  <th key={s.key} className="px-3 py-1.5 text-right font-medium">{s.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border">
              {buckets.filter((b) => series.some((s) => b[s.key])).map((b) => (
                <tr key={b.key}>
                  <td className="px-3 py-1.5 text-app-text-muted">{bucketLabel(b.key, unit, true)}</td>
                  {series.map((s) => (
                    <td key={s.key} className="px-3 py-1.5 text-right text-app-text">{formatNumber(b[s.key] || 0)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-2" style={{ height }} role="img" aria-label={`${series.map((s, i) => `${formatNumber(totals[i])} ${s.label.toLowerCase()}`).join(", ")}. Choose Table for every ${unit === "hour" ? "hour" : "day"}.`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={buckets} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                {series.map((s, i) => (
                  <linearGradient key={s.key} id={`${gradientId}-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" style={{ stopColor: s.color, stopOpacity: i === 0 ? 0.28 : 0.14 }} />
                    <stop offset="100%" style={{ stopColor: s.color, stopOpacity: 0 }} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="3 4" />
              <XAxis
                dataKey="key"
                ticks={ticks}
                tickFormatter={xLabel}
                tick={{ fontSize: 11, fill: "var(--app-text-muted)" }}
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                minTickGap={16}
              />
              <YAxis
                width={36}
                allowDecimals={false}
                ticks={yTicks}
                domain={[0, yTicks[yTicks.length - 1]]}
                tickFormatter={(v) => shortNumber(v)}
                tick={{ fontSize: 11, fill: "var(--app-text-muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ stroke: "var(--app-text-muted)", strokeWidth: 1, strokeDasharray: "3 3" }}
                content={<TrendTooltip unit={unit} series={series} />}
                wrapperStyle={{ outline: "none", zIndex: 10 }}
              />
              {series.map((s, i) => (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={s.color}
                  strokeWidth={2}
                  fill={`url(#${gradientId}-${i})`}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--app-surface)", fill: s.color }}
                  isAnimationActive={false}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function TrendTooltip({ active, payload, label, unit, series }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="min-w-36 rounded-xl border border-[var(--tooltip-border)]! bg-[var(--tooltip-bg)] px-3 py-2 text-xs shadow-lg backdrop-blur">
      <p className="mb-1 font-semibold text-[var(--tooltip-label)]">{bucketLabel(label, unit, true)}</p>
      {series.map((s) => (
        <p key={s.key} className="flex items-center gap-2 text-[var(--tooltip-text)]">
          <span className="size-2 shrink-0 rounded-full" style={{ background: s.color }} aria-hidden />
          <span className="flex-1">{s.label}</span>
          <b className="tabular-nums">{formatNumber(row[s.key] || 0)}</b>
        </p>
      ))}
    </div>
  );
}
