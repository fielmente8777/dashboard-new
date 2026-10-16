import { getToken } from "../../utils/session";
import { baseApi } from "./baseApi";

// The Profile page. These endpoints read the token from the body, not the
// header. Both answer { Status: true } when the change was made.
export const profileApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // { oldAccessId, newAccessId } - the current and the new password
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
  }),
});

export const { useChangePasswordMutation, useUpdateProfileUrlsMutation } = profileApi;
