import { ArrowDown, ArrowUp } from "lucide-react";
import Icon from "../ui/Icon";

const WIDTH = 64;
const HEIGHT = 22;

const TONES = {
  up: "text-emerald-600 dark:text-emerald-400",
  down: "text-red-600 dark:text-red-400",
  flat: "text-app-text-muted",
};

// Recent ranks as a tiny line (#1 at the top) and how many places the
// keyword moved since the first point. ranks: numbers, oldest first.
const RankSparkline = ({ ranks }) => {
  if (ranks.length < 2) return <span className="text-app-text-faint">—</span>;

  const min = Math.min(...ranks);
  const max = Math.max(...ranks);
  const span = max - min || 1;
  const points = ranks
    .map((rank, i) => {
      const x = (i / (ranks.length - 1)) * (WIDTH - 2) + 1;
      const y = max === min ? HEIGHT / 2 : ((rank - min) / span) * (HEIGHT - 4) + 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  // positive = climbed (a smaller rank number is better)
  const change = Math.round(ranks[0] - ranks[ranks.length - 1]);
  const direction = change > 0 ? "up" : change < 0 ? "down" : "flat";

  return (
    <div className={`flex items-center gap-2 ${TONES[direction]}`}>
      <svg width={WIDTH} height={HEIGHT} aria-hidden="true" className="shrink-0">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="inline-flex w-8 items-center text-xs font-semibold tabular-nums">
        {direction !== "flat" && <Icon icon={direction === "up" ? ArrowUp : ArrowDown} size="xs" />}
        {direction === "flat" ? "0" : Math.abs(change)}
      </span>
    </div>
  );
};

export default RankSparkline;
