import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import { NODE_BASE_URL } from "../../data/constant";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import {
  Search, TrendingUp, Target, Crown, Lightbulb, Sparkles,
  Plus, X, RefreshCw, Loader2, IndianRupee, BarChart3, Trophy,
  Trash2, Hash, ChevronDown, MapPin, MapPinned, Navigation,
  Crosshair, Globe, Shield, Rocket, ArrowRight, Activity,
  Zap, Building,
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface GeoGridPoint {
  lat: number;
  lng: number;
  rank: number | null;
  row: number;
  col: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const BADGE_CONFIG: Record<string, { label: string; cls: string; Icon: React.ComponentType<{ className?: string }> }> = {
  TARGET:   { label: "Target",   cls: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/25", Icon: Target },
  OPTIMIZE: { label: "Optimize", cls: "bg-amber-400/10 text-amber-300 ring-amber-400/25",       Icon: Lightbulb },
  DEFEND:   { label: "Defend",   cls: "bg-teal-400/10 text-teal-300 ring-teal-400/25",          Icon: Crown },
  RESEARCH: { label: "Research", cls: "bg-zinc-400/10 text-zinc-300 ring-zinc-400/20",          Icon: Sparkles },
};

const fmt         = (n: any) => (n == null ? "—" : Number(n).toLocaleString());
const fmtCurrency = (n: any) => (n == null ? "—" : `₹${Number(n).toFixed(2)}`);
const fmtRank     = (n: any) => (n == null ? "—" : `#${Number(n).toFixed(1)}`);

const rankTone = (rank: number | null | undefined) => {
  if (rank == null) return { text: "text-zinc-500", dot: "bg-zinc-600", cell: "bg-zinc-800 text-zinc-500", label: "Not ranked" };
  if (rank <= 3)    return { text: "text-emerald-300", dot: "bg-emerald-400", cell: "bg-emerald-500 text-emerald-950", label: "Top 3" };
  if (rank <= 7)    return { text: "text-teal-300",    dot: "bg-teal-400",    cell: "bg-teal-500 text-teal-950",      label: "Top 7" };
  if (rank <= 15)   return { text: "text-amber-300",   dot: "bg-amber-400",   cell: "bg-amber-500 text-amber-950",    label: "Page 1–2" };
  return                   { text: "text-rose-300",    dot: "bg-rose-400",    cell: "bg-rose-500/80 text-rose-50",    label: "Low" };
};

// ─── Leaflet helpers ──────────────────────────────────────────────────────────

function getRankStyle(rank: number | null) {
  if (rank == null) return { fillColor: '#71717a', opacity: 0.25, fillOpacity: 0.15, radius: 14 };
  if (rank <= 3)    return { fillColor: '#22c55e', opacity: 0.9,  fillOpacity: 0.35, radius: 38 };
  if (rank <= 6)    return { fillColor: '#84cc16', opacity: 0.85, fillOpacity: 0.3,  radius: 34 };
  if (rank <= 10)   return { fillColor: '#facc15', opacity: 0.8,  fillOpacity: 0.28, radius: 30 };
  if (rank <= 15)   return { fillColor: '#f97316', opacity: 0.75, fillOpacity: 0.25, radius: 28 };
  return                   { fillColor: '#ef4444', opacity: 0.7,  fillOpacity: 0.2,  radius: 26 };
}

// ─── GeoGrid Map Component ────────────────────────────────────────────────────

const GeoGrid = ({
  points,
  centerLat,
  centerLng,
  size = 3,
}: {
  points: GeoGridPoint[];
  centerLat: number;
  centerLng: number;
  size?: number;
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef  = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const offset = Math.floor(size / 2);

  // Init map ONCE
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center:             [centerLat, centerLng],
      zoom:               14,
      zoomControl:        true,
      attributionControl: true,
    });

    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current  = map;

    requestAnimationFrame(() => map.invalidateSize());
    const t = setTimeout(() => map.invalidateSize(), 300);

    return () => {
      clearTimeout(t);
      map.remove();
      mapInstanceRef.current  = null;
      markersLayerRef.current = null;
    };
  }, []); 

  const pointsKey = JSON.stringify(points);

  useEffect(() => {
    const map   = mapInstanceRef.current;
    const layer = markersLayerRef.current;

    if (!map || !layer) return;
    if (!points?.length) return;

    const firstPoint = points[0];
    if (firstPoint?.lat == null || firstPoint?.lng == null) return;

    layer.clearLayers();
    map.setView([centerLat, centerLng], 14);

    points.forEach((point, idx) => {
      if (!point || point.lat == null || point.lng == null) return;

      const lat = Number(point.lat);
      const lng = Number(point.lng);
      const row = Number(point.row);
      const col = Number(point.col);

      if (isNaN(lat) || isNaN(lng)) return;

      let rank: number | null = null;
      if (point.rank !== null && point.rank !== undefined && point.rank !== "") {
        const parsed = Number(point.rank);
        if (!isNaN(parsed)) {
          rank = parsed;
        }
      }

      const isCenter  = row === offset && col === offset;
      const style     = getRankStyle(rank);
      const label     = rank === null ? "—" : rank >= 20 ? "20+" : `#${rank}`;
      const rankColor = style.fillColor;

      if (rank !== null || isCenter) {
        L.circleMarker([lat, lng], {
          radius:      isCenter ? 52 : style.radius + 14,
          color:       rankColor,
          fillColor:   rankColor,
          weight:      0,
          fillOpacity: isCenter ? 0.18 : 0.12,
          interactive: false,
        }).addTo(layer);

        L.circleMarker([lat, lng], {
          radius:      isCenter ? 34 : style.radius + 4,
          color:       rankColor,
          fillColor:   rankColor,
          weight:      0,
          fillOpacity: isCenter ? 0.28 : 0.2,
          interactive: false,
        }).addTo(layer);
      }

      const marker = L.circleMarker([lat, lng], {
        radius:      isCenter ? 22 : style.radius,
        color:       "#ffffff",
        fillColor:   rankColor,
        weight:      isCenter ? 3.5 : (rank === null ? 1.5 : 2.5),
        opacity:     rank === null ? 0.6 : 1,
        fillOpacity: rank === null ? 0.4 : 1,
        interactive: true,
      }).addTo(layer);

      if (rank !== null || isCenter) {
        const isTopRank  = rank !== null && rank <= 3;
        const labelHtml  = isCenter
          ? `<div style="display:flex;flex-direction:column;align-items:center;pointer-events:none;">
               <span style="font-size:14px;line-height:1;">📍</span>
               <span style="font-family:system-ui;font-size:10px;font-weight:900;color:#fff;text-shadow:0 0 4px #000;">${label}</span>
             </div>`
          : `<div style="font-family:system-ui;font-size:${isTopRank ? "12px" : "10px"};font-weight:900;color:#fff;text-shadow:0 0 3px #000;text-align:center;pointer-events:none;">
               ${label}
             </div>`;

        L.marker([lat, lng], {
          icon:        L.divIcon({ html: labelHtml, className: "", iconSize: [40, 20], iconAnchor: [20, 10] }),
          interactive: false,
        }).addTo(layer);
      }

      marker.bindPopup(
        `<div style="font-family:system-ui;min-width:140px;padding:4px;">
           <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
             <div style="width:8px;height:8px;border-radius:50%;background:${rankColor};"></div>
             <b style="font-size:12px;">${isCenter ? "📍 Your Property" : `Rank ${label}`}</b>
           </div>
           <p style="margin:0;font-size:10px;color:#666;">
             Grid: [${row}, ${col}]<br/>${lat.toFixed(4)}, ${lng.toFixed(4)}
           </p>
         </div>`,
        { className: "geogrid-popup" },
      );
    });

    setTimeout(() => map.invalidateSize(), 50);
    requestAnimationFrame(() => map.invalidateSize());

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointsKey, centerLat, centerLng, offset]);

  const hasValidPoints = points?.length > 0 && points[0]?.lat != null;

  if (!hasValidPoints) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-dashed border-zinc-700/70 bg-zinc-900/40 p-8 flex flex-col items-center justify-center text-center h-[520px]">
        <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20">
          <Crosshair className="h-6 w-6" />
        </span>
        <p className="text-sm font-semibold text-zinc-200">Geo-grid not scanned yet</p>
        <p className="mt-1.5 max-w-xs text-xs text-zinc-500">
          Fill in the coordinates, hotel name, and keyword above, then hit Scan Grid.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{ position: "relative", width: "100%", height: "520px", borderRadius: "24px", overflow: "hidden" }}
      className="mt-4 border border-zinc-800/80 shadow-2xl"
    >
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

