import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { BASE_URL } from "../data/constant";
import { FiSearch, FiMousePointer, FiEye, FiTrendingUp, FiLock, FiSettings } from "react-icons/fi";

const TableSkeleton = () => (
  <div className="animate-pulse space-y-3">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/40 px-4 py-3.5"
      >
        <div className="flex items-center gap-3 w-1/3">
          <div className="h-6 w-6 rounded-md bg-slate-200" />
          <div className="h-3.5 w-3/4 rounded-full bg-slate-200" />
        </div>
        <div className="h-3.5 w-16 rounded-full bg-slate-200" />
        <div className="h-3.5 w-16 rounded-full bg-slate-200" />
        <div className="h-3.5 w-12 rounded-full bg-slate-200" />
      </div>
    ))}
  </div>
);

// Reusable empty/error state block
const StatusState = ({ icon: Icon, title, subtitle }) => (
  <div className="py-14 px-6 text-center flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200/80 bg-gradient-to-b from-slate-50/50 to-transparent">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06),0_8px_20px_-10px_rgba(15,23,42,0.15)] ring-1 ring-slate-100">
      <Icon className="w-6 h-6 text-slate-400" />
    </div>
    <p className="text-sm font-bold text-slate-700">{title}</p>
    <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto leading-relaxed">{subtitle}</p>
  </div>
);

