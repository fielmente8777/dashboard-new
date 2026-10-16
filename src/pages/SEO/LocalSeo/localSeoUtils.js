import { Crown, Lightbulb, MapPinned, Rocket, Shield, Sparkles, Target } from "lucide-react";
import { bandOf, fmt, fmtRank } from "../../../components/Seo/seoUtils";

export * from "../../../components/Seo/seoUtils";

export const RADIUS_OPTIONS = [2, 5, 10];

export const BUSINESS_TYPES = [
  "hotel",
  "resort",
  "hostel",
  "homestay",
  "villa",
  "retreat",
  "glamping",
];

// Where a Maps rank sits. One scale for the table, the detail panel, the map
// and its legend, so a colour always means the same thing on this page.
export const RANK_BANDS = [
  { max: 3, label: "Top 3", tone: "green", color: "#16a34a" },
  { max: 7, label: "4 – 7", tone: "sky", color: "#0ea5e9" },
  { max: 15, label: "8 – 15", tone: "amber", color: "#f59e0b" },
  { max: Infinity, label: "16+", tone: "red", color: "#ef4444" },
];
export const UNRANKED = { label: "Not ranked", tone: "gray", color: "#94a3b8" };

export const rankBand = bandOf(RANK_BANDS, UNRANKED);

// a rank from the API may be a number, a numeric string or empty
export const parseRank = (value) => {
  if (value === null || value === undefined || String(value) === "") return null;
  const rank = Number(value);
  return Number.isNaN(rank) ? null : rank;
};

// what the action badge on a keyword means, and the advice shown for it
export const ACTIONS = {
  TARGET: {
    label: "Target",
    tone: "green",
    icon: Target,
    tip: "Strong opportunity: build a dedicated page and a Google Business Profile service entry for this term.",
  },
  OPTIMIZE: {
    label: "Optimize",
    tone: "amber",
    icon: Lightbulb,
    tip: "Tighten on-page targeting and earn 2–3 local citations to climb into the pack.",
  },
  DEFEND: {
    label: "Defend",
    tone: "sky",
    icon: Crown,
    tip: "Hold your position: keep your Business Profile fresh with new photos, posts and review replies every week.",
  },
  RESEARCH: {
    label: "Research",
    tone: "gray",
    icon: Sparkles,
    tip: "Check the intent and volume before investing; low priority for now.",
  },
};
export const actionFor = (type) => ACTIONS[type] || ACTIONS.RESEARCH;

// The headline numbers of the tracked keywords.
export const summarizeKeywords = (keywords) => {
  const ranked = keywords.filter((k) => k.liveGmbRank != null);
  const inPack = ranked.filter((k) => k.liveGmbRank <= 3).length;
  const avgMaps = ranked.length
    ? +(ranked.reduce((sum, k) => sum + k.liveGmbRank, 0) / ranked.length).toFixed(1)
    : null;

  return {
    inPack,
    ranked: ranked.length,
    avgMaps,
    visibility: keywords.length ? (inPack / keywords.length) * 100 : 0,
  };
};

// Up to three plain-language tips worked out from the keywords. `parts` is
// text mixed with { strong } pieces, so the card can highlight the numbers.
export const buildInsights = (keywords) => {
  const insights = [];
  const byVolume = (a, b) => (b.searchVolume ?? 0) - (a.searchVolume ?? 0);

  const missing = keywords
    .filter((k) => (k.searchVolume ?? 0) >= 30 && (k.liveGmbRank == null || k.liveGmbRank > 3))
    .sort(byVolume)[0];
  if (missing) {
    insights.push({
      icon: MapPinned,
      chip: "Local opportunity",
      title: "You're missing the Map Pack",
      parts: [
        { strong: `"${missing.keyword}"` },
        " gets about ",
        { strong: fmt(missing.searchVolume) },
        " searches a month locally, but you're not in the top 3 on Maps.",
      ],
    });
  }

  const close = keywords
    .filter((k) => k.liveOrganicRank != null && k.liveOrganicRank > 3 && k.liveOrganicRank <= 10)
    .sort((a, b) => a.liveOrganicRank - b.liveOrganicRank)[0];
  if (close) {
    insights.push({
      icon: Rocket,
      chip: "Almost there",
      title: "One push from the top 3",
      parts: [
        "You rank ",
        { strong: fmtRank(close.liveOrganicRank) },
        " in search for ",
        { strong: `"${close.keyword}"` },
        ". A few quality links could move you into the top spots.",
      ],
    });
  }

  const defend = keywords
    .filter((k) => k.liveGmbRank != null && k.liveGmbRank <= 3)
    .sort(byVolume)[0];
  if (defend) {
    insights.push({
      icon: Shield,
      chip: "Defend",
      title: "Protect your Map Pack spot",
      parts: [
        "You hold ",
        { strong: fmtRank(defend.liveGmbRank) },
        " on Maps for ",
        { strong: `"${defend.keyword}"` },
        ". Keep the reviews coming.",
      ],
    });
  }

  return insights;
};
