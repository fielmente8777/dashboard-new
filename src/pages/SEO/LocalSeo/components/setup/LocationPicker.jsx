import L from "leaflet";
import { LocateFixed, MousePointerClick } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Button from "../../../../../components/ui/Button";
import Icon from "../../../../../components/ui/Icon";
import { GEOCODING_API_URL } from "../../../../../config/env";
import { createMap, labelIcon, reverseGeocode } from "../../leafletMap";

const DEFAULT_CENTER = [28.6139, 77.209]; // New Delhi

// Pin the property on a map (click, or use the device's location).
// Calls onPick({ lat, lng }) right away and onAddress({ city, ... }) once
// the place name has been looked up.
const LocationPicker = ({ lat, lng, onPick, onAddress }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const hasPin = lat !== "" && lng !== "";

  // latest callbacks, so the map's click handler never goes stale
  const handlers = useRef({ onPick, onAddress });
  handlers.current = { onPick, onAddress };

  const pick = (pickedLat, pickedLng) => {
    setError("");
    handlers.current.onPick({ lat: pickedLat.toFixed(6), lng: pickedLng.toFixed(6) });
    reverseGeocode(GEOCODING_API_URL, pickedLat, pickedLng)
      .then((address) => handlers.current.onAddress(address))
      .catch(() => {});
  };
  const pickRef = useRef(pick);
  pickRef.current = pick;

  useEffect(() => {
    const start = hasPin ? [Number(lat), Number(lng)] : DEFAULT_CENTER;
    const map = createMap(containerRef.current, { center: start });
    const marker = L.marker(start, {
      icon: labelIcon({ text: "", color: "#2563eb", size: 20, ring: true }),
      opacity: hasPin ? 1 : 0,
    }).addTo(map);

    map.on("click", (e) => pickRef.current(e.latlng.lat, e.latlng.lng));
    mapRef.current = map;
    markerRef.current = marker;
    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // the map is built once; the pin follows below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep the pin on the typed / picked coordinates
  useEffect(() => {
    const position = [Number(lat), Number(lng)];
    if (!hasPin || position.some(Number.isNaN)) return;
    markerRef.current?.setLatLng(position).setOpacity(1);
  }, [lat, lng, hasPin]);

  const locate = () => {
    if (!navigator.geolocation) {
      setError("Your browser can't share its location. Click on the map instead.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false);
        mapRef.current?.setView([coords.latitude, coords.longitude], 15);
        pick(coords.latitude, coords.longitude);
      },
      () => {
        setLocating(false);
        setError("Couldn't get your location. Click on the map or type the coordinates.");
      },
    );
  };

  return (
    <div className="space-y-2">
      <div className="local-seo-map relative h-64 overflow-hidden rounded-lg border border-app-border! bg-app-surface-secondary">
        <div ref={containerRef} className="size-full cursor-crosshair" />
        {!hasPin && (
          <div className="pointer-events-none absolute inset-x-0 top-3 z-[1000] flex justify-center">
            <span className="flex items-center gap-1.5 rounded-full bg-app-surface px-3 py-1.5 text-xs font-medium text-app-text shadow">
              <Icon icon={MousePointerClick} size="sm" tone="primary" />
              Click your property on the map
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-app-text-muted">
          City, area and state fill in from the pin.
        </p>
        <Button size="sm" variant="secondary" icon={LocateFixed} loading={locating} onClick={locate}>
          Use my location
        </Button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default LocationPicker;
