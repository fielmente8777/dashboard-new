import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import Icon from "../../../components/ui/Icon";

// Change against the previous period, as a small coloured pill.
// value: a percentage, or null when there is nothing to compare.
const Delta = ({ value }) => {
  if (value == null || !Number.isFinite(value)) {
    return <span className="text-xs text-app-text-faint">no prior data</span>;
  }

  const up = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums ${
        up
          ? "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300"
          : "bg-red-500/10 text-red-700 dark:bg-red-400/15 dark:text-red-300"
      }`}
    >
      <Icon icon={up ? ArrowUpRight : ArrowDownRight} size="xs" />
      {Math.abs(value).toFixed(1)}%
    </span>
  );
};

export default Delta;