const SearchConsoleQueries = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("loading");
  const [statusCode, setStatusCode] = useState(null); // null | NOT_CONFIGURED | PERMISSION_DENIED | ...
  const [dateRange, setDateRange] = useState({ start: "30daysAgo", end: "today" });

  // Fetches GSC data for a given GA property_id (backend resolves the domain)
  const fetchQueries = useCallback(async (range, propertyId) => {
    if (!propertyId) {
      setLoading(false);
      setStatusCode("NOT_CONFIGURED"); // koi property select nahi → setup prompt
      return;
    }
    try {
      setLoading(true);
      const timestamp = new Date().getTime(); // cache buster
      const { data } = await axios.get(
        `${BASE_URL}/google/analytics-search-queries/${propertyId}`,
        { params: { startDate: range.start, endDate: range.end, t: timestamp } }
      );
      // Backend returns 200 even for expected failures, with an error_code
      setStatusCode(data.error_code || null);
      setQueries(data.topQueries || []);
      
      if (!data.error_code) {
        window.dispatchEvent(
          new CustomEvent("gsc_configured", { detail: { property_id: propertyId } })
        );
      }
    } catch (err) {
      // Only genuine 5xx / network failures land here
      console.error("GSC fetch failed:", err);
      setStatusCode("API_ERROR");
      setQueries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  
  useEffect(() => {
    const propertyId = localStorage.getItem("activePropertyId");
    fetchQueries(dateRange, propertyId);
  }, [dateRange, fetchQueries]);

  
  useEffect(() => {
    const handleDate = (e) => {
      if (e.detail) setDateRange({ start: e.detail.start, end: e.detail.end });
    };
   
    const handleProp = (e) => {
      const propertyId =
        e.detail?.property_id || localStorage.getItem("activePropertyId");
      fetchQueries(dateRange, propertyId);
    };
    window.addEventListener("dashboard_date_changed", handleDate);
    window.addEventListener("dashboard_property_changed", handleProp);
    return () => {
      window.removeEventListener("dashboard_date_changed", handleDate);
      window.removeEventListener("dashboard_property_changed", handleProp);
    };
  }, [dateRange, fetchQueries]);

  const maxClicks = queries.length ? Math.max(...queries.map((q) => q.clicks)) : 0;

  
  const totals = queries.reduce(
    (acc, q) => {
      acc.clicks += q.clicks || 0;
      acc.impressions += q.impressions || 0;
      return acc;
    },
    { clicks: 0, impressions: 0 }
  );
  const avgCtr = totals.impressions ? (totals.clicks / totals.impressions) * 100 : 0;

  const renderBody = () => {
    if (loading) return <TableSkeleton />;
    if (statusCode === "NOT_CONFIGURED") {
      return (
        <StatusState
          icon={FiSettings}
          title="Search Console is not configured for this hotel"
          subtitle="Add this hotel's Search Console domain in Settings to start tracking search performance."
        />
      );
    }
    if (statusCode === "PERMISSION_DENIED" || statusCode === "BAD_SITE_URL") {
      return (
        <StatusState
          icon={FiLock}
          title="We don't have Search Console access for this hotel"
          subtitle="This hotel's Google account hasn't granted Search Console access, or the domain isn't configured correctly."
        />
      );
    }
    if (statusCode === "API_ERROR") {
      return (
        <StatusState
          icon={FiSearch}
          title="Couldn't load search data"
          subtitle="Something went wrong fetching Search Console data. Please try again shortly."
        />
      );
    }
    if (queries.length === 0) {
      return (
        <StatusState
          icon={FiSearch}
          title="No search query data found"
          subtitle="There's no Search Console data for the selected date range yet."
        />
      );
    }

    return (
      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-app-text dark:text-app-text-muted font-semibold">
              <th className="pb-3 pl-4">
                <div className="flex items-center gap-1.5">
                  <FiSearch className="w-3.5 h-3.5" /> Keyword
                </div>
              </th>
              <th className="pb-3 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <FiMousePointer className="w-3.5 h-3.5" /> Clicks
                </div>
              </th>
              <th className="pb-3 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <FiEye className="w-3.5 h-3.5" /> Impressions
                </div>
              </th>
              <th className="pb-3 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <FiTrendingUp className="w-3.5 h-3.5" /> CTR
                </div>
              </th>
              <th className="pb-3 text-right pr-4">Avg. Rank</th>
            </tr>
          </thead>
          <tbody>
            {queries.map((item, i) => {
              const widthPct = maxClicks ? (item.clicks / maxClicks) * 100 : 0;
              const isTop = i === 0;
              return (
                <tr
                  key={i}
                  className="group border-t border-slate-100 transition-colors hover:bg-slate-50/20"
                >
                  <td className="py-4 pl-4 max-w-[280px]">
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold tabular-nums ${
                          isTop
                            ? "bg-blue-50 text-blue-600 ring-1 ring-blue-100"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span
                        className="font-semibold text-app-text dark:text-app-text truncate"
                        title={item.keyword}
                      >
                        {item.keyword}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-700 ease-out"
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                      <span className="font-bold text-gray-400 min-w-[40px] tabular-nums">
                        {item.clicks.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-right text-gray-400 font-medium tabular-nums">
                    {item.impressions.toLocaleString()}
                  </td>
                  <td className="py-4 text-right">
                    <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 tabular-nums group-hover:bg-white group-hover:ring-1 group-hover:ring-slate-200 transition-all">
                      {(item.ctr * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-4 text-right pr-4">
                    <span className="text-sm font-bold text-gray-400 tabular-nums">
                      #{item.position.toFixed(1)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const showSummary = !loading && !statusCode && queries.length > 0;

  return (
    <div className="bg-app-surface p-6 rounded-2xl shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)] border border-slate-200/80 mt-6 transition-all duration-300 hover:shadow-[0_1px_3px_rgba(15,23,42,0.06),0_12px_32px_-12px_rgba(15,23,42,0.18)]">
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-app-text dark:text-app-text-muted to-blue-700 text-white shadow-sm">
            <FiSearch className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-app-text dark:text-app-text">
              Top Search Queries
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Performance ranked by Google Search clicks
            </p>
          </div>
        </div>

        {/* Summary chips — only render when we have real data */}
        {showSummary && (
          <div className="flex items-center gap-2">
            <SummaryChip
              label="Clicks"
              value={totals.clicks.toLocaleString()}
              icon={FiMousePointer}
            />
            <SummaryChip
              label="Impressions"
              value={totals.impressions.toLocaleString()}
              icon={FiEye}
            />
            <SummaryChip
              label="Avg. CTR"
              value={`${avgCtr.toFixed(1)}%`}
              icon={FiTrendingUp}
            />
          </div>
        )}
      </div>
      {renderBody()}
    </div>
  );
};

// Compact KPI chip for the header summary row
const SummaryChip = ({ label, value, icon: Icon }) => (
  <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2">
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm ring-1 ring-slate-100">
      <Icon className="h-3.5 w-3.5" />
    </span>
    <div className="leading-tight">
      <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p className="text-sm font-bold tabular-nums text-slate-900">{value}</p>
    </div>
  </div>
);

export default SearchConsoleQueries;