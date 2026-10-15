import { getToken } from "../../utils/session";
import { baseApi } from "./baseApi";

const api = baseApi.enhanceEndpoints({ addTagTypes: ["TeamUsers"] });

// The team members of the account. These endpoints take the token in the URL.
// A user is { emailId, phone, displayName, userName, role, access_id (the
// password), isAdmin, createdAt, assigned_location: [{ hid, disPlayLocation, accessScope }] }
export const usersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getTeamUsers: build.query({
      query: () => `/user/${getToken()}`,
      transformResponse: (response) => response?.data || [],
      providesTags: ["TeamUsers"],
      extraOptions: { skipAuth: true },
    }),

    createUser: build.mutation({
      query: (user) => ({
        url: `/user/create/${getToken()}`,
        method: "POST",
        body: user,
      }),
      invalidatesTags: ["TeamUsers"],
      extraOptions: { skipAuth: true },
    }),

    // the user is found by `emailId`
    updateUser: build.mutation({
      query: (user) => ({
        url: `/user/edit/${getToken()}`,
        method: "POST",
        body: user,
      }),
      invalidatesTags: ["TeamUsers"],
      extraOptions: { skipAuth: true },
    }),

    deleteUser: build.mutation({
      query: (emailId) => ({
        url: `/user/delete/${emailId}`,
        method: "POST",
      }),
      invalidatesTags: ["TeamUsers"],
      extraOptions: { skipAuth: true },
    }),
  }),
});

export const {
  useGetTeamUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi;
