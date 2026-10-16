export const FILTER_TABS = [
  { value: "dates", label: "Date range" },
  { value: "bookingId", label: "Booking ID" },
  { value: "payment", label: "Payment status" },
];

// `value` is the id the payment filter endpoint expects
export const PAYMENT_FILTERS = [
  { value: "1", label: "Pay at Hotel" },
  { value: "2", label: "Advanced" },
  { value: "3", label: "Success" },
];

// payment.Status -> Badge tone
const PAYMENT_TONES = {
  SUCCESS: "green",
  ADVANCED: "amber",
  PENDING: "red",
  REFUND: "sky",
  CANCELLED: "gray",
};

export const getPaymentTone = (status) => PAYMENT_TONES[status] || "green";

export const isCancelled = (booking) =>
  booking?.payment?.Status === "CANCELLED";

// older bookings use checked_in / checked_out
export const isCheckedIn = (booking) =>
  Boolean(booking?.isCheckedIn ?? booking?.checked_in);
export const isCheckedOut = (booking) =>
  Boolean(booking?.isCheckedOut ?? booking?.checked_out);

export const formatPrice = (amount) =>
  amount === undefined || amount === null || amount === ""
    ? "—"
    : `₹${Number(amount).toLocaleString("en-IN")}`;
