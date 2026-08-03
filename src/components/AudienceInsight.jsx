import React, { useState, useEffect } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Loader from "./Loader";
import { BASE_URL } from "../data/constant";

// Bold, vibrant palette — distinct hues for up to 8 categories
const COLORS = [
  "#6366f1", // indigo
  "#06b6d4", // cyan
  "#f59e0b", // amber
  "#ef4444", // red
  "#10b981", // emerald
  "#ec4899", // pink
  "#8b5cf6", // violet
  "#3b82f6", // blue
];

const AudienceInsights = () => {
  const [data, setData] = useState({ devices: [], countries: [] });
  const [loading, setLoading] = useState(true);

  // 1. ADD DATE STATE TO THIS FILE TOO
  const [dateRange, setDateRange] = useState({ start: "30daysAgo", end: "today" });

  // 2. SEPARATE THE FETCH FUNCTION
  const fetchAudience = async () => {
    const hid = localStorage.getItem("hid");
    if (!hid) return;

    try {
      setLoading(true);
      // NOTICE THE URL NOW USES DYNAMIC DATES
      const response = await axios.get(
        `${BASE_URL}/google/analytics-audience/${hid}?startDate=${dateRange.start}&endDate=${dateRange.end}`
      );
      setData(response.data);
    } catch (err) {
      console.error("Failed to fetch audience data:", err);
    } finally {
      setLoading(false);
    }
  };

  // 3. FETCH WHEN DATE CHANGES
  useEffect(() => {
    fetchAudience();
  }, [dateRange]);

  // 4. LISTEN TO THE CHART DROPDOWN
  useEffect(() => {
    const handleDateChange = (event) => {
      setDateRange(event.detail); // Update dates when Chart dropdown changes
    };

    const handlePropertyChange = () => {
      fetchAudience(); // Re-fetch immediately if the property is swapped
    };

    // Turn on the listeners
    window.addEventListener("dashboard_date_changed", handleDateChange);
    window.addEventListener("dashboard_property_changed", handlePropertyChange);

    // Clean them up when closing the page
    return () => {
      window.removeEventListener("dashboard_date_changed", handleDateChange);
      window.removeEventListener("dashboard_property_changed", handlePropertyChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white mt-6">
        <Loader color="#132e69" />
      </div>
    );
  }

  if (data.devices.length === 0 && data.countries.length === 0) return null;

  // Find max country users to calculate progress bar widths
  const maxCountryUsers = Math.max(...data.countries.map((c) => c.users), 1);
  const totalDeviceUsers = data.devices.reduce((sum, d) => sum + (d.value || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 w-full">
      {/* 1. Device Breakdown Card */}
      <div className="bg-app-surface p-6 drop-shadow-xl">
        <h2 className="text-lg font-semibold mb-6">
          Users by device
        </h2>
        <div className="h-[250px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {data.devices.map((_, index) => {
                  const color = COLORS[index % COLORS.length];
                  return (
                    <linearGradient
                      key={`device-grad-${index}`}
                      id={`deviceGradient-${index}`}
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={color} stopOpacity={1} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                    </linearGradient>
                  );
                })}
              </defs>
              <Pie
                data={data.devices}
                innerRadius={70}
                outerRadius={100}
                paddingAngle={3}
                cornerRadius={8}
                dataKey="value"
                stroke="none"
                animationDuration={700}
                animationEasing="ease-out"
              >
                {data.devices.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#deviceGradient-${index})`}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 8px 24px -4px rgba(0, 0, 0, 0.15)",
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Custom Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-app-text dark:text-app-text">
              {totalDeviceUsers.toLocaleString()}
            </span>
            <span className="text-app-text-faint text-[11px] font-bold uppercase tracking-wider mt-0.5">
              Devices
            </span>
          </div>
        </div>

        {/* Custom Legend — colorful chips */}
        <div className="flex flex-wrap justify-center gap-2 mt-5">
          {data.devices.map((device, idx) => {
            const color = COLORS[idx % COLORS.length];
            const pct = totalDeviceUsers
              ? Math.round((device.value / totalDeviceUsers) * 100)
              : 0;
            return (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{ backgroundColor: `${color}1A` }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                ></div>
                <span
                  className="text-xs font-semibold capitalize"
                  style={{ color }}
                >
                  {device.name}
                </span>
                <span className="text-xs font-bold text-app-text dark:text-app-text">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Top Countries Card */}
      <div className="bg-app-surface p-6 drop-shadow-xl">
        <h2 className="text-lg font-semibold mb-6">
          Users by country
        </h2>
        <div className="flex flex-col gap-4">
          {data.countries.map((country, idx) => {
            const percentage = (country.users / maxCountryUsers) * 100;
            const color = COLORS[idx % COLORS.length];
            return (
              <div key={idx} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    ></span>
                    {country.name}
                  </span>
                  <span
                    className="font-bold"
                    style={{ color }}
                  >
                    {country.users.toLocaleString()}
                  </span>
                </div>
                {/* Progress Bar — colorful gradient fill */}
                <div className="w-full bg-app-text/[0.06] dark:bg-white/[0.08] rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-2.5 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${percentage}%`,
                      background: `linear-gradient(90deg, ${color}, ${color}CC)`,
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AudienceInsights;