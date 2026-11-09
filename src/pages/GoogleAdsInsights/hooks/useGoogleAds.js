import { useEffect, useMemo, useRef, useState } from "react";
import { useIntegrationStatus } from "../../../hooks/useIntegrationStatus";
import { useApiAction } from "../../../hooks/useApiAction";
import {
  useGetAdsAccountsQuery,
  useGetAdsAdGroupsQuery,
  useGetAdsAdsQuery,
  useGetAdsBreakdownQuery,
  useGetAdsCampaignsQuery,
  useGetAdsDevicesQuery,
  useGetAdsSummaryQuery,
  useSyncGoogleAdsMutation,
} from "../../../redux/api/googleAdsApi";
import { presetRange } from "../../../utils/datePresets";
import {
  ALL,
  hasMetrics,
  previousRange,
  resolveBreakdown,
  resolveTarget,
  syncRange,
} from "../googleAdsUtils";

const NO_METRICS = {
  impressions: 0,
  clicks: 0,
  cost: 0,
  conversions: 0,
  conversionsValue: 0,
  ctr: 0,
  averageCpc: 0,
  costPerConversion: 0,
  roas: 0,
};

// the name and id of each kind of item, as gian returns them
const ENTITY = {
  campaign: (c) => ({ id: c.campaignId, name: c.name || c.campaignId }),
  adgroup: (g) => ({ id: g.adGroupId, name: g.name || g.adGroupId }),
  ad: (a) => ({
    id: a.adId,
    name:
      (a.headlines || []).map((h) => h?.text || h).filter(Boolean)[0] ||
      a.finalUrls?.[0] ||
      a.adId,
    url: a.finalUrls?.[0],
  }),
};

// Every item of the level (also the ones with no activity), with its numbers
// for the date range; most spend first.
const tableRows = (level, items, metrics) => {
  const byId = new Map((metrics || []).map((m) => [String(m.id), m]));
  const rows = (items || []).map((item) => {
    const { id, name, url } = ENTITY[level](item);
    return {
      id: String(id),
      name,
      url,
      paused: Boolean(item.paused),
      ...NO_METRICS,
      ...byId.get(String(id)),
    };
  });
  return rows.sort(
    (a, b) => b.cost - a.cost || b.clicks - a.clicks || b.impressions - a.impressions,
  );
};

// Data and actions of the Google Ads page. Everything is read from our
// database; only "Sync" goes to Google (and pulls the last 90 days).
export const useGoogleAds = () => {
  const {
    integrationStatus,
    checkIntegrationStatus,
    isLoadingIntegrationStatus,
  } = useIntegrationStatus();
  const connected = Boolean(integrationStatus?.googleAdsInsight?.status);
  const lastSync = integrationStatus?.googleAdsInsight?.lastSyncTime || null;
  const run = useApiAction();

  const [range, setRange] = useState(() => presetRange("last30"));
  const [selection, setSelection] = useState({
    account: "",
    campaign: ALL,
    adGroup: ALL,
    ad: ALL,
  });
  const { account, campaign, adGroup } = selection;
  // accounts already auto-synced once because they had no data
  const autoSynced = useRef(new Set());

  useEffect(() => {
    checkIntegrationStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const accounts = useGetAdsAccountsQuery(undefined, { skip: !connected });
  const campaigns = useGetAdsCampaignsQuery(account, { skip: !account });
  const adGroups = useGetAdsAdGroupsQuery(campaign, { skip: campaign === ALL });
  const ads = useGetAdsAdsQuery(adGroup, { skip: adGroup === ALL });

  // pick the first account once they are loaded
  useEffect(() => {
    const first = accounts.data?.[0];
    if (!account && first) {
      setSelection((s) => ({
        ...s,
        account: first.clientCustomerId || first.googleAccountId,
      }));
    }
  }, [accounts.data, account]);

  const target = useMemo(() => resolveTarget(selection), [selection]);
  const skipMetrics = { skip: !account || !target.entityId };
  const summary = useGetAdsSummaryQuery({ ...target, range }, skipMetrics);
  const previous = useGetAdsSummaryQuery(
    { ...target, range: previousRange(range) },
    skipMetrics,
  );
  const devices = useGetAdsDevicesQuery({ ...target, range }, skipMetrics);

  // the table: the children of what is selected
  const breakdownTarget = useMemo(() => resolveBreakdown(selection), [selection]);
  const breakdown = useGetAdsBreakdownQuery(
    { ...breakdownTarget, range },
    { skip: !account || !breakdownTarget.parentId },
  );
  const items = {
    campaign: campaigns,
    adgroup: adGroups,
    ad: ads,
  }[breakdownTarget.level];
  const rows = useMemo(
    () => tableRows(breakdownTarget.level, items.data, breakdown.data?.rows),
    [breakdownTarget.level, items.data, breakdown.data],
  );

  const [syncGoogleAds, { isLoading: syncing }] = useSyncGoogleAdsMutation();

  const sync = async () => {
    const done = await run(
      syncGoogleAds({
        accountId: account || undefined,
        campaignId: campaign !== ALL ? campaign : undefined,
        range: syncRange(),
      }),
      {
        success: "Google Ads data is up to date",
        error: "Couldn't reach Google Ads right now. Please try again.",
      },
    );
    if (done) {
      if (account) autoSynced.current.add(account);
      checkIntegrationStatus();
    }
  };

  // An account with nothing in our database yet is synced once by itself.
  const accountLevel = target.level === "account";
  useEffect(() => {
    if (
      account &&
      accountLevel &&
      summary.isSuccess &&
      !summary.isFetching &&
      !hasMetrics(summary.data?.totals) &&
      !autoSynced.current.has(account)
    ) {
      autoSynced.current.add(account);
      sync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    account,
    accountLevel,
    summary.isSuccess,
    summary.isFetching,
    summary.data,
  ]);

  // picking a level clears the levels under it
  const select = {
    account: (value) =>
      setSelection({ account: value, campaign: ALL, adGroup: ALL, ad: ALL }),
    campaign: (value) =>
      setSelection((s) => ({ ...s, campaign: value, adGroup: ALL, ad: ALL })),
    adGroup: (value) =>
      setSelection((s) => ({ ...s, adGroup: value, ad: ALL })),
    ad: (value) => setSelection((s) => ({ ...s, ad: value })),
  };

  // a row of the table opens that item
  const drillInto = (row) => {
    if (breakdownTarget.level === "campaign") select.campaign(row.id);
    else if (breakdownTarget.level === "adgroup") select.adGroup(row.id);
    else select.ad(row.id);
  };

  return {
    connected,
    // only the first check: a re-check after a sync must not blank the page
    checkingConnection: isLoadingIntegrationStatus && !connected,
    lastSync,
    range,
    setRange,
    selection,
    select,
    target,
    accounts,
    campaigns,
    adGroups,
    ads,
    summary,
    previous,
    devices,
    breakdown: {
      level: breakdownTarget.level,
      rows,
      loading: breakdown.isLoading || items.isLoading,
      fetching: breakdown.isFetching,
      error: breakdown.isError,
      refetch: breakdown.refetch,
      // false: nothing of this level was ever synced for this parent (ad group and ad
      // numbers come only from syncs after the 2026-11 change)
      levelSynced: breakdown.data?.levelSynced !== false,
    },
    drillInto,
    sync,
    syncing,
  };
};
