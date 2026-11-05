import { baseApi } from "./baseApi";

const NODE = { service: "node" };

// AI credits (gian: /api/v1/ai-credits). IN PROGRESS: gian answers with demo
// data for now; edits on the pages stay in the browser until the write
// endpoints exist.
export const aiCreditsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // AI Credit Management (owners): { overview, tenants, pricing, packages, lowCreditSettings }
    getAdminAiCredits: build.query({
      query: () => "/api/v1/ai-credits/admin",
      transformResponse: (response) => response?.result,
      extraOptions: NODE,
    }),

    // AI Wallet: { wallet, thresholds, dailyUsage, usage, packages, transactions }
    getAiWallet: build.query({
      query: () => "/api/v1/ai-credits/wallet",
      transformResponse: (response) => response?.result,
      extraOptions: NODE,
    }),
  }),
});

export const { useGetAdminAiCreditsQuery, useGetAiWalletQuery } = aiCreditsApi;
