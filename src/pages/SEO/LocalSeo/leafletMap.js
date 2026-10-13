import L from "leaflet";

// CARTO's light base map. Their dark style now asks for an API key, so in
// dark mode the same tiles are inverted with CSS (see .local-seo-map in
// index.css) instead.
const TILES = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

export const createMap = (element, { center, zoom = 13 }) => {
  const map = L.map(element, { center, zoom, zoomControl: true });
  L.tileLayer(TILES, {
    attribution: "&copy; OSM &copy; CARTO",
    subdomains: "abcd",
    maxZoom: 20,
  }).addTo(map);

  // the container keeps resizing while the page lays out (and with the
  // window); without this the tiles stop short of the edge
  const observer = new ResizeObserver(() => map.invalidateSize());
  observer.observe(element);
  map.on("unload", () => observer.disconnect());
  return map;
};

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
// text that goes into marker / popup HTML
export const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (ch) => ESCAPES[ch]);

// A round pin with text inside, drawn in HTML so it scales with the label.
export const labelIcon = ({ text, color, size, ring = false, muted = false }) =>
  L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:9999px;
      display:flex;align-items:center;justify-content:center;
      background:${color};opacity:${muted ? 0.55 : 1};
      color:#fff;font:700 ${size > 36 ? 13 : 11}px/1 system-ui,sans-serif;
      border:${ring ? 3 : 2}px solid #fff;
      box-shadow:0 0 0 ${ring ? 6 : 4}px ${color}33,0 2px 6px rgba(0,0,0,.25);
    ">${escapeHtml(text)}</div>`,
  });

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
