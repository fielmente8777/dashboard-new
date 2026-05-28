import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiTarget, FiZap } from "react-icons/fi";
import { BASE_URL } from "../data/constant";

const ConversionEvents = () => {
  const [data, setData] = useState({ events: [], conversions: [] });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: "30daysAgo", end: "today" });

  const fetchData = async () => {
    const hid = localStorage.getItem("hid");
    if (!hid) return;
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${BASE_URL}/google/analytics-conversions/${hid}?startDate=${dateRange.start}&endDate=${dateRange.end}`
      );
      setData({ events: data.events || [], conversions: data.conversions || [] });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [dateRange]);

  useEffect(() => {
    const handleDate = (e) => setDateRange(e.detail);
    const handleProp = () => fetchData();
    window.addEventListener("dashboard_date_changed", handleDate);
    window.addEventListener("dashboard_property_changed", handleProp);
    return () => {
      window.removeEventListener("dashboard_date_changed", handleDate);
      window.removeEventListener("dashboard_property_changed", handleProp);
    };
  }, []);

  if (loading || data.events.length === 0) return null;

  const maxEventCount = Math.max(...data.events.map(e => e.eventCount));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Top Events */}
      <div className="bg-app-surface rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
            <FiZap className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-app-text dark:text-app-text">Top Events</h3>
            <p className="text-xs text-gray-400">Most triggered events</p>
          </div>
        </div>

        <div className="space-y-3">
          {data.events.slice(0, 8).map((ev, i) => {
            const pct = maxEventCount ? (ev.eventCount / maxEventCount) * 100 : 0;
            return (
              <div key={i}>
                <div className="flex justify-between mb-1.5 text-sm">
                  <span className="font-medium text-app-text dark:text-app-text-muted truncate max-w-[200px]" title={ev.eventName}>
                    {ev.eventName}
                  </span>
                  <span className="font-semibold text-gray-400">{ev.eventCount.toLocaleString()}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-400 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>


      {/* Conversions */}
      <div className="bg-app-surface rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
            <FiTarget className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-app-text dark:text-app-text">Conversion Events</h3>
            <p className="text-xs text-gray-500">Marked as key events</p>
          </div>
        </div>

        {data.conversions.length === 0 ? (
          <div className="text-center py-10 text-sm text-gray-200">
            <p>No conversion events configured.</p>
            <p className="text-xs mt-1 text-gray-400">Mark events as "Key Events" in GA4 to track them here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.conversions.map((c, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-green-50/20 border border-green-100">
                <div>
                  <p className="font-medium text-app-text dark:text-app-text-muted text-sm">{c.eventName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{c.users.toLocaleString()} users</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{c.conversions.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversionEvents;