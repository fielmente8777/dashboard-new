import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  X, Coins, MapPin, Globe, Grid3x3, Zap,
  TrendingDown, TrendingUp, Sparkles, RefreshCw,
} from "lucide-react";
import { NODE_BASE_URL } from "../../data/constant";
import {
  DEFAULT_SEO_PRICING, WEBSITE_PER_KW_IN, WEBSITE_PER_KW_INTL,
  type SeoTokenPricing,
} from "../../utils/seoTokenPricing";

interface TokenTransaction {
  type:      string;
  amount:    number;
  reason:    string;
  createdAt: string;
}

interface SeoTokenUsagePanelProps {
  open:    boolean;
  onClose: () => void;
}

const REASON_LABELS: Record<string, { label: string; icon: React.ElementType }> = {
  add_local_keywords:      { label: "Local keywords added",      icon: MapPin },
  refresh_local_keyword:   { label: "Local keyword refresh",     icon: RefreshCw },
  add_website_keywords:    { label: "Website keywords added",    icon: Globe },
  refresh_website_keyword: { label: "Website keyword refresh",   icon: RefreshCw },
  geo_grid_scan:           { label: "Geo-grid scan",             icon: Grid3x3 },
  grid_scan_failed_refund: { label: "Scan refund",               icon: TrendingUp },
  welcome_bonus:           { label: "Welcome bonus",             icon: Sparkles },
};

const formatDate = (iso: string) => {
  const d   = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  if (isToday) return `Today · ${time}`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) + ` · ${time}`;
};

const CREDIT_ACTIONS = (pricing: SeoTokenPricing) => [
  {
    icon:     MapPin,
    label:    "Local SEO",
    sublabel: "Per keyword",
    cost:     pricing.localPerKeyword,
    gradient: "from-violet-500/20 to-purple-600/10",
    ring:     "ring-violet-500/20",
    iconBg:   "bg-violet-500/15 text-violet-400",
    badge:    "bg-violet-500/15 text-violet-300",
  },
  {
    icon:     Globe,
    label:    "Website SEO",
    sublabel: "India · per keyword",
    cost:     WEBSITE_PER_KW_IN,
    gradient: "from-blue-500/20 to-cyan-600/10",
    ring:     "ring-blue-500/20",
    iconBg:   "bg-blue-500/15 text-blue-400",
    badge:    "bg-blue-500/15 text-blue-300",
  },
  {
    icon:     Globe,
    label:    "Website SEO",
    sublabel: "International · per keyword",
    cost:     WEBSITE_PER_KW_INTL,
    gradient: "from-cyan-500/20 to-teal-600/10",
    ring:     "ring-cyan-500/20",
    iconBg:   "bg-cyan-500/15 text-cyan-400",
    badge:    "bg-cyan-500/15 text-cyan-300",
  },
  {
    icon:     Grid3x3,
    label:    "Geo-grid scan",
    sublabel: "Full map coverage",
    cost:     pricing.geoGridScan,
    gradient: "from-amber-500/20 to-orange-600/10",
    ring:     "ring-amber-500/20",
    iconBg:   "bg-amber-500/15 text-amber-400",
    badge:    "bg-amber-500/15 text-amber-300",
  },
];

