import { ExternalLink, RefreshCw, Trash2, Trophy, Zap } from "lucide-react";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import Drawer from "../../../../components/ui/Drawer";
import Icon from "../../../../components/ui/Icon";
import { actionFor, fmt, fmtCurrency, fmtRank, rankBand } from "../localSeoUtils";
import DifficultyBar from "../../../../components/Seo/DifficultyBar";
import RankTrendChart from "./RankTrendChart";

const Metric = ({ label, children }) => (
  <div className="rounded-lg bg-app-surface-secondary px-3 py-2.5">
    <p className="text-xs text-app-text-muted">{label}</p>
    <div className="mt-1 text-sm font-semibold tabular-nums text-app-text">
      {children}
    </div>
  </div>
);

// Everything about one tracked keyword.
const KeywordDrawer = ({
  keyword,
  onClose,
  refreshing,
  refreshCost,
  onRefresh,
  onUntrack,
}) => {
  if (!keyword) return null;

  const band = rankBand(keyword.liveGmbRank);
  const action = actionFor(keyword.actionBadge);
  const history = (keyword.rankHistory || [])
    .filter((snapshot) => snapshot?.rank != null)
    .slice(-30)
    .map((snapshot) => ({ date: snapshot.date, rank: snapshot.rank }));

  return (
    <Drawer
      open
      title={keyword.keyword}
      description="Google Maps ranking for this search"
      onClose={onClose}
      header={
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            icon={RefreshCw}
            loading={refreshing}
            onClick={() => onRefresh(keyword.keyword)}
          >
            Refresh rank · {refreshCost} cr
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={Trash2}
            className="text-red-500! hover:bg-red-500/10"
            onClick={() => onUntrack(keyword.keyword)}
          >
            Stop tracking
          </Button>
        </div>
      }
    >
      <div className="anim-stagger space-y-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Metric label="Maps rank">
            <span className="flex items-center gap-1.5">
              {fmtRank(keyword.liveGmbRank)}
              <Badge tone={band.tone}>{band.label}</Badge>
            </span>
          </Metric>
          <Metric label="Monthly searches">{fmt(keyword.searchVolume)}</Metric>
          <Metric label="CPC">{fmtCurrency(keyword.cpc)}</Metric>
          <Metric label="Difficulty">
            <DifficultyBar value={keyword.keywordDifficulty} />
          </Metric>
        </div>

        <Card title="Rank history" description="Lower is better">
          {history.length > 1 ? (
            <RankTrendChart data={history} height={180} id="keyword-rank-fill" />
          ) : (
            <p className="py-8 text-center text-sm text-app-text-muted">
              The trend appears once a few daily checks have run.
            </p>
          )}
        </Card>

        <Card
          title={
            <span className="flex items-center gap-1.5">
              <Icon icon={Zap} tone="warning" /> Next step
              <Badge tone={action.tone} className="ml-1 gap-1">
                <Icon icon={action.icon} size="xs" /> {action.label}
              </Badge>
            </span>
          }
        >
          <p className="text-sm leading-relaxed text-app-text-muted">{action.tip}</p>
          {keyword.topCompetitor && (
            <a
              href={`https://${keyword.topCompetitor}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-app-border! px-3 py-1.5 text-xs font-medium text-app-text transition hover:border-blue-500! hover:text-blue-500"
            >
              <Icon icon={Trophy} size="sm" tone="warning" />
              Top competitor: {keyword.topCompetitor}
              <Icon icon={ExternalLink} size="xs" tone="faint" />
            </a>
          )}
        </Card>
      </div>
    </Drawer>
  );
};

export default KeywordDrawer;
