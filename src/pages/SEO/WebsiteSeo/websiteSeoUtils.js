import { bandOf } from "../../../components/Seo/seoUtils";

export const COUNTRIES = [
  { value: "IN", label: "India" },
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "AE", label: "UAE" },
  { value: "AU", label: "Australia" },
  { value: "CA", label: "Canada" },
  { value: "WORLD", label: "Worldwide" },
];

// Google search positions: top 3, rest of page 1, page 2, further down.
export const ORGANIC_BANDS = [
  { max: 3, label: "Top 3", tone: "green", color: "#16a34a" },
  { max: 10, label: "4 – 10", tone: "sky", color: "#0ea5e9" },
  { max: 20, label: "11 – 20", tone: "amber", color: "#f59e0b" },
  { max: Infinity, label: "21+", tone: "red", color: "#ef4444" },
];
export const NOT_RANKED = { label: "Not ranked", tone: "gray", color: "#94a3b8" };

export const organicBand = bandOf(ORGANIC_BANDS, NOT_RANKED);

export const websiteHref = (url) => (/^https?:\/\//i.test(url) ? url : `https://${url}`);

// keywords tracked against the website (the rest belong to Local SEO)
export const isWebsiteKeyword = (keyword) => Boolean(keyword.targetUrl);

export const summarizeRankings = (keywords) => {
  const ranked = keywords.filter((k) => k.liveOrganicRank != null);
  return {
    top3: ranked.filter((k) => k.liveOrganicRank <= 3).length,
    page1: ranked.filter((k) => k.liveOrganicRank <= 10).length,
    avg: ranked.length
      ? ranked.reduce((sum, k) => sum + k.liveOrganicRank, 0) / ranked.length
      : null,
    volume: keywords.reduce((sum, k) => sum + (k.searchVolume || 0), 0),
  };
};

// Ranked just below the top 3 (4–20), biggest search volume first: the
// keywords where a little work pays off most.
export const findOpportunities = (keywords, limit = 5) =>
  keywords
    .filter((k) => k.liveOrganicRank > 3 && k.liveOrganicRank <= 20)
    .sort((a, b) => (b.searchVolume ?? 0) - (a.searchVolume ?? 0))
    .slice(0, limit);
