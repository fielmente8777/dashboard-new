import { useMemo, useState } from "react";
import { seoErrorMessage } from "../../../../components/Seo/seoUtils";
import { useConfirm } from "../../../../context/ConfirmContext";
import { useApiAction } from "../../../../hooks/useApiAction";
import {
  useGetLocalSeoQuery,
  useGetSeoTokensQuery,
  useRefreshKeywordMutation,
  useSetWebsiteMutation,
  useTrackWebsiteKeywordsMutation,
  useUntrackKeywordMutation,
  useUpdateWebsiteCountryMutation,
} from "../../../../redux/api/seoApi";
import { getWebsiteTokensPerKeyword } from "../../../../utils/seoTokenPricing";
import { isWebsiteKeyword, summarizeRankings } from "../websiteSeoUtils";

// Data and actions of the Website SEO dashboard. It reads the same response
// as Local SEO and keeps the keywords tracked against the website.
export const useWebsiteSeo = () => {
  const run = useApiAction();
  const { confirm } = useConfirm();
  const [refreshingKeyword, setRefreshingKeyword] = useState(null);

  const query = useGetLocalSeoQuery();
  const { data: tokens } = useGetSeoTokensQuery();

  const [setWebsite, { isLoading: lockingWebsite }] = useSetWebsiteMutation();
  const [updateCountry, { isLoading: savingCountry }] = useUpdateWebsiteCountryMutation();
  const [trackKeywords, { isLoading: tracking }] = useTrackWebsiteKeywordsMutation();
  const [refreshKeyword] = useRefreshKeywordMutation();
  const [untrackKeyword] = useUntrackKeywordMutation();

  const config = query.data?.localConfig;
  const website = config?.websiteUrl || null;
  const country = config?.websiteCountry || "IN";

  const keywords = useMemo(
    () => (query.data?.keywords || []).filter(isWebsiteKeyword),
    [query.data],
  );
  const stats = useMemo(() => summarizeRankings(keywords), [keywords]);
  const costPerKeyword = getWebsiteTokensPerKeyword(country);

  const options = (success, error) => ({ success, error, formatError: seoErrorMessage });

  const lockWebsite = async (url) => {
    const confirmed = await confirm(
      `Rankings will be tracked for ${url}. This can't be changed later.`,
      { title: "Lock your website", confirmText: "Lock website", variant: "primary" },
    );
    if (!confirmed) return;
    await run(setWebsite(url), options("Website locked", "Couldn't save the website."));
  };

  const changeCountry = (code) =>
    run(updateCountry(code), options("Country updated", "Couldn't change the country."));

  const addKeywords = async (list) =>
    Boolean(
      await run(
        trackKeywords(list),
        options(
          `Tracking ${list.length} keyword${list.length === 1 ? "" : "s"}`,
          "Couldn't add the keywords. Please try again.",
        ),
      ),
    );

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
      `"${keyword}" will no longer be tracked for your website.`,
      { title: "Stop tracking keyword", confirmText: "Stop tracking" },
    );
    if (confirmed) await run(untrackKeyword(keyword), options("Keyword removed"));
  };

  return {
    ...query,
    website,
    country,
    keywords,
    stats,
    balance: tokens?.balance ?? null,
    costPerKeyword,
    busy: { lockingWebsite, savingCountry, tracking, refreshingKeyword },
    actions: { lockWebsite, changeCountry, addKeywords, refresh, untrack },
  };
};
