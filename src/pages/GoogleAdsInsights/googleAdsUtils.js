import {
  addDays,
  parseISODate,
  presetRange,
  toISODate,
} from "../../utils/datePresets";

export const ALL = "all";

const nf = new Intl.NumberFormat("en-IN");
const compact = new Intl.NumberFormat("en-IN", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export const formatNumber = (n) => nf.format(Math.round(n || 0));
export const formatCompact = (n) => compact.format(n || 0);
export const formatCurrency = (n) =>
  `₹${nf.format(Number((n || 0).toFixed(2)))}`;
export const formatCurrencyCompact = (n) => `₹${compact.format(n || 0)}`;
export const formatPercent = (n) => `${((n || 0) * 100).toFixed(2)}%`;
export const formatRoas = (n) => `${(n || 0).toFixed(2)}×`;

// change against the previous period, in % (null when there is nothing to compare)
export const percentChange = (current, previous) =>
  previous ? +(((current - previous) / previous) * 100).toFixed(1) : null;

// The same number of days just before `range`, to compare against.
export const previousRange = ({ start, end }) => {
  const days = Math.round(
    (parseISODate(end) - parseISODate(start)) / 86_400_000,
  );
  const prevEnd = addDays(parseISODate(start), -1);
  return { start: toISODate(addDays(prevEnd, -days)), end: toISODate(prevEnd) };
};

// Sync always pulls the last 90 days, whatever range is on screen.
export const syncRange = () => presetRange("last90");

// Google's device codes
export const DEVICES = {
  2: "Mobile",
  3: "Tablet",
  4: "Desktop",
  5: "Smart TV",
  6: "Other",
};

// what the numbers are for: an ad, a campaign or the whole account
export const resolveTarget = ({ account, campaign, ad }) => {
  if (ad !== ALL) return { entityId: ad, level: "ad" };
  if (campaign !== ALL) return { entityId: campaign, level: "campaign" };
  return { entityId: account, level: "account" };
};

export const hasMetrics = (totals) =>
  Boolean(totals && (totals.clicks || totals.cost || totals.impressions));
