// Tooltip body for the Recharts charts on this page, in the shared tooltip
// colours (they switch with the theme). `rows(payload)` returns
// [{ label, value, color, dashed? }]; `title(payload)` the heading.
const ChartTooltip = ({ active, payload, title, rows }) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="min-w-44 rounded-xl px-3 py-2.5 text-xs shadow-lg"
      style={{
        background: "var(--tooltip-bg)",
        border: "1px solid var(--tooltip-border)",
        color: "var(--tooltip-text)",
      }}
    >
      <p className="mb-1.5 font-semibold" style={{ color: "var(--tooltip-label)" }}>
        {title(payload)}
      </p>
      <ul className="space-y-1">
        {rows(payload).map((row) => (
          <li key={row.label} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span
                className="h-0.5 w-3 rounded-full"
                style={{
                  background: row.dashed
                    ? `repeating-linear-gradient(90deg, ${row.color} 0 3px, transparent 3px 5px)`
                    : row.color,
                }}
              />
              {row.label}
            </span>
            <span className="font-semibold tabular-nums">{row.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChartTooltip;
