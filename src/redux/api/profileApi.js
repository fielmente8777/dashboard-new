import { getToken } from "../../utils/session";
import { baseApi } from "./baseApi";

const NODE = { service: "node" };

// The Profile page.
export const profileApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // { oldAccessId, newAccessId } - the current and the new password.
    // Core reads the token from the body and answers { Status: true } on success.
    changePassword: build.mutation({
      query: (body) => ({
        url: "/eazotel/edit/password",
        method: "POST",
        body: { token: getToken(), ...body },
      }),
      extraOptions: { skipAuth: true },
    }),

    // { websites, landingPages } - the hotel's links, one list per column
    // (gian: PUT /api/v1/profile/urls; core has no such endpoint)
    // -> { result: { urls } }
    updateProfileUrls: build.mutation({
      query: (urls) => ({ url: "/api/v1/profile/urls", method: "PUT", body: urls }),
      extraOptions: NODE,
    }),

    // The address email campaigns use as their "From" (guests' replies go
    // there). Empty = campaigns use the hotel email.
    // (gian: PUT /api/v1/profile/marketing-email) -> { result: { marketingEmail } }
    updateMarketingEmail: build.mutation({
      query: (marketingEmail) => ({
        url: "/api/v1/profile/marketing-email",
        method: "PUT",
        body: { marketingEmail },
      }),
      extraOptions: NODE,
    }),

    // The profile straight from Zucks_profile (gian: GET /api/v1/profile)
    // -> { result: { docs: profile } }. The core profile the dashboard loads
    // at sign-in leaves out newer fields such as secondaryPhone, so they are
    // read from here.
    getNodeProfile: build.query({
      query: () => "/api/v1/profile",
      extraOptions: NODE,
    }),

    // An optional second number that also gets WhatsApp lead notifications.
    // (gian: PUT /api/v1/profile/secondary-phone) -> { result: { secondaryPhone } }
    // secondaryPhone comes back as digits with country code, e.g. "919759349941"
    updateSecondaryPhone: build.mutation({
      query: (secondaryPhone) => ({
        url: "/api/v1/profile/secondary-phone",
        method: "PUT",
        body: { secondaryPhone },
      }),
      extraOptions: NODE,
    }),

    // (gian: DELETE /api/v1/profile/secondary-phone)
    deleteSecondaryPhone: build.mutation({
      query: () => ({ url: "/api/v1/profile/secondary-phone", method: "DELETE" }),
      extraOptions: NODE,
    }),

    // Hotel locations (gian: /api/v1/profile/hotels). Each answers
    // { result: { hotel, hotels } } with the profile's hotels after the change.

    // { hotelId, local, city, state, country, pinCode } - the caller picks hotelId
    createHotel: build.mutation({
      query: (body) => ({ url: "/api/v1/profile/hotels", method: "POST", body }),
      extraOptions: NODE,
    }),

    // { hotelId, local, city, state, country, pinCode }
    updateHotel: build.mutation({
      query: ({ hotelId, ...body }) => ({
        url: `/api/v1/profile/hotels/${encodeURIComponent(hotelId)}`,
        method: "PUT",
        body,
      }),
      extraOptions: NODE,
    }),

    deleteHotel: build.mutation({
      query: (hotelId) => ({
        url: `/api/v1/profile/hotels/${encodeURIComponent(hotelId)}`,
        method: "DELETE",
      }),
      extraOptions: NODE,
    }),
  }),
});

export const {
  useChangePasswordMutation,
  useUpdateProfileUrlsMutation,
  useUpdateMarketingEmailMutation,
  useGetNodeProfileQuery,
  useLazyGetNodeProfileQuery,
  useUpdateSecondaryPhoneMutation,
  useDeleteSecondaryPhoneMutation,
  useCreateHotelMutation,
  useUpdateHotelMutation,
  useDeleteHotelMutation,
} = profileApi;
