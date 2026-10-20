import { getToken } from "../../utils/session";
import { request } from "../request";
import { baseApi } from "./baseApi";

// gian's image store; these endpoints have never been sent the header
const NODE_OPEN = { service: "node", skipAuth: true };

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

    // file -> { success, result: { doc: { imageUrl } } }
    uploadImageFile: build.mutation({
      query: (file) => {
        const body = new FormData();
        body.append("file", file);
        return { url: "/api/v1/image/upload", method: "POST", body };
      },
      extraOptions: NODE_OPEN,
    }),

    // imageUrl -> { success }
    deleteImageFile: build.mutation({
      query: (imageUrl) => ({ url: "/api/v1/image/delete", method: "DELETE", body: { imageUrl } }),
      extraOptions: NODE_OPEN,
    }),
  }),
});

export const { useUploadImageMutation } = uploadApi;

// For plain code, named as in the old services/api/s3Image.api.js; each
// resolves with the answer's body.
export const uploadImageToServer = (file) => request(uploadApi.endpoints.uploadImageFile, file);
export const deleteImageFromServer = (imageUrl) =>
  request(uploadApi.endpoints.deleteImageFile, imageUrl);
