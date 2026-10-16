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

    // { [column]: [url, ...] } - the hotel's links, one list per column
    updateProfileUrls: build.mutation({
      query: (urls) => ({
        url: "/eazotel/edit/urls",
        method: "POST",
        body: { token: getToken(), ...urls },
      }),
      extraOptions: { skipAuth: true },
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
  useCreateHotelMutation,
  useUpdateHotelMutation,
  useDeleteHotelMutation,
} = profileApi;
