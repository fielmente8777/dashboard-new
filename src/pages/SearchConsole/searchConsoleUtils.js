// What the Search Console page works out from the top searches that Google
// gives for the period (and for the same length of time just before it).
// A search row: { keyword, clicks, impressions, ctr (0-1), position }.

// clicks, impressions, CTR and the average position (weighted by impressions,
// as Google does) of a list of searches
export const totalsOf = (rows) => {
  const clicks = rows.reduce((sum, r) => sum + (r.clicks || 0), 0);
  const impressions = rows.reduce((sum, r) => sum + (r.impressions || 0), 0);
  const weighted = rows.reduce((sum, r) => sum + (r.position || 0) * (r.impressions || 0), 0);
  return {
    clicks,
    impressions,
    ctr: impressions ? (clicks / impressions) * 100 : 0,
    position: impressions ? weighted / impressions : 0,
  };
};

// percentage change; null when there was nothing before
export const changeOf = (now, before) => (before ? ((now - before) / before) * 100 : null);

// Where a position puts the site on Google: { label, tone }
export const positionBand = (position) => {
  if (!position) return { label: "—", tone: "gray" };
  if (position <= 3) return { label: "Top 3", tone: "green" };
  if (position <= 10) return { label: "Page 1", tone: "blue" };
  if (position <= 20) return { label: "Page 2", tone: "amber" };
  return { label: "Page 3+", tone: "gray" };
};

const key = (text) => String(text || "").trim().toLowerCase();

// each search with how it did in the period before (null = not in the top list then)
export const withPrevious = (rows, previousRows) => {
  const before = new Map(previousRows.map((r) => [key(r.keyword), r]));
  return rows.map((r) => {
    const p = before.get(key(r.keyword)) || null;
    return {
      ...r,
      previous: p,
      clicksChange: p ? changeOf(r.clicks, p.clicks) : null,
      // a lower position is better: positive = moved up
      positionGain: p && p.position && r.position ? p.position - r.position : null,
    };
  });
};

// words of the hotel's name that count as a "brand" search (3+ letters)
const brandWords = (hotelName) =>
  key(hotelName)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 3 && !["the", "and", "hotel", "resort", "resorts", "hotels", "stay", "villa"].includes(w));

export const isBrandSearch = (keyword, hotelName) => {
  const words = brandWords(hotelName);
  const text = key(keyword);
  return words.length > 0 && words.some((w) => text.includes(w));
};

// Plain-language findings, most useful first: { tone: good|attention|info, title, detail }
export const searchInsights = ({ rows, previousRows, totals, previousTotals, hotelName }) => {
  const out = [];
  if (!rows.length) return out;

  const clicksChange = changeOf(totals.clicks, previousTotals.clicks);
  if (clicksChange !== null && Math.abs(clicksChange) >= 10) {
    out.push({
      tone: clicksChange > 0 ? "good" : "attention",
      title: `Clicks from Google ${clicksChange > 0 ? "up" : "down"} ${Math.abs(clicksChange).toFixed(0)}%`,
      detail: `${totals.clicks.toLocaleString()} clicks from your top searches, against ${previousTotals.clicks.toLocaleString()} in the period before.`,
    });
  }

  // seen a lot, rarely clicked: the title / description on Google need work
  const lowCtr = rows
    .filter((r) => r.impressions >= 50 && r.ctr * 100 < 2)
    .sort((a, b) => b.impressions - a.impressions);
  if (lowCtr.length) {
    const r = lowCtr[0];
    out.push({
      tone: "attention",
      title: `Seen ${r.impressions.toLocaleString()} times, clicked ${r.clicks}: “${r.keyword}”`,
      detail: "Google shows your site for this search but few people click. A clearer page title and description (with price, location or offer) would win more clicks.",
    });
  }

  // nearly on page 1 / nearly top 3
  const almost = rows
    .filter((r) => r.position > 10 && r.position <= 20)
    .sort((a, b) => b.impressions - a.impressions);
  if (almost.length) {
    out.push({
      tone: "attention",
      title: `${almost.length} ${almost.length === 1 ? "search is" : "searches are"} just off page 1`,
      detail: `“${almost[0].keyword}” is at position ${almost[0].position.toFixed(1)}. A page written for this search, and links to it, can move it onto page 1, where most clicks happen.`,
    });
  }
  const nearTop = rows.filter((r) => r.position > 3 && r.position <= 10);
  if (nearTop.length) {
    out.push({
      tone: "info",
      title: `${nearTop.length} on page 1 but below the top 3`,
      detail: "The top 3 results take most of the clicks. Improving these pages is the quickest way to more visitors.",
    });
  }

  const best = [...rows].sort((a, b) => b.clicks - a.clicks)[0];
  if (best?.clicks) {
    out.push({
      tone: "good",
      title: `Best search: “${best.keyword}”`,
      detail: `${best.clicks.toLocaleString()} clicks at position ${best.position.toFixed(1)}.`,
    });
  }

  const brand = rows.filter((r) => isBrandSearch(r.keyword, hotelName));
  if (brand.length && totals.clicks) {
    const share = (brand.reduce((s, r) => s + r.clicks, 0) / totals.clicks) * 100;
    out.push({
      tone: share > 80 ? "attention" : "info",
      title: `${share.toFixed(0)}% of clicks are people searching your name`,
      detail:
        share > 80
          ? "Almost everyone already knew you. Pages for searches like “hotel in <your city>” or “resort near <place>” would bring new guests."
          : "A good mix: people who know you, and new guests finding you through general searches.",
    });
  }

  const before = new Set(previousRows.map((r) => key(r.keyword)));
  const fresh = previousRows.length ? rows.filter((r) => !before.has(key(r.keyword))) : [];
  if (fresh.length) {
    out.push({
      tone: "info",
      title: `New in your top searches: ${fresh.slice(0, 3).map((r) => `“${r.keyword}”`).join(", ")}`,
      detail: "These were not among your top searches in the period before.",
    });
  }
  return out;
};
