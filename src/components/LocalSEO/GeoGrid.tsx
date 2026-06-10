import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface GeoGridPoint {
  lat: number;
  lng: number;
  rank: number | null;
  row: number;
  col: number;
}

interface GeoGridProps {
  points: GeoGridPoint[];
  centerLat: number;
  centerLng: number;
  size: number;
}

function getRankStyle(rank: number | null): { fill: string; aura: string } {
  if (!rank)       return { fill: '#94a3b8', aura: 'rgba(148,163,184,0.3)' };
  if (rank <= 3)   return { fill: '#22c55e', aura: 'rgba(34,197,94,0.35)' };
  if (rank <= 6)   return { fill: '#84cc16', aura: 'rgba(132,204,22,0.3)' };
  if (rank <= 10)  return { fill: '#facc15', aura: 'rgba(250,204,21,0.3)' };
  if (rank <= 15)  return { fill: '#f97316', aura: 'rgba(249,115,22,0.3)' };
  return             { fill: '#ef4444', aura: 'rgba(239,68,68,0.35)' };
}

function makeIcon(rank: number | null, isCenter: boolean): L.DivIcon {
  const { fill, aura } = getRankStyle(rank);
  const label = rank === null ? '?' : rank >= 20 ? '20+' : String(rank);
  const s = isCenter ? 44 : 36;
  const fs = isCenter ? 13 : 11;
  const border = isCenter
    ? `border:2.5px solid white;box-shadow:0 0 0 2.5px ${fill};`
    : `border:1.5px solid white;`;

  const svg = `
    <svg width="${s+20}" height="${s+20}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${(s+20)/2}" cy="${(s+20)/2}" r="${(s+20)/2-1}" fill="${aura}"/>
      <circle cx="${(s+20)/2}" cy="${(s+20)/2}" r="${s/2}" fill="${fill}" style="${border}"/>
      <text x="${(s+20)/2}" y="${(s+20)/2+fs*0.38}"
        text-anchor="middle" font-size="${fs}" font-weight="600"
        fill="white" font-family="system-ui,sans-serif">${label}</text>
    </svg>`;

  return L.divIcon({
    html: `<div style="width:${s+20}px;height:${s+20}px;">${svg}</div>`,
    className: '',
    iconSize: [s+20, s+20],
    iconAnchor: [(s+20)/2, (s+20)/2],
  });
}

export const GeoGrid = ({ points, centerLat, centerLng, size }: GeoGridProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<L.Map | null>(null);
  const offset = Math.floor(size / 2);

  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;

    leafletRef.current = L.map(mapRef.current, {
      center: [centerLat, centerLng],
      zoom: 14,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(leafletRef.current);

    return () => {
      leafletRef.current?.remove();
      leafletRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!leafletRef.current || !points.length) return;
    const map = leafletRef.current;

    // Clear old markers
    map.eachLayer(l => { if (l instanceof L.Marker) map.removeLayer(l); });

    points.forEach(({ lat, lng, rank, row, col }) => {
      const isCenter = row === offset && col === offset;
      const icon = makeIcon(rank, isCenter);

      L.marker([lat, lng], { icon })
        .addTo(map)
        .bindPopup(`
          <strong>${isCenter ? '📍 Your Property' : `Rank #${rank ?? '?'}`}</strong><br/>
          Grid: [${row}, ${col}]<br/>
          ${lat.toFixed(5)}, ${lng.toFixed(5)}
        `);
    });
  }, [points]);

  return (
    <div style={{ width: '100%', height: '520px', borderRadius: 12, overflow: 'hidden' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};