// How keywords spread over rank bands: one stacked bar and a legend with
// counts and shares. bands: [{ label, color, count }] from countByBand().
const RankDistribution = ({ bands }) => {
  const total = bands.reduce((sum, band) => sum + band.count, 0);

  return (
    <div>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-seo-track">
        {total > 0 &&
          bands.map(
            (band) =>
              band.count > 0 && (
                <div
                  key={band.label}
                  className="anim-grow-x h-full border-r-2 border-app-surface! last:border-r-0"
                  style={{ width: `${(band.count / total) * 100}%`, backgroundColor: band.color }}
                  title={`${band.label}: ${band.count}`}
                />
              ),
          )}
      </div>

      <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-xs sm:grid-cols-3 lg:grid-cols-5">
        {bands.map((band) => (
          <li key={band.label} className="flex items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: band.color }} />
            <span className="min-w-0 flex-1 truncate text-app-text-muted">{band.label}</span>
            <span className="font-semibold tabular-nums text-app-text">{band.count}</span>
            <span className="w-9 text-right tabular-nums text-app-text-faint">
              {total ? Math.round((band.count / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RankDistribution;
