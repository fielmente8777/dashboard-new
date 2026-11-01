export { timeAgo } from "../../utils/relativeTime";

// "45 min", "2 h 10 min", "3 d"
export const formatDuration = (minutes) => {
  if (minutes < 60) return `${Math.max(1, minutes)} min`;
  const hours = Math.floor(minutes / 60);
  if (hours >= 24) return `${Math.floor(hours / 24)} d`;
  const rest = minutes % 60;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
};

// "1 Nov, 2:45 pm"
export const formatDateTime = (date) =>
  date
    ? new Date(date).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";

export const minutesSince = (date, now = Date.now()) =>
  date ? Math.floor((now - new Date(date).getTime()) / 60_000) : 0;

export const isToday = (date) =>
  Boolean(date) && new Date(date).toDateString() === new Date().toDateString();

// a phone number as stored (country code, no "+") -> digits only
export const phoneDigits = (phone) => String(phone || "").replace(/\D/g, "");
