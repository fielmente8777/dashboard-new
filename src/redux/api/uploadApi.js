import { getToken } from "../../utils/session";
import { baseApi } from "./baseApi";

export const uploadApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // `image` is the file as base64; the response carries the hosted URL in `Image`
    uploadImage: build.mutation({
      query: (image) => ({
        url: "/upload/file/image",
        method: "POST",
        body: { token: getToken(), image },
      }),
      // this endpoint reads the token from the body, not the header
      extraOptions: { skipAuth: true },
    }),
  }),
});

export const { useUploadImageMutation } = uploadApi;
