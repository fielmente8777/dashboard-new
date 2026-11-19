// Google Maps helpers for the Local SEO maps (geo-grid + setup picker).
// The Maps script itself is loaded by useGoogleMaps (utils/googleMaps).

// map setup (light / dark) is shared with the WhatsApp chat
export { createMap } from "../../../utils/googleMaps";

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
// text that goes into marker / popup HTML
export const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (ch) => ESCAPES[ch]);

// A round pin with text inside (marker icon), same look as before:
// coloured circle, white border and a soft halo.
export const labelIcon = ({ text, color, size, ring = false, muted = false }) => {
  const { maps } = window.google;
  const halo = ring ? 6 : 4;
  const border = ring ? 3 : 2;
  const full = size + halo * 2;
  const c = full / 2;
  const font = size > 36 ? 13 : 11;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${full}" height="${full}">
    <g opacity="${muted ? 0.55 : 1}">
      <circle cx="${c}" cy="${c}" r="${c}" fill="${color}" fill-opacity="0.2"/>
      <circle cx="${c}" cy="${c}" r="${size / 2 - border / 2}" fill="${color}" stroke="#fff" stroke-width="${border}"/>
      ${text === "" ? "" : `<text x="${c}" y="${c}" dy="0.35em" text-anchor="middle" font-family="system-ui,sans-serif" font-size="${font}" font-weight="700" fill="#fff">${escapeHtml(text)}</text>`}
    </g>
  </svg>`;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new maps.Size(full, full),
    anchor: new maps.Point(c, c),
  };
};

// coordinates -> { city, district, state, pincode } (OpenStreetMap)
export const reverseGeocode = async (baseUrl, lat, lng) => {
  const response = await fetch(
    `${baseUrl}/reverse?lat=${lat}&lon=${lng}&format=json&zoom=14`,
  );
  const address = (await response.json())?.address || {};
  return {
    city: address.city || address.town || address.county || "",
    district:
      address.suburb ||
      address.neighbourhood ||
      address.city_district ||
      address.county ||
      "",
    state: address.state || "",
    pincode: address.postcode || "",
  };
};
