// A ranked list where each row has a label, a value and a bar.
// items: [{ key?, label, value, color?, prefix?, hint? }]
// The bar length is the value against `total` when given (a share of the
// whole), otherwise against the largest value in the list.
const ProgressList = ({
  items,
  total,
  color = "var(--chart-1)",
  showShare = false,
}) => {
  const max = total ?? Math.max(...items.map((item) => item.value), 1);

  return (
    <ul className="space-y-3">
      {items.map((item, index) => {
        const share = max ? (item.value / max) * 100 : 0;
        const barColor = item.color || color;

        return (
          <li key={item.key ?? `${item.label}-${index}`}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
              <span
                className="flex min-w-0 items-center gap-2 text-app-text"
                title={item.label}
              >
                {item.prefix ?? (
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: barColor }}
                  />
                )}
                <span className="truncate">{item.label}</span>
              </span>
              <span className="shrink-0 font-semibold tabular-nums text-app-text">
                {item.value.toLocaleString()}
                {showShare && (
                  <span className="ml-2 text-xs font-normal text-app-text-muted">
                    {share.toFixed(1)}%
                  </span>
                )}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-app-surface-secondary">
              <div
                className="anim-grow-x h-full rounded-full transition-[width] duration-500"
                style={{ width: `${Math.min(share, 100)}%`, backgroundColor: barColor }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default ProgressList;
