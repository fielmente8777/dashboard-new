import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  X, Coins, MapPin, Globe, Grid3x3, History, ArrowUpRight, ArrowDownLeft,
} from "lucide-react";
import { NODE_BASE_URL } from "../../data/constant";
import { DEFAULT_SEO_PRICING, WEBSITE_PER_KW_IN, WEBSITE_PER_KW_INTL, type SeoTokenPricing } from "../../utils/seoTokenPricing";

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

const REASON_LABELS: Record<string, string> = {
  add_local_keywords:       "Local SEO keywords added",
  refresh_local_keyword:    "Local SEO keyword refresh",
  add_website_keywords:     "Website SEO keywords added",
  refresh_website_keyword:  "Website SEO keyword refresh",
  geo_grid_scan:            "Geo-grid scan",
  grid_scan_failed_refund:  "Geo-grid scan refund",
  welcome_bonus:            "Welcome credits",
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  if (isToday) return `Today, ${time}`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) + `, ${time}`;
};

const SeoTokenUsagePanel = ({ open, onClose }: SeoTokenUsagePanelProps) => {
  const [balance, setBalance]             = useState<number | null>(null);
  const [pricing, setPricing]             = useState<SeoTokenPricing>(DEFAULT_SEO_PRICING);
  const [transactions, setTransactions]     = useState<TokenTransaction[]>([]);
  const [loading, setLoading]               = useState(true);

  const fetchTokens = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const { data: res } = await axios.get(
        `${NODE_BASE_URL}/seo/seo-intelligence/tokens`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const d = res.result || res;
      if (d.balance != null) setBalance(d.balance);
      if (d.pricing) setPricing(d.pricing);
      if (d.transactions) setTransactions(d.transactions);
    } catch (err) {
      console.error("SEO token fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetchTokens();
    }
  }, [open, fetchTokens]);

  if (!open) return null;

  const bal = balance ?? 0;
  const isEmpty = !loading && bal === 0;
  const isLow   = !loading && bal > 0 && bal < 10;

  const creditActions = [
    {
      icon:  MapPin,
      label: "Local SEO keyword",
      desc:  "Add or refresh one keyword",
      cost:  pricing.localPerKeyword,
    },
    {
      icon:  Globe,
      label: "Website SEO keyword (India)",
      desc:  "Add or refresh one keyword — India target",
      cost:  WEBSITE_PER_KW_IN,
    },
    {
      icon:  Globe,
      label: "Website SEO keyword (International)",
      desc:  "Add or refresh one keyword — outside India",
      cost:  WEBSITE_PER_KW_INTL,
    },
    {
      icon:  Grid3x3,
      label: "Geo-grid scan",
      desc:  "Full map coverage re-scan",
      cost:  pricing.geoGridScan,
    },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-zinc-800 bg-zinc-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
              <Coins className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Credits</h2>
              <p className="text-xs text-zinc-500">Usage & balance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Balance */}
          <div className={`rounded-xl border p-4 ${
            isEmpty ? "border-rose-500/30 bg-rose-500/5"
            : isLow  ? "border-amber-500/30 bg-amber-500/5"
            :         "border-zinc-800 bg-zinc-900/50"
          }`}>
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              Available credits
            </p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-white">
              {loading ? "—" : bal.toLocaleString()}
            </p>
            {isEmpty && (
              <p className="mt-2 text-xs text-rose-400">
                No credits left. Contact support to recharge.
              </p>
            )}
            {isLow && !isEmpty && (
              <p className="mt-2 text-xs text-amber-400">
                Running low — {bal} credit{bal === 1 ? "" : "s"} remaining.
              </p>
            )}
          </div>

          {/* Credit costs */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Credits per action
            </h3>
            <div className="space-y-2">
              {creditActions.map(({ icon: Icon, label, desc, cost }) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-200">{label}</p>
                      <p className="text-[11px] text-zinc-500">{desc}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs font-semibold tabular-nums text-amber-300">
                    {cost} {cost === 1 ? "credit" : "credits"}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-zinc-600">
              Changing radius or grid keyword does not use credits.
            </p>
          </div>

          {/* Usage history */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <History className="h-3.5 w-3.5 text-zinc-500" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Recent usage
              </h3>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-xl bg-zinc-900" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-800 py-8 text-center">
                <p className="text-sm text-zinc-500">No usage yet</p>
                <p className="mt-1 text-xs text-zinc-600">
                  Credit usage will appear here when you run scans.
                </p>
              </div>
            ) : (
              <ul className="space-y-1.5">
                {transactions.map((tx, i) => {
                  const isCredit = tx.type === "credit" || tx.type === "refund";
                  return (
                    <li
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/30 px-3.5 py-2.5"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                          isCredit ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-400"
                        }`}>
                          {isCredit
                            ? <ArrowDownLeft className="h-3.5 w-3.5" />
                            : <ArrowUpRight className="h-3.5 w-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-zinc-200">
                            {REASON_LABELS[tx.reason] || tx.reason.replace(/_/g, " ")}
                          </p>
                          <p className="text-[10px] text-zinc-500">
                            {formatDate(tx.createdAt)}
                          </p>
                        </div>
                      </div>
                      <span className={`shrink-0 text-sm font-semibold tabular-nums ${
                        isCredit ? "text-emerald-400" : "text-zinc-300"
                      }`}>
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
