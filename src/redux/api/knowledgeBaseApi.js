
import { baseApi } from "./baseApi";

const KB_URL = "/api/v1/knowledgebase";
const NODE = { service: "node" };

// Parse JSON response or text response
const parseJsonBody = async (response) => {
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const api = baseApi.enhanceEndpoints({
  addTagTypes: ["KnowledgeBase"],
});

export const knowledgeBaseApi = api.injectEndpoints({
  endpoints: (build) => ({

    // Get all knowledge bases
    getKnowledgeBases: build.query({
      query: ({ hid, ndid }) => ({
        url: KB_URL,
        params: { hid, ndid },
      }),
      transformResponse: (response) => response?.items || [],
      providesTags: ["KnowledgeBase"],
      extraOptions: NODE,
    }),

    // Get knowledge base by ID
    getKnowledgeBase: build.query({
      query: (id) => `${KB_URL}/${id}`,
      transformResponse: (response) =>
        response?.knowledgeBase || null,
      extraOptions: NODE,
    }),

    // Find knowledge base by website URL
    findKnowledgeBaseByUrl: build.query({
      query: (url) => ({
        url: KB_URL,
        params: { url },
      }),
      transformResponse: (response) =>
        response?.knowledgeBase || null,
      extraOptions: NODE,
    }),

    // Generate knowledge base
    generateKnowledgeBase: build.mutation({
      query: ({
        url,
        clientName,
        file,
        images = [],
        hid,
        ndid,
      }) => {
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

        if (clientName) {
          form.append("client_name", clientName);
        }

        if (file) {
          form.append("pdf_file", file);
        }

        images.forEach((image) => {
          form.append("images", image);
        });

        return {
          ...request,
          body: form,
        };
      },
      extraOptions: NODE,
    }),

    // Create or update knowledge base
    saveKnowledgeBase: build.mutation({
      query: ({ id, ...body }) => ({
        url: id ? `${KB_URL}/${id}` : KB_URL,
        method: id ? "PUT" : "POST",
        body,
      }),
      transformResponse: (response) =>
        response?.knowledgeBase || null,
      invalidatesTags: ["KnowledgeBase"],
      extraOptions: NODE,
    }),

    // Delete knowledge base
    deleteKnowledgeBase: build.mutation({
      query: (id) => ({
        url: `${KB_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["KnowledgeBase"],
      extraOptions: NODE,
    }),

    // Upload image / video / PDF
    uploadKnowledgeBaseMedia: build.mutation({
      query: (file) => {
        const form = new FormData();

        form.append("file", file);

        return {
          url: "/api/v1/uploads",
          method: "POST",
          body: form,
        };
      },
      transformResponse: (response) => ({
        url:
          response?.url ||
          response?.location ||
          response?.Location ||
          null,
      }),
      extraOptions: NODE,
    }),

    // Image import / AI analysis: see mediaApi.js (Media library).

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
