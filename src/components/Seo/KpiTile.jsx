import Icon from "../ui/Icon";
import { KPI_TONES } from "./seoTheme";

const METER = {
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  violet: "bg-violet-500",
  sky: "bg-sky-500",
};

// One headline number of an SEO overview. `meter` (0–100) draws a thin bar
// under the value; `hint` is a short line of context.
const KpiTile = ({ icon, label, value, hint, tone = "blue", meter }) => (
  <div className="flex min-w-0 flex-col rounded-xl border border-app-border! bg-app-surface p-4">
    <div className="flex items-center justify-between gap-2">
      <p className="truncate text-xs font-medium text-app-text-muted">{label}</p>
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${KPI_TONES[tone] || KPI_TONES.blue}`}
      >
        <Icon icon={icon} />
      </span>
    </div>
    <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-app-text">
      {value}
    </p>
    {meter != null && (
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-seo-track">
        <div
          className={`anim-grow-x h-full rounded-full ${METER[tone] || METER.blue}`}
          style={{ width: `${Math.max(0, Math.min(100, meter))}%` }}
        />
      </div>
    )}
    {hint && <p className="mt-auto pt-2 text-xs text-app-text-muted">{hint}</p>}
  </div>
);

export default KpiTile;
