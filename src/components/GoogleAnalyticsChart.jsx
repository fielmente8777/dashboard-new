import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area,
} from "recharts";
import { FiCalendar, FiTrendingUp, FiUsers, FiEye, FiActivity, FiClock } from "react-icons/fi";
import Loader from "./Loader";
import { BASE_URL } from "../data/constant";

const dateOptions = [
  { label: "Today", start: "today", end: "today" },
  { label: "Yesterday", start: "yesterday", end: "yesterday" },
  { label: "Last 7 days", start: "7daysAgo", end: "today" },
  { label: "Last 28 days", start: "28daysAgo", end: "today" },
  { label: "Last 30 days", start: "30daysAgo", end: "today" },
  { label: "Last 90 days", start: "90daysAgo", end: "today" },
];

const TAB_CONFIG = {
  users:        { label: "Active Users",  color: "#1a73e8", icon: FiUsers },
  newUsers:     { label: "New Users",     color: "#8b5cf6", icon: FiTrendingUp },
  sessions:     { label: "Sessions",      color: "#00A94B", icon: FiActivity },
  pageViews:    { label: "Page Views",    color: "#f97316", icon: FiEye },
  eventCount:   { label: "Events",        color: "#f9ab00", icon: FiActivity },
  avgSessionDuration: { label: "Avg Duration", color: "#06b6d4", icon: FiClock },
};

const GoogleAnalyticsChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [properties, setProperties] = useState([]);
  const [activePropertyId, setActivePropertyId] = useState("");
  const [email, setEmail] = useState("");
  const [isSwitching, setIsSwitching] = useState(false);
  const [dateRange, setDateRange] = useState(dateOptions[2]);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("users");

  const dropdownRef = useRef(null);

  const fetchAnalytics = async () => {
    const hid = localStorage.getItem("hid");
    if (!hid) {
      setError("No Hotel ID found.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.get(
        `${BASE_URL}/google/analytics-data/${hid}?startDate=${dateRange.start}&endDate=${dateRange.end}`
      );

      if (data.error) {
        setError(data.error);
      } else {
        setChartData(data.chartData);
        setActivePropertyId(data.activePropertyId);
        setEmail(data.email);
        if (data.email && properties.length === 0) {
          fetchPropertiesList(data.email);
        }
      }
    } catch (err) {
      setError("Please connect Google Analytics in the Integrations tab.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPropertiesList = async (userEmail) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/google/properties?email=${userEmail}`);
      if (data.properties) setProperties(data.properties);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    window.dispatchEvent(new CustomEvent("dashboard_date_changed", { detail: dateRange }));
  }, [dateRange]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDateDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handlePropertyChange = async (e) => {
    const newPropertyId = e.target.value;
    setActivePropertyId(newPropertyId);
    setIsSwitching(true);
    try {
      const hid = localStorage.getItem("hid");
      await axios.post(`${BASE_URL}/google/save-property`, {
        hid, email, property_id: newPropertyId,
      });
      await fetchAnalytics();
      window.dispatchEvent(new Event("dashboard_property_changed"));
    } catch (err) {
      alert("Failed to switch property.");
    } finally {
      setIsSwitching(false);
    }
  };

  const totals = {
    users: chartData.reduce((s, i) => s + i.users, 0),
    newUsers: chartData.reduce((s, i) => s + (i.newUsers || 0), 0),
    sessions: chartData.reduce((s, i) => s + i.sessions, 0),
    pageViews: chartData.reduce((s, i) => s + i.pageViews, 0),
    eventCount: chartData.reduce((s, i) => s + (i.eventCount || 0), 0),
    avgSessionDuration: chartData.length
      ? (chartData.reduce((s, i) => s + (i.avgSessionDuration || 0), 0) / chartData.length)
      : 0,
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return Math.round(num).toLocaleString();
  };

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}m ${s}s`;
  };

  const formatValue = (key, value) => {
    if (key === "avgSessionDuration") return formatDuration(value);
    return formatNumber(value);
  };

  if (loading && !isSwitching) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-sm border border-gray-200">
        <Loader color="#132e69" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-sm border border-red-100">
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  const tabKeys = Object.keys(TAB_CONFIG);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Eaz Analytics</h2>
          {/* <p className="text-xs text-gray-500 mt-0.5">{email}</p> */}
        </div>

        <div className="flex items-center gap-3">
          {properties.length > 0 && (
            <select
              value={activePropertyId}
              onChange={handlePropertyChange}
              disabled={isSwitching}
              className="border border-gray-200 text-gray-700 bg-white text-sm rounded-md px-3 py-1.5 outline-none cursor-pointer hover:border-gray-300 shadow-sm"
            >
              {properties.map((prop) => (
                <option key={prop.property_id} value={prop.property_id}>
                  {prop.name}
                </option>
              ))}
            </select>
          )}

          {/* Date Picker */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md hover:border-gray-300 text-sm text-gray-700 font-medium shadow-sm"
            >
              <FiCalendar className="w-4 h-4 text-gray-500" />
              {dateRange.label}
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isDateDropdownOpen && (
              <div className="absolute right-0 top-10 w-56 bg-white border border-gray-200 shadow-xl rounded-lg py-2 z-50">
                {dateOptions.map((opt, i) => (
                  <div
                    key={i}
                    onClick={() => { setDateRange(opt); setIsDateDropdownOpen(false); }}
                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 ${
                      dateRange.label === opt.label ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700"
                    }`}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metric Tabs */}
      <div className="grid grid-cols-3 md:grid-cols-6 border-b border-gray-100">
        {tabKeys.map((key, idx) => {
          const conf = TAB_CONFIG[key];
          const Icon = conf.icon;
          const isActive = activeTab === key;
          return (
            <div
              key={key}
              onClick={() => setActiveTab(key)}
              className={`cursor-pointer p-4 transition-all border-t-4 ${
                idx > 0 ? "border-l border-l-gray-100" : ""
              } ${
                isActive
                  ? "bg-white"
                  : "bg-gray-50/40 hover:bg-gray-50 border-t-transparent"
              }`}
              style={isActive ? { borderTopColor: conf.color } : {}}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className="w-3.5 h-3.5" style={{ color: isActive ? conf.color : "#9ca3af" }} />
                <span className={`text-[11px] font-semibold uppercase tracking-wider ${
                  isActive ? "text-gray-700" : "text-gray-500"
                }`}>
                  {conf.label}
                </span>
              </div>
              <div className={`text-2xl font-bold tracking-tight ${
                isActive ? "text-gray-900" : "text-gray-600"
              }`}>
                {formatValue(key, totals[key])}
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="p-6">
        <div className="w-full h-[340px] relative">
          {isSwitching && (
            <div className="absolute inset-0 flex justify-center items-center bg-white/60 backdrop-blur-sm z-10">
              <Loader color="#132e69" />
            </div>
          )}
          {chartData.length === 0 ? (
            <div className="flex justify-center items-center h-full text-gray-500 text-sm">
              No traffic data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={TAB_CONFIG[activeTab].color} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={TAB_CONFIG[activeTab].color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(t) => new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "10px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                  }}
                  labelFormatter={(l) => new Date(l).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                />
                <Area
                  type="monotone"
                  name={TAB_CONFIG[activeTab].label}
                  dataKey={activeTab}
                  stroke={TAB_CONFIG[activeTab].color}
                  strokeWidth={2.5}
                  fill="url(#colorMetric)"
                  activeDot={{ r: 5, fill: TAB_CONFIG[activeTab].color, stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleAnalyticsChart;