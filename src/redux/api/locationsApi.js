import { getToken } from "../../utils/session";
import { baseApi } from "./baseApi";

export const locationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Adds a hotel location to the account.
    // { local (the hotel's name), city, state, country, pincode }
    addLocation: build.mutation({
      query: (location) => ({
        url: "/multilocation/addlocations/dashboard",
        method: "POST",
        // this endpoint reads the token from the body
        body: { token: getToken(), ...location },
      }),
      extraOptions: { skipAuth: true },
    }),
  }),
});

export const { useAddLocationMutation } = locationsApi;
