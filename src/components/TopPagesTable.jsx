import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../data/constant";
import { FiExternalLink } from "react-icons/fi";

const TopPagesTable = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: "30daysAgo", end: "today" });

  const fetchPages = async () => {
    const hid = localStorage.getItem("hid");
    if (!hid) return;
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${BASE_URL}/google/analytics-pages/${hid}?startDate=${dateRange.start}&endDate=${dateRange.end}`
      );
      setPages(data.topPages || []);
    } catch (err) {
      console.error("Failed to fetch top pages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPages(); }, [dateRange]);

  useEffect(() => {
    const handleDate = (e) => setDateRange(e.detail);
    const handleProp = () => fetchPages();
    window.addEventListener("dashboard_date_changed", handleDate);
    window.addEventListener("dashboard_property_changed", handleProp);
    return () => {
      window.removeEventListener("dashboard_date_changed", handleDate);
      window.removeEventListener("dashboard_property_changed", handleProp);
    };
  }, []);

  const formatDuration = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return `${m}m ${s}s`;
  };

  if (loading) return null;
  if (pages.length === 0) return null;

  const maxViews = Math.max(...pages.map(p => p.views));

  return (
    <div className="bg-white  dark:bg-app-surface p-6 rounded-xl shadow-sm border border-gray-200 mt-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-app-text dark:text-app-text-muted">Top Pages</h2>
          <p className="text-xs text-gray-500 mt-0.5">Performance ranked by total page views</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500">
              <th className="pb-3 font-semibold">Page</th>
              <th className="pb-3 font-semibold text-right">Views</th>
              <th className="pb-3 font-semibold text-right">Users</th>
              <th className="pb-3 font-semibold text-right">Avg. Time</th>
              <th className="pb-3 font-semibold text-right">Bounce</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page, i) => {
              const widthPct = maxViews ? (page.views / maxViews) * 100 : 0;
              return (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 pr-4 max-w-[320px]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400 w-5">{i + 1}.</span>
                      <div className="flex flex-col">
                        <span className="font-medium text-app-text dark:text-app-text-muted truncate" title={page.fullUrl}>
                          {page.pageName}
                        </span>
                        <a
                          href={page.fullUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[11px] text-gray-500 hover:text-blue-600 hover:underline transition-colors truncate flex items-center gap-1" 
                          title={page.fullUrl}
                        >
                          <FiExternalLink className="w-3 h-3 flex-shrink-0" />
                          {page.fullUrl.replace('https://','')}
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${widthPct}%` }} />
                      </div>
                      <span className="font-semibold text-app-text dark:text-app-text-muted min-w-[50px]">{page.views.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="py-4 text-right text-app-text dark:text-app-text-muted font-medium">{page.users.toLocaleString()}</td>
                  <td className="py-4 text-right text-app-text dark:text-app-text-muted">{formatDuration(page.avgDuration)}</td>
                  <td className="py-4 text-right">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      page.bounceRate > 0.7 ? "bg-red-50 text-red-600" :
                      page.bounceRate > 0.4 ? "bg-yellow-50 text-yellow-700" :
                      "bg-green-50 text-green-700"
                    }`}>
                      {(page.bounceRate * 100).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopPagesTable;