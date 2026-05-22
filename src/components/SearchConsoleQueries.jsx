import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { BASE_URL } from "../data/constant";
import { FiSearch, FiMousePointer, FiEye, FiTrendingUp, FiLock, FiSettings } from "react-icons/fi";

const TableSkeleton = () => (
  <div className="animate-pulse space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100">
        <div className="flex items-center gap-3 w-1/3">
          <div className="h-4 w-4 rounded bg-slate-200"></div>
          <div className="h-4 w-3/4 rounded bg-slate-200"></div>
        </div>
        <div className="h-4 w-16 rounded bg-slate-200"></div>
        <div className="h-4 w-16 rounded bg-slate-200"></div>
        <div className="h-4 w-12 rounded bg-slate-200"></div>
      </div>
    ))}
  </div>
);

// Reusable empty/error state block
const StatusState = ({ icon: Icon, title, subtitle }) => (
  <div className="py-10 text-center flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-xl">
    <Icon className="w-8 h-8 text-slate-300 mb-3" />
    <p className="text-sm font-semibold text-slate-600">{title}</p>
    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">{subtitle}</p>
  </div>
);

const SearchConsoleQueries = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
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
    } catch (err) {
      // Only genuine 5xx / network failures land here
      console.error("GSC fetch failed:", err);
      setStatusCode("API_ERROR");
      setQueries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + whenever date range changes
  useEffect(() => {
    const propertyId = localStorage.getItem("activePropertyId");
    fetchQueries(dateRange, propertyId);
  }, [dateRange, fetchQueries]);

  // Event bus listeners
  useEffect(() => {
    const handleDate = (e) => {
      if (e.detail) setDateRange({ start: e.detail.start, end: e.detail.end });
    };
    // Property switch: event se naya property_id lo (warna localStorage se)
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
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              <th className="pb-3 pl-2"><div className="flex items-center gap-1.5"><FiSearch className="w-3.5 h-3.5" /> Keyword</div></th>
              <th className="pb-3 text-right"><div className="flex items-center justify-end gap-1.5"><FiMousePointer className="w-3.5 h-3.5" /> Clicks</div></th>
              <th className="pb-3 text-right"><div className="flex items-center justify-end gap-1.5"><FiEye className="w-3.5 h-3.5" /> Impressions</div></th>
              <th className="pb-3 text-right"><div className="flex items-center justify-end gap-1.5"><FiTrendingUp className="w-3.5 h-3.5" /> CTR</div></th>
              <th className="pb-3 text-right pr-2">Avg. Rank</th>
            </tr>
          </thead>
          <tbody>
            {queries.map((item, i) => {
              const widthPct = maxClicks ? (item.clicks / maxClicks) * 100 : 0;
              return (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors group">
                  <td className="py-4 pl-2 max-w-[280px]">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-bold text-slate-400 w-4 text-right">{i + 1}.</span>
                      <span className="font-semibold text-slate-800 truncate" title={item.keyword}>{item.keyword}</span>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                        <div className="h-full rounded-full bg-blue-500 transition-all duration-700 ease-out" style={{ width: `${widthPct}%` }} />
                      </div>
                      <span className="font-bold text-slate-900 min-w-[40px] tabular-nums">{item.clicks.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="py-4 text-right text-slate-600 font-medium tabular-nums">{item.impressions.toLocaleString()}</td>
                  <td className="py-4 text-right">
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-700 tabular-nums">{(item.ctr * 100).toFixed(1)}%</span>
                  </td>
                  <td className="py-4 text-right pr-2">
                    <span className="text-sm font-bold text-slate-700 tabular-nums">#{item.position.toFixed(1)}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)] border border-slate-200/80 mt-6 transition-all duration-300 hover:shadow-[0_1px_3px_rgba(15,23,42,0.06),0_12px_32px_-12px_rgba(15,23,42,0.18)]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">Top Search Queries</h2>
          <p className="text-xs text-slate-500 mt-0.5">Performance ranked by Google Search clicks</p>
        </div>
      </div>
      {renderBody()}
    </div>
  );
};

export default SearchConsoleQueries;
