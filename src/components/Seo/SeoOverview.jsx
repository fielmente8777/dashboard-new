import Badge from "../ui/Badge";
import KpiTile from "./KpiTile";
import RankDistribution from "./RankDistribution";
import ScoreRing from "./ScoreRing";
import { gradeOf } from "./seoTheme";

// The summary panel at the top of an SEO dashboard: a visibility score,
// the headline numbers and how the keywords spread over rank bands.
// score: 0–100. kpis: KpiTile props. bands: from countByBand().
const SeoOverview = ({ score, scoreTitle, scoreText, kpis, bands, bandsTitle }) => {
  const grade = gradeOf(Math.max(0, Math.min(100, score || 0)));

  return (
    <section className="seo-hero rounded-2xl p-4 sm:p-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[17rem_1fr]">
        <div className="flex items-center gap-4 lg:flex-col lg:items-start lg:border-r lg:border-app-border! lg:pr-5">
          <ScoreRing value={score} caption="Visibility" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold text-app-text">{scoreTitle}</h2>
              <Badge tone={grade.tone}>{grade.label}</Badge>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-app-text-muted">{scoreText}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <KpiTile key={kpi.label} {...kpi} />
          ))}
        </div>
      </div>

      <div className="mt-5 border-t border-app-border! pt-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-app-text-muted">
          {bandsTitle}
        </p>
        <RankDistribution bands={bands} />
      </div>
    </section>
  );
};

export default SeoOverview;
