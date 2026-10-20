import { baseApi } from "./baseApi";

export const grmApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // { hid, ndid } - every request guests raised for this hotel location
    getGuestRequests: build.query({
      query: ({ hid, ndid }) => ({
        url: "/api/getrequest",
        method: "POST",
        body: { ndid, hid },
      }),
      transformResponse: (response) => response?.data || [],
      // this backend identifies the hotel by the ids in the body
      extraOptions: { service: "grm", skipAuth: true },
    }),

    // { hid, ndid } - the emergency requests guests raised for this hotel location
    getEmergencyRequests: build.query({
      query: ({ hid, ndid }) => ({
        url: "/api/getallemergencyrequest",
        method: "POST",
        body: { ndid, hid },
      }),
      transformResponse: (response) => response?.data || [],
      extraOptions: { service: "grm", skipAuth: true },
    }),
  }),
});

export const { useGetGuestRequestsQuery, useGetEmergencyRequestsQuery } = grmApi;
