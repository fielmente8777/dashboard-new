import { useEffect, useMemo, useState } from "react";
import { useConfirm } from "../../../../context/ConfirmContext";
import { useApiAction } from "../../../../hooks/useApiAction";
import {
  useGetLocalSeoQuery,
  useGetSeoTokensQuery,
  useRefreshKeywordMutation,
  useTrackKeywordsMutation,
  useTriggerGridScanMutation,
  useUntrackKeywordMutation,
  useUpdateGridKeywordMutation,
  useUpdateRadiusMutation,
} from "../../../../redux/api/seoApi";
import { DEFAULT_SEO_PRICING } from "../../../../utils/seoTokenPricing";
import { buildInsights, seoErrorMessage, summarizeKeywords } from "../localSeoUtils";

const POLL_MS = 5000;

// Data and actions of the Local SEO dashboard.
export const useLocalSeo = () => {
  const run = useApiAction();
  const { confirm } = useConfirm();

  // a scan this page started: "pending" counts as running only then, since
  // an old "pending" can sit in the data without anything happening
  const [watchingScan, setWatchingScan] = useState(false);
  const [refreshingKeyword, setRefreshingKeyword] = useState(null);

  const [scanStatus, setScanStatus] = useState(null);
  const isScanning =
    scanStatus === "scanning" || (scanStatus === "pending" && watchingScan);

  const query = useGetLocalSeoQuery(undefined, {
    pollingInterval: isScanning ? POLL_MS : 0,
  });
  const { data: tokens } = useGetSeoTokensQuery();

  const status = query.data?.gridMeta?.status ?? null;
  useEffect(() => {
    setScanStatus(status);
    if (status === "scanning") setWatchingScan(true);
    if (status === "done" || status === "failed") setWatchingScan(false);
  }, [status]);

  const [trackKeywords, { isLoading: tracking }] = useTrackKeywordsMutation();
  const [refreshKeyword] = useRefreshKeywordMutation();
  const [untrackKeyword] = useUntrackKeywordMutation();
  const [triggerGridScan, { isLoading: startingScan }] =
    useTriggerGridScanMutation();
  const [updateRadius, { isLoading: savingRadius }] = useUpdateRadiusMutation();
  const [updateGridKeyword, { isLoading: savingGridKeyword }] =
    useUpdateGridKeywordMutation();

  const data = query.data;
  const keywords = useMemo(() => data?.keywords || [], [data]);
  const stats = useMemo(() => summarizeKeywords(keywords), [keywords]);
  const insights = useMemo(() => buildInsights(keywords), [keywords]);

  const options = (success, error) => ({ success, error, formatError: seoErrorMessage });

  const addKeywords = async (list) => {
    const saved = await run(
      trackKeywords({
        keywords: list,
        selfDomain: data?.localConfig?.selfDomain || "",
        selfHotelName: data?.localConfig?.businessName || "",
      }),
      options(
        `Tracking ${list.length} keyword${list.length === 1 ? "" : "s"}`,
        "Couldn't add the keywords. Please try again.",
      ),
    );
    return Boolean(saved);
  };

  const refresh = async (keyword) => {
    setRefreshingKeyword(keyword);
    await run(
      refreshKeyword(keyword),
      options(`Rank updated for "${keyword}"`, "Couldn't refresh this keyword."),
    );
    setRefreshingKeyword(null);
  };

  const untrack = async (keyword) => {
    const confirmed = await confirm(
      `"${keyword}" and its rank history will be removed from this dashboard.`,
      { title: "Stop tracking keyword", confirmText: "Stop tracking" },
    );
    if (!confirmed) return false;
    return Boolean(await run(untrackKeyword(keyword), options("Keyword removed")));
  };

  const startScan = async () => {
    setWatchingScan(true);
    setScanStatus("pending");
    const started = await run(
      triggerGridScan(),
      options("Scan started. This takes a few minutes.", "Couldn't start the scan."),
    );
    if (!started) {
      setWatchingScan(false);
      setScanStatus("failed");
    }
  };

  const changeRadius = (radiusKm) =>
    run(updateRadius(radiusKm), options(`Radius set to ${radiusKm} km`));

  const changeGridKeyword = (keyword) =>
    keyword &&
    run(updateGridKeyword(keyword), options("Map keyword updated"));

  return {
    ...query,
    keywords,
    stats,
    insights,
    tokens: {
      balance: tokens?.balance ?? null,
      pricing: tokens?.pricing || DEFAULT_SEO_PRICING,
    },
    scan: {
      status: scanStatus,
      isScanning,
      starting: startingScan,
      start: startScan,
    },
    busy: {
      tracking,
      savingRadius,
      savingGridKeyword,
      refreshingKeyword,
    },
    actions: {
      addKeywords,
      refresh,
      untrack,
      changeRadius,
      changeGridKeyword,
    },
  };
};
