import { getToken } from "../../utils/session";
import { baseApi } from "./baseApi";

// these endpoints read the token from the URL or the body, not the header
const NO_HEADER = { skipAuth: true };

// A POST that carries the token and the hotel id in its body. Called with
// { hid, ...fields }.
const post = (build, url, invalidatesTags, tokenKey = "token") =>
  build.mutation({
    query: ({ hid, ...body }) => ({
      url,
      method: "POST",
      body: { [tokenKey]: getToken(), hId: String(hid), ...body },
    }),
    invalidatesTags,
    extraOptions: NO_HEADER,
  });

const api = baseApi.enhanceEndpoints({
  addTagTypes: ["Room", "Inventory", "Price", "MealPackage", "AdPackage", "Engine"],
});

export const bookingEngineApi = api.injectEndpoints({
  endpoints: (build) => ({
    // --- rooms (the list itself is bookingApi.getRooms) ---
    addRoom: build.mutation({
      query: (room) => ({
        url: `/room/create/${getToken()}`,
        method: "POST",
        body: room,
      }),
      invalidatesTags: ["Room", "Inventory", "Price"],
      extraOptions: NO_HEADER,
    }),

    // { hid, roomId } - rooms are deleted by their room type id
    deleteRoom: build.mutation({
      query: ({ hid, roomId }) => ({
        url: `/room/delete/${roomId}`,
        method: "POST",
        body: { token: getToken(), hId: hid },
      }),
      invalidatesTags: ["Room", "Inventory", "Price"],
      extraOptions: NO_HEADER,
    }),

    // --- inventory and prices: one week per room type ---
    // { hid, range? } - range is { date, operation: "next" | "prev" } to move
    // to another week; without it the current week is returned.
    // Resolves with { values: { [roomTypeId]: { [date]: value } }, next, prev }.
    getInventory: build.query({
      query: ({ hid, range }) =>
        range
          ? {
              url: `/inventory/getinventory/all/nextprev/${getToken()}/${hid}`,
              method: "POST",
              body: range,
            }
          : `/inventory/getinventory/all/${getToken()}/${hid}`,
      transformResponse: (response) => ({
        values: response?.Inventory || {},
        next: response?.next,
        prev: response?.prev,
      }),
      providesTags: ["Inventory"],
      extraOptions: NO_HEADER,
    }),

    getPrices: build.query({
      query: ({ hid, range }) =>
        range
          ? {
              url: `/price/getprice/all/nextprev/${getToken()}`,
              method: "POST",
              body: { ...range, hId: String(hid) },
            }
          : `/price/getprice/all/${getToken()}/${hid}`,
      transformResponse: (response) => ({
        values: response?.Prices || {},
        next: response?.next,
        prev: response?.prev,
      }),
      providesTags: ["Price"],
      extraOptions: NO_HEADER,
    }),

    // { hid, bulkinventory: { [roomTypeId]: { [date]: value } } }
    saveInventory: post(build, "/inventory/update/bulk/inventory", ["Inventory"]),
    // { hid, bulkprice: { [roomTypeId]: { [date]: value } } }
    savePrices: post(build, "/price/update/bulkprice", ["Price"]),

    // --- meal (price) packages ---
    getMealPackages: build.query({
      query: (hid) => `/mpackage/packages/${getToken()}/${hid}`,
      transformResponse: (response) => response?.Packages || [],
      providesTags: ["MealPackage"],
      extraOptions: NO_HEADER,
    }),
    createMealPackage: post(build, "/mpackage/packages/create", ["MealPackage"]),
    // { hid, planId }
    deleteMealPackage: post(build, "/mpackage/packages/delete", ["MealPackage"]),

    // --- ad packages ---
    getAdPackages: build.query({
      query: (hid) => `/rpackage/ad/packages/${getToken()}/${hid}`,
      transformResponse: (response) => response?.Packages || [],
      providesTags: ["AdPackage"],
      extraOptions: NO_HEADER,
    }),
    createAdPackage: post(build, "/rpackage/ad/packages/create", ["AdPackage"]),
    // { hid, packageId }
    deleteAdPackage: post(build, "/rpackage/ad/packages/delete", ["AdPackage"]),

    // --- look of the public booking engine ---
    // Resolves with the engine details: { Colors, BgImage, Labels, ... }
    getEngineDetails: build.query({
      query: (hid) => `/booking/getengine/${getToken()}/${hid}`,
      transformResponse: (response) => response?.Details || null,
      providesTags: ["Engine"],
      extraOptions: NO_HEADER,
    }),
    // { hid, BackgroundColor, BoardColor, ButtonColor }
    saveEngineColors: post(build, "/cms/edit/engine/colors", ["Engine"], "Token"),
  }),
});

export const {
  useAddRoomMutation,
  useDeleteRoomMutation,
  useGetInventoryQuery,
  useGetPricesQuery,
  useSaveInventoryMutation,
  useSavePricesMutation,
  useGetMealPackagesQuery,
  useCreateMealPackageMutation,
  useDeleteMealPackageMutation,
  useGetAdPackagesQuery,
  useCreateAdPackageMutation,
  useDeleteAdPackageMutation,
  useGetEngineDetailsQuery,
  useSaveEngineColorsMutation,
} = bookingEngineApi;
