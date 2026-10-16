import { useContext, useEffect, useMemo, useRef, useState } from "react";
import DataContext from "../../../context/DataContext";
import { useApiAction } from "../../../hooks/useApiAction";
import {
  useGetAdsAccountsQuery,
  useGetAdsAdGroupsQuery,
  useGetAdsAdsQuery,
  useGetAdsCampaignComparisonQuery,
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
  resolveTarget,
  syncRange,
} from "../googleAdsUtils";

// Data and actions of the Google Ads Insights page. Everything is read from
// our database; only "Sync" goes to Google (and pulls the last 90 days).
export const useGoogleAds = () => {
  const {
    integrationStatus,
    checkIntegrationStatus,
    isLoadingIntegrationStatus,
  } = useContext(DataContext);
  const connected = Boolean(integrationStatus?.googleAdsInsight?.status);
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

  const campaignList = useMemo(
    () =>
      (campaigns.data || []).map(({ campaignId, name }) => ({
        campaignId,
        name,
      })),
    [campaigns.data],
  );
  const comparison = useGetAdsCampaignComparisonQuery(
    { campaigns: campaignList, range },
    { skip: !campaignList.length },
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
    if (done && account) autoSynced.current.add(account);
  };

  // An account with nothing in our database yet is synced once by itself.
  const accountLevel = campaign === ALL && selection.ad === ALL;
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

  return {
    connected,
    checkingConnection: isLoadingIntegrationStatus,
    range,
    setRange,
    selection,
    select,
    accounts,
    campaigns,
    adGroups,
    ads,
    summary,
    previousTotals: previous.data?.totals || null,
    devices,
    comparison,
    sync,
    syncing,
  };
};
