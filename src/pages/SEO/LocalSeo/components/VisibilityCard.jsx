import Card from "../../../../components/ui/Card";
import { RANK_BANDS, UNRANKED, rankBand } from "../localSeoUtils";

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const Gauge = ({ value }) => {
  const pct = Math.max(0, Math.min(100, value));
  const color = pct >= 70 ? "#16a34a" : pct >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative flex size-32 shrink-0 items-center justify-center">
      <svg viewBox="0 0 140 140" className="size-32 -rotate-90">
        <circle
          cx="70"
          cy="70"
          r={RADIUS}
          fill="none"
          strokeWidth="12"
          className="stroke-app-surface-secondary"
        />
        <circle
          cx="70"
          cy="70"
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          style={{ transition: "stroke-dasharray 900ms cubic-bezier(.22,1,.36,1)" }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-3xl font-semibold tabular-nums text-app-text">
          {Math.round(pct)}
          <span className="text-base text-app-text-muted">%</span>
        </p>
      </div>
    </div>
  );
};

// Share of tracked keywords in the Map 3-pack, plus how all keywords spread
// over the rank bands.
const VisibilityCard = ({ keywords, stats, area }) => {
  const bands = [...RANK_BANDS, UNRANKED].map((band) => ({
    ...band,
    count: keywords.filter((k) => rankBand(k.liveGmbRank) === band).length,
  }));
  const total = keywords.length || 1;

  return (
    <Card
      title={`${area ? `${area} ` : ""}visibility`}
      description="Share of your keywords in the top 3 on Google Maps"
    >
      <div className="flex items-center gap-5">
        <Gauge value={stats.visibility} />
        <p className="text-sm text-app-text-muted">
          <span className="font-semibold text-app-text">{stats.inPack}</span> of{" "}
          <span className="font-semibold text-app-text">{keywords.length}</span>{" "}
          tracked keywords show in the Map 3-pack.
        </p>
      </div>

      {keywords.length > 0 && (
        <div className="mt-5">
          <div className="flex h-2 overflow-hidden rounded-full bg-app-surface-secondary">
            {bands.map(
              (band) =>
                band.count > 0 && (
                  <div
                    key={band.label}
                    className="anim-grow-x h-full"
                    style={{
                      width: `${(band.count / total) * 100}%`,
                      backgroundColor: band.color,
                    }}
                    title={`${band.label}: ${band.count}`}
                  />
                ),
            )}
          </div>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            {bands.map((band) => (
              <li key={band.label} className="flex items-center gap-2">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: band.color }}
                />
                <span className="flex-1 text-app-text-muted">{band.label}</span>
                <span className="font-medium tabular-nums text-app-text">
                  {band.count}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};

export default VisibilityCard;
