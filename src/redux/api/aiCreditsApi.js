import { getSignedInToken } from "../../utils/session";
import { baseApi } from "./baseApi";

const NODE = { service: "node" };
const BASE = "/api/v1/ai-credits";
const result = (response) => response?.result;

// Admin calls go out with the signed-in owner's own token: after switching
// into a client account the default token is the client's, and gian checks
// the admin's email (AI_CREDITS_ADMIN_EMAILS) on the token it receives.
const asAdmin = (args) => {
  const request = typeof args === "string" ? { url: args } : args;
  const token = getSignedInToken();
  return token ? { ...request, headers: { ...request.headers, Authorization: `Bearer ${token}` } } : request;
};

const clean = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "" && v !== "all"));

// AI credit wallet (gian: /api/v1/ai-credits).
export const aiCreditsApi = baseApi
  .enhanceEndpoints({ addTagTypes: ["AiWallet", "AiAdmin"] })
  .injectEndpoints({
    endpoints: (build) => ({
      /* ------------------------------ tenant ------------------------------ */

      // { wallet, thresholds: { low, critical }, packages }
      getAiWallet: build.query({
        query: () => `${BASE}/wallet`,
        transformResponse: result,
        providesTags: ["AiWallet"],
        extraOptions: NODE,
      }),

      // Can this tenant use AI right now? Polled, and refreshed after any
      // recharge / adjustment / blocked request (tag AiWallet), so AI actions
      // turn back on without a reload.
      // { paused, reason: "insufficient_credits" | "wallet_suspended" | null, availableCredits, requiredCredits }
      getAiStatus: build.query({
        query: () => `${BASE}/status`,
        transformResponse: result,
        providesTags: ["AiWallet"],
        extraOptions: NODE,
      }),

      // { items, pagination }; params: { page, limit, type }
      getAiTransactions: build.query({
        query: (params) => ({ url: `${BASE}/transactions`, params: clean(params) }),
        transformResponse: result,
        providesTags: ["AiWallet"],
        extraOptions: NODE,
      }),

      // { summary: { totals, daily, byProvider, byModel, byService }, items, pagination }
      // params: { from, to, service, provider, page, limit }
      getAiUsage: build.query({
        query: (params) => ({ url: `${BASE}/usage`, params: clean(params) }),
        transformResponse: result,
        providesTags: ["AiWallet"],
        extraOptions: NODE,
      }),

      // packageId -> { orderId, amount (paise), currency, keyId, credits, packageName }
      createAiRecharge: build.mutation({
        query: (packageId) => ({ url: `${BASE}/recharge`, method: "POST", body: { packageId } }),
        transformResponse: result,
        extraOptions: NODE,
      }),

      // Razorpay checkout response -> { credited, pending, alreadyProcessed, credits }
      verifyAiRecharge: build.mutation({
        query: (body) => ({ url: `${BASE}/recharge/verify`, method: "POST", body }),
        transformResponse: result,
        invalidatesTags: ["AiWallet"],
        extraOptions: NODE,
      }),

      /* ------------------------------ admin ------------------------------ */

      // { overview, tenants: { items, pagination }, settings }
      getAdminAiOverview: build.query({
        query: (params) => asAdmin({ url: `${BASE}/admin/overview`, params: clean(params) }),
        transformResponse: result,
        providesTags: ["AiAdmin"],
        extraOptions: NODE,
      }),

      getAdminAiTenant: build.query({
        query: (tenantId) => asAdmin(`${BASE}/admin/tenants/${encodeURIComponent(tenantId)}`),
        transformResponse: result,
        providesTags: ["AiAdmin"],
        extraOptions: NODE,
      }),

      getAdminAiTenantTransactions: build.query({
        query: ({ tenantId, ...params }) =>
          asAdmin({ url: `${BASE}/admin/tenants/${encodeURIComponent(tenantId)}/transactions`, params: clean(params) }),
        transformResponse: result,
        providesTags: ["AiAdmin"],
        extraOptions: NODE,
      }),

      getAdminAiTenantUsage: build.query({
        query: ({ tenantId, ...params }) =>
          asAdmin({ url: `${BASE}/admin/tenants/${encodeURIComponent(tenantId)}/usage`, params: clean(params) }),
        transformResponse: result,
        providesTags: ["AiAdmin"],
        extraOptions: NODE,
      }),

      // { tenantId, direction: "add" | "deduct", amount, reason, idempotencyKey }
      adjustAiCredits: build.mutation({
        query: (body) => asAdmin({ url: `${BASE}/admin/adjust`, method: "POST", body }),
        transformResponse: result,
        invalidatesTags: ["AiAdmin", "AiWallet"],
        extraOptions: NODE,
      }),

      setAiWalletStatus: build.mutation({
        query: ({ tenantId, ...body }) =>
          asAdmin({ url: `${BASE}/admin/tenants/${encodeURIComponent(tenantId)}/status`, method: "PATCH", body }),
        transformResponse: result,
        invalidatesTags: ["AiAdmin", "AiWallet"],
        extraOptions: NODE,
      }),

      getAdminAiPricing: build.query({
        query: () => asAdmin(`${BASE}/admin/pricing`),
        transformResponse: result,
        providesTags: ["AiAdmin"],
        extraOptions: NODE,
      }),

      saveAiPricing: build.mutation({
        query: ({ id, ...body }) =>
          asAdmin({ url: `${BASE}/admin/pricing${id ? `/${id}` : ""}`, method: id ? "PATCH" : "POST", body }),
        transformResponse: result,
        invalidatesTags: ["AiAdmin"],
        extraOptions: NODE,
      }),

      getAdminAiPackages: build.query({
        query: () => asAdmin(`${BASE}/admin/packages`),
        transformResponse: result,
        providesTags: ["AiAdmin"],
        extraOptions: NODE,
      }),

      saveAiPackage: build.mutation({
        query: ({ id, ...body }) =>
          asAdmin({ url: `${BASE}/admin/packages${id ? `/${id}` : ""}`, method: id ? "PATCH" : "POST", body }),
        transformResponse: result,
        invalidatesTags: ["AiAdmin", "AiWallet"],
        extraOptions: NODE,
      }),

      updateAiCreditSettings: build.mutation({
        query: (body) => asAdmin({ url: `${BASE}/admin/settings`, method: "PUT", body }),
        transformResponse: result,
        invalidatesTags: ["AiAdmin", "AiWallet"],
        extraOptions: NODE,
      }),

      /* ------------------------- admin: API usage analytics ------------------------- */

      // { range, trackingSince, totals, byProvider, byModel, byService, daily }; params: { from, to }
      getAdminAiAnalytics: build.query({
        query: (params) => asAdmin({ url: `${BASE}/admin/analytics`, params: clean(params) }),
        transformResponse: result,
        providesTags: ["AiAdmin"],
        extraOptions: NODE,
      }),

      // { items, pagination }; params: { from, to, provider, sort, order, page, limit }
      getAdminAiAnalyticsModels: build.query({
        query: (params) => asAdmin({ url: `${BASE}/admin/analytics/models`, params: clean(params) }),
        transformResponse: result,
        providesTags: ["AiAdmin"],
        extraOptions: NODE,
      }),

      // { items, pagination }; params: { from, to, search, sort, order, page, limit }
      getAdminAiAnalyticsClients: build.query({
        query: (params) => asAdmin({ url: `${BASE}/admin/analytics/clients`, params: clean(params) }),
        transformResponse: result,
        providesTags: ["AiAdmin"],
        extraOptions: NODE,
      }),

      // { tenantId, name, byModel, calls: { items, pagination } }
      getAdminAiAnalyticsClient: build.query({
        query: ({ tenantId, ...params }) =>
          asAdmin({ url: `${BASE}/admin/analytics/clients/${encodeURIComponent(tenantId)}`, params: clean(params) }),
        transformResponse: result,
        providesTags: ["AiAdmin"],
        extraOptions: NODE,
      }),
    }),
  });

export const {
  useGetAiWalletQuery,
  useGetAiStatusQuery,
  useGetAiTransactionsQuery,
  useGetAiUsageQuery,
  useCreateAiRechargeMutation,
  useVerifyAiRechargeMutation,
  useGetAdminAiOverviewQuery,
  useGetAdminAiTenantQuery,
  useGetAdminAiTenantTransactionsQuery,
  useGetAdminAiTenantUsageQuery,
  useAdjustAiCreditsMutation,
  useSetAiWalletStatusMutation,
  useGetAdminAiPricingQuery,
  useSaveAiPricingMutation,
  useGetAdminAiPackagesQuery,
  useSaveAiPackageMutation,
  useUpdateAiCreditSettingsMutation,
  useGetAdminAiAnalyticsQuery,
  useGetAdminAiAnalyticsModelsQuery,
  useGetAdminAiAnalyticsClientsQuery,
  useGetAdminAiAnalyticsClientQuery,
} = aiCreditsApi;
