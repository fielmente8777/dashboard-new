import { baseApi } from "./baseApi";

const KB_URL = "/api/v1/knowledgebase";
const NODE = { service: "node" };

// The generator can answer with JSON sent as a file download, so the body is
// always read as text and parsed here.
const parseJsonBody = async (response) => {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const api = baseApi.enhanceEndpoints({ addTagTypes: ["KnowledgeBase"] });

export const knowledgeBaseApi = api.injectEndpoints({
  endpoints: (build) => ({
    getKnowledgeBases: build.query({
      query: ({ hid, ndid }) => ({ url: KB_URL, params: { hid, ndid } }),
      transformResponse: (response) => response?.items || [],
      providesTags: ["KnowledgeBase"],
      extraOptions: NODE,
    }),

    getKnowledgeBase: build.query({
      query: (id) => `${KB_URL}/${id}`,
      transformResponse: (response) => response?.knowledgeBase || null,
      extraOptions: NODE,
    }),

    // The saved knowledge base for a website URL. Answers 404 when there is none.
    findKnowledgeBaseByUrl: build.query({
      query: (url) => ({ url: KB_URL, params: { url } }),
      transformResponse: (response) => response?.knowledgeBase || null,
      extraOptions: NODE,
    }),

    // { url, clientName, file, images, hid, ndid } - builds a new knowledge
    // base from the website (and the optional PDF / images). Can take minutes.
    generateKnowledgeBase: build.mutation({
      query: ({ url, clientName, file, images = [], hid, ndid }) => {
        const request = {
          url: "/api/v1/kb-generator/generate",
          method: "POST",
          responseHandler: parseJsonBody,
        };

        if (!file && images.length === 0) {
          return {
            ...request,
            body: {
              website_url: url,
              client_name: clientName || undefined,
              hid,
              ndid,
            },
          };
        }

        const form = new FormData();
        form.append("website_url", url);
        if (clientName) form.append("client_name", clientName);
        if (file) form.append("pdf_file", file);
        images.forEach((image) => form.append("images", image));
        return { ...request, body: form };
      },
      extraOptions: NODE,
    }),

    // Creates the knowledge base, or updates it when `id` is given.
    saveKnowledgeBase: build.mutation({
      query: ({ id, ...body }) => ({
        url: id ? `${KB_URL}/${id}` : KB_URL,
        method: id ? "PUT" : "POST",
        body,
      }),
      transformResponse: (response) => response?.knowledgeBase || null,
      invalidatesTags: ["KnowledgeBase"],
      extraOptions: NODE,
    }),

    deleteKnowledgeBase: build.mutation({
      query: (id) => ({ url: `${KB_URL}/${id}`, method: "DELETE" }),
      invalidatesTags: ["KnowledgeBase"],
      extraOptions: NODE,
    }),

    // Uploads an image / video / PDF and resolves with { url }.
    uploadKnowledgeBaseMedia: build.mutation({
      query: (file) => {
        const form = new FormData();
        form.append("file", file);
        return { url: "/api/v1/uploads", method: "POST", body: form };
      },
      transformResponse: (response) => ({
        url: response?.url || response?.location || response?.Location || null,
      }),
      extraOptions: NODE,
    }),
  }),
});

export const {
  useGetKnowledgeBasesQuery,
  useLazyGetKnowledgeBaseQuery,
  useLazyFindKnowledgeBaseByUrlQuery,
  useGenerateKnowledgeBaseMutation,
  useSaveKnowledgeBaseMutation,
  useDeleteKnowledgeBaseMutation,
  useUploadKnowledgeBaseMediaMutation,
} = knowledgeBaseApi;
