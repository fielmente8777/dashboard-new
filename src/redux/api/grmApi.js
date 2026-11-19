import { baseApi } from "./baseApi";

// this backend answers 404 "Request not found" when a hotel simply has no
// requests yet; that is an empty list, not an error
const okOrEmpty = (response) => response.ok || response.status === 404;

export const grmApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // { hid, ndid } - every request guests raised for this hotel location
    getGuestRequests: build.query({
      query: ({ hid, ndid }) => ({
        url: "/api/getrequest",
        method: "POST",
        body: { ndid, hid },
        validateStatus: okOrEmpty,
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
        validateStatus: okOrEmpty,
      }),
      transformResponse: (response) => response?.data || [],
      extraOptions: { service: "grm", skipAuth: true },
    }),

    // { requestId, status } - status is one of REQUEST_STATUSES in pages/Grm/constants
    updateRequestStatus: build.mutation({
      query: ({ requestId, status }) => ({
        url: "/api/request",
        method: "PUT",
        body: { requestId, status },
      }),
      extraOptions: { service: "grm", skipAuth: true },
    }),
  }),
});

export const {
  useGetGuestRequestsQuery,
  useGetEmergencyRequestsQuery,
  useUpdateRequestStatusMutation,
} = grmApi;
