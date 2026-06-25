import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import { NODE_BASE_URL } from "../../data/constant";
import {
  ResponsiveContainer, XAxis, YAxis, Tooltip,
  CartesianGrid, Area, AreaChart,
} from "recharts";
import {
  Search, TrendingUp, Target, Crown, Lightbulb, Sparkles,
  Plus, X, RefreshCw, Loader2, IndianRupee, BarChart3, Trophy,
  Trash2, Hash, ChevronDown, MapPin, MapPinned, Navigation,
  Crosshair, Globe, Shield, Rocket, ArrowRight, Activity,
  Zap, CheckCircle, Clock, AlertCircle, ChevronRight,
  Map,
} from "lucide-react";
import L from "leaflet";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GeoGridPoint {
  lat: number;
  lng: number;
  rank: number | null;
  row: number;
  col: number;
}

interface LocalConfig {
  businessName: string;
  city: string;
  district: string;
  state?: string;
  radiusKm: number;
  lat: number;
  lng: number;
  onboardingComplete: boolean;
}

interface GridMeta {
  lastScanned: string | null;
  status: "pending" | "scanning" | "done" | "failed";
  keyword: string | null;
  gridSize: number;
  centerLat: number | null;
  centerLng: number | null;
}

type ScanStatus = "idle" | "queued" | "scanning" | "done" | "failed";

