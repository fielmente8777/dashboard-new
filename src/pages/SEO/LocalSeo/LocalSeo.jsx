import { AlertTriangle, Clock, Hash, MapPin, Plus, Target, TrendingUp, Trophy } from "lucide-react";
import { useState } from "react";
import CreditsButton from "../../../components/Seo/CreditsButton";
import SeoOverview from "../../../components/Seo/SeoOverview";
import SeoShell, { MetaItem } from "../../../components/Seo/SeoShell";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Icon from "../../../components/ui/Icon";
import { ErrorState, Skeleton } from "../../../components/ui/States";
import AddKeywordsDialog from "../../../components/Seo/AddKeywordsDialog";
import CoverageCard from "./components/CoverageCard";
import InsightsCard from "./components/InsightsCard";
import KeywordDrawer from "./components/KeywordDrawer";
import KeywordTable from "./components/KeywordTable";
import RankTrendChart from "./components/RankTrendChart";
import ScanProgressToast from "./components/ScanProgressToast";
import SetupWizard from "./components/setup/SetupWizard";
import { useLocalSeo } from "./hooks/useLocalSeo";
import { useScanProgress } from "./hooks/useScanProgress";
import {
  RANK_BANDS,
  UNRANKED,
  countByBand,
  fmt,
  fmtRank,
  formatDate,
  rankBand,
} from "./localSeoUtils";

const BANDS = [...RANK_BANDS, UNRANKED];

const LoadingLayout = () => (
  <>
    <Skeleton className="h-72 rounded-2xl" />
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Skeleton className="h-120 lg:col-span-2" />
      <Skeleton className="h-120" />
    </div>
    <Skeleton className="h-64" />
  </>
);

// Where the property ranks on Google Maps around it, keyword by keyword.
const LocalSeo = () => {
  const seo = useLocalSeo();
  const { data, keywords, stats, insights, tokens, scan, busy, actions } = seo;
  const progress = useScanProgress(seo.refetch);

  const [adding, setAdding] = useState(false);
  const [openKeyword, setOpenKeyword] = useState(null);

  if (data?.localConfig?.onboardingComplete === false) {
    return <SetupWizard onComplete={seo.refetch} />;
  }

  const config = data?.localConfig;
  const place = [config?.district, config?.city].filter(Boolean).join(", ");
  const selectedKeyword = keywords.find((k) => k.keyword === openKeyword);
  const lastScanned = data?.gridMeta?.lastScanned;

  const meta = config?.businessName ? (
    <>
      <MetaItem icon={MapPin}>
        <span className="truncate">
          <span className="font-medium text-app-text">{config.businessName}</span>
          {place && ` · ${place}`}
        </span>
      </MetaItem>
      {lastScanned && (
        <MetaItem icon={Clock}>
          Map scanned {formatDate(lastScanned, { day: "numeric", month: "short", year: "numeric" })}
        </MetaItem>
      )}
    </>
  ) : (
    "Where your property ranks on Google Maps around you."
  );

  const kpis = [
    {
      icon: Hash,
      tone: "blue",
      label: "Keywords tracked",
      value: fmt(keywords.length),
      hint: `${fmt(stats.ranked)} ranked on Maps`,
    },
    {
      icon: Trophy,
      tone: "green",
      label: "In Map 3-pack",
      value: fmt(stats.inPack),
      meter: stats.visibility,
      hint: `of ${fmt(keywords.length)} keywords`,
    },
    {
      icon: TrendingUp,
      tone: "violet",
      label: "Avg Maps rank",
      value: fmtRank(stats.avgMaps),
      hint: "Lower is better",
    },
    {
      icon: Target,
      tone: "amber",
      label: "Opportunities",
      value: data?.summary ? fmt(data.summary.opportunities) : "—",
      hint: "Keywords worth targeting",
    },
  ];

  return (
    <SeoShell
      title="Local SEO"
      meta={meta}
      actions={
        <>
          <CreditsButton />
          <Button icon={Plus} onClick={() => setAdding(true)} disabled={!data}>
            Add keywords
          </Button>
        </>
      }
    >
      {seo.isLoading ? (
        <LoadingLayout />
      ) : seo.isError && !data ? (
        <ErrorState message="Couldn't load your Local SEO data." onRetry={seo.refetch} />
      ) : (
        <>
          {data.staleKeywords > 0 && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30! bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
              <Icon icon={AlertTriangle} className="mt-0.5 text-amber-600 dark:text-amber-400" />
              <p>
                {data.staleKeywords} keyword{data.staleKeywords === 1 ? " has" : "s have"}{" "}
                older rankings. Open a keyword and refresh it to get today's rank.
              </p>
            </div>
          )}

          <SeoOverview
            score={stats.visibility}
            scoreTitle={`${config?.district ? `${config.district} ` : "Map "}visibility`}
            scoreText={
              <>
                <span className="font-semibold text-app-text">{stats.inPack}</span> of{" "}
                <span className="font-semibold text-app-text">{keywords.length}</span>{" "}
                tracked keywords show in the Google Map 3-pack.
              </>
            }
            kpis={kpis}
            bands={countByBand(keywords, BANDS, (k) => rankBand(k.liveGmbRank))}
            bandsTitle="Maps rank distribution"
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="flex lg:col-span-2 [&>*]:flex-1">
              <CoverageCard
                data={data}
                keywords={keywords}
                scan={scan}
                scanCost={tokens.pricing.geoGridScan}
                busy={busy}
                onRadiusChange={actions.changeRadius}
                onKeywordChange={actions.changeGridKeyword}
              />
            </div>
            <InsightsCard insights={insights} />
          </div>

          <Card title="Average Maps rank over time" description="Last 30 days · lower is better">
            {data.trend.length > 1 ? (
              <RankTrendChart data={data.trend} dataKey="avgRank" label="Avg rank" id="local-seo-trend-fill" />
            ) : (
              <p className="py-12 text-center text-sm text-app-text-muted">
                The trend appears once a few daily rank checks have run.
              </p>
            )}
          </Card>

          <KeywordTable
            keywords={keywords}
            city={config?.city}
            refreshCost={tokens.pricing.localPerKeyword}
            refreshingKeyword={busy.refreshingKeyword}
            onAdd={() => setAdding(true)}
            onOpen={(row) => setOpenKeyword(row.keyword)}
            onRefresh={actions.refresh}
            onUntrack={actions.untrack}
          />
        </>
      )}

      <AddKeywordsDialog
        open={adding}
        onClose={() => setAdding(false)}
        onAdd={actions.addKeywords}
        saving={busy.tracking}
        description={`Search volume and Maps rank are checked for ${place || "your area"}.`}
        placeholder={`hotel in ${config?.district || "your area"}
best hotel ${config?.city || "in your city"}
budget hotel near me`}
        balance={tokens.balance}
        costPerKeyword={tokens.pricing.localPerKeyword}
      />

      <KeywordDrawer
        keyword={selectedKeyword}
        onClose={() => setOpenKeyword(null)}
        refreshing={busy.refreshingKeyword === openKeyword}
        refreshCost={tokens.pricing.localPerKeyword}
        onRefresh={actions.refresh}
        onUntrack={async (keyword) => {
          if (await actions.untrack(keyword)) setOpenKeyword(null);
        }}
      />

      {progress.progress && (
        <ScanProgressToast progress={progress.progress} onDismiss={progress.dismiss} />
      )}
    </SeoShell>
  );
};

export default LocalSeo;
