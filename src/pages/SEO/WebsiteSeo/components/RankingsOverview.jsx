import { Award, Rocket, Search } from "lucide-react";
import RankBadge from "../../../../components/Seo/RankBadge";
import { fmt } from "../../../../components/Seo/seoUtils";
import Card from "../../../../components/ui/Card";
import Icon from "../../../../components/ui/Icon";
import { EmptyState } from "../../../../components/ui/States";
import { findOpportunities, findTopPerformers, organicBand } from "../websiteSeoUtils";

// One keyword row: position, name, and its search volume as a bar against
// the biggest one in the list. `note` is a short line under the name.
const KeywordRow = ({ keyword, maxVolume, note }) => (
  <li className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
    <RankBadge
      rank={keyword.liveOrganicRank}
      tone={organicBand(keyword.liveOrganicRank).tone}
      icon={Search}
    />
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-medium text-app-text" title={keyword.keyword}>
        {keyword.keyword}
      </p>
      {note && <p className="mt-0.5 text-xs text-app-text-muted">{note}</p>}
    </div>
    <div className="w-28 shrink-0">
      <p className="text-right text-xs tabular-nums text-app-text-muted">
        <span className="font-semibold text-app-text">{fmt(keyword.searchVolume)}</span> / mo
      </p>
      <div className="mt-1 h-1 overflow-hidden rounded-full bg-seo-track">
        <div
          className="anim-grow-x h-full rounded-full bg-blue-500 dark:bg-blue-400"
          style={{ width: `${((keyword.searchVolume ?? 0) / maxVolume) * 100}%` }}
        />
      </div>
    </div>
  </li>
);

const maxVolumeOf = (list) => Math.max(...list.map((k) => k.searchVolume ?? 0), 1);

const ListCard = ({ icon, iconClass, title, description, list, note, empty }) => (
  <Card
    title={
      <span className="flex items-center gap-1.5">
        <Icon icon={icon} className={iconClass} /> {title}
      </span>
    }
    description={description}
  >
    {list.length ? (
      <ul className="anim-stagger divide-y divide-app-border!">
        {list.map((k) => (
          <KeywordRow key={k.keyword} keyword={k} maxVolume={maxVolumeOf(list)} note={note(k)} />
        ))}
      </ul>
    ) : (
      empty
    )}
  </Card>
);

// Two short lists under the overview: keywords close to the top 3, and the
// ones already doing best.
const RankingsOverview = ({ keywords }) => (
  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
    <ListCard
      icon={Rocket}
      iconClass="text-amber-600 dark:text-amber-400"
      title="Closest to the top"
      description="Ranked 4–20 with the most searches: a little work here pays off most"
      list={findOpportunities(keywords)}
      note={(k) => {
        const gap = Math.round(k.liveOrganicRank) - 3;
        return `${gap} place${gap === 1 ? "" : "s"} from the top 3`;
      }}
      empty={
        <EmptyState
          icon={Rocket}
          title="Nothing close yet"
          description="Keywords ranked between #4 and #20 show up here."
        />
      }
    />
    <ListCard
      icon={Award}
      iconClass="text-emerald-600 dark:text-emerald-400"
      title="Best performers"
      description="Your strongest keywords on page 1 of Google"
      list={findTopPerformers(keywords)}
      note={(k) => (k.liveOrganicRank <= 3 ? "In the top 3" : "On page 1")}
      empty={
        <EmptyState
          icon={Award}
          title="No page-1 rankings yet"
          description="Keywords in the top 10 of Google show up here."
        />
      }
    />
  </div>
);

export default RankingsOverview;
