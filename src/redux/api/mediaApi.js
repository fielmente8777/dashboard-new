import { API_URLS } from "../../config/env";
import { baseApi } from "./baseApi";

// Media library: paste links -> background import -> Claude analysis ->
// collections + Knowledge Base. Backend: gian /api/v1/media.
const MEDIA = "/api/v1/media";
const DRIVE = "/api/v1/knowledgebase/media/google";
const NODE = { service: "node" };

/** Import files use signed backend paths. Source thumbnails may already be absolute URLs. */
export const mediaFileUrl = (path) => (typeof path === "string" && /^https?:\/\//i.test(path) ? path : typeof path === "string" && path.startsWith("/api/") ? `${API_URLS.node}${path}` : null);

export const ACTIVE_IMPORT_STATUSES = ["queued", "resolving", "downloading", "analyzing", "scanning", "committing"];

const api = baseApi.enhanceEndpoints({
  addTagTypes: ["MediaImports", "MediaAssets", "MediaCollections", "MediaInventory", "MediaConnections"],
});

export const mediaApi = api.injectEndpoints({
  endpoints: (build) => ({
    /* ------------------------------ imports ------------------------------ */

    estimateMediaImport: build.mutation({
      query: ({ links }) => ({ url: `${MEDIA}/imports/estimate`, method: "POST", body: { links } }),
      extraOptions: NODE,
    }),

    startMediaImport: build.mutation({
      query: (body) => ({ url: `${MEDIA}/imports`, method: "POST", body }),
      transformResponse: (res) => res?.jobs || [],
      invalidatesTags: ["MediaImports"],
      extraOptions: NODE,
    }),

    getMediaImports: build.query({
      // { limit, hid }: imports of one property (plus account-wide ones)
      query: ({ limit = 20, hid } = {}) => ({ url: `${MEDIA}/imports`, params: hid ? { limit, hid } : { limit } }),
      transformResponse: (res) => res?.jobs || [],
      providesTags: ["MediaImports"],
      extraOptions: NODE,
    }),

    /* ------------------------------ review flow ------------------------------ */

    // one import's status (polled while the review screen waits)
    getMediaImport: build.query({
      query: (id) => `${MEDIA}/imports/${encodeURIComponent(id)}`,
      transformResponse: (res) => res?.job || null,
      extraOptions: NODE,
    }),

    // staged images of an import + AI scan results
    getImportReview: build.query({
      query: (id) => `${MEDIA}/imports/${encodeURIComponent(id)}/review`,
      extraOptions: NODE,
    }),

    // scenario 2: { types, inventoryItems, note, unsure }
    scanImport: build.mutation({
      query: ({ id, ...brief }) => ({ url: `${MEDIA}/imports/${encodeURIComponent(id)}/scan`, method: "POST", body: brief }),
      extraOptions: NODE,
    }),

    // both scenarios: { items: [{ assetId, include, ...edits }] }
    confirmImport: build.mutation({
      query: ({ id, items, draftId }) => ({ url: `${MEDIA}/imports/${encodeURIComponent(id)}/confirm`, method: "POST", body: { items, draftId } }),
      invalidatesTags: ["MediaImports", "MediaAssets", "MediaCollections", "MediaInventory"],
      extraOptions: NODE,
    }),

    /* ---------------- Knowledge Base editor drafts ("Save changes") ---------------- */

    getMediaDraft: build.query({
      query: (draftId) => `${MEDIA}/drafts/${encodeURIComponent(draftId)}`,
      transformResponse: (res) => res?.count || 0,
      providesTags: ["MediaAssets"],
      extraOptions: NODE,
    }),

    // { link } -> { folders: [{ path, name, depth, count, total }], images: [{ id, name, folderPath, thumbUrl }], truncated }
    // listing only: nothing is downloaded or charged
    browseMediaLink: build.mutation({
      query: (link) => ({ url: `${MEDIA}/browse`, method: "POST", body: { link } }),
      extraOptions: NODE,
    }),

    // saved library images and where they belong in the Knowledge Base document
    getLibraryPlacements: build.query({
      query: () => `${MEDIA}/placements`,
      transformResponse: (res) => res?.placements || [],
      providesTags: ["MediaAssets"],
      extraOptions: NODE,
    }),

    // { draftId, count } -> [{ assetId, category, item, title, url }] where each unsaved image goes in the KB document
    getMediaDraftPlacements: build.query({
      query: ({ draftId }) => `${MEDIA}/drafts/${encodeURIComponent(draftId)}/placements`,
      transformResponse: (res) => res?.placements || [],
      extraOptions: NODE,
    }),

    // unsaved images of closed editor sessions join this session (shown as unsaved again)
    adoptMediaDrafts: build.mutation({
      query: (draftId) => ({ url: `${MEDIA}/drafts/${encodeURIComponent(draftId)}/adopt`, method: "POST" }),
      invalidatesTags: ["MediaAssets", "MediaImports"],
      extraOptions: NODE,
    }),

    publishMediaDraft: build.mutation({
      query: (draftId) => ({ url: `${MEDIA}/drafts/${encodeURIComponent(draftId)}/publish`, method: "POST" }),
      invalidatesTags: ["MediaAssets", "MediaCollections", "MediaInventory"],
      extraOptions: NODE,
    }),

    /* ---------------- per-image status, title routing, location, history ---------------- */

    // { id, state?, page? } -> { counts, items: [{ key, name, folderPath, state, error, attempts, updatedAt }] }
    getImportItems: build.query({
      query: ({ id, state, page = 1 }) => ({ url: `${MEDIA}/imports/${encodeURIComponent(id)}/items`, params: { page, limit: 50, ...(state ? { state } : {}) } }),
      providesTags: ["MediaImports"],
      extraOptions: NODE,
    }),

    retryImportItem: build.mutation({
      query: ({ id, key }) => ({ url: `${MEDIA}/imports/${encodeURIComponent(id)}/items/${encodeURIComponent(key)}/retry`, method: "POST" }),
      invalidatesTags: ["MediaImports"],
      extraOptions: NODE,
    }),

    // where a title routes images: { collection, subCollection, matchedBy }
    resolveTitle: build.query({
      query: (title) => ({ url: `${MEDIA}/titles/resolve`, params: { title } }),
      transformResponse: (res) => res?.route || null,
      extraOptions: NODE,
    }),

    getAssetLocation: build.query({
      query: (id) => `${MEDIA}/assets/${encodeURIComponent(id)}/location`,
      transformResponse: (res) => res?.location || null,
      providesTags: ["MediaAssets"],
      extraOptions: NODE,
    }),

    getAssetHistory: build.query({
      query: (id) => `${MEDIA}/assets/${encodeURIComponent(id)}/history`,
      transformResponse: (res) => res?.events || [],
      providesTags: ["MediaAssets"],
      extraOptions: NODE,
    }),

    retryMediaImport: build.mutation({
      query: (id) => ({ url: `${MEDIA}/imports/${encodeURIComponent(id)}/retry`, method: "POST" }),
      invalidatesTags: ["MediaImports"],
      extraOptions: NODE,
    }),

    /* ------------------------------ assets ------------------------------ */

    getMediaAssets: build.query({
      // filters: { collection, sub, tag, source, status, room, from, to, q, semantic, page, limit }
      query: (filters = {}) => ({
        url: `${MEDIA}/assets`,
        params: Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined && v !== null && v !== "")),
      }),
      providesTags: ["MediaAssets"],
      extraOptions: NODE,
    }),

    updateMediaAsset: build.mutation({
      query: ({ id, ...body }) => ({ url: `${MEDIA}/assets/${encodeURIComponent(id)}`, method: "PATCH", body }),
      transformResponse: (res) => res?.asset || null,
      invalidatesTags: ["MediaAssets", "MediaCollections", "MediaInventory"],
      extraOptions: NODE,
    }),

    reanalyzeMediaAsset: build.mutation({
      query: (id) => ({ url: `${MEDIA}/assets/${encodeURIComponent(id)}/reanalyze`, method: "POST" }),
      invalidatesTags: ["MediaAssets"],
      extraOptions: NODE,
    }),

    deleteMediaAsset: build.mutation({
      query: (id) => ({ url: `${MEDIA}/assets/${encodeURIComponent(id)}`, method: "DELETE" }),
      invalidatesTags: ["MediaAssets", "MediaCollections", "MediaInventory"],
      extraOptions: NODE,
    }),

    // { action: "move" | "delete" | "reanalyze", assetIds, collectionId?, subCategory? }
    bulkMediaAssets: build.mutation({
      query: (body) => ({ url: `${MEDIA}/assets/bulk`, method: "POST", body }),
      invalidatesTags: ["MediaAssets", "MediaCollections", "MediaInventory"],
      extraOptions: NODE,
    }),

    /* ---------------------------- collections ---------------------------- */

    // draft: include the current Knowledge Base editor session's unsaved images in the counts
    getMediaCollections: build.query({
      query: (draft) => ({ url: `${MEDIA}/collections`, params: draft ? { draft } : undefined }),
      providesTags: ["MediaCollections"],
      extraOptions: NODE,
    }),

    createMediaCollection: build.mutation({
      query: (body) => ({ url: `${MEDIA}/collections`, method: "POST", body }),
      invalidatesTags: ["MediaCollections"],
      extraOptions: NODE,
    }),

    getMediaInventory: build.query({
      query: (params = {}) => ({ url: `${MEDIA}/inventory`, params }),
      providesTags: ["MediaInventory"],
      extraOptions: NODE,
    }),

    /* ---------------------------- connections ---------------------------- */

    getS3Connection: build.query({
      query: () => `${MEDIA}/connections/s3`,
      providesTags: ["MediaConnections"],
      extraOptions: NODE,
    }),

    saveS3Connection: build.mutation({
      query: (body) => ({ url: `${MEDIA}/connections/s3`, method: "PUT", body }),
      invalidatesTags: ["MediaConnections"],
      extraOptions: NODE,
    }),

    deleteS3Connection: build.mutation({
      query: () => ({ url: `${MEDIA}/connections/s3`, method: "DELETE" }),
      invalidatesTags: ["MediaConnections"],
      extraOptions: NODE,
    }),

    getDriveStatus: build.query({
      query: () => `${DRIVE}/status`,
      providesTags: ["MediaConnections"],
      extraOptions: NODE,
    }),

    connectDrive: build.mutation({
      query: () => `${DRIVE}/connect`,
      extraOptions: NODE,
    }),

    disconnectDrive: build.mutation({
      query: () => ({ url: `${DRIVE}/disconnect`, method: "DELETE" }),
      invalidatesTags: ["MediaConnections"],
      extraOptions: NODE,
    }),
  }),
});

export const {
  useEstimateMediaImportMutation,
  useStartMediaImportMutation,
  useGetMediaImportsQuery,
  useRetryMediaImportMutation,
  useScanImportMutation,
  useGetMediaDraftQuery,
  useGetMediaDraftPlacementsQuery,
  useBrowseMediaLinkMutation,
  useGetLibraryPlacementsQuery,
  useGetImportItemsQuery,
  useRetryImportItemMutation,
  useResolveTitleQuery,
  useGetAssetLocationQuery,
  useGetAssetHistoryQuery,
  usePublishMediaDraftMutation,
  useAdoptMediaDraftsMutation,
  useConfirmImportMutation,
  useGetMediaAssetsQuery,
  useUpdateMediaAssetMutation,
  useReanalyzeMediaAssetMutation,
  useDeleteMediaAssetMutation,
  useBulkMediaAssetsMutation,
  useGetMediaCollectionsQuery,
  useCreateMediaCollectionMutation,
  useGetMediaInventoryQuery,
  useGetS3ConnectionQuery,
  useSaveS3ConnectionMutation,
  useDeleteS3ConnectionMutation,
  useGetDriveStatusQuery,
  useConnectDriveMutation,
  useDisconnectDriveMutation,
} = mediaApi;
