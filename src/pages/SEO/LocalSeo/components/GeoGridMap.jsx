import L from "leaflet";
import { useEffect, useRef } from "react";
import { createMap, escapeHtml, labelIcon } from "../leafletMap";
import { parseRank, rankBand } from "../localSeoUtils";

// The geo-grid: your Maps rank at each point of a grid around the property.
// points: [{ lat, lng, rank, row, col }]; the middle cell is the property.
const GeoGridMap = ({ points, center, gridSize = 5, businessName, place }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const [lat, lng] = center;

  // the map itself: rebuilt when the property moves
  useEffect(() => {
    const map = createMap(containerRef.current, { center: [lat, lng] });
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, [lat, lng]);

  // the markers: redrawn when the scan results change
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();

    const middle = Math.floor(gridSize / 2);
    points.forEach((point) => {
      const pointLat = Number(point?.lat);
      const pointLng = Number(point?.lng);
      if (Number.isNaN(pointLat) || Number.isNaN(pointLng)) return;

      const rank = parseRank(point.rank);
      const band = rankBand(rank);
      const isCenter = Number(point.row) === middle && Number(point.col) === middle;
      const text = rank == null ? "–" : rank >= 20 ? "20+" : rank;

      const title = isCenter
        ? escapeHtml(businessName || "Your property")
        : rank == null
          ? "Not in the top 20"
          : `Rank #${rank}`;
      const subtitle = isCenter ? escapeHtml(place) : band.label;

      L.marker([pointLat, pointLng], {
        icon: labelIcon({
          text,
          color: band.color,
          size: isCenter ? 44 : rank != null && rank <= 3 ? 36 : 30,
          ring: isCenter,
          muted: rank == null,
        }),
        zIndexOffset: isCenter ? 1000 : 0,
      })
        .bindPopup(
          `<div class="local-seo-popup__title">${title}</div>
           <div class="local-seo-popup__meta">${subtitle}<br/>${pointLat.toFixed(4)}, ${pointLng.toFixed(4)}</div>`,
          { className: "local-seo-popup", closeButton: false },
        )
        .addTo(layer);
    });
  }, [points, gridSize, businessName, place, lat, lng]);

  return <div ref={containerRef} className="size-full" />;
};

export default GeoGridMap;
