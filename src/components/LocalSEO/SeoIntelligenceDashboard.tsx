import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Search,
  TrendingUp,
  Target,
  Crown,
  Lightbulb,
  Sparkles,
  Plus,
  X,
  RefreshCw,
  Loader2,
  IndianRupee,
  BarChart3,
  Trophy,
  Trash2,
  Hash,
  ChevronDown,
  MapPin,
  MapPinned,
  Navigation,
  Crosshair,
  Globe,
  Shield,
  Rocket,
  ArrowRight,
  Activity,
  Zap,
  Building,
} from "lucide-react";

const BADGE_CONFIG: Record<
  string,
  { label: string; cls: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  TARGET: { label: "Target", cls: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/25", Icon: Target },
  OPTIMIZE: { label: "Optimize", cls: "bg-amber-400/10 text-amber-300 ring-amber-400/25", Icon: Lightbulb },
  DEFEND: { label: "Defend", cls: "bg-teal-400/10 text-teal-300 ring-teal-400/25", Icon: Crown },
  RESEARCH: { label: "Research", cls: "bg-zinc-400/10 text-zinc-300 ring-zinc-400/20", Icon: Sparkles },
};

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
      <Icon className="h-3.5 w-3.5" />
      {cfg.label}
    </span>
  );
};

const RankChip = ({ rank, kind }: { rank: number | null; kind: "maps" | "organic" }) => {
  const t = rankTone(rank);
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
  const r = 52;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  const dash = (pct / 100) * c;
  const tone = pct >= 70 ? "#34d399" : pct >= 40 ? "#fbbf24" : "#fb7185";
  return (
    <div className="relative flex h-36 w-36 items-center justify-center">
      <svg viewBox="0 0 140 140" className="h-36 w-36 -rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#27272a" strokeWidth="12" />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{ transition: "stroke-dasharray 900ms cubic-bezier(.22,1,.36,1)" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold tabular-nums text-white">{Math.round(pct)}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Visibility</span>
      </div>
    </div>
  );
};

// 🚀 NAYA PREMIUM LOCALO-STYLE GEO-GRID COMPONENT
const GeoGrid = ({ grid, size = 3 }: { grid?: (number | null)[][]; size?: number }) => {
  const hasData = Array.isArray(grid) && grid.length > 0 && grid[0].length > 0;
  const actualSize = hasData ? grid[0].length : size;

  if (!hasData) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-dashed border-zinc-700/70 bg-zinc-900/40 p-8">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#fff 2px, transparent 2px)", backgroundSize: "24px 24px" }} />
        <div className="relative flex flex-col items-center justify-center text-center">
          <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20">
            <Crosshair className="h-6 w-6" />
          </span>
          <p className="text-sm font-semibold text-zinc-200">Geo-grid not scanned yet</p>
          <p className="mt-1.5 max-w-xs text-xs text-zinc-500 leading-relaxed">
            Run a maps grid scan to generate a premium heatmap of your local rankings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-950 p-6 sm:p-8 shadow-2xl">
      {/* Sleek Radar / Map Background Pattern */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.08]" 
        style={{ 
          backgroundImage: "linear-gradient(#3f3f46 1px, transparent 1px), linear-gradient(90deg, #3f3f46 1px, transparent 1px)", 
          backgroundSize: "40px 40px",
          backgroundPosition: "center center"
        }} 
      />
      
      <div className="relative mx-auto flex justify-center">
        <div 
          className="relative grid gap-5 sm:gap-6" 
          style={{ gridTemplateColumns: `repeat(${actualSize}, minmax(0,1fr))` }}
        >
          {grid.flatMap((rowArr, ri) =>
            rowArr.map((rank, ci) => {
              const isTop = rank != null && rank <= 3;
              const isGood = rank != null && rank > 3 && rank <= 7;
              const isAvg = rank != null && rank > 7 && rank <= 15;
              const isPoor = rank != null && rank > 15;
              const isNull = rank == null;

              // Premium styling classes
              let baseClass = "bg-zinc-900 border-zinc-800 text-zinc-600";
              let glowClass = "";
              
              if (isTop) { 
                baseClass = "bg-emerald-500 border-emerald-400 text-emerald-950"; 
                glowClass = "shadow-[0_0_15px_rgba(16,185,129,0.4)] z-10"; 
              } else if (isGood) { 
                baseClass = "bg-teal-500 border-teal-400 text-teal-950 shadow-md"; 
              } else if (isAvg) { 
                baseClass = "bg-amber-400 border-amber-300 text-amber-950 shadow-md"; 
              } else if (isPoor) { 
                baseClass = "bg-rose-500 border-rose-400 text-rose-50 shadow-md"; 
              }

              return (
                <div key={`${ri}-${ci}`} className="relative flex items-center justify-center">
                  
                  {/* Connectors (Horizontal & Vertical Lines Behind Nodes) */}
                  {ci < actualSize - 1 && <div className="absolute top-1/2 left-1/2 h-[2px] w-[200%] -translate-y-1/2 bg-zinc-800/60 -z-10" />}
                  {ri < actualSize - 1 && <div className="absolute top-1/2 left-1/2 w-[2px] h-[200%] -translate-x-1/2 bg-zinc-800/60 -z-10" />}

                  {/* Pulsing Ring for Top 3 Rankings */}
                  {isTop && (
                    <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-25 duration-1000"></div>
                  )}

                  {/* Circular Pin */}
                  <div
                    className={`relative flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border-[2.5px] text-[13px] sm:text-[15px] font-black tabular-nums transition-all hover:scale-110 cursor-pointer ${baseClass} ${glowClass}`}
                    title={isNull ? "Not ranked here" : `Rank #${rank}`}
                  >
                    {isNull ? "—" : rank}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modern Legend */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
        {[
          ["bg-emerald-500 ring-emerald-400", "Top 1-3"],
          ["bg-teal-500 ring-teal-400", "Pos 4-7"],
          ["bg-amber-400 ring-amber-300", "Pos 8-15"],
          ["bg-rose-500 ring-rose-400", "Pos 16+"],
          ["bg-zinc-800 ring-zinc-700", "Not Ranked"],
        ].map(([c, l]) => (
          <span key={l} className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ring-2 ring-offset-1 ring-offset-zinc-950 ${c}`} /> 
            {l}
          </span>
        ))}
      </div>
    </div>
  );
};

const Hl = ({ children }: { children: React.ReactNode }) => <span className="font-semibold text-white">{children}</span>;

const buildInsights = (keywords: any[]) => {
  if (!keywords?.length) return [];
  const out = [];

  const mapsGap = keywords.filter((k) => (k.searchVolume ?? 0) >= 30 && (k.liveGmbRank == null || k.liveGmbRank > 3)).sort((a, b) => (b.searchVolume ?? 0) - (a.searchVolume ?? 0));
  if (mapsGap[0]) {
    const g = mapsGap[0];
    out.push({
      Icon: MapPinned,
      chip: "Local opportunity",
      glow: "from-emerald-500/40 via-emerald-400/20",
      title: "You're missing the Map Pack",
      body: <><Hl>“{g.keyword}”</Hl> gets about <Hl>{fmt(g.searchVolume)}</Hl> searches a month, but you're not in the local 3-pack. Strengthen your Google Business Profile and on-page signals to surface on Maps.</>,
    });
  }

  const close = keywords.filter((k) => k.liveOrganicRank != null && k.liveOrganicRank > 3 && k.liveOrganicRank <= 10).sort((a, b) => a.liveOrganicRank - b.liveOrganicRank);
  if (close[0]) {
    const c = close[0];
    out.push({
      Icon: Rocket,
      chip: "Almost there",
      glow: "from-teal-500/40 via-teal-400/20",
      title: "One push from the top 3",
      body: <>You rank <Hl>{fmtRank(c.liveOrganicRank)}</Hl> organically for <Hl>“{c.keyword}”</Hl>. Fresh content and a few quality links could move you into the spots that actually get clicked.</>,
    });
  }

  const defend = keywords.filter((k) => k.liveGmbRank != null && k.liveGmbRank <= 3).sort((a, b) => (b.searchVolume ?? 0) - (a.searchVolume ?? 0));
  if (defend[0]) {
    const d = defend[0];
    out.push({
      Icon: Shield,
      chip: "Defend",
      glow: "from-amber-500/40 via-amber-400/20",
      title: "Protect your Map Pack spot",
      body: <>You hold <Hl>{fmtRank(d.liveGmbRank)}</Hl> on Maps for <Hl>“{d.keyword}”</Hl>. Keep reviews and posts flowing so a competitor doesn't quietly overtake you.</>,
    });
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
                <button key={i} onClick={() => setIdx(i)} className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-emerald-400" : "w-1.5 bg-zinc-700 hover:bg-zinc-600"}`} />
              ))}
            </div>
            <button onClick={() => setIdx((i) => (i + 1) % insights.length)} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/10">
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
  const history = Array.isArray(row.rankHistory) ? row.rankHistory.filter((s: any) => s?.rank != null).map((s: any) => ({ date: new Date(s.date).toISOString().slice(5, 10), rank: s.rank })).slice(-14) : [];
  const tip = row.actionBadge === "DEFEND" ? "Hold position: keep the GBP fresh — new photos, posts and review replies weekly." : row.actionBadge === "OPTIMIZE" ? "Tighten on-page targeting and earn 2–3 local citations to climb into the pack." : row.actionBadge === "TARGET" ? "Strong opportunity: build a dedicated page + GBP service entry for this term." : "Validate intent and volume before investing — low priority for now.";
  return (
    <div className="space-y-4 bg-zinc-950/60 p-4 sm:p-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <RankStat label="Maps / GMB rank" rank={row.liveGmbRank} kind="maps" />
        <RankStat label="Organic rank" rank={row.liveOrganicRank} kind="organic" />
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
            <a href={`https://${row.topCompetitor}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 px-2.5 py-1.5 text-xs font-semibold text-zinc-300 ring-1 ring-zinc-700 transition hover:text-emerald-300">
              <Trophy className="h-3.5 w-3.5" /> Watch {row.topCompetitor}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const AddKeywordModal = ({ open, onClose, onAdd, saving }: any) => {
  const [text, setText] = useState("");
  const [selfDomain, setSelfDomain] = useState("");
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
          <button onClick={onClose} className="text-zinc-500 transition hover:text-zinc-300">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-300">Keywords</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder={"luxury resort morjim goa\ncliff top resort goa\nbeach resort near morjim"} className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-800/60 px-3.5 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30" />
            <p className="mt-1.5 text-[11px] text-zinc-500">One per line or comma-separated. {parsed.length} keyword(s) detected.</p>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-300">Your domain (optional)</label>
            <input value={selfDomain} onChange={(e) => setSelfDomain(e.target.value)} placeholder="theacaciamorjim.com" className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30" />
            <p className="mt-1.5 text-[11px] text-zinc-500">Used to detect your organic position.</p>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-300">Property name <span className="text-emerald-400">(for Maps rank)</span></label>
            <input value={selfHotelName} onChange={(e) => setSelfHotelName(e.target.value)} placeholder="e.g., The Acacia Hotel & Spa Resort" className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30" />
            <p className="mt-1.5 text-[11px] text-zinc-500">Exact GBP name — finds you in the Local 3-Pack.</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-zinc-800 px-6 py-4">
          <button onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800">Cancel</button>
          <button onClick={() => onAdd(parsed, selfDomain.trim(), selfHotelName.trim())} disabled={saving || !parsed.length} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50">
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
    <p className="mt-1.5 max-w-sm text-sm text-zinc-500">Add the local searches this property should win. We'll merge volume, your organic position, and your Maps rank into one view.</p>
    <button onClick={onAdd} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-500">
      <Plus className="h-4 w-4" /> Add keywords
    </button>
  </div>
);

const RowSkeleton = () => (
  <div className="animate-pulse space-y-2.5">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="h-12 rounded-xl bg-zinc-800/40" />
    ))}
  </div>
);

/* ════════════════════════════════ MAIN ════════════════════════════════ */
const LocalSeoIntelligenceDashboard = () => {
  const [data, setData] = useState<any>({ summary: null, trend: [], keywords: [], provider: "dataforseo" });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  
  const [gridKeyword, setGridKeyword] = useState<string>("");
  const [isScanningGrid, setIsScanningGrid] = useState(false);
  const [gridLat, setGridLat] = useState("30.713199");
  const [gridLng, setGridLng] = useState("76.806318");
  const [gridRadius, setGridRadius] = useState("1.5");
  const [gridHotelName, setGridHotelName] = useState("");

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
      const { data: res } = await axios.get(`${NODE_BASE_URL}/seo/seo-intelligence/${propertyId}`, {
        params: { t: Date.now() },
        ...getAuthConfig(),
      });
      const responseData = res.result || res;
      setData({
        summary: responseData.summary || null,
        trend: responseData.trend || [],
        keywords: responseData.keywords || [],
        provider: responseData.provider || "dataforseo",
      });
    } catch (err) {
      console.error("SEO intelligence fetch failed:", err);
      setData({ summary: null, trend: [], keywords: [], provider: "dataforseo" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(localStorage.getItem("activePropertyId"));
  }, [fetchData]);

  useEffect(() => {
    const handleProp = (e: any) => fetchData(e.detail?.property_id || localStorage.getItem("activePropertyId"));
    window.addEventListener("dashboard_property_changed", handleProp);
    return () => window.removeEventListener("dashboard_property_changed", handleProp);
  }, [fetchData]);

  const { summary, trend, keywords, provider } = data;
  const gridRow = useMemo(() => keywords?.find((k: any) => k.keyword === gridKeyword) || keywords?.[0], [keywords, gridKeyword]);
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

  // Auto-fill Target Hotel Name
  useEffect(() => {
    if (gridRow?.selfHotelName) {
      setGridHotelName(gridRow.selfHotelName);
    } else {
      setGridHotelName("");
    }
  }, [gridRow]);

  const handleAdd = async (keywords2: string[], selfDomain: string, selfHotelName: string) => {
    const propertyId = localStorage.getItem("activePropertyId");
    if (!propertyId) return alert("Select a hotel / GA property first.");
    if (!keywords2.length) return;
    try {
      setSaving(true);
      await axios.post(
        `${NODE_BASE_URL}/seo/seo-intelligence/track`,
        { property_id: propertyId, propertyId, keywords: keywords2, selfDomain, selfHotelName },
        getAuthConfig()
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
      await axios.delete(`${NODE_BASE_URL}/seo/seo-intelligence/${propertyId}/${encodeURIComponent(keyword)}`, getAuthConfig());
      setData((d: any) => ({ ...d, keywords: d.keywords.filter((k: any) => k.keyword !== keyword) }));
    } catch (err) {
      console.error("Untrack failed:", err);
    }
  };

  const handleRunGridScan = async () => {
    const propertyId = localStorage.getItem("activePropertyId");
    const targetKeyword = gridKeyword || gridRow?.keyword;
    
    if (!propertyId || !targetKeyword) return alert("Select a property and keyword first.");
    if (!gridLat || !gridLng || !gridHotelName) return alert("Latitude, Longitude and Target Hotel are required.");

    try {
      setIsScanningGrid(true);
      
      // Request bhej rahe hain
      await axios.post(
        `${NODE_BASE_URL}/seo/seo-intelligence/grid-scan`,
        {
          propertyId,
          keyword: targetKeyword,
          lat: Number(gridLat),
          lng: Number(gridLng),
          size: 3, 
          stepKm: Number(gridRadius),
          hotelName: gridHotelName 
        },
        { 
          ...getAuthConfig(),
          // 🚀 FIX: Timeout badhakar 5 minutes (300000 ms) kar diya
          // Ab frontend wait karega jab tak backend "Saved to DB" nahi kar deta!
          timeout: 300000 
        }
      );
      
      // Jaise hi backend success dega, yeh auto-refresh chal jayega!
      await fetchData(propertyId);
      
    } catch (err: any) {
      console.error("Grid scan error:", err);
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
         alert("DataForSEO is taking extra time. Check back in a minute and hit Refresh!");
      } else {
         alert("Failed to run grid scan. Backend error.");
      }
    } finally {
      setIsScanningGrid(false);
      // Failsafe: Agar galti se connection toot bhi jaye, toh UI loading hatne ke baad naya data pull kar le.
      await fetchData(propertyId); 
    }
  };

  return (
    <div className="min-h-screen rounded-3xl bg-gradient-to-b from-zinc-950 via-zinc-950 to-black p-6 sm:p-8">
      <div className="pointer-events-none absolute inset-0 -z-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-zinc-950 shadow-lg shadow-emerald-500/30">
            <MapPinned className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Local SEO Intelligence</h1>
            <p className="mt-0.5 flex items-center gap-2 text-sm text-zinc-400">
              Maps &amp; organic command center
              <span className="inline-flex items-center gap-1 rounded-md bg-zinc-900 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-300 ring-1 ring-zinc-800"><Sparkles className="h-3 w-3" /> {provider}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button onClick={handleRefresh} disabled={refreshing || !keywords.length} className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-800 disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
          <button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-500">
            <Plus className="h-4 w-4" /> Add keywords
          </button>
        </div>
      </div>

      <div className="relative mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex items-center gap-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm">
          <LocalVisibilityGauge score={local.visibility} />
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Local Visibility</p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-300"><Hl>{local.inPack}</Hl> of <Hl>{keywords.length || 0}</Hl> tracked terms sit in the Map 3-Pack.</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800/70 px-2.5 py-1 font-semibold text-emerald-300 ring-1 ring-zinc-700"><MapPin className="h-3.5 w-3.5" /> Avg Maps {fmtRank(local.avgMaps)}</span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800/70 px-2.5 py-1 font-semibold text-teal-300 ring-1 ring-zinc-700"><Globe className="h-3.5 w-3.5" /> Avg Organic {fmtRank(local.avgOrg)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-sm lg:col-span-2">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/60 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20"><Navigation className="h-4 w-4" /></span>
              <div>
                <h2 className="text-sm font-bold text-white">Map Coverage Grid</h2>
                <p className="text-xs text-zinc-500">How your rank shifts around the property</p>
              </div>
            </div>
            
            {keywords.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
                    <Building className="h-3.5 w-3.5 text-zinc-500" />
                  </span>
                  <input
                    type="text"
                    value={gridHotelName}
                    onChange={(e) => setGridHotelName(e.target.value)}
                    placeholder="Target Hotel Name"
                    className="w-32 sm:w-40 appearance-none rounded-lg border border-zinc-700 bg-zinc-800 py-1.5 pl-8 pr-2.5 text-[11px] sm:text-xs font-medium text-emerald-300 outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <input
                  type="text"
                  value={gridLat}
                  onChange={(e) => setGridLat(e.target.value)}
                  placeholder="Latitude"
                  className="w-20 sm:w-24 appearance-none rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-[11px] sm:text-xs font-medium text-zinc-200 outline-none focus:border-emerald-500 transition"
                />
                <input
                  type="text"
                  value={gridLng}
                  onChange={(e) => setGridLng(e.target.value)}
                  placeholder="Longitude"
                  className="w-20 sm:w-24 appearance-none rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-[11px] sm:text-xs font-medium text-zinc-200 outline-none focus:border-emerald-500 transition"
                />
                
                <div className="relative">
                  <select
                    value={gridRadius}
                    onChange={(e) => setGridRadius(e.target.value)}
                    className="appearance-none rounded-lg border border-zinc-700 bg-zinc-800 py-1.5 pl-3 pr-7 text-[11px] sm:text-xs font-medium text-zinc-200 outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="0.5">0.5 km Area</option>
                    <option value="1.5">1.5 km Area</option>
                    <option value="3">3.0 km Area</option>
                    <option value="5">5.0 km Area</option>
                    <option value="10">10.0 km Area</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                </div>

                <div className="relative">
                  <select
                    value={gridKeyword || gridRow?.keyword || ""}
                    onChange={(e) => setGridKeyword(e.target.value)}
                    className="appearance-none rounded-lg border border-zinc-700 bg-zinc-800 py-1.5 pl-3 pr-7 text-[11px] sm:text-xs font-medium text-zinc-200 outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {keywords.map((k: any) => (
                      <option key={k.keyword} value={k.keyword}>{k.keyword}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                </div>
                
                <button
                  onClick={handleRunGridScan}
                  disabled={isScanningGrid}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20 transition hover:bg-emerald-500/20 disabled:opacity-50"
                >
                  {isScanningGrid ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Crosshair className="h-3.5 w-3.5" />}
                  {isScanningGrid ? "Scanning..." : "Scan Grid"}
                </button>
              </div>
            )}
          </div>
          {/* NAYA CIRCULAR GEO-GRID RENDER HO RAHA HAI */}
          <GeoGrid grid={gridRow?.geoGrid} />
        </div>
      </div>

      {insights.length > 0 && (
        <div className="relative mt-4">
          <SmartInsightCard insights={insights} />
        </div>
      )}

      <div className="relative mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Hash} label="Keywords tracked" value={summary ? fmt(summary.totalKeywords) : "—"} sub="this property" accent="bg-emerald-400" glow="bg-emerald-400" />
        <StatCard icon={MapPin} label="In Map 3-Pack" value={fmt(local.inPack)} sub="top-3 on Maps" accent="bg-teal-400" glow="bg-teal-400" />
        <StatCard icon={Globe} label="Avg organic rank" value={local.avgOrg != null ? fmtRank(local.avgOrg) : "—"} sub="organic search" accent="bg-amber-300" glow="bg-amber-300" />
        <StatCard icon={Target} label="Opportunities" value={summary ? fmt(summary.opportunities) : "—"} sub="gap terms to win" accent="bg-emerald-300" glow="bg-emerald-300" />
      </div>

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
            <div className="flex h-full items-center justify-center text-sm text-zinc-600">Trend builds as daily rank snapshots accumulate.</div>
          )}
        </div>
      </div>

      <div className="relative mt-4 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300">
              <Search className="h-4 w-4" />
            </span>
            <h2 className="text-sm font-bold text-white">Keyword intelligence</h2>
          </div>
          {keywords.length > 0 && <p className="hidden text-xs text-zinc-600 sm:block">Tap a row for its local rank detail</p>}
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
                    const key = row._id || row.keyword || String(i);
                    const isOpen = expanded === key;
                    return (
                      <React.Fragment key={key}>
                        <tr onClick={() => setExpanded(isOpen ? null : key)} className={`group cursor-pointer border-t border-zinc-800/70 transition-colors ${isOpen ? "bg-zinc-800/30" : "hover:bg-zinc-800/30"}`}>
                          <td className="py-3.5 pl-2"><ChevronDown className={`h-4 w-4 text-zinc-600 transition-transform ${isOpen ? "rotate-180 text-emerald-300" : "group-hover:text-zinc-400"}`} /></td>
                          <td className="max-w-[240px] py-3.5"><span className="block truncate font-semibold text-zinc-100" title={row.keyword}>{row.keyword}</span></td>
                          <td className="py-3.5 text-right font-semibold tabular-nums text-zinc-200">{fmt(row.searchVolume)}</td>
                          <td className="py-3.5 text-right tabular-nums text-zinc-300">{fmtCurrency(row.cpc)}</td>
                          <td className="py-3.5 text-center"><RankChip rank={row.liveGmbRank} kind="maps" /></td>
                          <td className="py-3.5 text-center"><RankChip rank={row.liveOrganicRank} kind="organic" /></td>
                          <td className="py-3.5 pl-6"><DifficultyMeter value={row.keywordDifficulty} /></td>
                          <td className="py-3.5"><ActionBadge type={row.actionBadge} /></td>
                          <td className="py-3.5 pr-2 text-right">
                            <button onClick={(e) => { e.stopPropagation(); handleUntrack(row.keyword); }} className="rounded-lg p-1.5 text-zinc-700 opacity-0 transition hover:bg-rose-500/10 hover:text-rose-400 group-hover:opacity-100" title="Stop tracking"><Trash2 className="h-4 w-4" /></button>
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

export default LocalSeoIntelligenceDashboard;