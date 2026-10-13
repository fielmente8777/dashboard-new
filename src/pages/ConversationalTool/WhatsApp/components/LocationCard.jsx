import { ExternalLink, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Icon from "../../../../components/ui/Icon";
import {
  createMap,
  googleMapsKeylessEmbedUrl,
  googleMapsLink,
  useGoogleMaps,
} from "../../../../utils/googleMaps";

// A shared location in the chat: small Google map with a pin, the place
// name and "Open in Google Maps". Used for WhatsApp "location" messages and
// for text messages that only carry a Google Maps link.
// The map is created only when the card scrolls into view (long chats).
const LocationCard = ({ latitude, longitude, name, address }) => {
  const { isLoaded, loadError } = useGoogleMaps();
  const containerRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const lat = Number(latitude);
  const lng = Number(longitude);
  const valid = !Number.isNaN(lat) && !Number.isNaN(lng);

  // wait until the card is on screen
  useEffect(() => {
    const element = containerRef.current;
    if (!element || visible) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { rootMargin: "200px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [visible]);

  useEffect(() => {
    if (!isLoaded || loadError || !visible || !valid) return;
    const { map, destroy } = createMap(containerRef.current, {
      center: [lat, lng],
      zoom: 16,
    });
    map.setOptions({ disableDefaultUI: true, zoomControl: true });
    const marker = new window.google.maps.Marker({ map, position: { lat, lng } });
    return () => {
      marker.setMap(null);
      destroy();
    };
  }, [isLoaded, loadError, visible, valid, lat, lng]);

  if (!valid) return null;

  return (
    <div className="w-64 max-w-full overflow-hidden rounded-lg border border-app-border! bg-app-surface-secondary">
      <div className="relative aspect-[4/3] w-full">
        {loadError ? (
          // key refused / blocked: Google's keyless map instead of an error
          <iframe
            title="Location"
            loading="lazy"
            src={googleMapsKeylessEmbedUrl(lat, lng)}
            className="size-full border-0"
          />
        ) : (
          <div ref={containerRef} className="size-full" />
        )}
        {!loadError && (!isLoaded || !visible) && (
          <div className="absolute inset-0 flex items-center justify-center text-app-text-faint">
            <Icon icon={MapPin} size="xl" className="animate-pulse" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 px-2.5 py-2">
        <Icon icon={MapPin} size="sm" className="shrink-0 text-red-500" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-app-text">
            {name || "Location"}
          </p>
          {address && (
            <p className="truncate text-xs text-app-text-muted">{address}</p>
          )}
        </div>
        <a
          href={googleMapsLink(lat, lng)}
          target="_blank"
          rel="noopener noreferrer"
          title="Open in Google Maps"
          className="flex shrink-0 items-center gap-1 text-xs font-medium text-blue-500 hover:underline"
        >
          Open <Icon icon={ExternalLink} size="xs" />
        </a>
      </div>
    </div>
  );
};

export default LocationCard;