// Thin SVG arc showing balance health (0–100 %)
const BalanceArc = ({ pct }: { pct: number }) => {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const dash = Math.min(pct, 1) * circ * 0.75; // 270° arc
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" className="absolute inset-0">
      {/* track */}
      <circle
        cx="48" cy="48" r={r}
        fill="none" stroke="rgba(255,255,255,0.06)"
        strokeWidth="5" strokeDasharray={`${circ * 0.75} ${circ}`}
        strokeDashoffset={circ * 0.125}
        strokeLinecap="round"
      />
      {/* fill */}
      <circle
        cx="48" cy="48" r={r}
        fill="none"
        stroke="url(#arcGrad)"
        strokeWidth="5"
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={circ * 0.125}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)" }}
      />
      <defs>
        <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const SeoTokenUsagePanel = ({ open, onClose }: SeoTokenUsagePanelProps) => {
  const [balance, setBalance]         = useState<number | null>(null);
  const [pricing, setPricing]         = useState<SeoTokenPricing>(DEFAULT_SEO_PRICING);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loading, setLoading]         = useState(true);

  const fetchTokens = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const { data: res } = await axios.get(
        `${NODE_BASE_URL}/seo/seo-intelligence/tokens`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const d = res.result || res;
      if (d.balance      != null) setBalance(d.balance);
      if (d.pricing)               setPricing(d.pricing);
      if (d.transactions)          setTransactions(d.transactions);
    } catch (err) {
      console.error("SEO token fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) { setLoading(true); fetchTokens(); }
  }, [open, fetchTokens]);

  if (!open) return null;

  const bal      = balance ?? 0;
  const isEmpty  = !loading && bal === 0;
  const isLow    = !loading && bal > 0 && bal < 10;
  const arcPct   = Math.min(bal / 200, 1); // 200 tokens = full arc

  const statusGradient = isEmpty
    ? "from-rose-950/80 via-zinc-950 to-zinc-950"
    : isLow
    ? "from-amber-950/60 via-zinc-950 to-zinc-950"
    : "from-indigo-950/70 via-zinc-950 to-zinc-950";

  const statusColor = isEmpty ? "text-rose-400" : isLow ? "text-amber-400" : "text-violet-300";

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative z-10 flex h-full w-full max-w-[420px] flex-col overflow-hidden
                   border-l border-white/[0.06] shadow-2xl"
        style={{ background: "linear-gradient(160deg, #0f0c1a 0%, #09090b 40%, #09090b 100%)" }}
      >
        {/* ── Top gradient band ── */}
        <div
          className={`absolute inset-x-0 top-0 h-72 bg-gradient-to-b ${statusGradient} pointer-events-none`}
        />

        {/* ── Header ── */}
        <div className="relative flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl
                            bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-900/40">
              <Coins className="h-4 w-4 text-amber-950" strokeWidth={2.4} />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white">SEO Credits</h2>
              <p className="text-[11px] text-zinc-500">Balance & usage history</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-600 transition hover:bg-white/[0.06] hover:text-zinc-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Balance hero ── */}
        <div className="relative mx-5 mb-5 overflow-hidden rounded-2xl border border-white/[0.07]
                        bg-white/[0.03] p-5 backdrop-blur-sm">
          {/* subtle inner glow */}
          <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full
                          bg-violet-600/10 blur-2xl" />

          <div className="flex items-center justify-between gap-4">
            {/* Left: number */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-600">
                Available
              </p>
              <p className={`mt-1 text-5xl font-black tabular-nums leading-none ${statusColor}`}>
                {loading ? <span className="animate-pulse text-zinc-600">—</span> : bal.toLocaleString()}
              </p>
              <p className="mt-1.5 text-xs text-zinc-600">
                {isEmpty
                  ? "No credits — contact support"
                  : isLow
                  ? `Only ${bal} credit${bal === 1 ? "" : "s"} left`
                  : "credits remaining"}
              </p>
            </div>

            {/* Right: arc */}
            <div className="relative shrink-0 h-24 w-24 flex items-center justify-center">
              <BalanceArc pct={arcPct} />
              <Zap className="h-5 w-5 text-violet-400/80" />
            </div>
          </div>

          {/* Status pill */}
          {(isEmpty || isLow) && (
            <div className={`mt-4 flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-medium
              ${isEmpty
                ? "bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/20"
                : "bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20"
              }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${isEmpty ? "bg-rose-400" : "bg-amber-400"} animate-pulse`} />
              {isEmpty ? "Out of credits. Contact support to recharge." : "Running low — top up soon."}
            </div>
          )}
        </div>

        {/* ── Scrollable body ── */}
        <div className="relative flex-1 overflow-y-auto px-5 pb-6 space-y-6
                        scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">

          {/* Credit costs */}
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
              Credits per action
            </p>
            <div className="grid grid-cols-2 gap-2">
              {CREDIT_ACTIONS(pricing).map(({ icon: Icon, label, sublabel, cost, gradient, ring, iconBg, badge }) => (
                <div
                  key={`${label}-${sublabel}`}
                  className={`flex flex-col gap-3 rounded-2xl border border-white/[0.05] bg-gradient-to-br
                              ${gradient} p-4 ring-1 ${ring}`}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${iconBg}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white leading-tight">{label}</p>
                    <p className="text-[10px] text-zinc-500 leading-tight mt-0.5">{sublabel}</p>
                  </div>
                  <span className={`self-start rounded-lg px-2.5 py-1 text-xs font-bold tabular-nums ${badge}`}>
                    {cost} {cost === 1 ? "cr" : "cr"}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-2.5 text-[10px] text-zinc-700">
              Radius changes and grid keyword edits are free.
            </p>
          </div>

          {/* Usage history */}
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
              Recent activity
            </p>

            {loading ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/[0.03]" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed
                              border-white/[0.07] py-10 text-center">
                <Sparkles className="h-6 w-6 text-zinc-700" />
                <p className="text-sm text-zinc-500">No activity yet</p>
                <p className="text-xs text-zinc-700">Usage appears here after your first scan.</p>
              </div>
            ) : (
              <ul className="space-y-1.5">
                {transactions.map((tx, i) => {
                  const isCredit = tx.type === "credit" || tx.type === "refund";
                  const meta     = REASON_LABELS[tx.reason];
                  const TxIcon   = meta?.icon ?? (isCredit ? TrendingUp : TrendingDown);
                  return (
                    <li
                      key={i}
                      className="flex items-center gap-3 rounded-2xl border border-white/[0.05]
                                 bg-white/[0.025] px-4 py-3 transition hover:bg-white/[0.04]"
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl
                        ${isCredit
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-zinc-800/60 text-zinc-400"}`}
                      >
                        <TxIcon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-zinc-200">
                          {meta?.label ?? tx.reason.replace(/_/g, " ")}
                        </p>
                        <p className="text-[10px] text-zinc-600">{formatDate(tx.createdAt)}</p>
                      </div>
                      <span className={`shrink-0 text-sm font-black tabular-nums
                        ${isCredit ? "text-emerald-400" : "text-zinc-300"}`}>
                        {isCredit ? "+" : "−"}{tx.amount}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeoTokenUsagePanel;
