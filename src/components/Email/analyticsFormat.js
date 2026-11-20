// Numbers and labels shared by the Performance card and a campaign's Report.

export const TIME_ZONE = (() => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
})();

export const pct = (part, whole) => (whole > 0 ? (part / whole) * 100 : 0);
export const fmtPct = (value) => `${value >= 10 || value === 0 ? value.toFixed(0) : value.toFixed(1)}%`;

// a round top for the y axis: 9,966 -> 10,000
export const niceMax = (value) => {
  if (value <= 4) return 4;
  const step = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / step) * step;
};
export const shortNumber = (n) => (n >= 1000 ? `${+(n / 1000).toFixed(1)}k` : String(n));

export const dayLabel = (key, long) =>
  new Date(`${key.slice(0, 10)}T00:00:00`).toLocaleDateString(
    "en-IN",
    long ? { weekday: "short", day: "numeric", month: "short" } : { day: "numeric", month: "short" },
  );
const hourLabel = (key) => {
  const hour = Number(key.slice(11, 13));
  return `${hour % 12 || 12}${hour < 12 ? " am" : " pm"}`;
};

// "2026-11-17" / "2026-11-17 14" -> "17 Nov" / "2 pm"; long adds the weekday (and the day to an hour)
export const bucketLabel = (key, unit, long = false) => {
  if (unit !== "hour") return dayLabel(key, long);
  return long ? `${dayLabel(key, true)}, ${hourLabel(key)}` : hourLabel(key);
};
