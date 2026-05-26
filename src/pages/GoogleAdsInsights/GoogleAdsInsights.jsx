import { useContext, useEffect, useState, useRef, useMemo, createContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, RadialBarChart, RadialBar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend,
} from "recharts";

import { BASE_PATH, NEW_BASE_URL } from "../../data/constant";
import DataContext from "../../context/DataContext";

/* ============================================================================
 * DATE HELPERS & FORMATTERS
 * ========================================================================== */
const fmt = (d) => d.toISOString().slice(0, 10);
const RANGE_PRESETS = [
  { key: "7d", label: "7D", days: 7 },
  { key: "30d", label: "30D", days: 30 },
  { key: "90d", label: "90D", days: 90 },
];
const rangeFromPreset = (days) => {
  const end = new Date(); const start = new Date();
  start.setDate(end.getDate() - days);
  return { startDate: fmt(start), endDate: fmt(end) };
};
const previousRange = (range) => {
  const start = new Date(range.startDate); const end = new Date(range.endDate);
  const lengthDays = Math.round((end - start) / 86_400_000);
  const prevEnd = new Date(start); prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd); prevStart.setDate(prevStart.getDate() - lengthDays);
  return { startDate: fmt(prevStart), endDate: fmt(prevEnd) };
};

const nf = new Intl.NumberFormat("en-IN");
const compact = new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 });
const formatNumber = (n) => nf.format(Math.round(n || 0));
const formatCompact = (n) => compact.format(n || 0);
const formatCurrency = (n) => `₹${nf.format(Number((n || 0).toFixed(2)))}`;
const formatCurrencyCompact = (n) => `₹${compact.format(n || 0)}`;
const formatPercent = (n) => `${((n || 0) * 100).toFixed(2)}%`;
const formatDecimal = (n) => (n || 0).toFixed(2);
const pctChange = (curr, prev) => {
  if (prev == null || prev === 0) return null;
  return (curr - prev) / prev;
};

/* ============================================================================
 * THEME TOKENS
 * ========================================================================== */
const DARK = {
  name: "dark", bg: "#0a0a0f", panel: "#13131a", panelHi: "#1a1a24",
  border: "#26262f", borderHi: "#33333f", text: "#f4f4f6", textMut: "#8b8b97",
  textFaint: "#5a5a66", grid: "#1f1f29", tooltipBg: "#000000", glowOpacity: "1a",
  blue: "#5b8def", indigo: "#818cf8", violet: "#a78bfa", emerald: "#34d399",
  amber: "#fbbf24", rose: "#fb7185", cyan: "#22d3ee",
};
const LIGHT = {
  name: "light", bg: "#f6f7fb", panel: "#ffffff", panelHi: "#f1f3f9",
  border: "#e6e8f0", borderHi: "#d4d7e3", text: "#0f1222", textMut: "#5c6175",
  textFaint: "#9aa0b4", grid: "#eceef5", tooltipBg: "#0f1222", glowOpacity: "12",
  blue: "#3b6fe0", indigo: "#6366f1", violet: "#8b5cf6", emerald: "#10b981",
  amber: "#f59e0b", rose: "#f43f5e", cyan: "#0891b2",
};
const THEMES = { dark: DARK, light: LIGHT };
const ThemeContext = createContext(DARK);
const useTheme = () => useContext(ThemeContext);
const accentHex = (C, accent) => ({ blue: C.blue, indigo: C.indigo, violet: C.violet, emerald: C.emerald, amber: C.amber, rose: C.rose, cyan: C.cyan }[accent] || C.blue);
const deviceColors = (C) => [C.blue, C.violet, C.emerald, C.amber, C.rose];


const DEVICE_MAP = { "2": "Mobile", "3": "Tablet", "4": "Desktop", "5": "Smart TV", "6": "Other" };

const ALL = "all"; // sentinel for aggregated selections

/* ============================================================================
 * MAIN COMPONENT
 * ========================================================================== */
