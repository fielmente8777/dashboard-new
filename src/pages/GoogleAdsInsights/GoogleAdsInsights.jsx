import { ChevronRight, CloudDownload, Info, Loader2, Plug, RefreshCw } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import DateRangePicker from "../../components/ui/DateRangePicker";
import Icon from "../../components/ui/Icon";
import PageShell from "../../components/ui/PageShell";
import { EmptyState, ErrorState, Skeleton } from "../../components/ui/States";
import { integrationPath } from "../../routes/paths";
import AdPreviews from "./components/AdPreviews";
import AdsFilters from "./components/AdsFilters";
import BreakdownCards from "./components/BreakdownCards";
import BreakdownTable from "./components/BreakdownTable";
import KpiGrid from "./components/KpiGrid";
import PerformanceChart from "./components/PerformanceChart";
import { ALL, formatDate, hasMetrics, timeAgo } from "./googleAdsUtils";
import { useGoogleAds } from "./hooks/useGoogleAds";

const TITLE = "Google Ads";
const DESCRIPTION = "Spend, clicks and conversions from your Google Ads campaigns.";

const MetricsSkeleton = () => (
  <>
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="h-28" />
      ))}
    </div>
    <Skeleton className="h-16" />
    <Skeleton className="h-80" />
  </>
);

const NotConnected = () => {
  const navigate = useNavigate();
  return (
    <Card>
      <EmptyState
        icon={Plug}
        title="Connect Google Ads"
        description="Link your Google Ads account to see spend, clicks and conversions here."
        action={
          <Button icon={Plug} onClick={() => navigate(integrationPath("google-ads"))}>
            Go to Integrations
          </Button>
        }
      />
    </Card>
  );
};

// Where the page is: account › campaign › ad group › ad. Each step goes back up.
const ScopeBar = ({ steps }) => (
  <nav aria-label="Selection" className="flex min-w-0 flex-wrap items-center gap-1 text-sm">
    <span className="mr-1 text-app-text-muted">Showing</span>
    {steps.map((step, i) => {
      const last = i === steps.length - 1;
      return (
        <span key={step.key} className="flex min-w-0 items-center gap-1">
          {i > 0 && <Icon icon={ChevronRight} size="sm" tone="faint" />}
          {last ? (
            <span className="max-w-64 truncate font-semibold text-app-text" title={step.label}>
              {step.label}
            </span>
          ) : (
            <button
              type="button"
              onClick={step.onClick}
              title={step.label}
              className="max-w-48 truncate text-blue-600 hover:underline dark:text-blue-400"
            >
              {step.label}
            </button>
          )}
          {step.paused && <Badge tone="amber">Paused</Badge>}
        </span>
      );
    })}
  </nav>
);

// In place of the charts when the selection has no clicks, impressions or
// spend in the range: says why, and what to do. The table stays below.
const NoActivity = ({ range, paused, noun, lastActivity, lastSync, onSync, syncing }) => (
  <Card>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-app-surface-secondary">
          <Icon icon={Info} tone="muted" />
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-app-text">
            No activity from {formatDate(range.start)} to {formatDate(range.end)}
          </p>
          <p className="mt-0.5 text-sm text-app-text-muted">
            {paused
              ? `This ${noun} is paused in Google Ads, so it had no impressions or spend.`
              : `This ${noun} had no impressions, clicks or spend in these dates.`}{" "}
            {lastActivity
              ? `Its last activity was on ${formatDate(lastActivity)}: pick a range that includes it.`
              : `No activity has been synced for this ${noun} yet${noun === "account" || noun === "campaign" ? "" : " (ad group and ad numbers come from a fresh sync)"}.`}
            {lastSync && ` Last synced ${timeAgo(lastSync)}.`}
          </p>
        </div>
      </div>
      <Button variant="secondary" icon={RefreshCw} loading={syncing} onClick={onSync} className="shrink-0">
        Check Google Ads
      </Button>
    </div>
  </Card>
);

