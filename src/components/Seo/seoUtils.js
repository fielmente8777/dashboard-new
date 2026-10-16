import { getApiErrorMessage } from "../../redux/api/baseApi";

// Helpers shared by the Local SEO and Website SEO pages.

export const fmt = (n) => (n == null ? "—" : Number(n).toLocaleString());
export const fmtCurrency = (n) => (n == null ? "—" : `₹${Number(n).toFixed(2)}`);
export const fmtRank = (n) => (n == null ? "—" : `#${Number(n).toFixed(1).replace(/\.0$/, "")}`);

export const formatDate = (date, options = { day: "numeric", month: "short" }) =>
  date ? new Date(date).toLocaleDateString("en-IN", options) : "";

// "hotel in a, best hotel b" (lines or commas) -> unique, lower-case keywords
export const parseKeywordList = (text) => [
  ...new Set(
    text
      .split(/[\n,]/)
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean),
  ),
];

// A 402 means the account ran out of SEO credits; say how many are missing.
export const seoErrorMessage = (error, fallback) => {
  if (error?.status === 402 && error.data?.required != null) {
    return `Not enough credits: this needs ${error.data.required}, you have ${error.data.available ?? 0}.`;
  }
  return getApiErrorMessage(error, fallback);
};

// bands: [{ max, label, tone, color }], lowest max first -> rank => its band
export const bandOf = (bands, unranked) => (rank) =>
  rank == null ? unranked : bands.find((band) => rank <= band.max);
