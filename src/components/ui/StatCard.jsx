import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import Icon from "./Icon";

const TRENDS = {
  up: { icon: TrendingUp, className: "text-emerald-600 dark:text-emerald-400" },
  down: { icon: TrendingDown, className: "text-red-600 dark:text-red-400" },
  flat: { icon: Minus, className: "text-app-text-muted" },
};

// One headline number. `trend` ("up" | "down") and `growth` (a percentage)
// add the change line underneath. Pass `lowerIsBetter` for numbers such as
// missed calls, where going down is the good direction. `icon` is optional.
const StatCard = ({
  label,
  value,
  trend,
  growth,
  caption,
  icon,
  lowerIsBetter = false,
}) => {
  const trendIcon = (TRENDS[trend] || TRENDS.flat).icon;
  // the arrow follows the number; the colour follows whether that is good
  const flipped = { up: "down", down: "up" }[trend];
  const { className } = TRENDS[lowerIsBetter ? flipped : trend] || TRENDS.flat;

  return (
    <div className="rounded-xl border border-app-border! bg-app-surface p-4">
      <p className="flex items-center justify-between gap-2 text-xs font-medium uppercase tracking-wide text-app-text-muted">
        {label}
        {icon && <Icon icon={icon} tone="faint" />}
      </p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-app-text">
        {value}
      </p>
      {growth !== undefined && (
        <p className={`mt-2 flex items-center gap-1 text-sm font-medium ${className}`}>
          <Icon icon={trendIcon} />
          {Math.abs(growth || 0)}%
          {caption && (
            <span className="font-normal text-app-text-muted">{caption}</span>
          )}
        </p>
      )}
    </div>
  );
};

export default StatCard;
