import { CloudDownload, Loader2, Plug, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import DateRangePicker from "../../components/ui/DateRangePicker";
import Icon from "../../components/ui/Icon";
import PageShell from "../../components/ui/PageShell";
import { EmptyState, ErrorState, Skeleton } from "../../components/ui/States";
import { PAGES, dashboardPath } from "../../routes/paths";
import AdPreviews from "./components/AdPreviews";
import AdsFilters from "./components/AdsFilters";
import BreakdownCards from "./components/BreakdownCards";
import CampaignTable from "./components/CampaignTable";
import KpiGrid from "./components/KpiGrid";
import TrendCharts from "./components/TrendCharts";
import { ALL, hasMetrics } from "./googleAdsUtils";
import { useGoogleAds } from "./hooks/useGoogleAds";

const LoadingLayout = () => (
  <>
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: 10 }, (_, i) => (
        <Skeleton key={i} className="h-24" />
      ))}
    </div>
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <Skeleton className="h-80" />
      <Skeleton className="h-80" />
    </div>
  </>
);

const NotConnected = () => {
  const navigate = useNavigate();
  return (
    <Card>
      <EmptyState
        icon={Plug}
        title="Connect Google Ads"
        description="Link your Google Ads account to see clicks, spend and conversions here."
        action={
          <Button
            icon={Plug}
            onClick={() => navigate(dashboardPath(PAGES.INTEGRATION))}
          >
            Go to Integrations
          </Button>
        }
      />
    </Card>
  );
};

// Google Ads performance of the selected account, campaign or ad.
const GoogleAdsInsights = () => {
  const ads = useGoogleAds();
  const { selection, summary, campaigns } = ads;

  if (ads.checkingConnection) {
    return (
      <PageShell title="Google Ads Insights">
        <LoadingLayout />
      </PageShell>
    );
  }

  if (!ads.connected) {
    return (
      <PageShell
        title="Google Ads Insights"
        description="Clicks, spend and conversions from your Google Ads."
      >
        <NotConnected />
      </PageShell>
    );
  }

  const campaignName = campaigns.data?.find(
    (c) => c.campaignId === selection.campaign,
  )?.name;
  const scope =
    selection.ad !== ALL
      ? "A single ad"
      : selection.campaign !== ALL
        ? `Campaign: ${campaignName || "selected campaign"}`
        : "All campaigns (account total)";

  const syncButton = (label = "Sync now") => (
    <Button icon={RefreshCw} loading={ads.syncing} onClick={ads.sync}>
      {ads.syncing ? "Syncing…" : label}
    </Button>
  );

  const noAccounts = ads.accounts.isSuccess && !ads.accounts.data?.length;
  const { totals, derived = {}, series = [] } = summary.data || {};
  const loadingMetrics =
    summary.isLoading || (summary.isFetching && !hasMetrics(totals));

  const body = () => {
    if (ads.accounts.isError) {
      return (
        <ErrorState
          message="Couldn't load your Google Ads accounts."
          onRetry={ads.accounts.refetch}
        />
      );
    }
    if (noAccounts) {
      return (
        <Card>
          <EmptyState
            icon={CloudDownload}
            title="No Google Ads accounts yet"
            description="Sync once to pull your accounts and their last 90 days from Google Ads."
            action={syncButton("Sync accounts")}
          />
        </Card>
      );
    }
    if (ads.accounts.isLoading || !selection.account || loadingMetrics)
      return <LoadingLayout />;
    if (summary.isError) {
      return (
        <ErrorState
          message="Couldn't load the performance data."
          onRetry={summary.refetch}
        />
      );
    }
    if (!hasMetrics(totals)) {
      return (
        <Card>
          <EmptyState
            icon={CloudDownload}
            title="No data for these dates"
            description="Nothing was recorded for this selection and date range. Sync to check Google Ads for the latest numbers."
            action={syncButton("Check for updates")}
          />
        </Card>
      );
    }

    return (
      <div
        className={`space-y-5 transition-opacity ${summary.isFetching ? "opacity-60" : ""}`}
      >
        <KpiGrid
          totals={totals}
          derived={derived}
          previousTotals={ads.previousTotals}
        />
        <TrendCharts
          series={series}
          roas={derived.roas}
          showRoas={totals.cost > 0 && totals.conversionsValue > 0}
        />
        <BreakdownCards
          totals={totals}
          derived={derived}
          devices={ads.devices.data || []}
          adLevel={selection.ad !== ALL}
        />
        <CampaignTable
          query={ads.comparison}
          selected={selection.campaign}
          onSelect={ads.select.campaign}
        />
        <AdPreviews
          ads={ads.ads.data || []}
          adGroupPicked={selection.adGroup !== ALL}
        />
      </div>
    );
  };

  return (
    <PageShell
      title="Google Ads Insights"
      description={scope}
      actions={
        <>
          <DateRangePicker value={ads.range} onChange={ads.setRange} />
          {!noAccounts && syncButton()}
        </>
      }
    >
      {ads.syncing && (
        <div className="anim-enter flex items-center gap-2 rounded-xl border border-blue-500/30! bg-blue-500/5 px-4 py-3 text-sm text-blue-700 dark:text-blue-300">
          <Icon icon={Loader2} className="animate-spin" />
          Pulling the last 90 days from Google Ads. This can take a few seconds;
          you can keep using the page.
        </div>
      )}

      {!noAccounts && (
        <Card>
          <AdsFilters
            selection={selection}
            select={ads.select}
            accounts={ads.accounts}
            campaigns={ads.campaigns}
            adGroups={ads.adGroups}
            ads={ads.ads}
          />
        </Card>
      )}

      {body()}
    </PageShell>
  );
};

export default GoogleAdsInsights;
