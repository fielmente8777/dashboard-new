import handleLocalStorage from "../../utils/handleLocalStorage";
import { getToken } from "../../utils/session";
import { baseApi } from "./baseApi";

// these endpoints read the token from the body, not the header
const BODY_TOKEN = { skipAuth: true };

const SEARCH = {
  order: { url: "/razorpay/v1/filtered/orders", idKey: "orderid" },
  payment: { url: "/razorpay/v1/filtered/payments", idKey: "payid" },
};

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // One page of Razorpay payments. `hid` is part of the argument so each
    // hotel location gets its own cached list.
    getPayments: build.query({
      query: ({ hid, skip }) => ({
        url: "/razorpay/v1/payments",
        method: "POST",
        body: { token: getToken(), hId: String(hid), skip: String(skip) },
      }),
      transformResponse: (response) =>
        response?.status ? response.Details?.items || [] : [],
      extraOptions: BODY_TOKEN,
    }),

    // Looks up one payment. type: "order" | "payment"
    findPayment: build.query({
      query: ({ hid, type, id }) => ({
        url: SEARCH[type].url,
        method: "POST",
        body: { token: getToken(), hId: String(hid), [SEARCH[type].idKey]: id },
      }),
      transformResponse: (response) =>
        response?.status && response.Details ? [response.Details] : [],
      extraOptions: BODY_TOKEN,
    }),

    saveGateway: build.mutation({
      query: ({ type, apiKey, secretKey }) => ({
        url: "/razorpay/edit/gateway",
        method: "POST",
        body: {
          Token: getToken(),
          hId: handleLocalStorage("hid"),
          type,
          API_KEY: apiKey,
          SECRET_KEY: secretKey,
        },
      }),
      extraOptions: BODY_TOKEN,
    }),
  }),
});

export const {
  useGetPaymentsQuery,
  useFindPaymentQuery,
  useSaveGatewayMutation,
} = paymentApi;
