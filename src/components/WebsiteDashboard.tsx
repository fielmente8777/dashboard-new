import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { NODE_BASE_URL } from "../data/constant";
import {
  Globe, Plus, X, RefreshCw, Loader2, IndianRupee, BarChart3, Trash2, Search, Link as LinkIcon, Lock
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: any) => (n == null ? "—" : Number(n).toLocaleString());
const fmtCurrency = (n: any) => (n == null ? "—" : `₹${Number(n).toFixed(2)}`);

const getOrganicRankStyle = (rank: number | null) => {
  if (rank == null) return { text: "text-zinc-500", bg: "bg-zinc-800/70" };
  if (rank <= 3) return { text: "text-emerald-300", bg: "bg-emerald-500/20" };
  if (rank <= 10) return { text: "text-teal-300", bg: "bg-teal-500/20" };
  if (rank <= 20) return { text: "text-amber-300", bg: "bg-amber-500/20" };
  return { text: "text-rose-300", bg: "bg-rose-500/20" };
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

const COUNTRIES = [
  { code: "IN", name: "India" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "AE", name: "UAE" },
  { code: "AU", name: "Australia" },
  { code: "CA", name: "Canada" },
  { code: "WORLD", name: "Worldwide (Global)" },
];

// ─── Track Link Modal ───────────────────────────────────────────
const TrackLinkModal = ({ open, onClose, onAdd, saving }: any) => {
  const [text, setText] = useState("");

  if (!open) return null;
  const parsed = [...new Set(text.split(/[\n,]/).map((k: string) => k.trim().toLowerCase()).filter(Boolean))];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
              <Plus className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">Add Keywords</h3>
              <p className="text-xs text-zinc-500">Track organic ranking for your locked website</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 transition hover:text-zinc-300"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-300">Keywords to check</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5}
              placeholder="best hotel in city&#10;luxury resort near me"
              className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-800/60 px-3.5 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30" />
            <p className="text-[11px] text-zinc-500 mt-1">One keyword per line. {parsed.length} keyword(s) detected.</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-zinc-800 px-6 py-4">
          <button onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800">Cancel</button>
          <button onClick={() => onAdd(parsed)} disabled={saving || !parsed.length}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Track Keywords
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Website SEO Dashboard ──────────────────────────────────────────────
const WebsiteSeoDashboard = () => {
  const [linkKeywords, setLinkKeywords] = useState<any[]>([]);
  const [lockedUrl, setLockedUrl] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState("IN");

  const [setupUrl, setSetupUrl] = useState("");
  const [isSettingUrl, setIsSettingUrl] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const getAuthConfig = useCallback(() => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  }), []);

  const fetchData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const { data: res } = await axios.get(
        `${NODE_BASE_URL}/seo/seo-intelligence`,
        { params: { t: Date.now() }, ...getAuthConfig() }
      );

      const config = res.result?.localConfig || res.localConfig;
      if (config?.websiteUrl) setLockedUrl(config.websiteUrl);
      if (config?.websiteCountry) setSelectedCountry(config.websiteCountry);

      const allKeywords = res.result?.keywords || res.keywords || [];
      const websiteLinksOnly = allKeywords.filter((k: any) => k.targetUrl != null && k.targetUrl !== "");
      setLinkKeywords(websiteLinksOnly);
    } catch (err) {
      console.error("Website SEO fetch failed:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [getAuthConfig]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Handle Country Dropdown Change
  // Handle Country Dropdown Change
  // Handle Country Dropdown Change
  const handleCountryChange = async (e: any) => {
    const newCountry = e.target.value;
    setSelectedCountry(newCountry);
    try {
      setLoading(true);

      // 1. Backend mein country update karo
      await axios.post(`${NODE_BASE_URL}/seo/seo-intelligence/update-website-country`, { country: newCountry }, getAuthConfig());

      // 2. Nayi country ke hisaab se ranking/volume fetch karo
      // 🔥 YAHAN BHI { type: 'website' } DAALNA ZAROORI HAI 🔥
      await axios.post(`${NODE_BASE_URL}/seo/seo-intelligence/refresh`, { type: 'website' }, getAuthConfig());

      // 3. Data UI pe laao
      await fetchData(false);

    } catch {
      alert("Failed to update country volume.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Permanent Website Setup
  const handleSetWebsite = async () => {
    if (!setupUrl.trim()) return;
    try {
      setIsSettingUrl(true);
      await axios.post(`${NODE_BASE_URL}/seo/seo-intelligence/set-website`, { websiteUrl: setupUrl }, getAuthConfig());
      await fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Setup failed");
    } finally {
      setIsSettingUrl(false);
    }
  };

  const handleAddLinkTracking = async (kws: string[]) => {
    try {
      setSaving(true);
      await axios.post(`${NODE_BASE_URL}/seo/seo-intelligence/track-link`, {
        keywords: kws,
      }, getAuthConfig());
      setModalOpen(false);
      await fetchData();
    } catch { alert("Couldn't add keywords. Please try again."); }
    finally { setSaving(false); }
  };

  const handleUntrack = async (keyword: string) => {
    try {
      await axios.delete(`${NODE_BASE_URL}/seo/seo-intelligence/${encodeURIComponent(keyword)}`, getAuthConfig());
      setLinkKeywords((prev) => prev.filter((k: any) => k.keyword !== keyword));
    } catch { console.error("Untrack failed"); }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      // Yahan { type: 'website' } add karna hai payload mein
      await axios.post(`${NODE_BASE_URL}/seo/seo-intelligence/refresh`, { type: 'website' }, getAuthConfig());
      await fetchData();
    } catch { console.error("Refresh failed"); }
    finally { setRefreshing(false); }
  };

  // SETUP SCREEN 
  if (!loading && !lockedUrl) {
    return (
      <div className="relative w-full bg-gradient-to-b from-slate-950 to-zinc-950 border border-zinc-800/60 p-10 flex flex-col items-center justify-center text-center shadow-xl">
        <span className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
          <Lock className="h-7 w-7" />
        </span>
        <h2 className="text-xl font-bold text-white mb-2">Set Your Primary Website URL</h2>
        <p className="text-sm text-zinc-400 max-w-md mb-6">
          Enter the main website link you want to track organic rankings for. <strong className="text-rose-400">This action is permanent and cannot be changed later.</strong>
        </p>
        <div className="flex w-full max-w-md gap-3">
          <input
            value={setupUrl}
            onChange={(e) => setSetupUrl(e.target.value)}
            placeholder="fielmente.com"
            className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-3 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
          />
          <button
            onClick={handleSetWebsite}
            disabled={isSettingUrl || !setupUrl.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50"
          >
            {isSettingUrl ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />} Lock URL
          </button>
        </div>
      </div>
    );
  }

  // DASHBOARD SCREEN 
  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-slate-950 to-zinc-950 border border-zinc-800/60 p-6 sm:p-8 shadow-xl overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-0 opacity-[0.02]"
        style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "48px 48px" }} />

      {/* ── Header ── */}
      <div className="relative flex flex-wrap items-start justify-between gap-4 border-b border-zinc-800/60 pb-6 mb-6">
        <div className="flex items-center gap-3.5">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
            <Globe className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Website SEO Tracker
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 font-semibold uppercase tracking-wider">
                <Lock className="h-2.5 w-2.5" /> Locked
              </span>
            </h1>
            <p className="mt-0.5 text-sm text-zinc-400 flex gap-1">
              Tracking rankings for: <a href={lockedUrl?.includes('http') ? lockedUrl : `https://${lockedUrl}`} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 transition hover:underline font-medium">{lockedUrl}</a>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">

          {/* Country/World Dropdown */}
          <div className="flex items-center gap-2 bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-2">
            <Globe className="h-4 w-4 text-blue-400" />
            <select
              value={selectedCountry}
              onChange={handleCountryChange}
              className="bg-transparent text-zinc-200 text-sm font-semibold outline-none focus:ring-0 cursor-pointer"
            >
              {COUNTRIES.map(c => <option key={c.code} value={c.code} className="bg-zinc-900">{c.name}</option>)}
            </select>
          </div>

          <button onClick={handleRefresh} disabled={refreshing || !linkKeywords.length}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-800 disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{refreshing ? "Refreshing…" : "Refresh"}</span>
          </button>

          <button onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-500 hover:to-indigo-500">
            <Plus className="h-4 w-4" /> Add Keywords
          </button>
        </div>
      </div>

      {/* ── Table Area ── */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-5 py-4 bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300">
              <Search className="h-4 w-4" />
            </span>
            <h2 className="text-sm font-bold text-white">Organic Rankings</h2>
          </div>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-zinc-500" /></div>
          ) : !linkKeywords.length ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-900/30 py-20 text-center">
              <span className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
                <Search className="h-7 w-7" />
              </span>
              <h3 className="text-base font-bold text-white">No keywords tracked yet</h3>
              <p className="mt-1.5 max-w-sm text-sm text-zinc-500">Monitor where your website ranks on Google for specific searches.</p>
              <button onClick={() => setModalOpen(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-500 hover:to-indigo-500">
                <Plus className="h-4 w-4" /> Track First Keyword
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-zinc-500 border-b border-zinc-800/60">
                    <th className="pb-3 pl-2 font-semibold w-1/3">Target Keyword</th>
                    <th className="pb-3 text-right font-semibold">
                      <span className="inline-flex items-center justify-end gap-1.5"><BarChart3 className="h-3.5 w-3.5" />Search Volume</span>
                    </th>
                    <th className="pb-3 text-right font-semibold">
                      <span className="inline-flex items-center justify-end gap-1.5"><IndianRupee className="h-3.5 w-3.5" />CPC</span>
                    </th>
                    <th className="pb-3 text-center font-semibold text-blue-400">Organic Position</th>
                    <th className="pb-3 pl-8 text-left font-semibold">Difficulty</th>
                    <th className="pb-3 pr-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {linkKeywords.map((row: any) => {
                    const rankTheme = getOrganicRankStyle(row.liveOrganicRank);
                    return (
                      <tr key={row._id || row.keyword} className="hover:bg-zinc-800/30 transition-colors group">
                        <td className="py-4 pl-2">
                          <span className="block text-sm font-bold text-zinc-100">{row.keyword}</span>
                        </td>
                        <td className="py-4 text-right font-semibold tabular-nums text-zinc-200">{fmt(row.searchVolume)}</td>
                        <td className="py-4 text-right tabular-nums text-zinc-400">{fmtCurrency(row.cpc)}</td>
                        <td className="py-4 text-center">
                          <span className={`inline-flex items-center justify-center h-8 px-3 rounded-lg text-sm font-bold tabular-nums ring-1 ring-inset ring-current/10 ${rankTheme.bg} ${rankTheme.text}`}>
                            {row.liveOrganicRank == null ? "—" : `#${row.liveOrganicRank}`}
                          </span>
                        </td>
                        <td className="py-4 pl-8"><DifficultyMeter value={row.keywordDifficulty} /></td>
                        <td className="py-4 pr-2 text-right">
                          <button onClick={() => handleUntrack(row.keyword)}
                            className="rounded-lg p-2 text-zinc-600 opacity-0 group-hover:opacity-100 transition hover:bg-rose-500/10 hover:text-rose-400" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <TrackLinkModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAddLinkTracking}
        saving={saving}
      />
    </div>
  );
};

export default WebsiteSeoDashboard;