interface ScanProgress {
  step: string;
  percent: number;
  status: ScanStatus;
  detail?: string;
  ts?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BADGE_CONFIG: Record<string, {
  label: string;
  cls: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = {
  TARGET: { label: "Target", cls: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/25", Icon: Target },
  OPTIMIZE: { label: "Optimize", cls: "bg-amber-400/10 text-amber-300 ring-amber-400/25", Icon: Lightbulb },
  DEFEND: { label: "Defend", cls: "bg-teal-400/10 text-teal-300 ring-teal-400/25", Icon: Crown },
  RESEARCH: { label: "Research", cls: "bg-zinc-400/10 text-zinc-300 ring-zinc-400/20", Icon: Sparkles },
};

const BUSINESS_TYPES = ["hotel", "resort", "hostel", "homestay", "villa", "retreat", "glamping"];
const RADIUS_OPTIONS = [2, 5, 10] as const;

const fmt = (n: any) => (n == null ? "—" : Number(n).toLocaleString());
const fmtCurrency = (n: any) => (n == null ? "—" : `₹${Number(n).toFixed(2)}`);
const fmtRank = (n: any) => (n == null ? "—" : `#${Number(n).toFixed(1)}`);

const rankTone = (rank: number | null | undefined) => {
  if (rank == null) return { text: "text-zinc-500", dot: "bg-zinc-600", cell: "bg-zinc-800 text-zinc-500", label: "Not ranked" };
  if (rank <= 3) return { text: "text-emerald-300", dot: "bg-emerald-400", cell: "bg-emerald-500 text-emerald-950", label: "Top 3" };
  if (rank <= 7) return { text: "text-teal-300", dot: "bg-teal-400", cell: "bg-teal-500 text-teal-950", label: "Top 7" };
  if (rank <= 15) return { text: "text-amber-300", dot: "bg-amber-400", cell: "bg-amber-500 text-amber-950", label: "Page 1–2" };
  return { text: "text-rose-300", dot: "bg-rose-400", cell: "bg-rose-500/80 text-rose-50", label: "Low" };
};

function getRankStyle(rank: number | null) {
  if (rank == null) return { fillColor: "#71717a", radius: 14 };
  if (rank <= 3) return { fillColor: "#22c55e", radius: 38 };
  if (rank <= 6) return { fillColor: "#84cc16", radius: 34 };
  if (rank <= 10) return { fillColor: "#facc15", radius: 30 };
  if (rank <= 15) return { fillColor: "#f97316", radius: 28 };
  return { fillColor: "#ef4444", radius: 26 };
}

// ─── useSeoProgress hook ──────────────────────────────────────────────────────

function useSeoProgress(onDone?: () => void) {
  const [progress, setProgress] = useState<ScanProgress | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const esRef = useRef<EventSource | null>(null);
  const doneCalledRef = useRef(false);
  const onDoneRef = useRef(onDone);



  useEffect(() => { onDoneRef.current = onDone; }, [onDone]);

  const connectSSE = useCallback(() => {
    if (esRef.current?.readyState === EventSource.OPEN) return;
    const token = localStorage.getItem("token");
    const url = `${NODE_BASE_URL}/seo/seo-intelligence/progress?token=${encodeURIComponent(token || "")}`;
    const es = new EventSource(url);

    es.onopen = () => { console.log("[SSE] Connected ✅"); };
    es.onmessage = (e) => {
      try {
        const data: ScanProgress = JSON.parse(e.data);
        if (data.status === "idle") return;
        setProgress(data);
        setIsActive(data.status === "scanning");
        setDismissed(false);
        if (data.status === "scanning" || data.status === "queued" || (data.status as any) === "pending") {
          doneCalledRef.current = false;
        }
        if ((data.status === "done" || data.status === "failed") && !doneCalledRef.current) {
          doneCalledRef.current = true;
          if (data.status === "done") { onDoneRef.current?.(); setIsActive(false); }
        }
      } catch { }
    };
    es.onerror = () => {
      es.close();
      esRef.current = null;
      setTimeout(() => connectSSE(), 3_000);
    };
    esRef.current = es;
  }, []);

  useEffect(() => {
    connectSSE();
    return () => { esRef.current?.close(); esRef.current = null; };
  }, [connectSSE]);

  return {
    progress,
    isActive: isActive && !dismissed,
    dismiss: () => { setDismissed(true); setIsActive(false); },
  };
}

// ─── ScanProgressToast ────────────────────────────────────────────────────────

const ScanProgressToast = ({
  progress, onDismiss, onRefresh,
}: {
  progress: ScanProgress;
  onDismiss: () => void;
  onRefresh: () => void;
}) => {
  const isDone = progress.status === "done";
  const isFailed = progress.status === "failed";
  const isQueued = progress.status === "queued";

  const borderColor = isDone ? "border-emerald-500/30" : isFailed ? "border-rose-500/30" : isQueued ? "border-zinc-700" : "border-teal-500/30";
  const iconBg = isDone ? "bg-emerald-500/15 text-emerald-400" : isFailed ? "bg-rose-500/15 text-rose-400" : isQueued ? "bg-zinc-800 text-zinc-400" : "bg-teal-500/15 text-teal-400";

  return (
    <div className={`fixed bottom-6 right-6 z-50 w-80 rounded-2xl border ${borderColor} bg-zinc-900/95 p-4 shadow-2xl backdrop-blur-sm`}
      style={{ animation: "slideUp 0.3s ease" }}>
      <style>{`@keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${iconBg}`}>
            {isDone ? <CheckCircle className="h-4 w-4" /> : isFailed ? <AlertCircle className="h-4 w-4" /> : isQueued ? <Clock className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />}
          </span>
          <span className="text-xs font-bold text-zinc-200">
            {isDone ? "Scan Complete!" : isFailed ? "Scan Failed" : isQueued ? "Scan Queued" : "Scanning…"}
          </span>
        </div>
        <button onClick={onDismiss} className="text-zinc-600 hover:text-zinc-400 transition"><X className="h-4 w-4" /></button>
      </div>
      {!isQueued && (
        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
          <div className={`h-full rounded-full transition-all duration-700 ${isDone ? "bg-emerald-500" : isFailed ? "bg-rose-500" : "bg-teal-500"}`}
            style={{ width: `${progress.percent}%` }} />
        </div>
      )}
      <p className="text-xs text-zinc-300 leading-relaxed">{progress.step}</p>
      {progress.detail && <p className="mt-1 text-[11px] text-zinc-500">{progress.detail}</p>}
      {isDone && (
        <button onClick={() => { onRefresh(); onDismiss(); }}
          className="mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/25 transition hover:bg-emerald-500/25">
          <RefreshCw className="h-3.5 w-3.5" /> Load updated map
        </button>
      )}
      {isFailed && <p className="mt-2 text-[11px] text-zinc-500">Will retry automatically on the next run.</p>}
      {!isDone && !isFailed && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
          </span>
          <span className="text-[10px] text-zinc-600">Live updates</span>
          <span className="ml-auto text-[10px] text-zinc-600 tabular-nums">{progress.percent}%</span>
        </div>
      )}
    </div>
  );
};


// ─── GeoGrid Scanning Overlay ─────────────────────────────────────────────────

const GeoGridScanningOverlay = ({ onRescan, triggeringScan }: { onRescan: () => void; triggeringScan: boolean }) => (
  <div style={{
    position: "absolute", inset: 0, zIndex: 10,
    background: "rgba(9,11,20,0.82)", backdropFilter: "blur(3px)",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    borderRadius: "24px", gap: 0,
  }}>
    <style>{`
      @keyframes gg-ring-outer{to{transform:rotate(360deg)}}
      @keyframes gg-ring-inner{to{transform:rotate(-360deg)}}
      @keyframes gg-dots{0%,80%,100%{opacity:0.2;transform:scale(0.7)}40%{opacity:1;transform:scale(1)}}
      @keyframes gg-fadein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    `}</style>
    <div style={{ position: "relative", width: 64, height: 64, marginBottom: 28 }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid transparent", borderTopColor: "#00d4aa", borderRightColor: "rgba(0,212,170,0.3)", animation: "gg-ring-outer 1.1s linear infinite" }} />
      <div style={{ position: "absolute", inset: 10, borderRadius: "50%", border: "2px solid transparent", borderTopColor: "rgba(0,212,170,0.5)", borderLeftColor: "rgba(0,212,170,0.15)", animation: "gg-ring-inner 0.8s linear infinite" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <MapPinned size={16} color="#00d4aa" />
      </div>
    </div>
    <p style={{ fontSize: 18, fontWeight: 600, color: "#f1f5f9", margin: 0, letterSpacing: "-0.02em", animation: "gg-fadein 0.5s ease" }}>Please wait</p>
    <p style={{ fontSize: 13, color: "#475569", margin: "6px 0 0", textAlign: "center", maxWidth: 240, lineHeight: 1.5, animation: "gg-fadein 0.6s ease" }}>
      Scanning geo-grid across all 25 points.<br />This takes a few minutes.
    </p>
    <div style={{ display: "flex", gap: 6, marginTop: 20 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#00d4aa", animation: `gg-dots 1.4s ease-in-out ${i * 0.16}s infinite` }} />
      ))}
    </div>
    <button onClick={onRescan} disabled={triggeringScan}
      style={{ marginTop: 32, fontFamily: "inherit", fontSize: 11, padding: "6px 16px", borderRadius: 7, border: "0.5px solid rgba(255,255,255,0.1)", background: "transparent", color: "#475569", cursor: triggeringScan ? "not-allowed" : "pointer", opacity: triggeringScan ? 0.3 : 1, display: "flex", alignItems: "center", gap: 6, letterSpacing: "0.03em", transition: "color 0.15s, border-color 0.15s" }}
      onMouseEnter={e => { (e.target as HTMLElement).style.color = "#94a3b8"; (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)"; }}
      onMouseLeave={e => { (e.target as HTMLElement).style.color = "#475569"; (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; }}>
      <RefreshCw size={11} className={triggeringScan ? "animate-spin" : ""} />
      {triggeringScan ? "starting…" : "re-scan"}
    </button>
  </div>
);

// ─── GeoGrid Map ──────────────────────────────────────────────────────────────

const GeoGrid = ({
  points, centerLat, centerLng, size = 5,
  businessName, district, city, lastScanned, gridStatus,
  keyword, onRescan, triggeringScan,
}: {
  points: GeoGridPoint[];
  centerLat: number;
  centerLng: number;
  size?: number;
  businessName?: string;
  district?: string;
  city?: string;
  lastScanned?: string | null;
  gridStatus?: string;
  keyword?: string | null;
  onRescan: () => void;
  triggeringScan: boolean;
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const offset = Math.floor(size / 2);

  useEffect(() => {
    if (!mapContainerRef.current || !centerLat || !centerLng) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
    }
    const map = L.map(mapContainerRef.current, { center: [centerLat, centerLng], zoom: 13, zoomControl: true });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: "&copy; OSM &copy; CARTO", subdomains: "abcd", maxZoom: 20,
    }).addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    requestAnimationFrame(() => map.invalidateSize());
    const t = setTimeout(() => map.invalidateSize(), 300);
    return () => {
      clearTimeout(t);
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
    };
  }, [centerLat, centerLng]);

  const pointsKey = useMemo(
    () => points?.map((p) => `${p.lat},${p.lng},${p.rank}`).join("|") || "",
    [points],
  );


  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer || !points?.length || points[0]?.lat == null) return;

    const draw = () => {
      layer.clearLayers();
      map.setView([centerLat, centerLng], 13);
      points.forEach((point) => {
        if (!point || point.lat == null || point.lng == null) return;
        const lat = Number(point.lat);
        const lng = Number(point.lng);
        const row = Number(point.row);
        const col = Number(point.col);
        if (isNaN(lat) || isNaN(lng)) return;
        let rank: number | null = null;
        if (point.rank !== null && point.rank !== undefined && String(point.rank) !== "") {
          const p = Number(point.rank);
          if (!isNaN(p)) rank = p;
        }
        const isCenter = row === offset && col === offset;
        const style = getRankStyle(rank);
        const label = rank === null ? "—" : rank >= 20 ? "20+" : `#${rank}`;
        const rankColor = style.fillColor;

        if (rank !== null || isCenter) {
          L.circleMarker([lat, lng], { radius: isCenter ? 52 : style.radius + 14, color: rankColor, fillColor: rankColor, weight: 0, fillOpacity: isCenter ? 0.18 : 0.12, interactive: false }).addTo(layer);
          L.circleMarker([lat, lng], { radius: isCenter ? 34 : style.radius + 4, color: rankColor, fillColor: rankColor, weight: 0, fillOpacity: isCenter ? 0.28 : 0.2, interactive: false }).addTo(layer);
        }
        const marker = L.circleMarker([lat, lng], {
          radius: isCenter ? 22 : style.radius,
          color: "#ffffff", fillColor: rankColor,
          weight: isCenter ? 3.5 : (rank === null ? 1.5 : 2.5),
          opacity: rank === null ? 0.6 : 1,
          fillOpacity: rank === null ? 0.4 : 1,
        }).addTo(layer);

        if (rank !== null || isCenter) {
          const isTop = rank !== null && rank <= 3;
          const html = isCenter
            ? `<div style="display:flex;flex-direction:column;align-items:center;pointer-events:none;"><span style="font-size:14px;">📍</span><span style="font-family:system-ui;font-size:10px;font-weight:900;color:#fff;text-shadow:0 0 4px #000;">${label}</span></div>`
            : `<div style="font-family:system-ui;font-size:${isTop ? "12px" : "10px"};font-weight:900;color:#fff;text-shadow:0 0 3px #000;text-align:center;pointer-events:none;">${label}</div>`;
          L.marker([lat, lng], { icon: L.divIcon({ html, className: "", iconSize: [40, 20], iconAnchor: [20, 10] }), interactive: false }).addTo(layer);
        }
        marker.bindPopup(
          `<div style="font-family:system-ui;min-width:140px;padding:4px;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
              <div style="width:8px;height:8px;border-radius:50%;background:${rankColor};"></div>
              <b style="font-size:12px;">${isCenter ? "📍 " + (businessName || "Your Property") : `Rank ${label}`}</b>
            </div>
            <p style="margin:0;font-size:10px;color:#666;">
              ${isCenter ? `${district || ""}, ${city || ""}` : `Grid [${row},${col}]`}<br/>
              ${lat.toFixed(4)}, ${lng.toFixed(4)}
            </p>
          </div>`,
          { className: "geogrid-popup" },
        );
      });
      map.invalidateSize();
    };

    if (map && layer) {
      // Small delay taaki DB write settle ho jaaye
      const t = setTimeout(draw, 100);
      return () => clearTimeout(t);
    }
    else { const t = setTimeout(draw, 400); return () => clearTimeout(t); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointsKey, centerLat, centerLng, offset, businessName, district, city]);

  const hasPoints = points?.length > 0 && points[0]?.lat != null;
  const isScanning = gridStatus === "scanning" || gridStatus === "pending";

  if (!hasPoints && !isScanning) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-dashed border-zinc-700/70 bg-zinc-900/40 p-8 flex flex-col items-center justify-center text-center h-[480px]">
        <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20">
          <Crosshair className="h-6 w-6" />
        </span>
        <p className="text-sm font-semibold text-zinc-200">Geo-grid not scanned yet</p>
        <p className="mt-1.5 max-w-xs text-xs text-zinc-500">Your first scan runs tonight automatically. Come back tomorrow morning!</p>
        {lastScanned && <p className="mt-3 text-[11px] text-zinc-600">Last scan: {new Date(lastScanned).toLocaleDateString("en-IN")}</p>}
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "480px", borderRadius: "24px", overflow: "hidden" }}
      className="mt-4 border border-zinc-800/80 shadow-2xl">
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
      {isScanning && <GeoGridScanningOverlay onRescan={onRescan} triggeringScan={triggeringScan} />}
      {lastScanned && !isScanning && (
        <div style={{ position: "absolute", bottom: 12, left: 12, zIndex: 1000 }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950/80 px-2.5 py-1 text-[11px] font-medium text-zinc-400 backdrop-blur-sm ring-1 ring-zinc-800">
          <Clock className="h-3 w-3" />
          Updated {new Date(lastScanned).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </div>
      )}
    </div>
  );
};

// ─── Onboarding Wizard ────────────────────────────────────────────────────────

const OnboardingWizard = ({ onComplete, authConfig }: { onComplete: () => void; authConfig: any }) => {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedKws, setSelectedKws] = useState<Set<string>>(new Set());
  const [customKw, setCustomKw] = useState("");
  const [loadingKws, setLoadingKws] = useState(false);
  const [locationError, setLocationError] = useState("");
  const mapPickerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);


