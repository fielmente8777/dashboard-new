import { request } from "../request";
import { baseApi } from "./baseApi";

const NODE = { service: "node" };

// Settings > Wallet (gian).
export const walletApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // the AI credits balance and usage. gian has this route in
    // credits.route.ts but does not mount it yet, so it answers 404.
    getWallet: build.query({
      query: () => "/api/v1/credits/",
      extraOptions: NODE,
    }),

    // ndid -> starts the account's subscription
    addSubscription: build.mutation({
      query: (ndid) => ({ url: "/api/v1/user/subscribe", method: "POST", params: { ndid } }),
      extraOptions: NODE,
    }),
  }),
});

// For plain code, named as in the old services/api/wallet.api.js; each
// resolves with the answer's body.
export const getWallet = () => request(walletApi.endpoints.getWallet);
export const addSubscription = () =>
  request(walletApi.endpoints.addSubscription, localStorage.getItem("ndid"));