// ─── UI sub-components ────────────────────────────────────────────────────────

const DifficultyMeter = ({ value }: { value: number | null }) => {
  if (value == null) return <span className="text-zinc-600">—</span>;
  const color = value >= 70 ? "from-rose-500 to-red-500" : value >= 40 ? "from-amber-400 to-orange-500" : "from-emerald-400 to-teal-500";
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-700/60">
        <div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="w-7 text-right text-xs font-semibold tabular-nums text-zinc-300">{value}</span>
    </div>
  );
};

const ActionBadge = ({ type }: { type: string }) => {
  const cfg  = BADGE_CONFIG[type] || BADGE_CONFIG.RESEARCH;
  const { Icon } = cfg;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold ring-1 ${cfg.cls}`}>
      <Icon className="h-3.5 w-3.5" />{cfg.label}
    </span>
  );
};

const RankChip = ({ rank, kind }: { rank: number | null; kind: "maps" | "organic" }) => {
  const t    = rankTone(rank);
  const Icon = kind === "maps" ? MapPin : Globe;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg bg-zinc-800/70 px-2 py-1 text-xs font-bold tabular-nums ring-1 ring-zinc-700/60 ${t.text}`}>
      <Icon className="h-3.5 w-3.5" />
      {rank == null ? "—" : `#${Number(rank).toFixed(0)}`}
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, sub, accent, glow }: any) => (
  <div className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-sm transition-all hover:border-zinc-700">
    <div className={`absolute -right-8 -top-8 h-28 w-28 rounded-full ${glow} opacity-[0.12] blur-2xl transition-opacity group-hover:opacity-25`} />
    <div className="flex items-start justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</p>
        <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums text-white">{value}</p>
        {sub && <p className="mt-1 text-xs text-zinc-500">{sub}</p>}
      </div>
      <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent} text-zinc-950 shadow-lg`}>
        <Icon className="h-5 w-5" />
      </span>
    </div>
  </div>
);

const LocalVisibilityGauge = ({ score }: { score: number }) => {
  const r   = 52;
  const c   = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  const dash = (pct / 100) * c;
  const tone = pct >= 70 ? "#34d399" : pct >= 40 ? "#fbbf24" : "#fb7185";
  return (
    <div className="relative flex h-36 w-36 items-center justify-center">
      <svg viewBox="0 0 140 140" className="h-36 w-36 -rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#27272a" strokeWidth="12" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={tone} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`} style={{ transition: "stroke-dasharray 900ms cubic-bezier(.22,1,.36,1)" }} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold tabular-nums text-white">{Math.round(pct)}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Visibility</span>
      </div>
    </div>
  );
};

