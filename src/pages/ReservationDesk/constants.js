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

// "PAY_AT_HOTEL" -> "Pay at hotel"
export const formatPaymentStatus = (status) => {
  const words = String(status || "").replace(/_/g, " ").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

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

// A stay date as a local day. "2026-11-01" is read as that calendar day
// (not UTC midnight); anything else goes through Date. null when unreadable.
export const parseDay = (value) => {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));
  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const startOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

// "12 Nov 2026"; the raw value when it isn't a date
export const formatDay = (value, { weekday = false } = {}) => {
  const date = parseDay(value);
  if (!date) return value || "—";
  return date.toLocaleDateString("en-IN", {
    ...(weekday && { weekday: "short" }),
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const nightsBetween = (checkIn, checkOut) => {
  const from = parseDay(checkIn);
  const to = parseDay(checkOut);
  if (!from || !to) return null;
  return Math.max(
    0,
    Math.round((startOfDay(to) - startOfDay(from)) / 86_400_000),
  );
};

// Where the guest is in their stay, as one label for the table.
export const getStayStatus = (booking) => {
  if (isCancelled(booking)) return { label: "Cancelled", dot: "bg-gray-400" };
  if (isCheckedOut(booking)) return { label: "Checked out", dot: "bg-slate-500" };
  if (isCheckedIn(booking)) return { label: "In house", dot: "bg-emerald-500" };

  const checkIn = parseDay(booking?.checkIn);
  if (!checkIn) return { label: "Booked", dot: "bg-blue-500" };
  const today = startOfDay(new Date());
  const day = startOfDay(checkIn);
  if (day.getTime() === today.getTime()) {
    return { label: "Arriving today", dot: "bg-amber-500" };
  }
  if (day > today) return { label: "Upcoming", dot: "bg-blue-500" };
  return { label: "Not arrived", dot: "bg-red-500" };
};

export const isSameDay = (value, date = new Date()) => {
  const day = parseDay(value);
  return Boolean(day) && day.toDateString() === date.toDateString();
};

export const plural = (count, word) => `${count} ${word}${Number(count) === 1 ? "" : "s"}`;

// "12 Nov" for lists, where the year is usually obvious
export const shortDay = (value) => formatDay(value).replace(/ \d{4}$/, "");
