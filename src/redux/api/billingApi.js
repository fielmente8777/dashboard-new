import { API_URLS } from "../../config/env";
import { getToken } from "../../utils/session";
import { baseApi } from "./baseApi";

// Plans, payments and auto-renew: gian-new's /api/v1/billing. gian-new answers
// { success, data } or { success: false, error: { code, message } }; `data` is unwrapped here.
// Every amount it sends is in paise (₹1 = 100), prices in the catalogue are rupees per month.
const APP = { service: "app" };
const data = (response) => response?.data ?? response;

export const billingApi = baseApi
  .enhanceEndpoints({ addTagTypes: ["BillingAccount", "BillingDetails"] })
  .injectEndpoints({
    endpoints: (build) => ({
      // the plan, what the hotel can use, the plans it can buy and its payments, in one call
      getBillingAccount: build.query({
        query: () => "/api/v1/billing/account",
        transformResponse: data,
        providesTags: ["BillingAccount"],
        extraOptions: APP,
      }),

      // { planId, cycleMonths, addonCodes, seats, offerCode } -> the server's price
      quotePlan: build.mutation({
        query: (choice) => ({ url: "/api/v1/billing/quote", method: "POST", body: choice }),
        transformResponse: data,
        extraOptions: APP,
      }),

      // the choice + { autoRenew, expectedTotalPaise } -> a Razorpay order (status "pending") or "applied"
      startCheckout: build.mutation({
        query: (body) => ({ url: "/api/v1/billing/checkout", method: "POST", body }),
        transformResponse: data,
        extraOptions: APP,
      }),

      // Razorpay checkout's handler result, as Razorpay names it
      confirmPayment: build.mutation({
        query: (razorpayResult) => ({ url: "/api/v1/billing/checkout/confirm", method: "POST", body: razorpayResult }),
        transformResponse: data,
        invalidatesTags: ["BillingAccount"],
        extraOptions: APP,
      }),

      // { enabled: true } -> { status: "authorize", subscriptionId, keyId, ... }; false -> { status: "off", account }
      setAutoRenew: build.mutation({
        query: (enabled) => ({ url: "/api/v1/billing/auto-renew", method: "POST", body: { enabled } }),
        transformResponse: data,
        invalidatesTags: (result) => (result?.status === "off" ? ["BillingAccount"] : []),
        extraOptions: APP,
      }),

      // the name, GSTIN and address on the hotel's invoices
      getBillingDetails: build.query({
        query: () => "/api/v1/billing/details",
        transformResponse: data,
        providesTags: ["BillingDetails"],
        extraOptions: APP,
      }),

      saveBillingDetails: build.mutation({
        query: (details) => ({ url: "/api/v1/billing/details", method: "PUT", body: details }),
        transformResponse: data,
        invalidatesTags: ["BillingDetails"],
        extraOptions: APP,
      }),

      confirmAutoRenew: build.mutation({
        query: (razorpayResult) => ({ url: "/api/v1/billing/auto-renew/confirm", method: "POST", body: razorpayResult }),
        transformResponse: data,
        invalidatesTags: ["BillingAccount"],
        extraOptions: APP,
      }),
    }),
  });

export const {
  useGetBillingAccountQuery,
  useQuotePlanMutation,
  useStartCheckoutMutation,
  useConfirmPaymentMutation,
  useSetAutoRenewMutation,
  useConfirmAutoRenewMutation,
  useGetBillingDetailsQuery,
  useSaveBillingDetailsMutation,
} = billingApi;

// Saves an invoice PDF to the browser's downloads (a file, so not through RTK Query).
export async function downloadInvoice(invoiceId) {
  const response = await fetch(`${API_URLS.app}/api/v1/billing/invoices/${invoiceId}/pdf`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error?.message || "Could not download the invoice.");
  }
  const filename = /filename="([^"]+)"/.exec(response.headers.get("content-disposition") || "")?.[1] || "Eazotel-invoice.pdf";
  const url = URL.createObjectURL(await response.blob());
  const link = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

// The server's error message (gian-new's `error.message`), for toasts.
export const billingError = (error, fallback = "Something went wrong. Please try again.") =>
  error?.data?.error?.message || fallback;

export const billingErrorCode = (error) => error?.data?.error?.code || null;

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const inrExact = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const rupees = (value) => inr.format(Number(value) || 0);
export const fromPaise = (paise) => inrExact.format((Number(paise) || 0) / 100);
export const fromPaiseRounded = (paise) => inr.format(Math.round((Number(paise) || 0) / 100));
