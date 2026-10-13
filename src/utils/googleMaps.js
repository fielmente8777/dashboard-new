import { useJsApiLoader } from "@react-google-maps/api";
import { useEffect, useState } from "react";
import { GOOGLE_MAPS_API_KEY } from "../config/env";

// Same id + libraries everywhere, so the Maps script is loaded only once.
const LIBRARIES = [];

// Google calls window.gm_authFailure when the key is refused (API not
// enabled, site not allowed ...). The script still "loads" then, so we
// remember it and report it as a load error.
let authFailed = false;
const authListeners = new Set();
if (typeof window !== "undefined") {
  const previous = window.gm_authFailure;
  window.gm_authFailure = () => {
    authFailed = true;
    authListeners.forEach((notify) => notify());
    previous?.();
  };
}

// { isLoaded, loadError } for the Google Maps JavaScript API
export const useGoogleMaps = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "eazotel-google-maps",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });
  const [refused, setRefused] = useState(authFailed);

  useEffect(() => {
    const notify = () => setRefused(true);
    authListeners.add(notify);
    return () => authListeners.delete(notify);
  }, []);

  return {
    isLoaded,
    loadError: loadError || (refused ? new Error("Google Maps key was refused") : null),
  };
};

// Small map for an <iframe> (Maps Embed API)
export const googleMapsEmbedUrl = (latitude, longitude, zoom = 17) =>
  `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${latitude},${longitude}&zoom=${zoom}`;

// Same small map without any key (backup when the key is refused)
export const googleMapsKeylessEmbedUrl = (latitude, longitude, zoom = 16) =>
  `https://www.google.com/maps?q=${latitude},${longitude}&z=${zoom}&output=embed`;

// Opens the place in Google Maps (new tab / app)
export const googleMapsLink = (latitude, longitude) =>
  `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

// A Google Maps link inside a text message, e.g.
//   "📍 My location\nhttps://maps.google.com/?q=28.63,78.53"
//   https://www.google.com/maps?q=..  /maps/search/?api=1&query=..  /maps/@28.6,77.2,17z
// -> { latitude, longitude, label: "My location" }  (null if none)
const MAPS_LINK =
  /https?:\/\/(?:www\.)?(?:maps\.google\.[a-z.]+|google\.[a-z.]+\/maps)\S*?(?:[?&](?:q|query|ll)=|@)(-?\d{1,2}(?:\.\d+)?),\s*(-?\d{1,3}(?:\.\d+)?)\S*/i;

export const findLocationInText = (text) => {
  const match = String(text || "").match(MAPS_LINK);
  if (!match) return null;

  const latitude = Number(match[1]);
  const longitude = Number(match[2]);
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;

  const label = text
    .replace(match[0], "")
    .replace(/📍/g, "")
    .trim();

  return { latitude, longitude, label };
};

// ------------------------------------------------------------------
// A Google map in an element (Maps JavaScript API must be loaded).
// ------------------------------------------------------------------

// Google's dark style, used while the app is in dark mode
const DARK_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
  { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
  { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
];

const isDark = () => document.documentElement.classList.contains("dark");

// center: [lat, lng]. Returns { map, destroy }.
export const createMap = (element, { center, zoom = 13, gestureHandling = "cooperative" }) => {
  const { maps } = window.google;
  const map = new maps.Map(element, {
    center: { lat: center[0], lng: center[1] },
    zoom,
    gestureHandling,
    clickableIcons: false,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    styles: isDark() ? DARK_STYLES : null,
  });

  // follow the app's light / dark switch
  const observer = new MutationObserver(() =>
    map.setOptions({ styles: isDark() ? DARK_STYLES : null }),
  );
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

  return {
    map,
    destroy: () => {
      observer.disconnect();
      maps.event.clearInstanceListeners(map);
    },
  };
};