export default function GoogleAdsInsights() {
  const { integrationStatus, checkIntegrationStatus, isLoadingIntegrationStatus, is24HoursCompleted } = useContext(DataContext);
  const [theme, setTheme] = useState(() => { try { const saved = localStorage.getItem("gads_theme"); return saved === "dark" || saved === "light" ? saved : "dark"; } catch { return "dark"; } });
  const C = THEMES[theme] || DARK;
  const toggleTheme = () => { setTheme((t) => { const next = t === "dark" ? "light" : "dark"; try { localStorage.setItem("gads_theme", next); } catch { } return next; }); };

  const [loadingSync, setLoadingSync] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [loadingAdGroups, setLoadingAdGroups] = useState(false);
  const [loadingAds, setLoadingAds] = useState(false);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  const [accounts, setAccounts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [adGroups, setAdGroups] = useState([]);
  const [ads, setAds] = useState([]);

  const [series, setSeries] = useState([]);
  const [totals, setTotals] = useState(null);
  const [derived, setDerived] = useState(null);
  const [prevTotals, setPrevTotals] = useState(null);
  const [deviceRows, setDeviceRows] = useState([]); // dedicated device rollup

  const [campaignRows, setCampaignRows] = useState([]);

  // Default everything to ALL → account-level aggregated view (Google-Ads style).
  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState(ALL);
  const [selectedAdGroup, setSelectedAdGroup] = useState(ALL);
  const [selectedAd, setSelectedAd] = useState(ALL);

  const accountIdRef = useRef("");
  const campaignIdRef = useRef("");

  const [activePreset, setActivePreset] = useState("30d");
  const [dateRange, setDateRange] = useState(rangeFromPreset(30));
  const authHeader = { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } };

  const resolveTarget = () => {
    if (selectedAd && selectedAd !== ALL) return { entityId: selectedAd, level: "ad" };
    if (selectedCampaign && selectedCampaign !== ALL) return { entityId: selectedCampaign, level: "campaign" };
    
    return { entityId: accountIdRef.current, level: "account" };
  };

  const handleSyncAdsData = async () => {
    setLoadingSync(true);
    try {
      const currentHotelId = accountIdRef.current || "";

      
      await axios.get(`${NEW_BASE_URL}/api/v1/google-ads/sync?targetAccountId=${currentHotelId}`, authHeader);
      
      if (currentHotelId) {
       
        const campResponse = await axios.get(`${NEW_BASE_URL}/api/v1/google-ads/campaigns/${currentHotelId}`, authHeader);
        const campData = campResponse?.data?.result?.campaigns || [];
        setCampaigns(campData);

        
        const allFetchPromises = [];

        
        allFetchPromises.push(
          syncAndSummarize({ entityId: currentHotelId, level: "account", range: dateRange })
        );

        if (campData.length > 0) {
          const uniqueCampaigns = Array.from(new Map(campData.map(c => [c.campaignId, c])).values());
          uniqueCampaigns.forEach(c => {
            allFetchPromises.push(
              syncAndSummarize({ entityId: c.campaignId, level: "campaign", range: dateRange })
            );
          });
        }

        
        await Promise.allSettled(allFetchPromises);

       
        const target = resolveTarget();
        await loadFor(target, dateRange);
        buildCampaignComparison(campData, dateRange);

      } else {
        
        await getAccounts(); 
      }
      
      checkIntegrationStatus();
      
      Swal.fire({
        icon: 'success',
        title: 'Data Synced!',
        text: 'Hotel and all its campaigns are now fully loaded in the database.',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) { 
      Swal.fire("Error", error?.response?.data?.error || error.message, "error"); 
    } finally { 
      setLoadingSync(false); 
    }
  };
  const handleChangeAccount = async (accountId) => {
    setSelectedAccount(accountId); 
    accountIdRef.current = accountId;
    
    setCampaigns([]); setAdGroups([]); setAds([]);
    setSelectedCampaign(ALL); setSelectedAdGroup(ALL); setSelectedAd(ALL);
    campaignIdRef.current = "";
    
    
    resetMetrics(); 
    setCampaignRows([]);
   
    setLoadingMetrics(true);

   
    await getCampaigns(accountId);
    await loadFor({ entityId: accountId, level: "account" }, dateRange);
  };

  const handleChangeCampaign = async (campaignId) => {
    setSelectedAdGroup(ALL); setSelectedAd(ALL);
    setAdGroups([]); setAds([]);
    if (!campaignId || campaignId === ALL) {
      
      setSelectedCampaign(ALL); campaignIdRef.current = "";
      await loadFor({ entityId: accountIdRef.current, level: "account" }, dateRange);
      return;
    }
    setSelectedCampaign(campaignId); campaignIdRef.current = campaignId;
    await getAdGroups(campaignId);
    await loadFor({ entityId: campaignId, level: "campaign" }, dateRange);
  };

  const handleChangeAdGroup = async (adGroupId) => {
    setSelectedAdGroup(adGroupId); setAds([]); setSelectedAd(ALL);
    if (adGroupId && adGroupId !== ALL) await getAds(adGroupId);
   
    if (campaignIdRef.current) await loadFor({ entityId: campaignIdRef.current, level: "campaign" }, dateRange);
  };

  const handleChangeAd = async (adId) => {
    setSelectedAd(adId);
    if (adId === ALL) {
      
      const tgt = campaignIdRef.current
        ? { entityId: campaignIdRef.current, level: "campaign" }
        : { entityId: accountIdRef.current, level: "account" };
      await loadFor(tgt, dateRange);
    } else {
      await loadFor({ entityId: adId, level: "ad" }, dateRange);
    }
  };

  const handleChangePreset = async (preset) => {
    setActivePreset(preset.key); const range = rangeFromPreset(preset.days); setDateRange(range);
    await loadFor(resolveTarget(), range);
    
    if (campaigns.length) buildCampaignComparison(campaigns, range);
  };

  const resetMetrics = () => { setSeries([]); setTotals(null); setDerived(null); setPrevTotals(null); setDeviceRows([]); };

  const getAccounts = async () => {
    if (!integrationStatus?.googleAdsInsight?.status) return;

    setLoadingAccounts(true);
    try {
      const response = await axios.get(`${NEW_BASE_URL}/api/v1/google-ads/accounts`, authHeader);
      const data = response?.data?.result?.accounts || [];
      setAccounts(data);
      
      if (data.length > 0) {
       
        if (!accountIdRef.current) {
          handleChangeAccount(data[0].clientCustomerId);
        }
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Almost There!',
          text: 'No accounts found in database. Please click the "Sync Data" button on the top right.',
        });
      }
    } catch (error) {
      console.error("Failed to load accounts:", error);
    } finally { 
      setLoadingAccounts(false); 
    }
  };

  const getCampaigns = async (accountId) => {
    setLoadingCampaigns(true);
    try {
      const response = await axios.get(`${NEW_BASE_URL}/api/v1/google-ads/campaigns/${accountId}`, authHeader);
      const data = response?.data?.result?.campaigns || [];
      setCampaigns(data);
      buildCampaignComparison(data, dateRange);
    } catch (error) { setCampaigns([]); } finally { setLoadingCampaigns(false); }
  };

  const getAdGroups = async (campaignId) => {
    setLoadingAdGroups(true);
    try {
      const response = await axios.get(`${NEW_BASE_URL}/api/v1/google-ads/adgroups/${campaignId}`, authHeader);
      setAdGroups(response?.data?.result?.adGroups || []);
    } catch (error) { setAdGroups([]); } finally { setLoadingAdGroups(false); }
  };

  const getAds = async (adGroupId) => {
    setLoadingAds(true);
    try {
      const response = await axios.get(`${NEW_BASE_URL}/api/v1/google-ads/ads/${adGroupId}`, authHeader);
      setAds(response?.data?.result?.ads || []);
    } catch (error) { setAds([]); } finally { setLoadingAds(false); }
  };

  /* -------------------------------------------------------------------------
   * DATA FETCH — one place that drives every metric panel for a given target.
   * ----------------------------------------------------------------------- */
  const syncAndSummarize = async ({ entityId, level, range }) => {
    const currentAccountId = accountIdRef.current;
    if (!currentAccountId || !entityId) return null;
    
    await axios.get(`${NEW_BASE_URL}/api/v1/google-ads/metrics`, { ...authHeader, params: { accountId: currentAccountId, entityId, level, startDate: range.startDate, endDate: range.endDate, granularity: "daily" } });
   
    const response = await axios.get(`${NEW_BASE_URL}/api/v1/google-ads/metrics/summary/${entityId}`, { ...authHeader, params: { level, startDate: range.startDate, endDate: range.endDate } });
    return response?.data?.result || {};
  };

  const summaryOnly = async ({ entityId, level, range }) => {
    const response = await axios.get(`${NEW_BASE_URL}/api/v1/google-ads/metrics/summary/${entityId}`, { ...authHeader, params: { level, startDate: range.startDate, endDate: range.endDate } });
    return response?.data?.result || {};
  };

  const fetchDeviceSummary = async ({ entityId, level, range }) => {
    try {
      const response = await axios.get(`${NEW_BASE_URL}/api/v1/google-ads/metrics/devices/${entityId}`, { ...authHeader, params: { level, startDate: range.startDate, endDate: range.endDate } });
      return response?.data?.result?.devices || [];
    } catch { return []; }
  };

 
 const loadFor = async (target, range) => {
  const { entityId, level } = target;
  if (!accountIdRef.current || !entityId) return;
  setLoadingMetrics(true);
  try {
    
    const result = await summaryOnly({ entityId, level, range });
    
    if (!result || !result.totals) { resetMetrics(); return; }

    const cleanSeries = (result.series || []).map((d) => ({
      date: d.date, label: (d.date || "").slice(5),
      impressions: d.impressions || 0, clicks: d.clicks || 0,
      cost: Number((d.cost || 0).toFixed(2)), conversions: d.conversions || 0,
      conversionsValue: Number((d.conversionsValue || 0).toFixed(2)),
    }));
    setSeries(cleanSeries);
    setTotals(result.totals || null);
    setDerived(result.derived || null);

   
    const devices = await fetchDeviceSummary({ entityId, level, range });
    setDeviceRows(devices);

    
    try {
      const prev = await summaryOnly({ entityId, level, range: previousRange(range) });
      setPrevTotals(prev?.totals || null);
    } catch { setPrevTotals(null); }
  } catch (error) {
    console.error("Failed to load metrics (Network or Auth Error):", error);
    
   
    resetMetrics();
    
   
    checkIntegrationStatus();
  } finally {
    setLoadingMetrics(false);
  }
};
  const buildCampaignComparison = async (campaignList, range) => {
    if (!campaignList?.length) { setCampaignRows([]); return; }
    
    const uniqueCampaigns = Array.from(
      new Map(campaignList.map(c => [c.campaignId, c])).values()
    );

    const results = await Promise.allSettled(
      uniqueCampaigns.map(async (c) => {
        try {
          
          const r = await summaryOnly({ entityId: c.campaignId, level: "campaign", range });
          
          if (r && r.totals) {
            return {
              campaignId: c.campaignId,
              name: c.name || c.campaignId,
              isRegistered: c.isRegistered, 
              impressions: r.totals.impressions || 0,
              clicks: r.totals.clicks || 0,
              cost: r.totals.cost || 0,
              conversions: r.totals.conversions || 0,
              conversionsValue: r.totals.conversionsValue || 0,
              ctr: r.derived?.ctr || 0,
              roas: r.derived?.roas || 0,
            };
          }
          throw new Error("No data"); 
        } catch (error) {
          return {
            campaignId: c.campaignId,
            name: c.name || c.campaignId,
            isRegistered: c.isRegistered, 
            impressions: 0,
            clicks: 0,
            cost: 0,
            conversions: 0,
            conversionsValue: 0,
            ctr: 0,
            roas: 0,
          };
        }
      })
    );

    const rows = results
      .map((x) => x.value)
      .sort((a, b) => b.cost - a.cost);

    setCampaignRows(rows);
  };

    

 
  const deviceData = useMemo(() => {
    const palette = deviceColors(C);
    if (!deviceRows || deviceRows.length === 0) return [];
    
    const map = {};
    deviceRows.forEach(d => {
        const name = DEVICE_MAP[String(d.device)] || "Other";
        map[name] = (map[name] || 0) + (d.clicks || 0);
    });

    return Object.entries(map)
      .filter(([name, value]) => value > 0)
      .map(([name, value], i) => ({ 
          name, 
          value, 
          fill: palette[i % palette.length] 
      }));
  }, [deviceRows, C]);

  useEffect(() => { 
    checkIntegrationStatus(); 
  }, []);

  useEffect(() => {
    if (integrationStatus?.googleAdsInsight?.status) {
      getAccounts();
    }
  }, [integrationStatus?.googleAdsInsight?.status]);

  const funnelData = useMemo(() => {
    if (!totals) return [];
    return [{ stage: "Impressions", value: totals.impressions || 0, color: C.blue }, { stage: "Clicks", value: totals.clicks || 0, color: C.violet }, { stage: "Conversions", value: totals.conversions || 0, color: C.emerald }];
  }, [totals, C]);

  // Device donut now reads the dedicated rollup, mapped through DEVICE_MAP.
  

  const impressionShare = derived?.searchImpressionShare ?? null;
  const impressionShareApprox = derived?.searchImpressionShareApprox === true;

  
  const targetLabel = useMemo(() => {
    if (selectedAd && selectedAd !== ALL) return "Single ad";
    if (selectedCampaign && selectedCampaign !== ALL) {
      const c = campaigns.find((x) => x.campaignId === selectedCampaign);
      return c ? `Campaign: ${c.name}` : "Selected campaign";
    }
    return "All campaigns (account total)";
  }, [selectedAd, selectedCampaign, campaigns]);

  if (isLoadingIntegrationStatus) {
    return (
      <div style={{ background: C.bg }} className="min-h-screen p-8 animate-pulse">
        <div className="mb-8 flex justify-between items-center"><div className="h-8 w-64 rounded-lg" style={{ background: C.panelHi }} /></div>
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">{[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-28 rounded-2xl" style={{ background: C.panelHi }} />)}</div>
        <div className="h-96 rounded-2xl" style={{ background: C.panelHi }} />
      </div>
    );
  }

  if (!integrationStatus?.googleAdsInsight?.status) {
    return (
      <div style={{ background: C.bg }} className="flex items-center justify-center py-16 min-h-screen">
        <div className="max-w-md w-full rounded-3xl p-10 text-center" style={{ background: C.panel, border: `1px solid ${C.border}`, boxShadow: "0 24px 60px -20px rgba(0,0,0,0.7)" }}>
          <h2 className="text-2xl font-bold" style={{ color: C.text }}>Connect Google Ads</h2>
          <Link to={`${BASE_PATH}/${localStorage.getItem("hid")}/integration`} className="mt-8 inline-flex w-full items-center justify-center rounded-xl px-6 py-3.5 text-sm font-semibold text-white transition" style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.indigo})` }}>Connect Now</Link>
        </div>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={C}>
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 420, background: `radial-gradient(900px 300px at 20% -10%, ${C.blue}${C.glowOpacity}, transparent 60%), radial-gradient(700px 280px at 85% -20%, ${C.violet}${C.glowOpacity}, transparent 60%)`, pointerEvents: "none" }} />

      <div style={{ borderBottom: `1px solid ${C.border}`, position: "relative" }}>
        <div className="px-8 py-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.violet})` }}><svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M3 3v18h18M7 14l4-4 4 4 5-6" /></svg></div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: C.text }}>Google Ads Performance</h1>
              <p className="text-sm mt-0.5" style={{ color: C.textMut }}>{targetLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            
          
            <button 
              onClick={handleSyncAdsData} 
              disabled={loadingSync}
              className="inline-flex h-9 items-center justify-center rounded-xl px-4 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.indigo})`, boxShadow: `0 4px 12px ${C.blue}40` }}
            >
              {loadingSync ? (
                 <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              )}
              {loadingSync ? "Syncing..." : "Sync Data"}
            </button>
           

            <div className="inline-flex rounded-xl p-1" style={{ border: `1px solid ${C.border}`, background: C.panel }}>
              {RANGE_PRESETS.map((p) => <button key={p.key} onClick={() => handleChangePreset(p)} className="px-4 py-1.5 text-sm font-medium rounded-lg transition" style={ activePreset === p.key ? { background: C.panelHi, color: C.text, boxShadow: `0 0 0 1px ${C.borderHi}` } : { color: C.textMut, background: "transparent" } }>{p.label}</button>)}
            </div>
            <button onClick={toggleTheme} className="inline-flex h-9 w-9 items-center justify-center rounded-xl transition" style={{ border: `1px solid ${C.border}`, background: C.panel, color: C.textMut }}>
              {theme === "dark" ? <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg> : <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z" /></svg>}
            </button>
          </div>
        </div>

        <div className="px-8 pb-5 flex flex-wrap gap-3">
          <Select label="Account" value={selectedAccount} loading={loadingAccounts} disabled={loadingAccounts} onChange={handleChangeAccount}
            options={accounts.map((a) => ({ value: a.clientCustomerId, label: a.accountName }))} />

<Select 
            label="Campaign" 
            value={selectedCampaign} 
            loading={loadingCampaigns} 
            disabled={!selectedAccount || loadingCampaigns} 
            onChange={handleChangeCampaign}
            options={[{ value: ALL, label: "All Campaigns (Account)" }, ...campaigns.map((c) => ({ value: c.campaignId, label: c.name }))]}
          />  
          <Select label="Ad Group" value={selectedAdGroup} loading={loadingAdGroups} disabled={selectedCampaign === ALL || loadingAdGroups} onChange={handleChangeAdGroup}
            options={[{ value: ALL, label: "All Ad Groups" }, ...adGroups.map((g) => ({ value: g.adGroupId, label: g.name }))]} />

          <Select label="Ad" value={selectedAd} loading={loadingAds} disabled={selectedAdGroup === ALL || loadingAds} onChange={handleChangeAd}
            options={[{ value: ALL, label: "All Ads (Aggregated)" }, ...ads.map((a) => ({ value: a.adId, label: a.finalUrls?.[0] || a.adId }))]} />
        </div>
      </div>

      <div className="px-8 py-8" style={{ position: "relative" }}>
        {loadingMetrics ? (
          <DashboardSkeleton />
        ) : series.length > 0 ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
              <KpiCard label="Impressions" value={formatNumber(totals?.impressions)} accent="blue" delta={pctChange(totals?.impressions, prevTotals?.impressions)} />
              <KpiCard label="Clicks" value={formatNumber(totals?.clicks)} accent="indigo" delta={pctChange(totals?.clicks, prevTotals?.clicks)} />
              <KpiCard label="Cost" value={formatCurrency(totals?.cost)} accent="violet" delta={pctChange(totals?.cost, prevTotals?.cost)} invertDelta />
              <KpiCard label="Conversions" value={formatNumber(totals?.conversions)} accent="emerald" delta={pctChange(totals?.conversions, prevTotals?.conversions)} />
              <KpiCard label="CTR" value={formatPercent(derived?.ctr)} accent="amber" hint="Click-through rate" />
              <KpiCard label="Avg. CPC" value={formatCurrency(derived?.averageCpc)} accent="rose" hint="Cost per click" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <MiniStat label="Conversion Rate" value={formatPercent(derived?.conversionRate)} />
              <MiniStat label="Cost / Conversion" value={formatCurrency(derived?.costPerConversion)} />
              <MiniStat 
                label="ROAS" 
                value={(totals?.cost > 0 && totals?.conversionsValue > 0) ? `${formatDecimal(derived?.roas)}×` : "N/A"} 
                accent={C.emerald} 
              />
              <MiniStat label="Conv. Value" value={formatCurrency(totals?.conversionsValue)} />
            </div>

            <Panel title="Engagement Trend" subtitle="Daily clicks &amp; conversions" className="mb-6">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={series} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.indigo} stopOpacity={0.35} /><stop offset="95%" stopColor={C.indigo} stopOpacity={0} /></linearGradient>
                    <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.emerald} stopOpacity={0.35} /><stop offset="95%" stopColor={C.emerald} stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: C.textFaint }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: C.textFaint }} axisLine={false} tickLine={false} />
                  <Tooltip content={<DarkTooltip />} cursor={{ stroke: C.borderHi }} />
                  <Legend wrapperStyle={{ fontSize: 13, paddingTop: 10, color: C.textMut }} iconType="circle" />
                  <Area type="monotone" dataKey="clicks" name="Clicks" stroke={C.indigo} strokeWidth={2.5} fill="url(#clicksGrad)" />
                  <Area type="monotone" dataKey="conversions" name="Conversions" stroke={C.emerald} strokeWidth={2.5} fill="url(#convGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </Panel>

            <Panel title="Spend vs. Revenue" subtitle="Daily cost against conversion value (₹)" className="mb-6" badge={`ROAS ${formatDecimal(derived?.roas)}×`} badgeColor={C.emerald}>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={series} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: C.textFaint }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: C.textFaint }} axisLine={false} tickLine={false} />
                  <Tooltip content={<DarkTooltip currency />} cursor={{ stroke: C.borderHi }} />
                  <Legend wrapperStyle={{ fontSize: 13, paddingTop: 10 }} iconType="circle" />
                  <Line type="monotone" dataKey="cost" name="Cost" stroke={C.violet} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="conversionsValue" name="Conv. Value" stroke={C.cyan} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </Panel>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <Panel title="Conversion Funnel" subtitle="Impressions → Clicks → Conversions">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={funnelData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: C.textFaint }} axisLine={false} tickLine={false} tickFormatter={formatCompact} />
                    <YAxis type="category" dataKey="stage" tick={{ fontSize: 12, fill: C.textMut }} axisLine={false} tickLine={false} width={92} />
                    <Tooltip content={<DarkTooltip />} cursor={{ fill: C.panelHi }} />
                    <Bar dataKey="value" name="Count" radius={[0, 6, 6, 0]}>{funnelData.map((d, i) => <Cell key={i} fill={d.color} />)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
                <FunnelRates totals={totals} derived={derived} />
              </Panel>

              <Panel title="Clicks by Device" subtitle="Distribution across devices">
                {deviceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={deviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={58} outerRadius={88} paddingAngle={3} stroke="none">
                        {deviceData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Pie>
                      <Tooltip content={<DarkTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <EmptyMini text="No device data for this selection yet — try a Sync." />}
              </Panel>

              <Panel title="Search Impression Share" subtitle={selectedAd !== ALL ? "Not available at ad level" : "Share of eligible impressions"}>
                {impressionShare != null ? (
                  <div className="relative">
                    <ResponsiveContainer width="100%" height={240}>
                      <RadialBarChart cx="50%" cy="50%" innerRadius="68%" outerRadius="100%" barSize={18} startAngle={220} endAngle={-40} data={[{ name: "share", value: Math.min(impressionShare * 100, 100), fill: C.cyan }]}>
                        <RadialBar background={{ fill: C.panelHi }} dataKey="value" cornerRadius={10} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-4xl font-bold tabular-nums" style={{ color: C.text }}>{formatPercent(impressionShare)}</span>
                      <span className="text-xs mt-1" style={{ color: C.textMut }}>{impressionShareApprox ? "weighted avg (approx)" : "of available impressions"}</span>
                    </div>
                  </div>
                ) : <EmptyMini text={selectedAd !== ALL ? "Switch to a campaign/account view to see impression share." : "No impression share data for this range."} />}
              </Panel>
            </div>

            <Panel title="Campaign Comparison" subtitle="Ranked by spend in selected range">
              {campaignRows.length > 0 ? (
                <div className="overflow-x-auto -mx-2">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ color: C.textFaint }} className="text-left">
                      <Th>Campaign</Th><Th right>Impr.</Th><Th right>Clicks</Th><Th right>CTR</Th><Th right>Cost</Th><Th right>Conv.</Th><Th right>ROAS</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaignRows.map((r) => (
                        <tr key={r.campaignId} style={{ borderTop: `1px solid ${C.border}`, cursor: "pointer" }} className="transition hover:opacity-80"
                          onClick={() => handleChangeCampaign(r.campaignId)}>
                         <Td>
                         <span className="font-medium" style={{ color: C.text }}>{r.name}</span>
                          </Td>
                          <Td right>{formatCompact(r.impressions)}</Td>
                          <Td right>{formatCompact(r.clicks)}</Td>
                          <Td right>{formatPercent(r.ctr)}</Td>
                          <Td right>{formatCurrencyCompact(r.cost)}</Td>
                          <Td right>{formatNumber(r.conversions)}</Td>
                          
                      
                          <Td right>
                            {r.roas > 0 ? (
                              <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold" style={{ background: r.roas >= 1 ? `${C.emerald}1f` : `${C.rose}1f`, color: r.roas >= 1 ? C.emerald : C.rose }}>
                                {formatDecimal(r.roas)}×
                              </span>
                            ) : (
                              <span className="text-xs font-medium" style={{ color: C.textMut }}>N/A</span>
                            )}
                          </Td>
                          
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <EmptyMini text="No campaign rollup available yet — try a Sync." />}
            </Panel>
        
            <div className="mt-8 mb-4">
              <Panel title="Live Ad Previews" subtitle="How the client's ads appear on Google Search">
                {ads && ads.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {/* Top 6 ads dikhayenge */}
                    {ads.slice(0, 6).map((ad, idx) => (
                      <AdPreviewCard key={ad.adId || idx} ad={ad} />
                    ))}
                  </div>
                ) : (
                  <EmptyMini text="Select a Campaign and Ad Group from the dropdown above to view live ad previews." />
                )}
              </Panel>
            </div>
          </>
        ) : (
        
          <div className="flex flex-col items-center justify-center h-96 rounded-2xl transition-all" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full" style={{ background: `${C.blue}1a`, color: C.blue }}>
              <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            </div>
            
            <h3 className="text-2xl font-bold mb-3" style={{ color: C.text }}>First Time Setup</h3>
            <p className="text-sm mb-8 text-center max-w-md leading-relaxed" style={{ color: C.textMut }}>
              We don't have performance data for this hotel in our database yet. 
              Click the button below to fetch it directly from Google Ads.
              <br /><br />
              <span className="inline-block px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: C.panelHi, color: C.textFaint }}>
                ⏳ Note: The first-time fetch may take 2-3 minutes.
              </span>
            </p>
            
            <button 
              onClick={handleSyncAdsData} 
              disabled={loadingSync}
              className="inline-flex h-12 items-center justify-center rounded-xl px-8 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.indigo})`, boxShadow: `0 8px 24px ${C.blue}40` }}
            >
              {loadingSync ? (
                 <>
                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   Fetching Data... Please wait
                 </>
              ) : (
                "Fetch Data from Google"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
    </ThemeContext.Provider>
  );
}

function Panel({ title, subtitle, badge, badgeColor, className = "", children }) { const C = useTheme(); const badgeHex = badgeColor || C.violet; const shadow = C.name === "dark" ? "0 16px 40px -24px rgba(0,0,0,0.8)" : "0 8px 24px -16px rgba(15,18,34,0.18)"; return ( <div className={`rounded-2xl p-6 ${className}`} style={{ background: C.panel, border: `1px solid ${C.border}`, boxShadow: shadow }}> <div className="flex items-center justify-between mb-6"> <div> <h3 className="text-base font-semibold" style={{ color: C.text }} dangerouslySetInnerHTML={{ __html: title }} /> {subtitle && <p className="text-sm" style={{ color: C.textMut }} dangerouslySetInnerHTML={{ __html: subtitle }} />} </div> {badge && <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold" style={{ background: `${badgeHex}1f`, color: badgeHex }}>{badge}</span>} </div> {children} </div> ); }
function KpiCard({ label, value, accent = "blue", hint, delta, invertDelta }) { const C = useTheme(); const hex = accentHex(C, accent); const showDelta = delta != null && Number.isFinite(delta); const isGood = invertDelta ? delta <= 0 : delta >= 0; const deltaColor = isGood ? C.emerald : C.rose; const shadow = C.name === "dark" ? "0 10px 30px -20px rgba(0,0,0,0.9)" : "0 6px 18px -14px rgba(15,18,34,0.22)"; return ( <div className="relative overflow-hidden rounded-2xl p-5 transition hover:-translate-y-0.5" style={{ background: C.panel, border: `1px solid ${C.border}`, boxShadow: shadow }}> <div className="absolute left-0 top-0 h-full w-1" style={{ background: hex }} /> <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full blur-xl" style={{ background: hex, opacity: C.name === "dark" ? 0.2 : 0.14 }} /> <p className="text-xs font-medium uppercase tracking-wide" style={{ color: C.textFaint }}>{label}</p> <p className="mt-2 text-2xl font-bold tabular-nums" style={{ color: C.text }}>{value}</p> <div className="mt-1 flex items-center gap-2 h-4"> {showDelta ? ( <span className="inline-flex items-center gap-0.5 text-xs font-semibold" style={{ color: deltaColor }}> <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ transform: delta >= 0 ? "none" : "rotate(180deg)" }}> <path d="M5 12l7-7 7 7" /> </svg> {Math.abs(delta * 100).toFixed(1)}% </span> ) : hint ? <span className="text-xs" style={{ color: C.textFaint }}>{hint}</span> : null} </div> </div> ); }
function MiniStat({ label, value, accent }) { const C = useTheme(); return ( <div className="rounded-xl px-5 py-4" style={{ background: C.panel, border: `1px solid ${C.border}` }}> <p className="text-xs font-medium" style={{ color: C.textFaint }}>{label}</p> <p className="mt-1 text-lg font-semibold tabular-nums" style={{ color: accent || C.text }}>{value}</p> </div> ); }
function FunnelRates({ totals, derived }) { const C = useTheme(); if (!totals) return null; return ( <div className="mt-4 grid grid-cols-2 gap-3"> <div className="rounded-lg px-3 py-2" style={{ background: C.panelHi }}> <p className="text-xs" style={{ color: C.textFaint }}>CTR</p> <p className="text-sm font-semibold tabular-nums" style={{ color: C.text }}>{formatPercent(derived?.ctr)}</p> </div> <div className="rounded-lg px-3 py-2" style={{ background: C.panelHi }}> <p className="text-xs" style={{ color: C.textFaint }}>Conv. Rate</p> <p className="text-sm font-semibold tabular-nums" style={{ color: C.text }}>{formatPercent(derived?.conversionRate)}</p> </div> </div> ); }
function DarkTooltip({ active, payload, label, currency }) { const C = useTheme(); if (!active || !payload || !payload.length) return null; const onTip = "#ffffff"; const onTipMut = "rgba(255,255,255,0.6)"; const shadow = C.name === "dark" ? "0 12px 30px rgba(0,0,0,0.6)" : "0 12px 30px rgba(15,18,34,0.35)"; return ( <div className="rounded-xl px-4 py-3" style={{ background: C.tooltipBg, border: `1px solid ${C.borderHi}`, boxShadow: shadow }}> {label != null && <p className="text-xs font-medium mb-2" style={{ color: onTipMut }}>{label}</p>} {payload.map((entry) => ( <div key={entry.name} className="flex items-center gap-2 text-sm"> <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.payload?.fill }} /> <span style={{ color: onTipMut }}>{entry.name}:</span> <span className="font-semibold tabular-nums" style={{ color: onTip }}> {currency ? `₹${nf.format(Number((entry.value || 0).toFixed(2)))}` : nf.format(entry.value || 0)} </span> </div> ))} </div> ); }
function Select({ label, value, onChange, options, loading, disabled }) { const C = useTheme(); const hasOptions = options && options.length > 0; return ( <div className="min-w-[180px]"> <label className="block text-xs font-medium mb-1.5" style={{ color: C.textMut }}>{label}</label> <select className="w-full rounded-xl px-3.5 py-2.5 text-sm transition focus:outline-none disabled:cursor-not-allowed" style={{ background: C.panel, border: `1px solid ${C.border}`, color: hasOptions ? C.text : C.textFaint }} value={value} disabled={disabled || loading || !hasOptions} onChange={(e) => onChange(e.target.value)}> {loading && <option value="">Loading…</option>} {!loading && !hasOptions && <option value="">No data</option>} {!loading && hasOptions && options.map((o) => <option key={o.value} value={o.value} style={{ background: C.panel }}>{o.label || "N/A"}</option>)} </select> </div> ); }
function Th({ children, right }) { return <th className={`px-3 py-2.5 text-xs font-medium uppercase tracking-wide ${right ? "text-right" : "text-left"}`}>{children}</th>; }
function Td({ children, right }) { const C = useTheme(); return <td className={`px-3 py-3 tabular-nums ${right ? "text-right" : "text-left"}`} style={{ color: C.textMut }}>{children}</td>; }
function EmptyMini({ text }) { const C = useTheme(); return ( <div className="flex items-center justify-center h-40 rounded-xl" style={{ background: C.panelHi, border: `1px dashed ${C.border}` }}> <p className="text-sm px-6 text-center" style={{ color: C.textFaint }}>{text}</p> </div> ); }
function DashboardSkeleton() { const C = useTheme(); const block = { background: C.panelHi }; return ( <div className="animate-pulse"> <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8"> {[1, 2, 3, 4, 5, 6].map((i) => (<div key={i} className="h-28 rounded-2xl" style={block} />))} </div> <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"> {[1, 2, 3, 4].map((i) => (<div key={i} className="h-20 rounded-xl" style={block} />))} </div> <div className="h-80 rounded-2xl mb-6" style={block} /> <div className="h-64 rounded-2xl mb-6" style={block} /> <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"> {[1, 2, 3].map((i) => (<div key={i} className="h-64 rounded-2xl" style={block} />))} </div> </div> ); }
function AdPreviewCard({ ad }) { 
  const C = useTheme(); 
  const isDark = C.name === "dark";
  
  
  const linkColor = isDark ? "#8ab4f8" : "#1a0dab";
  const urlColor = isDark ? "#bdc1c6" : "#202124";
  const descColor = isDark ? "#9aa0a6" : "#4d5156";

  
  const extractText = (arr) => (arr || []).map(x => x?.text || x).filter(Boolean);
  const headlines = extractText(ad.headlines);
  const descriptions = extractText(ad.descriptions);
  
  let displayUrl = "www.website.com";
  let rawUrl = "#"; 
  
  try { 
    if (ad.finalUrls?.[0]) {
      rawUrl = ad.finalUrls[0];
      displayUrl = new URL(rawUrl).hostname; 
    }
  } catch(e){}

  if (!headlines.length) {
     return (
       <div className="p-4 rounded-xl flex items-center justify-center h-full min-h-[120px]" style={{ border: `1px solid ${C.border}`, background: C.panel }}>
         <p className="text-xs italic" style={{ color: C.textMut }}>Display/Image Ad preview not supported yet.</p>
       </div>
     );
  }

  const title = headlines.slice(0, 3).join(" | ");
  const desc = descriptions.slice(0, 2).join(" - ");

  return (
    <div className="p-5 rounded-xl transition-all duration-200 hover:-translate-y-1 text-left" style={{ border: `1px solid ${C.border}`, background: C.panel, boxShadow: C.name === "dark" ? "0 4px 12px rgba(0,0,0,0.5)" : "0 4px 12px rgba(0,0,0,0.05)" }}>
       <div className="flex items-center gap-3 mb-1.5">
         <span className="text-[11px] font-bold tracking-wide" style={{ color: C.text }}>Sponsored</span>
         <span className="text-xs font-medium" style={{ color: urlColor }}>{displayUrl}</span>
       </div>
       
       <a 
         href={rawUrl !== "#" ? rawUrl : undefined} 
         target="_blank" 
         rel="noopener noreferrer"
         className="text-[17px] font-medium cursor-pointer hover:underline line-clamp-2 mb-1.5 leading-snug block" 
         style={{ color: linkColor, textDecorationColor: linkColor }}
       >
         {title}
       </a>
       
       <div className="text-[13px] leading-relaxed line-clamp-2" style={{ color: descColor }}>
         {desc}
       </div>
    </div>
  ); 
}