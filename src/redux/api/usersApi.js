import { getToken } from "../../utils/session";
import { baseApi } from "./baseApi";

// The team members of the account. (The list itself is `getTeamUsers` in
// callsApi.) These endpoints take the token in the URL.
// A user is { emailId, phone, displayName, userName, role, access_id (the
// password), isAdmin, assigned_location: [{ hid, disPlayLocation, accessScope }] }
export const usersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createUser: build.mutation({
      query: (user) => ({
        url: `/user/create/${getToken()}`,
        method: "POST",
        body: user,
      }),
      extraOptions: { skipAuth: true },
    }),

    // the user is found by `emailId`
    updateUser: build.mutation({
      query: (user) => ({
        url: `/user/edit/${getToken()}`,
        method: "POST",
        body: user,
      }),
      extraOptions: { skipAuth: true },
    }),
  }),
});

export const { useCreateUserMutation, useUpdateUserMutation } = usersApi;
