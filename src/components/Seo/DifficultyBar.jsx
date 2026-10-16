// Keyword difficulty 0–100: easy (green), medium (amber), hard (red).
const DifficultyBar = ({ value }) => {
  if (value == null) return <span className="text-app-text-faint">—</span>;

  const color =
    value >= 70 ? "bg-red-500" : value >= 40 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="flex items-center gap-2" title={`Difficulty ${value} / 100`}>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-app-surface-secondary">
        <div
          className={`anim-grow-x h-full rounded-full ${color}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="w-6 text-right text-xs tabular-nums text-app-text-muted">
        {value}
      </span>
    </div>
  );
};

export default DifficultyBar;
