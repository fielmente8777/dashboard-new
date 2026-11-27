// Number formats of the Meta pages, the same way the PDF report writes them.
const nf = new Intl.NumberFormat("en-IN");
const compactFormat = new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 });

export const count = (n) => nf.format(Math.round(Number(n) || 0));
export const compact = (n) => compactFormat.format(Number(n) || 0);

export const money = (value, currency = "INR", digits = 0) => {
  if (value == null || !Number.isFinite(Number(value))) return "—";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: digits,
      minimumFractionDigits: 0,
    }).format(Number(value));
  } catch {
    return `${currency} ${count(value)}`;
  }
};

/** cost of one result; small amounts keep paise so ₹3.40 per chat doesn't read ₹3 */
export const cost = (value, currency = "INR") =>
  value == null ? "—" : money(value, currency, Number(value) < 100 ? 2 : 0);

/** percent change against the period before, or undefined when there is nothing to compare */
export const growth = (now, before) => {
  if (before == null || !Number.isFinite(Number(before)) || Number(before) === 0) return undefined;
  return Math.round(((Number(now) - Number(before)) / Number(before)) * 100);
};

/** chats started + form leads: what a hotel calls an enquiry */
export const enquiries = (m) => (Number(m?.conversations) || 0) + (Number(m?.leads) || 0);

export const ago = (date) => {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(date).getTime()) / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return hours < 24 ? `${hours} h ago` : new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

/** a result as the hotel reads it: "740 conversations · ₹3.40 each" */
export const resultText = (result, currency) => {
  if (!result) return "—";
  const each = result.costPer == null ? "" : ` · ${cost(result.costPer, currency)}${result.per === 1000 ? " / 1K" : " each"}`;
  return `${count(result.count)} ${result.label}${each}`;
};

export const RANKING = {
  ABOVE_AVERAGE: { label: "Above average", tone: "green" },
  AVERAGE: { label: "Average", tone: "gray" },
  BELOW_AVERAGE: { label: "Below average", tone: "red" },
  UNKNOWN: { label: "—", tone: "gray" },
};

export const STATUS_TONE = { Active: "green", Paused: "gray", "In review": "amber", Rejected: "red", "Has issues": "amber" };
