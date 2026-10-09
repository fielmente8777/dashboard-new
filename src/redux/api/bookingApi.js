import { getToken } from "../../utils/session";
import { baseApi } from "./baseApi";

// these endpoints read the token from the URL or the body, not the header
const NO_HEADER = { skipAuth: true };

const toList = (value) => (Array.isArray(value) ? value : value ? [value] : []);

// One request per kind of booking filter.
// filter: null | { type: "dates", from, to } | { type: "bookingId", id }
//       | { type: "payment", status }
const bookingRequest = (hid, filter) => {
  const body = { hId: String(hid), token: getToken() };

  switch (filter?.type) {
    case "dates":
      return {
        url: "/booking/filter/dates",
        method: "POST",
        body: { ...body, checkIn: filter.from, checkOut: filter.to },
      };
    case "bookingId":
      return {
        url: "/booking/filter/bookingid",
        method: "POST",
        body: { ...body, bookingId: filter.id },
      };
    case "payment":
      return {
        url: `/booking/filter/payment/${filter.status}`,
        method: "POST",
        body,
      };
    default:
      return `/booking/bookings/${getToken()}/${hid}`;
  }
};

const frontDeskMutation = (build, url) =>
  build.mutation({
    query: ({ hid, ...body }) => ({
      url: `/frontdesk/${url}`,
      method: "POST",
      body: { token: getToken(), hId: hid, ...body },
    }),
    invalidatesTags: ["Room", "Booking"],
    extraOptions: NO_HEADER,
  });

const api = baseApi.enhanceEndpoints({ addTagTypes: ["Booking", "Room"] });

export const bookingApi = api.injectEndpoints({
  endpoints: (build) => ({
    // { hid, filter? } - every booking of the hotel, or the filtered ones
    getBookings: build.query({
      query: ({ hid, filter }) => bookingRequest(hid, filter),
      transformResponse: (response) =>
        toList(response?.Details ?? response?.Bookings),
      providesTags: ["Booking"],
      extraOptions: NO_HEADER,
    }),

    // room types of the hotel, each with its room numbers and maintenance blocks
    getRooms: build.query({
      query: (hid) => `/room/${getToken()}/${hid}`,
      transformResponse: (response) => response?.data || [],
      providesTags: ["Room"],
      extraOptions: NO_HEADER,
    }),

    // Creates a reservation and its payment link (used to turn a lead into
    // a booking). { hid, ndid, ...the reservation }
    createReservation: build.mutation({
      query: ({ hid, ndid, ...reservation }) => ({
        url: `/api/v1/reservation/create/${ndid}/${hid}`,
        method: "POST",
        body: reservation,
      }),
      invalidatesTags: ["Booking"],
      extraOptions: { service: "node" },
    }),

    // --- front desk calendar; every call also takes `hid` ---
    // { roomNumber, Message, start, end }
    addMaintenance: frontDeskMutation(build, "add-maintenance"),
    // { oldroomNumber, oldstart, oldend, newroomNumber, newstart, newend, Message }
    updateMaintenance: frontDeskMutation(build, "update-maintenance"),
    // { roomNumber, Message, start, end }
    deleteMaintenance: frontDeskMutation(build, "delete-maintenance"),
    // { bookingId, oldroomNumber, oldstart, oldend, newroomNumber, newstart, newend }
    moveBooking: frontDeskMutation(build, "update-booking"),
  }),
});

export const {
  useGetBookingsQuery,
  useGetRoomsQuery,
  useCreateReservationMutation,
  useAddMaintenanceMutation,
  useUpdateMaintenanceMutation,
  useDeleteMaintenanceMutation,
  useMoveBookingMutation,
} = bookingApi;