  const [form, setForm] = useState({
    businessName: "", businessType: "hotel", selfDomain: "",
    lat: "", lng: "", radiusKm: "5",
    city: "", district: "", state: "", pincode: "", primaryKeyword: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  // Init map for onboarding location picker
  useEffect(() => {
    if (step !== 2 || !mapPickerRef.current || mapRef.current) return;
    const defaultLat = form.lat ? Number(form.lat) : 28.6139;
    const defaultLng = form.lng ? Number(form.lng) : 77.2090;
    const map = L.map(mapPickerRef.current, { center: [defaultLat, defaultLng], zoom: 13, zoomControl: true, attributionControl: false });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", { subdomains: "abcd", maxZoom: 20 }).addTo(map);
    const marker = L.marker([defaultLat, defaultLng], {
      icon: L.divIcon({
        html: `<div style="width:20px;height:20px;border-radius:50%;background:#10b981;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.5);"></div>`,
        className: "", iconSize: [20, 20], iconAnchor: [10, 10],
      }),
    }).addTo(map);
    markerRef.current = marker;
    map.on("click", async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      set("lat", lat.toFixed(6));
      set("lng", lng.toFixed(6));
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=14`);
        const data = await r.json();
        const addr = data.address || {};
        if (addr.city || addr.town || addr.county) set("city", addr.city || addr.town || addr.county);
        if (addr.suburb || addr.neighbourhood || addr.city_district) set("district", addr.suburb || addr.neighbourhood || addr.city_district);
        if (addr.state) set("state", addr.state);
        if (addr.postcode) set("pincode", addr.postcode);
      } catch { }
    });
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 100);
    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const detectLocation = () => {
    setLocationError("");
    if (!navigator.geolocation) { setLocationError("Geolocation not supported."); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        set("lat", latitude.toFixed(6));
        set("lng", longitude.toFixed(6));
        if (mapRef.current && markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude]);
          mapRef.current.setView([latitude, longitude], 15, { animate: true });
        }
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=14`)
          .then((r) => r.json())
          .then((data) => {
            const addr = data.address || {};
            set("city", addr.city || addr.town || addr.county || "");
            set("district", addr.suburb || addr.neighbourhood || addr.city_district || addr.county || "");
            set("state", addr.state || "");
            set("pincode", addr.postcode || "");
          }).catch(() => { });
      },
      () => setLocationError("Could not get location. Please click on the map or enter manually."),
    );
  };

  const fetchSuggestions = async () => {
    if (!form.city || !form.district) return;
    setLoadingKws(true);
    try {
      const { data } = await axios.post(
        `${NODE_BASE_URL}/seo/seo-intelligence/suggest-keywords`,
        { businessType: form.businessType, city: form.city, district: form.district, state: form.state },
        authConfig,
      );
      setSuggestions(data?.result?.suggestions || data?.suggestions || []);
    } catch {
      const bt = form.businessType, ci = form.city.toLowerCase(), di = form.district.toLowerCase();
      setSuggestions([
        `${bt} in ${di}`, `best ${bt} in ${di}`, `${bt} near ${di}`, `${bt} ${ci}`,
        `budget ${bt} ${di}`, `luxury ${bt} ${di}`, `${bt} near me ${ci}`, `book ${bt} ${di}`,
      ]);
    } finally { setLoadingKws(false); }
  };

  const toggleKw = (kw: string) =>
    setSelectedKws((s) => { const n = new Set(s); n.has(kw) ? n.delete(kw) : n.add(kw); return n; });

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await axios.post(`${NODE_BASE_URL}/seo/seo-intelligence/onboarding`, {
        businessName: form.businessName,
        lat: Number(form.lat),
        lng: Number(form.lng),
        radiusKm: Number(form.radiusKm),
        city: form.city,
        district: form.district,
        state: form.state,
        pincode: form.pincode,
        selfDomain: form.selfDomain,
        selfHotelName: form.businessName,
        primaryKeyword: [...selectedKws][0] || form.primaryKeyword || `${form.businessType} in ${form.district}`,
      }, authConfig);

      const allKws = [...selectedKws];
      if (form.primaryKeyword && !allKws.includes(form.primaryKeyword)) allKws.push(form.primaryKeyword);
      if (allKws.length > 0) {
        await axios.post(`${NODE_BASE_URL}/seo/seo-intelligence/track`, {
          keywords: allKws, selfDomain: form.selfDomain, selfHotelName: form.businessName,
        }, authConfig);
      }
      onComplete();
    } catch (err: any) {
      alert("Setup failed: " + (err?.response?.data?.error || err.message));
    } finally { setSaving(false); }
  };

  const STEPS = ["Business Info", "Location", "Keywords"];

  return (
    <div className="min-h-screen rounded-3xl bg-gradient-to-b from-zinc-950 via-zinc-950 to-black p-6 sm:p-12 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-zinc-950 shadow-lg shadow-emerald-500/30 mb-4">
            <MapPinned className="h-7 w-7" />
          </span>
          <h1 className="text-2xl font-bold text-white">Set up Local SEO</h1>
          <p className="mt-1 text-sm text-zinc-400">One-time setup — takes 2 minutes.</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <React.Fragment key={i}>
              <div className="flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${step === i + 1 ? "bg-emerald-500 text-zinc-950" : step > i + 1 ? "bg-emerald-900 text-emerald-300" : "bg-zinc-800 text-zinc-500"}`}>
                  {step > i + 1 ? <CheckCircle className="h-4 w-4" /> : i + 1}
                </div>
                <span className={`text-xs font-medium ${step === i + 1 ? "text-white" : "text-zinc-500"}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className="h-px w-8 bg-zinc-800" />}
            </React.Fragment>
          ))}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm">

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-300">Business / Property name *</label>
                <input value={form.businessName} onChange={(e) => set("businessName", e.target.value)}
                  placeholder="e.g. Hotel Sunrise Indirapuram"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
                <p className="mt-1 text-[11px] text-zinc-500">Use the exact name as on Google Business Profile.</p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-300">Business type *</label>
                <div className="flex flex-wrap gap-2">
                  {BUSINESS_TYPES.map((bt) => (
                    <button key={bt} onClick={() => set("businessType", bt)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${form.businessType === bt ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40" : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"}`}>
                      {bt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-300">Your website domain (optional)</label>
                <input value={form.selfDomain} onChange={(e) => set("selfDomain", e.target.value)}
                  placeholder="e.g. hotelsunrise.com"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
              </div>
              <button onClick={() => setStep(2)} disabled={form.businessName.trim().length <= 2}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40">
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-300">Click on the map to pin your property location</label>
                <div className="relative overflow-hidden rounded-xl border border-zinc-700 bg-zinc-800" style={{ height: "220px" }}>
                  <div ref={mapPickerRef} style={{ width: "100%", height: "100%", cursor: "crosshair" }} />
                  {!form.lat && !form.lng && (
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-zinc-900/60">
                      <Crosshair className="h-7 w-7 text-emerald-400 opacity-80" />
                      <p className="text-xs font-medium text-zinc-300">Click anywhere on the map to set your location</p>
                    </div>
                  )}
                </div>
                <p className="mt-1.5 text-[11px] text-zinc-500 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-emerald-400 shrink-0" />
                  Click the map — coordinates, city and district will auto-fill below.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-800/30 p-3 flex items-center justify-between gap-3">
                <p className="text-xs text-zinc-400">Or use your current GPS location:</p>
                <button onClick={detectLocation}
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-400 border border-emerald-500/20 transition hover:bg-emerald-500/20">
                  <Navigation className="h-3.5 w-3.5" /> Auto-detect
                </button>
              </div>
              {locationError && <p className="text-xs text-rose-400">{locationError}</p>}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-300">Latitude</label>
                  <input value={form.lat} onChange={(e) => set("lat", e.target.value)} placeholder="28.6139"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-500" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-300">Longitude</label>
                  <input value={form.lng} onChange={(e) => set("lng", e.target.value)} placeholder="77.2090"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-300">District / Area *</label>
                  <input value={form.district} onChange={(e) => set("district", e.target.value)} placeholder="e.g. Indirapuram"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-500" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-300">City *</label>
                  <input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="e.g. Ghaziabad"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-300">State</label>
                  <input value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="e.g. Uttar Pradesh"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-500" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-300">Target radius</label>
                  <select value={form.radiusKm} onChange={(e) => set("radiusKm", e.target.value)}
                    className="w-full appearance-none rounded-xl border border-zinc-700 bg-zinc-800/60 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-emerald-500">
                    {RADIUS_OPTIONS.map((r) => <option key={r} value={r}>{r} km</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={() => setStep(1)} className="flex-1 rounded-xl border border-zinc-700 px-5 py-3 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800">Back</button>
                <button onClick={() => { setStep(3); fetchSuggestions(); }}
                  disabled={!(form.lat && form.lng && form.city && form.district)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40">
                  Continue <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <p className="text-xs text-zinc-400">
                Select keywords for <span className="text-white font-semibold">{form.district}, {form.city}</span>.
              </p>
              {loadingKws ? (
                <div className="flex items-center justify-center py-10 gap-2 text-sm text-zinc-500">
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating…
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                  {suggestions.map((kw) => (
                    <button key={kw} onClick={() => toggleKw(kw)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${selectedKws.has(kw) ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40" : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"}`}>
                      {kw}
                    </button>
                  ))}
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-300">Add a custom keyword</label>
                <div className="flex gap-2">
                  <input value={customKw} onChange={(e) => setCustomKw(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && customKw.trim()) {
                        setSuggestions((s) => [...s, customKw.trim()]);
                        toggleKw(customKw.trim()); setCustomKw("");
                      }
                    }}
                    placeholder={`${form.businessType} near ${form.district}`}
                    className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800/60 px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-500" />
                  <button onClick={() => { if (!customKw.trim()) return; setSuggestions((s) => [...s, customKw.trim()]); toggleKw(customKw.trim()); setCustomKw(""); }}
                    className="rounded-xl bg-zinc-800 px-3 text-zinc-300 transition hover:bg-zinc-700">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {selectedKws.size > 0 && <p className="text-xs text-emerald-400">✓ {selectedKws.size} keyword{selectedKws.size !== 1 ? "s" : ""} selected</p>}
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 rounded-xl border border-zinc-700 px-5 py-3 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800">Back</button>
                <button onClick={handleSubmit}
                  disabled={saving || !(selectedKws.size > 0 || form.primaryKeyword.trim().length > 2)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40">
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Setting up…</> : <><CheckCircle className="h-4 w-4" /> Finish Setup</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

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
  const cfg = BADGE_CONFIG[type] || BADGE_CONFIG.RESEARCH;
  const { Icon } = cfg;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold ring-1 ${cfg.cls}`}>
      <Icon className="h-3.5 w-3.5" />{cfg.label}
    </span>
  );
};

const RankChip = ({ rank, kind }: { rank: number | null; kind: "maps" | "organic" }) => {
  const t = rankTone(rank);
  const Icon = kind === "maps" ? MapPin : Globe;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg bg-zinc-800/70 px-2 py-1 text-xs font-bold tabular-nums ring-1 ring-zinc-700/60 ${t.text}`}>
      <Icon className="h-3.5 w-3.5" />{rank == null ? "—" : `#${Number(rank).toFixed(0)}`}
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
  const r = 52;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  const dash = (pct / 100) * c;
  const tone = pct >= 70 ? "#34d399" : pct >= 40 ? "#fbbf24" : "#fb7185";
  return (
    <div className="relative flex h-36 w-36 items-center justify-center">
      <svg viewBox="0 0 140 140" className="h-36 w-36 -rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#27272a" strokeWidth="12" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={tone} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{ transition: "stroke-dasharray 900ms cubic-bezier(.22,1,.36,1)" }} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold tabular-nums text-white">{Math.round(pct)}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Visibility</span>
      </div>
    </div>
  );
};

const Hl = ({ children }: { children: React.ReactNode }) => (
  <span className="font-semibold text-white">{children}</span>
);

const buildInsights = (keywords: any[]) => {
  if (!keywords?.length) return [];
  const out: any[] = [];

  const mapsGap = keywords.filter((k) => (k.searchVolume ?? 0) >= 30 && (k.liveGmbRank == null || k.liveGmbRank > 3)).sort((a, b) => (b.searchVolume ?? 0) - (a.searchVolume ?? 0));
  if (mapsGap[0]) {
    const g = mapsGap[0];
    out.push({ Icon: MapPinned, chip: "Local opportunity", glow: "from-emerald-500/40 via-emerald-400/20", title: "You're missing the Map Pack", body: <><Hl>"{g.keyword}"</Hl> gets about <Hl>{fmt(g.searchVolume)}</Hl> searches/month locally, but you're not in the 3-pack.</> });
  }

  const close = keywords.filter((k) => k.liveOrganicRank != null && k.liveOrganicRank > 3 && k.liveOrganicRank <= 10).sort((a, b) => a.liveOrganicRank - b.liveOrganicRank);
  if (close[0]) {
    const c = close[0];
    out.push({ Icon: Rocket, chip: "Almost there", glow: "from-teal-500/40 via-teal-400/20", title: "One push from the top 3", body: <>You rank <Hl>{fmtRank(c.liveOrganicRank)}</Hl> organically for <Hl>"{c.keyword}"</Hl>. A few quality links could move you into the top spots.</> });
  }

  const defend = keywords.filter((k) => k.liveGmbRank != null && k.liveGmbRank <= 3).sort((a, b) => (b.searchVolume ?? 0) - (a.searchVolume ?? 0));
  if (defend[0]) {
    const d = defend[0];
    out.push({ Icon: Shield, chip: "Defend", glow: "from-amber-500/40 via-amber-400/20", title: "Protect your Map Pack spot", body: <>You hold <Hl>{fmtRank(d.liveGmbRank)}</Hl> on Maps for <Hl>"{d.keyword}"</Hl>. Keep reviews flowing.</> });
  }

  return out;
};

const SmartInsightCard = ({ insights }: any) => {
  const [idx, setIdx] = useState(0);
  useEffect(() => setIdx(0), [insights.length]);
  if (!insights.length) return null;
  const ins = insights[Math.min(idx, insights.length - 1)];
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
  const t = rankTone(rank);
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
    ? row.rankHistory.filter((s: any) => s?.rank != null).map((s: any) => ({ date: new Date(s.date).toISOString().slice(5, 10), rank: s.rank })).slice(-14)
    : [];

  const tip =
    row.actionBadge === "DEFEND" ? "Hold position: keep GBP fresh — new photos, posts and review replies weekly."
      : row.actionBadge === "OPTIMIZE" ? "Tighten on-page targeting and earn 2–3 local citations to climb into the pack."
        : row.actionBadge === "TARGET" ? "Strong opportunity: build a dedicated page + GBP service entry for this term."
          : "Validate intent and volume before investing — low priority for now.";

  return (
    <div className="space-y-4 bg-zinc-950/60 p-4 sm:p-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <RankStat label="Maps / GMB rank" rank={row.liveGmbRank} kind="maps" />
        <RankStat label="Organic rank" rank={row.liveOrganicRank} kind="organic" />
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 lg:col-span-2">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <Activity className="h-4 w-4 text-teal-300" /> Rank trend
          </div>
          {history.length > 1 ? (
            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`spk-${row.keyword}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis reversed tick={{ fill: "#71717a", fontSize: 10 }} tickLine={false} axisLine={false} width={28} />
                  <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 10, fontSize: 11 }} formatter={(v: any) => [`#${v}`, "Rank"]} />
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

const AddKeywordModal = ({ open, onClose, onAdd, saving, localConfig }: any) => {
  const [text, setText] = useState("");
  if (!open) return null;
  const parsed = [...new Set(text.split(/[\n,]/).map((k: string) => k.trim().toLowerCase()).filter(Boolean))];
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
              <p className="text-xs text-zinc-500">Local volume for <span className="text-emerald-400">{localConfig?.district || "your area"}, {localConfig?.city || ""}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 transition hover:text-zinc-300"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5}
            placeholder={`hotel in ${localConfig?.district || "your area"}\nbest hotel ${localConfig?.city || "your city"}\nbudget hotel near me`}
            className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-800/60 px-3.5 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30" />
          <p className="text-[11px] text-zinc-500">One per line or comma-separated. {parsed.length} keyword(s) detected.</p>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-zinc-800 px-6 py-4">
          <button onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800">Cancel</button>
          <button onClick={() => onAdd(parsed)} disabled={saving || !parsed.length}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {saving ? "Analyzing…" : `Track ${parsed.length || ""}`.trim()}
          </button>
        </div>
      </div>
    </div>
  );
};
const TrackLinkModal = ({ open, onClose, onAdd, saving }: any) => {
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");

  if (!open) return null;
  const parsed = [...new Set(text.split(/[\n,]/).map((k: string) => k.trim().toLowerCase()).filter(Boolean))];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-teal-400/10 text-teal-300 ring-1 ring-teal-400/20">
              <Globe className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">Track specific Link</h3>
              <p className="text-xs text-zinc-500">Track organic ranking for an exact URL</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 transition hover:text-zinc-300"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-300">Website Link (URL)</label>
            <input value={url} onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. https://yourwebsite.com/specific-page"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-3.5 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-300">Keywords to check</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4}
              placeholder="hotel near me&#10;best resort in city"
              className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-800/60 px-3.5 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30" />
            <p className="text-[11px] text-zinc-500 mt-1">One per line. {parsed.length} keyword(s) detected.</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-zinc-800 px-6 py-4">
          <button onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800">Cancel</button>
          <button onClick={() => onAdd(parsed, url)} disabled={saving || !parsed.length || !url.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-5 py-2 text-sm font-semibold text-zinc-950 shadow-lg shadow-teal-500/20 transition hover:from-teal-400 hover:to-emerald-500 disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Track Link
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
    <p className="mt-1.5 max-w-sm text-sm text-zinc-500">Add local searches this property should win.</p>
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

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────

const SeoIntelligenceDashboard = () => {
  const [data, setData] = useState<any>({
    summary: null, trend: [], keywords: [], provider: "dataforseo",
    geoGrid: [], gridMeta: null, localConfig: null,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [triggeringScan, setTriggeringScan] = useState(false);


  const getAuthConfig = useCallback(() => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  }), []);

  const fetchData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const { data: res } = await axios.get(
        `${NODE_BASE_URL}/seo/seo-intelligence`,
        { params: { t: Date.now() }, ...getAuthConfig() },
      );
      const d = res.result || res;
      setData({
        summary: d.summary || null,
        trend: d.trend || [],
        keywords: d.keywords || [],
        provider: d.provider || "dataforseo",
        geoGrid: d.geoGrid || [],
        gridMeta: d.gridMeta || null,
        localConfig: d.localConfig || null,
      });
      if (!d.localConfig?.onboardingComplete) setShowOnboarding(true);
    } catch (err) { console.error("SEO fetch failed:", err); }
    finally { if (!silent) setLoading(false); }
  }, [getAuthConfig]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const status = data.gridMeta?.status;
    if (status !== "scanning" && status !== "pending") return;
    let stopped = false;
    const poll = async () => {
      if (stopped) return;
      try {
        const { data: res } = await axios.get(
          `${NODE_BASE_URL}/seo/seo-intelligence`,
          { params: { t: Date.now() }, headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } },
        );
        const d = res.result || res;
        const newStatus = d.gridMeta?.status;
        setData((prev: any) => ({ ...prev, geoGrid: d.geoGrid || [], gridMeta: d.gridMeta || null }));
        if (newStatus === "done" || newStatus === "failed") {
          stopped = true;
          clearInterval(interval);
          fetchData(true);
        }
      } catch { }
    };
    poll();
    const interval = setInterval(poll, 5_000);
    return () => { stopped = true; clearInterval(interval); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.gridMeta?.status]);

  const onScanDone = useCallback(() => {
    // 1 second wait — DB write fully commit ho jaaye
    setTimeout(() => fetchData(false), 1000);
  }, [fetchData]);
  const { progress: scanProgress, isActive: scanToastActive, dismiss: dismissScan } = useSeoProgress(onScanDone);

  const { summary, trend, keywords, provider, geoGrid, gridMeta, localConfig } = data;
  const localKeywords = keywords.filter((k: any) => !k.targetUrl);

  const insights = useMemo(() => buildInsights(keywords), [keywords]);


  const local = useMemo(() => {
    const list = keywords || [];
    const inPack = list.filter((k: any) => k.liveGmbRank != null && k.liveGmbRank <= 3).length;
    const mapsRanked = list.filter((k: any) => k.liveGmbRank != null);
    const orgRanked = list.filter((k: any) => k.liveOrganicRank != null);
    const avgMaps = mapsRanked.length ? +(mapsRanked.reduce((s: number, k: any) => s + k.liveGmbRank, 0) / mapsRanked.length).toFixed(1) : null;
    const avgOrg = orgRanked.length ? +(orgRanked.reduce((s: number, k: any) => s + k.liveOrganicRank, 0) / orgRanked.length).toFixed(1) : null;
    const total = list.length || 1;
    const packScore = (inPack / total) * 100;
    const orgScore = (orgRanked.filter((k: any) => k.liveOrganicRank <= 10).length / total) * 100;
    const visibility = list.length ? 0.65 * packScore + 0.35 * orgScore : 0;
    return { inPack, avgMaps, avgOrg, visibility };
  }, [keywords]);

  const handleAdd = async (kws: string[]) => {
    if (!kws.length) return;
    try {
      setSaving(true);
      await axios.post(`${NODE_BASE_URL}/seo/seo-intelligence/track`, {
        keywords: kws,
        selfDomain: localConfig?.selfDomain || "",
        selfHotelName: localConfig?.businessName || "",
      }, getAuthConfig());
      setModalOpen(false);
      await fetchData();
    } catch { alert("Couldn't add keywords. Please try again."); }
    finally { setSaving(false); }
  };



  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      // Yahan { type: 'local' } add karna hai payload mein
      await axios.post(`${NODE_BASE_URL}/seo/seo-intelligence/refresh`, { type: 'local' }, getAuthConfig());
      await fetchData();
    } catch { console.error("Refresh failed"); }
    finally { setRefreshing(false); }
  };

  const handleUntrack = async (keyword: string) => {
    try {
      await axios.delete(`${NODE_BASE_URL}/seo/seo-intelligence/${encodeURIComponent(keyword)}`, getAuthConfig());
      setData((d: any) => ({ ...d, keywords: d.keywords.filter((k: any) => k.keyword !== keyword) }));
    } catch { console.error("Untrack failed"); }
  };

  const handleTriggerGridScan = async () => {
    if (triggeringScan) return;
    setTriggeringScan(true);
    setData((prev: any) => ({
      ...prev,
      gridMeta: { ...(prev.gridMeta || {}), status: "pending" },
    }));
    try {
      await axios.post(`${NODE_BASE_URL}/seo/seo-intelligence/trigger-grid-scan`, {}, getAuthConfig());
      await fetchData(true);
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Scan trigger failed.";
      setData((prev: any) => ({ ...prev, gridMeta: { ...(prev.gridMeta || {}), status: "failed" } }));
      alert(msg);
    } finally { setTriggeringScan(false); }
  };

  const handleRadiusChange = async (r: number) => {
    try {
      await axios.post(`${NODE_BASE_URL}/seo/seo-intelligence/update-radius`, { radiusKm: r }, getAuthConfig());
      await axios.post(`${NODE_BASE_URL}/seo/seo-intelligence/trigger-grid-scan`, {}, getAuthConfig());
      setData((prev: any) => ({
        ...prev,
        geoGrid: [],
        gridMeta: { ...(prev.gridMeta || {}), status: "pending" },
        localConfig: { ...prev.localConfig, radiusKm: r },
      }));
      fetchData(true);
    } catch { alert("Could not update radius."); }
  };

  if (showOnboarding && !loading) {
    return (
      <OnboardingWizard
        authConfig={getAuthConfig()}
        onComplete={() => { setShowOnboarding(false); fetchData(); }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-black p-6 sm:p-8">
      <div className="pointer-events-none absolute inset-0 -z-0 opacity-[0.025]"
        style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "48px 48px" }} />

      {/* ── Welcome Banner ── */}
      {localConfig?.onboardingComplete && (
        <div className="relative mb-5 rounded-2xl border border-emerald-500/15 bg-emerald-500/5 px-5 py-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">

            {/* Left: property info */}
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-white">{localConfig.businessName}</p>
                <p className="text-xs text-zinc-400">
                  <span className="text-emerald-400 font-semibold">{localConfig.district}, {localConfig.city}</span>
                </p>
              </div>
            </div>

            {/* Right: radius + keyword */}
            <div className="flex items-center gap-4 flex-wrap">

              {/* Radius selector */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-zinc-500">Radius:</span>
                {RADIUS_OPTIONS.map((r) => (
                  <button key={r} onClick={() => handleRadiusChange(r)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${localConfig?.radiusKm === r
                      ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40"
                      : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
                      }`}>
                    {r}km
                  </button>
                ))}
              </div>

              <div className="h-4 w-px bg-zinc-700/60 hidden sm:block" />

              {/* Grid keyword */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-zinc-500">Grid keyword:</span>
                <select
                  value={gridMeta?.keyword || ""}
                  onChange={async (e) => {
                    const newKw = e.target.value;
                    if (!newKw) return;
                    await axios.post(`${NODE_BASE_URL}/seo/seo-intelligence/update-grid-keyword`, { keyword: newKw }, getAuthConfig());
                    await fetchData();
                  }}
                  className="text-[11px] font-semibold text-emerald-400 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-0.5 outline-none focus:border-emerald-500 cursor-pointer max-w-[180px]"
                >
                  {!gridMeta?.keyword && <option value="">— not set —</option>}
                  {keywords.map((k: any) => (
                    <option key={k.keyword} value={k.keyword}>{k.keyword}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-zinc-950 shadow-lg shadow-emerald-500/30">
            <MapPinned className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Local SEO Intelligence</h1>
            <p className="mt-0.5 flex items-center gap-2 text-sm text-zinc-400">
              {localConfig ? `${localConfig.district}, ${localConfig.city}` : "Maps & organic command center"}
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

      {/* ── Visibility + GeoGrid ── */}
      <div className="relative mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex items-center gap-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm z-10">
          <LocalVisibilityGauge score={local.visibility} />
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              {localConfig?.district ? `${localConfig.district} Visibility` : "Local Visibility"}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-300">
              <Hl>{local.inPack}</Hl> of <Hl>{keywords.length || 0}</Hl> tracked terms in the Map 3-Pack.
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

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-zinc-800/60 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20">
                <Map className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-white">Map Coverage — {localConfig?.district || "Your Area"}</h2>
                <p className="text-xs text-zinc-500">
                  {gridMeta?.keyword ? `"${gridMeta.keyword}"` : "Primary keyword"} · {localConfig?.radiusKm || 5}km · Auto-updated nightly
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {gridMeta?.status === "done" && <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 ring-1 ring-emerald-500/20"><CheckCircle className="h-3.5 w-3.5" /> Updated</span>}
              {gridMeta?.status === "scanning" && <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-400 ring-1 ring-amber-500/20"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Scanning…</span>}
              {gridMeta?.status === "failed" && <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold text-rose-400 ring-1 ring-rose-500/20"><AlertCircle className="h-3.5 w-3.5" /> Failed</span>}
              <button onClick={handleTriggerGridScan}
                disabled={gridMeta?.status === "scanning" || gridMeta?.status === "pending" || triggeringScan}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-[11px] font-medium text-zinc-400 transition hover:text-zinc-200 disabled:opacity-40">
                <RefreshCw className={`h-3 w-3 ${triggeringScan ? "animate-spin" : ""}`} />
                {triggeringScan ? "Starting..." : "Re-scan"}
              </button>
            </div>
          </div>

          {localConfig?.lat && localConfig?.lng ? (
            <GeoGrid
              points={geoGrid}
              centerLat={localConfig.lat}
              centerLng={localConfig.lng}
              size={gridMeta?.gridSize || 5}
              businessName={localConfig?.businessName}
              district={localConfig?.district}
              city={localConfig?.city}
              lastScanned={gridMeta?.lastScanned}
              gridStatus={gridMeta?.status}
              keyword={gridMeta?.keyword}
              onRescan={handleTriggerGridScan}
              triggeringScan={triggeringScan}
            />
          ) : (
            <div className="h-[480px] flex items-center justify-center text-zinc-500 text-sm">
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading map…
            </div>
          )}
        </div>
      </div>

      {/* ── Smart Insights ── */}
      {insights.length > 0 && (
        <div className="relative mt-4"><SmartInsightCard insights={insights} /></div>
      )}

      {/* ── Stat Cards ── */}
      <div className="relative mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Hash} label="Keywords tracked" value={summary ? fmt(summary.totalKeywords) : "—"} sub={`in ${localConfig?.city || "your area"}`} accent="bg-emerald-400" glow="bg-emerald-400" />
        <StatCard icon={MapPin} label="In Map 3-Pack" value={fmt(local.inPack)} sub="top-3 on Maps" accent="bg-teal-400" glow="bg-teal-400" />
        <StatCard icon={Globe} label="Avg organic rank" value={local.avgOrg != null ? fmtRank(local.avgOrg) : "—"} sub="organic search" accent="bg-amber-300" glow="bg-amber-300" />
        <StatCard icon={Target} label="Opportunities" value={summary ? fmt(summary.opportunities) : "—"} sub="gap terms to win" accent="bg-emerald-300" glow="bg-emerald-300" />
      </div>

      {/* ── Rank Trend Chart ── */}
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
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#27272a" }} tickFormatter={(d) => d?.slice(5)} />
                <YAxis reversed tick={{ fill: "#71717a", fontSize: 11 }} tickLine={false} axisLine={false} width={36} domain={["dataMin - 1", "dataMax + 1"]} />
                <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 12, color: "#e4e4e7", fontSize: 12 }} formatter={(v: any) => [`#${v}`, "Avg Rank"]} />
                <Area type="monotone" dataKey="avgRank" stroke="#2dd4bf" strokeWidth={2.5} fill="url(#rankFill)" dot={false} activeDot={{ r: 5, fill: "#2dd4bf" }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-600">
              Trend builds as daily rank snapshots accumulate.
            </div>
          )}
        </div>
      </div>

      {/* ── Keyword Table ── */}
      <div className="relative mt-4 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300">
              <Search className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-white">Keyword intelligence</h2>
              {localConfig && <p className="text-xs text-zinc-500">Volume = {localConfig.city} only · not India-wide</p>}
            </div>
          </div>
          {keywords.length > 0 && <p className="hidden text-xs text-zinc-600 sm:block">Tap a row for rank detail</p>}
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
                    <th className="pb-3 text-right font-semibold">
                      <span className="inline-flex items-center justify-end gap-1.5"><BarChart3 className="h-3.5 w-3.5" />Volume <span className="text-emerald-500 normal-case">(local)</span></span>
                    </th>
                    <th className="pb-3 text-right font-semibold">
                      <span className="inline-flex items-center justify-end gap-1.5"><IndianRupee className="h-3.5 w-3.5" />CPC</span>
                    </th>
                    <th className="pb-3 text-center font-semibold">
                      <span className="inline-flex items-center justify-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-emerald-400" />Maps</span>
                    </th>
                    <th className="pb-3 text-center font-semibold">
                      <span className="inline-flex items-center justify-center gap-1.5"><Globe className="h-3.5 w-3.5 text-teal-400" />Organic</span>
                    </th>
                    <th className="pb-3 pl-6 text-left font-semibold">Difficulty</th>
                    <th className="pb-3 text-left font-semibold">Action</th>
                    <th className="pb-3 pr-2" />
                  </tr>
                </thead>
                <tbody>
                  {localKeywords.map((row: any, i: number) => {
                    const key = row._id || row.keyword || String(i);
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
                          <td className="py-3.5 text-center"><RankChip rank={row.liveGmbRank} kind="maps" /></td>
                          <td className="py-3.5 text-center"><RankChip rank={row.liveOrganicRank} kind="organic" /></td>
                          <td className="py-3.5 pl-6"><DifficultyMeter value={row.keywordDifficulty} /></td>
                          <td className="py-3.5"><ActionBadge type={row.actionBadge} /></td>
                          <td className="py-3.5 pr-2 text-right">
                            <button onClick={(e) => { e.stopPropagation(); handleUntrack(row.keyword); }}
                              className="rounded-lg p-1.5 text-zinc-700 opacity-0 transition hover:bg-rose-500/10 hover:text-rose-400 group-hover:opacity-100" title="Stop tracking">
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

      {/* ── Modals ── */}
      <AddKeywordModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAdd}
        saving={saving}
        localConfig={localConfig}
      />


      {/* ── SSE Scan Toast ── */}
      {scanToastActive && scanProgress && scanProgress.status !== "queued" && (
        <ScanProgressToast
          progress={scanProgress}
          onDismiss={dismissScan}
          onRefresh={() => fetchData()}
        />
      )}
    </div>
  );
};

export default SeoIntelligenceDashboard;