const Hl = ({ children }: { children: React.ReactNode }) => <span className="font-semibold text-white">{children}</span>;

const buildInsights = (keywords: any[]) => {
  if (!keywords?.length) return [];
  const out: any[] = [];

  const mapsGap = keywords
    .filter((k) => (k.searchVolume ?? 0) >= 30 && (k.liveGmbRank == null || k.liveGmbRank > 3))
    .sort((a, b) => (b.searchVolume ?? 0) - (a.searchVolume ?? 0));
  if (mapsGap[0]) {
    const g = mapsGap[0];
    out.push({
      Icon:  MapPinned,
      chip:  "Local opportunity",
      glow:  "from-emerald-500/40 via-emerald-400/20",
      title: "You're missing the Map Pack",
      body:  <><Hl>"{g.keyword}"</Hl> gets about <Hl>{fmt(g.searchVolume)}</Hl> searches a month, but you're not in the local 3-pack. Strengthen your Google Business Profile and on-page signals to surface on Maps.</>,
    });
  }

  const close = keywords
    .filter((k) => k.liveOrganicRank != null && k.liveOrganicRank > 3 && k.liveOrganicRank <= 10)
    .sort((a, b) => a.liveOrganicRank - b.liveOrganicRank);
  if (close[0]) {
    const c = close[0];
    out.push({
      Icon:  Rocket,
      chip:  "Almost there",
      glow:  "from-teal-500/40 via-teal-400/20",
      title: "One push from the top 3",
      body:  <>You rank <Hl>{fmtRank(c.liveOrganicRank)}</Hl> organically for <Hl>"{c.keyword}"</Hl>. Fresh content and a few quality links could move you into the spots that get clicked.</>,
    });
  }

  const defend = keywords
    .filter((k) => k.liveGmbRank != null && k.liveGmbRank <= 3)
    .sort((a, b) => (b.searchVolume ?? 0) - (a.searchVolume ?? 0));
  if (defend[0]) {
    const d = defend[0];
    out.push({
      Icon:  Shield,
      chip:  "Defend",
      glow:  "from-amber-500/40 via-amber-400/20",
      title: "Protect your Map Pack spot",
      body:  <>You hold <Hl>{fmtRank(d.liveGmbRank)}</Hl> on Maps for <Hl>"{d.keyword}"</Hl>. Keep reviews and posts flowing so a competitor doesn't quietly overtake you.</>,
    });
  }

  return out;
};

