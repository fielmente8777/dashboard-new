import { AlertTriangle, Hash, MapPin, Plus, Target, TrendingUp } from "lucide-react";
import { useState } from "react";
import CreditsButton from "../../../components/Seo/CreditsButton";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Icon from "../../../components/ui/Icon";
import PageShell from "../../../components/ui/PageShell";
import StatCard from "../../../components/ui/StatCard";
import { ErrorState, Skeleton } from "../../../components/ui/States";
import AddKeywordsDialog from "../../../components/Seo/AddKeywordsDialog";
import CoverageCard from "./components/CoverageCard";
import InsightsCard from "./components/InsightsCard";
import KeywordDrawer from "./components/KeywordDrawer";
import KeywordTable from "./components/KeywordTable";
import RankTrendChart from "./components/RankTrendChart";
import ScanProgressToast from "./components/ScanProgressToast";
import SetupWizard from "./components/setup/SetupWizard";
import VisibilityCard from "./components/VisibilityCard";
import { useLocalSeo } from "./hooks/useLocalSeo";
import { useScanProgress } from "./hooks/useScanProgress";
import { fmt, fmtRank } from "./localSeoUtils";

const LoadingLayout = () => (
  <>
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="h-24" />
      ))}
    </div>
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Skeleton className="h-80" />
      <Skeleton className="h-80 lg:col-span-2" />
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

  return (
    <PageShell
      title="Local SEO"
      description={
        config?.businessName
          ? `${config.businessName}${place ? ` · ${place}` : ""}`
          : "Where your property ranks on Google Maps around you."
      }
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
            <div className="flex items-start gap-2 rounded-xl border border-amber-500/30! bg-amber-500/5 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
              <Icon icon={AlertTriangle} className="mt-0.5" />
              <p>
                {data.staleKeywords} keyword{data.staleKeywords === 1 ? " has" : "s have"}{" "}
                older rankings. Open a keyword and refresh it to get today's rank.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={Hash} label="Keywords tracked" value={fmt(keywords.length)} />
            <StatCard icon={MapPin} label="In Map 3-pack" value={fmt(stats.inPack)} />
            <StatCard icon={TrendingUp} label="Avg Maps rank" value={fmtRank(stats.avgMaps)} />
            <StatCard
              icon={Target}
              label="Opportunities"
              value={data.summary ? fmt(data.summary.opportunities) : "—"}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="flex flex-col gap-4">
              <VisibilityCard keywords={keywords} stats={stats} area={config?.district} />
              <InsightsCard insights={insights} className="flex-1" />
            </div>
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
          </div>

          <Card title="Average rank over time" description="Last 30 days · lower is better">
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
    </PageShell>
  );
};

export default LocalSeo;
