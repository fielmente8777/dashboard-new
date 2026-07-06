import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Coins } from "lucide-react";
import { NODE_BASE_URL } from "../../data/constant";
import { DEFAULT_SEO_PRICING, type SeoTokenPricing } from "../../utils/seoTokenPricing";
import { SEO_TOKENS_CHANGED } from "../../utils/seoTokenEvents";
import SeoTokenUsagePanel from "./SeoTokenUsagePanel";

const CACHE_KEY = "seo_token_balance_cache";

const SeoTokenBalanceCard = () => {
  const [balance, setBalance] = useState<number | null>(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached != null ? Number(cached) : null;
  });
  const [pricing, setPricing] = useState<SeoTokenPricing>(DEFAULT_SEO_PRICING);
  const [loading, setLoading] = useState(balance === null);
  const [panelOpen, setPanelOpen] = useState(false);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);

  const fetchTokens = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const { data: res } = await axios.get(
        `${NODE_BASE_URL}/seo/seo-intelligence/tokens`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const d = res.result || res;
      if (d.balance != null) {
        setBalance(d.balance);
        localStorage.setItem(CACHE_KEY, String(d.balance));
      }
      if (d.pricing) setPricing(d.pricing);
    } catch {
      // Retry once after 8s so balance recovers after a server restart
      if (mounted.current) {
        retryTimer.current = setTimeout(() => {
          if (mounted.current) fetchTokens();
        }, 8_000);
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    fetchTokens();

    const onUpdate = () => fetchTokens();
    const onFocus  = () => fetchTokens();

    window.addEventListener(SEO_TOKENS_CHANGED, onUpdate);
    window.addEventListener("focus", onFocus);

    return () => {
      mounted.current = false;
      if (retryTimer.current) clearTimeout(retryTimer.current);
      window.removeEventListener(SEO_TOKENS_CHANGED, onUpdate);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchTokens]);

  const isLow   = balance != null && balance > 0 && balance < pricing.localPerKeyword;
  const isEmpty = balance === 0;
  const display = loading && balance === null ? "…" : (balance ?? 0).toLocaleString();

  let ringCls = "ring-indigo-200/50 shadow-indigo-500/10";
  if (isEmpty) ringCls = "ring-rose-400/40 shadow-rose-500/20";
  else if (isLow) ringCls = "ring-amber-400/40 shadow-amber-500/15";

  return (
    <>
      <button
        type="button"
        onClick={() => setPanelOpen(true)}
        className={`fixed top-4 right-4 z-[100] flex items-center gap-2.5 rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900/95 via-indigo-950/95 to-violet-950/95 px-3.5 py-2.5 shadow-lg backdrop-blur-md ring-1 transition hover:ring-indigo-400/40 hover:scale-[1.02] cursor-pointer ${ringCls}`}
        title="View credits & usage"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 shadow-inner">
          <Coins className="h-4 w-4 text-amber-950" strokeWidth={2.2} />
        </div>
        <div className="min-w-0 pr-1 text-left">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-300/70 leading-none">
            Credits
          </p>
          <p className="mt-0.5 text-lg font-bold tabular-nums leading-none text-white">
            {display}
          </p>
        </div>
        {isEmpty && (
          <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-semibold text-rose-300">
            Empty
          </span>
        )}
        {isLow && !isEmpty && (
          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-200">
            Low
          </span>
        )}
      </button>
      <SeoTokenUsagePanel open={panelOpen} onClose={() => setPanelOpen(false)} />
    </>
  );
};

export default SeoTokenBalanceCard;