const SmartInsightCard = ({ insights }: any) => {
  const [idx, setIdx] = useState(0);
  useEffect(() => setIdx(0), [insights.length]);
  if (!insights.length) return null;
  const ins  = insights[Math.min(idx, insights.length - 1)];
  const { Icon } = ins;
  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-[1px] backdrop-blur-sm">
      <div className={`pointer-events-none absolute -inset-24 bg-gradient-to-r ${ins.glow} to-transparent opacity-50 blur-3xl`} />
      <div className="relative rounded-2xl bg-zinc-950/70 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="relative inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-zinc-950 shadow-lg">
            <Icon className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-200 ring-1 ring-white/10">
                <Sparkles className="h-3 w-3" /> {ins.chip}
              </span>
              <span className="text-[11px] font-medium text-zinc-500">Auto-generated from your data</span>
            </div>
            <h3 className="mt-1.5 text-base font-bold text-white">{ins.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-zinc-300">{ins.body}</p>
          </div>
        </div>
        {insights.length > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-3">
            <div className="flex items-center gap-1.5">
              {insights.map((_: any, i: number) => (
                <button key={i} onClick={() => setIdx(i)}
                  className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-emerald-400" : "w-1.5 bg-zinc-700 hover:bg-zinc-600"}`} />
              ))}
            </div>
            <button onClick={() => setIdx((i) => (i + 1) % insights.length)}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/10">
              Next <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const RankStat = ({ label, rank, kind }: any) => {
  const t    = rankTone(rank);
  const Icon = kind === "maps" ? MapPin : Globe;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
      <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 ${t.text}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{label}</p>
        <p className={`text-lg font-bold tabular-nums ${t.text}`}>{fmtRank(rank)}</p>
      </div>
      <span className="ml-auto text-[11px] font-semibold text-zinc-500">{t.label}</span>
    </div>
  );
};

const KeywordDetailPanel = ({ row }: { row: any }) => {
  const history = Array.isArray(row.rankHistory)
    ? row.rankHistory
        .filter((s: any) => s?.rank != null)
        .map((s: any) => ({ date: new Date(s.date).toISOString().slice(5, 10), rank: s.rank }))
        .slice(-14)
    : [];
  const tip =
    row.actionBadge === "DEFEND"   ? "Hold position: keep the GBP fresh — new photos, posts and review replies weekly."
    : row.actionBadge === "OPTIMIZE" ? "Tighten on-page targeting and earn 2–3 local citations to climb into the pack."
    : row.actionBadge === "TARGET"   ? "Strong opportunity: build a dedicated page + GBP service entry for this term."
    :                                  "Validate intent and volume before investing — low priority for now.";
  return (
    <div className="space-y-4 bg-zinc-950/60 p-4 sm:p-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <RankStat label="Maps / GMB rank" rank={row.liveGmbRank}     kind="maps"    />
        <RankStat label="Organic rank"    rank={row.liveOrganicRank} kind="organic" />
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 lg:col-span-2">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <Activity className="h-4 w-4 text-teal-300" /> Rank trend (last snapshots)
          </div>
          {history.length > 1 ? (
            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`spk-${row.keyword}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#2dd4bf" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis reversed tick={{ fill: "#71717a", fontSize: 10 }} tickLine={false} axisLine={false} width={28} />
                  <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 10, fontSize: 11 }}
                    formatter={(v: any) => [`#${v}`, "Rank"]} />
                  <Area type="monotone" dataKey="rank" stroke="#2dd4bf" strokeWidth={2} fill={`url(#spk-${row.keyword})`} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-28 items-center justify-center text-xs text-zinc-600">Trend builds as daily snapshots accumulate.</div>
          )}
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <Zap className="h-4 w-4 text-amber-300" /> Next move
          </div>
          <p className="text-sm leading-relaxed text-zinc-300">{tip}</p>
          {row.topCompetitor && (
            <a href={`https://${row.topCompetitor}`} target="_blank" rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 px-2.5 py-1.5 text-xs font-semibold text-zinc-300 ring-1 ring-zinc-700 transition hover:text-emerald-300">
              <Trophy className="h-3.5 w-3.5" /> Watch {row.topCompetitor}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const AddKeywordModal = ({ open, onClose, onAdd, saving }: any) => {
  const [text, setText]                 = useState("");
  const [selfDomain, setSelfDomain]     = useState("");
  const [selfHotelName, setSelfHotelName] = useState("");
  if (!open) return null;
  const parsed = [...new Set(text.split(/[\n,]/).map((k) => k.trim().toLowerCase()).filter(Boolean))];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20">
              <Plus className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">Track new keywords</h3>
              <p className="text-xs text-zinc-500">We'll pull volume, CPC, organic &amp; maps rank for each.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 transition hover:text-zinc-300"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-300">Keywords</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5}
              placeholder={"luxury resort morjim goa\ncliff top resort goa\nbeach resort near morjim"}
              className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-800/60 px-3.5 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30" />
            <p className="mt-1.5 text-[11px] text-zinc-500">One per line or comma-separated. {parsed.length} keyword(s) detected.</p>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-300">Your domain (optional)</label>
            <input value={selfDomain} onChange={(e) => setSelfDomain(e.target.value)} placeholder="theacaciamorjim.com"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30" />
            <p className="mt-1.5 text-[11px] text-zinc-500">Used to detect your organic position.</p>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-300">
              Property name <span className="text-emerald-400">(for Maps rank — stored per property)</span>
            </label>
            <input value={selfHotelName} onChange={(e) => setSelfHotelName(e.target.value)}
              placeholder="e.g., The Acacia Hotel & Spa Resort"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30" />
            <p className="mt-1.5 text-[11px] text-zinc-500">
              Exact GBP name for dashboard keyword tracking.{" "}
              <span className="text-amber-400">Grid scans use their own Hotel Name field — separate.</span>
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-zinc-800 px-6 py-4">
          <button onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800">Cancel</button>
          <button onClick={() => onAdd(parsed, selfDomain.trim(), selfHotelName.trim())}
            disabled={saving || !parsed.length}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {saving ? "Analyzing…" : `Track ${parsed.length || ""}`.trim()}
          </button>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ onAdd }: any) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-900/30 py-20 text-center">
    <span className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20">
      <MapPinned className="h-7 w-7" />
    </span>
    <h3 className="text-base font-bold text-white">No keywords tracked yet</h3>
    <p className="mt-1.5 max-w-sm text-sm text-zinc-500">Add the local searches this property should win. We'll merge volume, organic position, and Maps rank into one view.</p>
    <button onClick={onAdd}
      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-500">
      <Plus className="h-4 w-4" /> Add keywords
    </button>
  </div>
);

const RowSkeleton = () => (
  <div className="animate-pulse space-y-2.5">
    {[...Array(6)].map((_, i) => <div key={i} className="h-12 rounded-xl bg-zinc-800/40" />)}
  </div>
);

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const SeoIntelligenceDashboard = () => {
  // ── Dashboard keyword state
  const [data, setData] = useState<any>({
    summary:  null,
    trend:    [],
    keywords: [],
    provider: "dataforseo",
  });
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [expanded,   setExpanded]   = useState<string | null>(null);

  // ── Geo-grid state
  const [geoGridPoints,  setGeoGridPoints]  = useState<GeoGridPoint[]>([]);
  const [gridCenter,     setGridCenter]     = useState({ lat: 30.1264, lng: 78.2938 });
  const [gridKeyword,    setGridKeyword]    = useState<string>("");
  const [gridLat,        setGridLat]        = useState("30.1264");
  const [gridLng,        setGridLng]        = useState("78.2938");
  const [gridRadius,     setGridRadius]     = useState("1.5");
  const [gridHotelName,  setGridHotelName]  = useState("");
  const [isScanningGrid, setIsScanningGrid] = useState(false);

  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  const fetchData = useCallback(async (propertyId?: string | null) => {
    if (!propertyId) {
      setData({ summary: null, trend: [], keywords: [], provider: "dataforseo" });
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data: res } = await axios.get(
        `${NODE_BASE_URL}/seo/seo-intelligence/${propertyId}`,
        { params: { t: Date.now() }, ...getAuthConfig() },
      );
      const d = res.result || res;
      setData({
        summary:  d.summary  || null,
        trend:    d.trend    || [],
        keywords: d.keywords || [],
        provider: d.provider || "dataforseo",
      });
    } catch (err) {
      console.error("SEO intelligence fetch failed:", err);
      setData({ summary: null, trend: [], keywords: [], provider: "dataforseo" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(localStorage.getItem("activePropertyId")); }, [fetchData]);

  useEffect(() => {
    const handleProp = (e: any) => fetchData(e.detail?.property_id || localStorage.getItem("activePropertyId"));
    window.addEventListener("dashboard_property_changed", handleProp);
    return () => window.removeEventListener("dashboard_property_changed", handleProp);
  }, [fetchData]);

  // 🔥 THE FIX: Restore Grid from DB on initial load if available!
  useEffect(() => {
    if (geoGridPoints.length === 0 && data.keywords?.length > 0) {
      const kwWithGrid = data.keywords.find((k: any) => k.geoGrid && k.geoGrid.length > 0);
      if (kwWithGrid) {
        const coerced = kwWithGrid.geoGrid.map((p:any) => ({
           ...p,
           lat: Number(p.lat),
           lng: Number(p.lng),
           row: Number(p.row),
           col: Number(p.col),
           rank: (p.rank !== null && p.rank !== undefined && p.rank !== "") ? Number(p.rank) : null
        }));
        setGeoGridPoints(coerced);
        
        // Find center logic
        const centerPoint = coerced.find((p:any) => p.row === 1 && p.col === 1) || coerced[0];
        if (centerPoint) {
           setGridCenter({ lat: centerPoint.lat, lng: centerPoint.lng });
           setGridLat(centerPoint.lat.toString());
           setGridLng(centerPoint.lng.toString());
        }
      }
    }
  }, [data.keywords, geoGridPoints.length]);

  const { summary, trend, keywords, provider } = data;
  const insights = useMemo(() => buildInsights(keywords), [keywords]);

  const local = useMemo(() => {
    const list      = keywords || [];
    const inPack    = list.filter((k: any) => k.liveGmbRank != null && k.liveGmbRank <= 3).length;
    const mapsRanked = list.filter((k: any) => k.liveGmbRank != null);
    const orgRanked  = list.filter((k: any) => k.liveOrganicRank != null);
    const avgMaps    = mapsRanked.length
      ? +(mapsRanked.reduce((s: number, k: any) => s + k.liveGmbRank, 0) / mapsRanked.length).toFixed(1)
      : null;
    const avgOrg    = orgRanked.length
      ? +(orgRanked.reduce((s: number, k: any) => s + k.liveOrganicRank, 0) / orgRanked.length).toFixed(1)
      : null;
    const total      = list.length || 1;
    const packScore  = (inPack / total) * 100;
    const orgScore   = (orgRanked.filter((k: any) => k.liveOrganicRank <= 10).length / total) * 100;
    const visibility = list.length ? 0.65 * packScore + 0.35 * orgScore : 0;
    return { inPack, avgMaps, avgOrg, visibility };
  }, [keywords]);

  const handleAdd = async (keywords2: string[], selfDomain: string, selfHotelName: string) => {
    const propertyId = localStorage.getItem("activePropertyId");
    if (!propertyId) return alert("Select a hotel / GA property first.");
    if (!keywords2.length) return;
    try {
      setSaving(true);
      await axios.post(
        `${NODE_BASE_URL}/seo/seo-intelligence/track`,
        { property_id: propertyId, propertyId, keywords: keywords2, selfDomain, selfHotelName },
        getAuthConfig(),
      );
      setModalOpen(false);
      await fetchData(propertyId);
    } catch (err) {
      console.error("Add keywords failed:", err);
      alert("Couldn't add keywords. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    const propertyId = localStorage.getItem("activePropertyId");
    if (!propertyId) return;
    try {
      setRefreshing(true);
      await axios.post(`${NODE_BASE_URL}/seo/seo-intelligence/refresh/${propertyId}`, {}, getAuthConfig());
      await fetchData(propertyId);
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleUntrack = async (keyword: string) => {
    const propertyId = localStorage.getItem("activePropertyId");
    if (!propertyId) return;
    try {
      await axios.delete(
        `${NODE_BASE_URL}/seo/seo-intelligence/${propertyId}/${encodeURIComponent(keyword)}`,
        getAuthConfig(),
      );
      setData((d: any) => ({ ...d, keywords: d.keywords.filter((k: any) => k.keyword !== keyword) }));
    } catch (err) {
      console.error("Untrack failed:", err);
    }
  };

  const handleRunGridScan = async () => {
    const propertyId    = localStorage.getItem("activePropertyId");
    const targetKeyword = gridKeyword || keywords?.[0]?.keyword;

    if (!propertyId || !targetKeyword) return alert("Select a property and keyword first.");
    if (!gridLat || !gridLng)          return alert("Latitude and Longitude are required.");
    if (!gridHotelName.trim())         return alert("Target Hotel Name is required for the grid scan.");

    try {
      setIsScanningGrid(true);

      const { data: responseData } = await axios.post(
        `${NODE_BASE_URL}/seo/seo-intelligence/grid-scan`,
        {
          propertyId,
          keyword:   targetKeyword,
          lat:       Number(gridLat),
          lng:       Number(gridLng),
          size:      3,
          stepKm:    Number(gridRadius),
          hotelName: gridHotelName.trim(),
        },
        { ...getAuthConfig(), timeout: 300_000 },
      );

      console.log("🔥 RAW API RESPONSE:", JSON.stringify(responseData, null, 2));

      let rawPoints: any[] = [];

      if (Array.isArray(responseData?.result?.geoGrid))   rawPoints = responseData.result.geoGrid;
      else if (Array.isArray(responseData?.data?.geoGrid)) rawPoints = responseData.data.geoGrid;
      else if (Array.isArray(responseData?.geoGrid))       rawPoints = responseData.geoGrid;
      else if (Array.isArray(responseData?.result?.data))  rawPoints = responseData.result.data;
      else if (Array.isArray(responseData?.data))          rawPoints = responseData.data;
      else if (Array.isArray(responseData?.result))        rawPoints = responseData.result;
      else if (Array.isArray(responseData))                rawPoints = responseData;

      if (!rawPoints.length) {
        alert("Backend returned data but format didn't match any known shape. Check F12 Console → Network tab for the raw response.");
        return;
      }

      const coercedPoints: GeoGridPoint[] = rawPoints.map((p: any) => {
        const lat = Number(p.lat ?? p.latitude ?? p.Lat ?? 0);
        const lng = Number(p.lng ?? p.lon ?? p.longitude ?? p.Lng ?? 0);
        const row = Number(p.row ?? p.Row ?? 0);
        const col = Number(p.col ?? p.Col ?? 0);

        let rank: number | null = null;
        const rawRank = p.rank ?? p.Rank ?? p.position ?? p.Position;
        if (rawRank !== null && rawRank !== undefined && rawRank !== "") {
          const parsed = Number(rawRank);
          if (!isNaN(parsed)) rank = parsed;
        }

        return { lat, lng, row, col, rank };
      });

      setGeoGridPoints([...coercedPoints]);
      setGridCenter({ lat: Number(gridLat), lng: Number(gridLng) });

    } catch (err: any) {
      console.error("Grid scan error:", err);
      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        alert("DataForSEO is taking extra time. Check back in a minute and hit Refresh!");
      } else {
        alert(`Grid scan failed: ${err?.response?.data?.message || err.message || "Unknown error"}`);
      }
    } finally {
      setIsScanningGrid(false);
    }
  };

  return (
    <div className="min-h-screen rounded-3xl bg-gradient-to-b from-zinc-950 via-zinc-950 to-black p-6 sm:p-8">
      <div className="pointer-events-none absolute inset-0 -z-0 opacity-[0.025]"
        style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "48px 48px" }} />

      {/* Header */}
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-zinc-950 shadow-lg shadow-emerald-500/30">
            <MapPinned className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Local SEO Intelligence</h1>
            <p className="mt-0.5 flex items-center gap-2 text-sm text-zinc-400">
              Maps &amp; organic command center
              <span className="inline-flex items-center gap-1 rounded-md bg-zinc-900 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-300 ring-1 ring-zinc-800">
                <Sparkles className="h-3 w-3" /> {provider}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={handleRefresh} disabled={refreshing || !keywords.length}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-800 disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
          <button onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-500">
            <Plus className="h-4 w-4" /> Add keywords
          </button>
        </div>
      </div>

      {/* Visibility + Grid */}
      <div className="relative mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* Visibility gauge */}
        <div className="flex items-center gap-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm z-10">
          <LocalVisibilityGauge score={local.visibility} />
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Local Visibility</p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-300">
              <Hl>{local.inPack}</Hl> of <Hl>{keywords.length || 0}</Hl> tracked terms sit in the Map 3-Pack.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800/70 px-2.5 py-1 font-semibold text-emerald-300 ring-1 ring-zinc-700">
                <MapPin className="h-3.5 w-3.5" /> Avg Maps {fmtRank(local.avgMaps)}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800/70 px-2.5 py-1 font-semibold text-teal-300 ring-1 ring-zinc-700">
                <Globe className="h-3.5 w-3.5" /> Avg Organic {fmtRank(local.avgOrg)}
              </span>
            </div>
          </div>
        </div>

        {/* Map Coverage Grid */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-sm lg:col-span-2">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/60 pb-4 z-10 relative">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20">
                <Navigation className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-white">Map Coverage Grid</h2>
                <p className="text-xs text-zinc-500">Standalone geo-scan — separate from keyword tracking</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
                  <Building className="h-3.5 w-3.5 text-zinc-500" />
                </span>
                <input
                  type="text"
                  value={gridHotelName}
                  onChange={(e) => setGridHotelName(e.target.value)}
                  placeholder="Hotel for grid only"
                  title="This name is used only for the grid scan — it does not affect keyword dashboard data."
                  className="w-36 sm:w-44 appearance-none rounded-lg border border-amber-500/30 bg-zinc-800 py-1.5 pl-8 pr-2.5 text-[11px] sm:text-xs font-medium text-amber-300 outline-none focus:border-amber-400 transition"
                />
              </div>

              <input type="text" value={gridLat} onChange={(e) => setGridLat(e.target.value)}
                placeholder="Latitude"
                className="w-20 sm:w-24 appearance-none rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-[11px] sm:text-xs font-medium text-zinc-200 outline-none focus:border-emerald-500 transition" />
              <input type="text" value={gridLng} onChange={(e) => setGridLng(e.target.value)}
                placeholder="Longitude"
                className="w-20 sm:w-24 appearance-none rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-[11px] sm:text-xs font-medium text-zinc-200 outline-none focus:border-emerald-500 transition" />

              <div className="relative">
                <select value={gridRadius} onChange={(e) => setGridRadius(e.target.value)}
                  className="appearance-none rounded-lg border border-zinc-700 bg-zinc-800 py-1.5 pl-3 pr-7 text-[11px] sm:text-xs font-medium text-zinc-200 outline-none focus:border-emerald-500 cursor-pointer">
                  <option value="0.5">0.5 km</option>
                  <option value="1.5">1.5 km</option>
                  <option value="3">3.0 km</option>
                  <option value="5">5.0 km</option>
                  <option value="10">10.0 km</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
              </div>

              {keywords.length > 0 && (
                <div className="relative">
                  <select
                    value={gridKeyword || keywords?.[0]?.keyword || ""}
                    onChange={(e) => setGridKeyword(e.target.value)}
                    className="appearance-none rounded-lg border border-zinc-700 bg-zinc-800 py-1.5 pl-3 pr-7 text-[11px] sm:text-xs font-medium text-zinc-200 outline-none focus:border-emerald-500 cursor-pointer">
                    {keywords.map((k: any) => (
                      <option key={k.keyword} value={k.keyword}>{k.keyword}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                </div>
              )}

              <button onClick={handleRunGridScan} disabled={isScanningGrid}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20 transition hover:bg-emerald-500/20 disabled:opacity-50">
                {isScanningGrid ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Crosshair className="h-3.5 w-3.5" />}
                {isScanningGrid ? "Scanning..." : "Scan Grid"}
              </button>
            </div>
          </div>

          <GeoGrid
            points={geoGridPoints}
            centerLat={gridCenter.lat}
            centerLng={gridCenter.lng}
            size={3}
          />
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="relative mt-4">
          <SmartInsightCard insights={insights} />
        </div>
      )}

      {/* Stat cards */}
      <div className="relative mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Hash}    label="Keywords tracked" value={summary ? fmt(summary.totalKeywords) : "—"} sub="this property"     accent="bg-emerald-400" glow="bg-emerald-400" />
        <StatCard icon={MapPin}  label="In Map 3-Pack"    value={fmt(local.inPack)}                          sub="top-3 on Maps"      accent="bg-teal-400"    glow="bg-teal-400"    />
        <StatCard icon={Globe}   label="Avg organic rank"  value={local.avgOrg != null ? fmtRank(local.avgOrg) : "—"} sub="organic search" accent="bg-amber-300" glow="bg-amber-300" />
        <StatCard icon={Target}  label="Opportunities"     value={summary ? fmt(summary.opportunities) : "—"} sub="gap terms to win"   accent="bg-emerald-300" glow="bg-emerald-300" />
      </div>

      {/* Rank trend chart */}
      <div className="relative mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-sm">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-teal-400/10 text-teal-300 ring-1 ring-teal-400/20">
            <TrendingUp className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-white">Average ranking trend</h2>
            <p className="text-xs text-zinc-500">Last 30 days · lower is better</p>
          </div>
        </div>
        <div className="h-64 w-full">
          {trend.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="rankFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#27272a" }} tickFormatter={(d) => d?.slice(5)} />
                <YAxis reversed tick={{ fill: "#71717a", fontSize: 11 }} tickLine={false} axisLine={false} width={36} domain={["dataMin - 1", "dataMax + 1"]} />
                <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 12, color: "#e4e4e7", fontSize: 12 }}
                  formatter={(v: any) => [`#${v}`, "Avg Rank"]} />
                <Area type="monotone" dataKey="avgRank" stroke="#2dd4bf" strokeWidth={2.5} fill="url(#rankFill)" dot={false} activeDot={{ r: 5, fill: "#2dd4bf" }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-600">Trend builds as daily rank snapshots accumulate.</div>
          )}
        </div>
      </div>

      {/* Keyword table */}
      <div className="relative mt-4 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300">
              <Search className="h-4 w-4" />
            </span>
            <h2 className="text-sm font-bold text-white">Keyword intelligence</h2>
          </div>
          {keywords.length > 0 && <p className="hidden text-xs text-zinc-600 sm:block">Tap a row for local rank detail</p>}
        </div>
        <div className="p-5">
          {loading ? (
            <RowSkeleton />
          ) : !keywords.length ? (
            <EmptyState onAdd={() => setModalOpen(true)} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-zinc-600">
                    <th className="w-8 pb-3 pl-2 font-semibold" />
                    <th className="pb-3 font-semibold">Keyword</th>
                    <th className="pb-3 text-right font-semibold"><span className="inline-flex items-center justify-end gap-1.5"><BarChart3 className="h-3.5 w-3.5" />Volume</span></th>
                    <th className="pb-3 text-right font-semibold"><span className="inline-flex items-center justify-end gap-1.5"><IndianRupee className="h-3.5 w-3.5" />CPC</span></th>
                    <th className="pb-3 text-center font-semibold"><span className="inline-flex items-center justify-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-emerald-400" />Maps</span></th>
                    <th className="pb-3 text-center font-semibold"><span className="inline-flex items-center justify-center gap-1.5"><Globe className="h-3.5 w-3.5 text-teal-400" />Organic</span></th>
                    <th className="pb-3 pl-6 text-left font-semibold">Difficulty</th>
                    <th className="pb-3 text-left font-semibold">Action</th>
                    <th className="pb-3 pr-2" />
                  </tr>
                </thead>
                <tbody>
                  {keywords.map((row: any, i: number) => {
                    const key    = row._id || row.keyword || String(i);
                    const isOpen = expanded === key;
                    return (
                      <React.Fragment key={key}>
                        <tr onClick={() => setExpanded(isOpen ? null : key)}
                          className={`group cursor-pointer border-t border-zinc-800/70 transition-colors ${isOpen ? "bg-zinc-800/30" : "hover:bg-zinc-800/30"}`}>
                          <td className="py-3.5 pl-2">
                            <ChevronDown className={`h-4 w-4 text-zinc-600 transition-transform ${isOpen ? "rotate-180 text-emerald-300" : "group-hover:text-zinc-400"}`} />
                          </td>
                          <td className="max-w-[240px] py-3.5">
                            <span className="block truncate font-semibold text-zinc-100" title={row.keyword}>{row.keyword}</span>
                          </td>
                          <td className="py-3.5 text-right font-semibold tabular-nums text-zinc-200">{fmt(row.searchVolume)}</td>
                          <td className="py-3.5 text-right tabular-nums text-zinc-300">{fmtCurrency(row.cpc)}</td>
                          <td className="py-3.5 text-center"><RankChip rank={row.liveGmbRank}     kind="maps"    /></td>
                          <td className="py-3.5 text-center"><RankChip rank={row.liveOrganicRank} kind="organic" /></td>
                          <td className="py-3.5 pl-6"><DifficultyMeter value={row.keywordDifficulty} /></td>
                          <td className="py-3.5"><ActionBadge type={row.actionBadge} /></td>
                          <td className="py-3.5 pr-2 text-right">
                            <button onClick={(e) => { e.stopPropagation(); handleUntrack(row.keyword); }}
                              className="rounded-lg p-1.5 text-zinc-700 opacity-0 transition hover:bg-rose-500/10 hover:text-rose-400 group-hover:opacity-100"
                              title="Stop tracking">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                        {isOpen && (
                          <tr className="border-t border-zinc-800/70">
                            <td colSpan={9} className="p-0">
                              <div className="overflow-hidden rounded-b-xl">
                                <KeywordDetailPanel row={row} />
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <AddKeywordModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAdd} saving={saving} />
    </div>
  );
};

export default SeoIntelligenceDashboard;