const GoogleAdsInsights = () => {
  const ads = useGoogleAds();
  const { selection, select, summary, campaigns, adGroups, target } = ads;

  // names and paused state of what is selected, for the breadcrumb
  const steps = useMemo(() => {
    const account = ads.accounts.data?.find(
      (a) => (a.clientCustomerId || a.googleAccountId) === selection.account,
    );
    const campaign = campaigns.data?.find((c) => c.campaignId === selection.campaign);
    const adGroup = adGroups.data?.find((g) => g.adGroupId === selection.adGroup);
    const ad = ads.ads.data?.find((a) => a.adId === selection.ad);
    const list = [
      {
        key: "account",
        label: account?.accountName || "All campaigns",
        onClick: () => select.account(selection.account),
      },
    ];
    if (selection.campaign !== ALL)
      list.push({
        key: "campaign",
        label: campaign?.name || "Campaign",
        paused: campaign?.paused,
        onClick: () => select.campaign(selection.campaign),
      });
    if (selection.adGroup !== ALL)
      list.push({
        key: "adGroup",
        label: adGroup?.name || "Ad group",
        paused: adGroup?.paused,
        onClick: () => select.adGroup(selection.adGroup),
      });
    if (selection.ad !== ALL)
      list.push({
        key: "ad",
        label: ad?.finalUrls?.[0] || "Ad",
        paused: ad?.paused,
      });
    return list;
  }, [selection, select, ads.accounts.data, campaigns.data, adGroups.data, ads.ads.data]);

  const adStats = useMemo(
    () =>
      new Map(
        ads.breakdown.level === "ad"
          ? ads.breakdown.rows.map((r) => [r.id, r])
          : [],
      ),
    [ads.breakdown.level, ads.breakdown.rows],
  );

  if (ads.checkingConnection) {
    return (
      <PageShell title={TITLE} description={DESCRIPTION}>
        <MetricsSkeleton />
      </PageShell>
    );
  }

  // gian answers 404 on /accounts when no Google login is connected, even if
  // the integration flag still says connected: show how to connect, not an error
  if (!ads.connected || ads.accounts.error?.status === 404) {
    return (
      <PageShell title={TITLE} description={DESCRIPTION}>
        <NotConnected />
      </PageShell>
    );
  }

  const syncButton = (label = "Sync now") => (
    <Button icon={RefreshCw} loading={ads.syncing} onClick={ads.sync}>
      {ads.syncing ? "Syncing…" : label}
    </Button>
  );

  const noAccounts = ads.accounts.isSuccess && !ads.accounts.data?.length;
  const { totals, derived = {}, series = [] } = summary.data || {};
  const loadingMetrics = summary.isLoading || (summary.isFetching && !hasMetrics(totals));
  const selectedStep = steps.at(-1);
  const noun = { account: "account", campaign: "campaign", adgroup: "ad group", ad: "ad" }[
    target.level
  ];

  const metrics = () => {
    if (ads.accounts.isLoading || !selection.account || loadingMetrics) return <MetricsSkeleton />;
    if (summary.isError) {
      return (
        <ErrorState message="Couldn't load the performance data." onRetry={summary.refetch} />
      );
    }
    if (!hasMetrics(totals)) {
      return (
        <NoActivity
          range={ads.range}
          paused={selectedStep?.paused}
          noun={noun}
          lastActivity={summary.data?.lastActivity}
          lastSync={ads.lastSync}
          onSync={ads.sync}
          syncing={ads.syncing}
        />
      );
    }
    return (
      <div className={`space-y-4 transition-opacity ${summary.isFetching ? "opacity-60" : ""}`}>
        <KpiGrid totals={totals} derived={derived} previous={ads.previous.data} />
        <PerformanceChart
          series={series}
          previousSeries={ads.previous.data?.series || []}
          range={ads.range}
        />
        <BreakdownCards totals={totals} derived={derived} devices={ads.devices.data || []} />
      </div>
    );
  };

  const syncedLine = ads.lastSync
    ? `Synced ${timeAgo(ads.lastSync)} · each sync pulls the last 90 days`
    : "Not synced yet · a sync pulls the last 90 days";

  return (
    <PageShell
      title={TITLE}
      description={DESCRIPTION}
      actions={
        <>
          <DateRangePicker value={ads.range} onChange={ads.setRange} />
          {!noAccounts && syncButton()}
        </>
      }
    >
      {ads.syncing ? (
        <div className="anim-enter flex items-center gap-2 rounded-xl border border-blue-500/30! bg-blue-500/5 px-4 py-3 text-sm text-blue-700 dark:text-blue-300">
          <Icon icon={Loader2} className="animate-spin" />
          Pulling the last 90 days from Google Ads. This can take a minute; you can keep using the page.
        </div>
      ) : (
        <p className="-mt-2 text-xs text-app-text-muted">{syncedLine}</p>
      )}

      {ads.accounts.isError && ads.accounts.error?.status !== 404 ? (
        <ErrorState message="Couldn't load your Google Ads accounts." onRetry={ads.accounts.refetch} />
      ) : noAccounts ? (
        <Card>
          <EmptyState
            icon={CloudDownload}
            title="No Google Ads accounts yet"
            description="Sync once to pull your accounts and their last 90 days from Google Ads."
            action={syncButton("Sync accounts")}
          />
        </Card>
      ) : (
        <>
          <Card className="space-y-4">
            <AdsFilters
              selection={selection}
              select={select}
              accounts={ads.accounts}
              campaigns={campaigns}
              adGroups={adGroups}
              ads={ads.ads}
            />
            {selection.account && (
              <div className="border-t border-app-border! pt-3">
                <ScopeBar steps={steps} />
              </div>
            )}
          </Card>

          {metrics()}

          {selection.account && (
            <BreakdownTable
              breakdown={ads.breakdown}
              scopeName={
                ads.breakdown.level === "campaign" ? null : steps.find((s) =>
                  ads.breakdown.level === "adgroup" ? s.key === "campaign" : s.key === "adGroup",
                )?.label
              }
              selectedId={selection.ad !== ALL ? selection.ad : undefined}
              onOpen={ads.drillInto}
              onSync={ads.sync}
              syncing={ads.syncing}
            />
          )}

          {selection.adGroup !== ALL && (
            <AdPreviews
              ads={ads.ads.data || []}
              statsById={adStats}
              selectedAd={selection.ad !== ALL ? selection.ad : null}
              onSelect={select.ad}
            />
          )}
        </>
      )}
    </PageShell>
  );
};

export default GoogleAdsInsights;
