import { Rocket, Search } from "lucide-react";
import RankBadge from "../../../../components/Seo/RankBadge";
import { fmt } from "../../../../components/Seo/seoUtils";
import Card from "../../../../components/ui/Card";
import { EmptyState } from "../../../../components/ui/States";
import { NOT_RANKED, ORGANIC_BANDS, findOpportunities, organicBand } from "../websiteSeoUtils";

// How the keywords spread over Google positions.
const PositionSpread = ({ keywords }) => {
  const bands = [...ORGANIC_BANDS, NOT_RANKED].map((band) => ({
    ...band,
    count: keywords.filter((k) => organicBand(k.liveOrganicRank) === band).length,
  }));
  const max = Math.max(...bands.map((band) => band.count), 1);

  return (
    <Card title="Where you rank" description="Your keywords by Google search position">
      <ul className="space-y-3">
        {bands.map((band) => (
          <li key={band.label} className="flex items-center gap-3 text-sm">
            <span className="w-20 shrink-0 text-app-text-muted">{band.label}</span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-app-surface-secondary">
              <div
                className="anim-grow-x h-full rounded-full"
                style={{ width: `${(band.count / max) * 100}%`, backgroundColor: band.color }}
              />
            </div>
            <span className="w-8 shrink-0 text-right font-semibold tabular-nums text-app-text">
              {band.count}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
};

// Keywords just short of the top 3 with the most searches.
const Opportunities = ({ keywords }) => {
  const list = findOpportunities(keywords);

  return (
    <Card
      title="Closest to the top"
      description="Ranked 4–20 with the most searches: a little work here pays off most"
    >
      {list.length ? (
        <ul className="anim-stagger divide-y divide-app-border!">
          {list.map((k) => (
            <li key={k.keyword} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
              <RankBadge
                rank={k.liveOrganicRank}
                tone={organicBand(k.liveOrganicRank).tone}
                icon={Search}
              />
              <span className="min-w-0 flex-1 truncate text-sm text-app-text" title={k.keyword}>
                {k.keyword}
              </span>
              <span className="shrink-0 text-xs tabular-nums text-app-text-muted">
                {fmt(k.searchVolume)} / mo
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Rocket}
          title="Nothing close yet"
          description="Keywords ranked between #4 and #20 show up here."
        />
      )}
    </Card>
  );
};

const RankingsOverview = ({ keywords }) => (
  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
    <PositionSpread keywords={keywords} />
    <Opportunities keywords={keywords} />
  </div>
);

export default RankingsOverview;
