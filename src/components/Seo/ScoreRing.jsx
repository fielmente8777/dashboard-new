import { gradeOf } from "./seoTheme";

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// A ring filled to `value` percent, with the number in the middle.
const ScoreRing = ({ value, caption }) => {
  const pct = Math.max(0, Math.min(100, value || 0));
  const grade = gradeOf(pct);

  return (
    <div className="relative flex size-36 shrink-0 items-center justify-center">
      <svg viewBox="0 0 140 140" className="size-36 -rotate-90">
        <circle cx="70" cy="70" r={RADIUS} fill="none" strokeWidth="11" className="stroke-seo-track" />
        <circle
          cx="70"
          cy="70"
          r={RADIUS}
          fill="none"
          strokeWidth="11"
          strokeLinecap="round"
          className={grade.ring}
          strokeDasharray={`${(pct / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          style={{ transition: "stroke-dasharray 900ms cubic-bezier(.22,1,.36,1)" }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-3xl font-semibold tabular-nums tracking-tight text-app-text">
          {Math.round(pct)}
          <span className="text-base font-medium text-app-text-muted">%</span>
        </p>
        {caption && (
          <p className="text-[11px] font-medium uppercase tracking-wide text-app-text-muted">
            {caption}
          </p>
        )}
      </div>
    </div>
  );
};

export default ScoreRing;
