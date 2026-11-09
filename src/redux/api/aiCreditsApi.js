import { baseApi } from "./baseApi";
import { demoAdminAiCredits, demoAiWallet } from "../../components/AiCredits/aiCreditsDemo";

const NODE = { service: "node" };

// AI credits (gian: /api/v1/ai-credits). IN PROGRESS: gian answers with demo
// data for now; edits on the pages stay in the browser until the write
// endpoints exist.
//
// Until that route is deployed, gian answers 404 ("Route doesn't exist").
// Then the same demo data comes from the dashboard itself, so the pages
// still work. Once gian has the real API, its answer is used and the
// fallback never runs; remove it (and aiCreditsDemo.js) at that point.
const withDemoFallback = (url, demo) => async (_arg, _api, _extra, fetchWithBQ) => {
  const result = await fetchWithBQ(url);
  if (result.error?.status === 404) return { data: demo() };
  if (result.error) return { error: result.error };
  return { data: result.data?.result };
};

export const aiCreditsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // AI Credit Management (owners): { overview, tenants, pricing, packages, lowCreditSettings }
    getAdminAiCredits: build.query({
      queryFn: withDemoFallback("/api/v1/ai-credits/admin", demoAdminAiCredits),
      extraOptions: NODE,
    }),

    // AI Wallet: { wallet, thresholds, dailyUsage, usage, packages, transactions }
    getAiWallet: build.query({
      queryFn: withDemoFallback("/api/v1/ai-credits/wallet", demoAiWallet),
      extraOptions: NODE,
    }),
  }),
});

export const { useGetAdminAiCreditsQuery, useGetAiWalletQuery } = aiCreditsApi;
