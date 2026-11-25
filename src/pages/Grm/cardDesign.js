import { GRM_SITE_URL } from "../../config/env";
import { CARD_DESIGNS, CARD_PALETTES } from "./printCard";

const hostnameOf = (value) => {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
};

const FOOTNOTE = "Point your phone camera at the code";

// The words a card starts with, from the link the code opens. Anything the
// team types replaces these (see useCardDesign).
export const defaultCardContent = (link, hotelName) => {
  const base = { eyebrow: "Welcome to", title: hotelName, footnote: FOOTNOTE, poweredBy: true };
  if (!link) return { ...base, headline: "", caption: "" };

  if (link.startsWith(GRM_SITE_URL)) {
    return { ...base, headline: "Scan to request services", caption: "Housekeeping, room service, amenities & more" };
  }

  const host = hostnameOf(link);
  const onPlay = host === "play.google.com";
  const onAppStore = host === "apps.apple.com";
  if (onPlay || onAppStore) {
    const eazotelApp = link.includes("com.eazotel.app");
    return {
      ...base,
      eyebrow: eazotelApp ? "Download the" : "Get our app",
      title: eazotelApp ? "Eazotel App" : hotelName,
      headline: "Scan to download",
      caption: onPlay ? "Free on Google Play" : "Free on the App Store",
      footnote: "Open your camera and point it at the code",
    };
  }
  return { ...base, headline: "Scan to open", caption: host };
};

export const CARD_TEXT_FIELDS = [
  { key: "eyebrow", label: "Top line", placeholder: "Welcome to", max: 40 },
  { key: "title", label: "Title", placeholder: "Your hotel or app name", max: 48 },
  { key: "headline", label: "Headline", placeholder: "Scan to open", max: 48 },
  { key: "caption", label: "Line under the headline", placeholder: "What the code opens", max: 70 },
  { key: "footnote", label: "Bottom note", placeholder: "Point your phone camera at the code", max: 60 },
];

// what the team chose for the card of one hotel location, kept in this browser
const designKey = (hid) => `qr-card:${hid}`;

export const readCardDesign = (hid) => {
  try {
    const saved = JSON.parse(localStorage.getItem(designKey(hid)) || "{}");
    return {
      design: CARD_DESIGNS.some((d) => d.key === saved.design) ? saved.design : "classic",
      palette: CARD_PALETTES.some((p) => p.key === saved.palette) ? saved.palette : "eazotel",
      // texts typed by the team, per link (a new link starts from its own defaults)
      overrides: saved.overrides && typeof saved.overrides === "object" ? saved.overrides : {},
    };
  } catch {
    return { design: "classic", palette: "eazotel", overrides: {} };
  }
};

export const saveCardDesign = (hid, value) => {
  try {
    localStorage.setItem(designKey(hid), JSON.stringify(value));
  } catch {
    // storage full or blocked: the choice lasts until the page is closed
  }
};
