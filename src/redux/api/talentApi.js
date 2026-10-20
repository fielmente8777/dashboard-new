import { baseApi } from "./baseApi";

// The HR pages (Human resources > Applications / Analytics).
export const talentApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // -> { Data: applications } (core; the token picks the account)
    getApplications: build.query({
      query: () => "/career/get-applications",
    }),
  }),
});
