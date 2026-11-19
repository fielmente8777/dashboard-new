import { useEffect, useRef } from "react";
import { useGoogleMaps } from "../../../../utils/googleMaps";
import { createMap, escapeHtml, labelIcon } from "../googleMap";
import { parseRank, rankBand } from "../localSeoUtils";
import MapStatus from "./MapStatus";

// The geo-grid: your Maps rank at each point of a grid around the property.
// points: [{ lat, lng, rank, row, col }]; the middle cell is the property.
const GeoGridMap = ({ points, center, gridSize = 5, businessName, place }) => {
  const { isLoaded, loadError } = useGoogleMaps();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const popupRef = useRef(null);
  const [lat, lng] = center;

  const clearMarkers = () => {
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
  };

  // the map itself: rebuilt when the property moves
  useEffect(() => {
    if (!isLoaded) return;
    const { map, destroy } = createMap(containerRef.current, { center: [lat, lng] });
    popupRef.current = new window.google.maps.InfoWindow();
    mapRef.current = map;
    return () => {
      clearMarkers();
      popupRef.current?.close();
      destroy();
      mapRef.current = null;
      popupRef.current = null;
    };
  }, [isLoaded, lat, lng]);

  // the markers: redrawn when the scan results change
  useEffect(() => {
    const map = mapRef.current;
    if (!isLoaded || !map) return;
    clearMarkers();

    const middle = Math.floor(gridSize / 2);
    points.forEach((point) => {
      const pointLat = Number(point?.lat);
      const pointLng = Number(point?.lng);
      if (Number.isNaN(pointLat) || Number.isNaN(pointLng)) return;

      const rank = parseRank(point.rank);
      const band = rankBand(rank);
      const isCenter = Number(point.row) === middle && Number(point.col) === middle;
      const text = rank == null ? "–" : rank >= 20 ? "20+" : String(rank);

      const title = isCenter
        ? escapeHtml(businessName || "Your property")
        : rank == null
          ? "Not in the top 20"
          : `Rank #${rank}`;
      const subtitle = isCenter ? escapeHtml(place) : band.label;

      const marker = new window.google.maps.Marker({
        map,
        position: { lat: pointLat, lng: pointLng },
        icon: labelIcon({
          text,
          color: band.color,
          size: isCenter ? 44 : rank != null && rank <= 3 ? 36 : 30,
          ring: isCenter,
          muted: rank == null,
        }),
        zIndex: isCenter ? 1000 : 1,
      });

      marker.addListener("click", () => {
        popupRef.current?.setContent(
          `<div class="local-seo-popup__title">${title}</div>
           <div class="local-seo-popup__meta">${subtitle}<br/>${pointLat.toFixed(4)}, ${pointLng.toFixed(4)}</div>`,
        );
        popupRef.current?.open({ anchor: marker, map });
      });

      markersRef.current.push(marker);
    });
  }, [isLoaded, points, gridSize, businessName, place, lat, lng]);

  return (
    <div className="relative size-full">
      <div ref={containerRef} className="size-full" />
      {(!isLoaded || loadError) && <MapStatus loadError={loadError} />}
    </div>
  );
};

export default GeoGridMap;
