import React, { useState, useEffect } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { FiMonitor, FiSmartphone, FiTablet } from "react-icons/fi";
import { BASE_URL } from "../data/constant";

const DEVICE_COLORS = { desktop: "#1a73e8", mobile: "#10b981", tablet: "#f59e0b" };
const DEVICE_ICONS = { Desktop: FiMonitor, Mobile: FiSmartphone, Tablet: FiTablet };

// Bold, vibrant palette — used for browsers and OS rows
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

const DeviceAnalytics = () => {
  const [data, setData] = useState({ devices: [], browsers: [], operatingSystems: [] });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: "30daysAgo", end: "today" });

  const fetchData = async () => {
    const hid = localStorage.getItem("hid");
    if (!hid) return;
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${BASE_URL}/google/analytics-devices/${hid}?startDate=${dateRange.start}&endDate=${dateRange.end}`
      );
      setData({
        devices: data.devices || [],
        browsers: data.browsers || [],
        operatingSystems: data.operatingSystems || [],
      });
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

  if (loading || data.devices.length === 0) return null;

  const totalUsers = data.devices.reduce((s, d) => s + d.value, 0);
  const maxBrowser = Math.max(...data.browsers.map(b => b.value), 1);
  const maxOs = Math.max(...data.operatingSystems.map(o => o.value), 1);

  return (
    <div className="">
      <h2 className="text-lg font-semibold mb-4">Device & Tech</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Device Breakdown */}
        <div className="bg-app-surface rounded-none drop-shadow-xl p-4">
          <h3 className="text-sm font-medium mb-4">Device Category</h3>
          <div className="h-[180px] mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {data.devices.map((entry, i) => {
                    const color = DEVICE_COLORS[entry.name.toLowerCase()] || "#9ca3af";
                    return (
                      <linearGradient key={`device-grad-${i}`} id={`deviceGradient-${i}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={1} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                      </linearGradient>
                    );
                  })}
                </defs>
                <Pie
                  data={data.devices}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  cornerRadius={6}
                  animationDuration={700}
                  animationEasing="ease-out"
                >
                  {data.devices.map((entry, i) => (
                    <Cell key={i} fill={`url(#deviceGradient-${i})`} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: "10px", border: "1px solid #e5e7eb" }}
                  formatter={(v) => v.toLocaleString() + " users"}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            {data.devices.map((d, i) => {
              const pct = totalUsers ? (d.value / totalUsers) * 100 : 0;
              const Icon = DEVICE_ICONS[d.name] || FiMonitor;
              const color = DEVICE_COLORS[d.name.toLowerCase()] || "#9ca3af";
              return (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm px-2 py-1.5 rounded-full"
                  style={{ backgroundColor: `${color}1A` }}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                    <span className="font-semibold" style={{ color }}>{d.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-app-text dark:text-app-text">{pct.toFixed(1)}%</span>
                    <span className="    ml-2 text-xs">({d.value.toLocaleString()})</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Browsers */}
        <div className="bg-app-surface rounded-none drop-shadow-xl p-4">
          <h3 className="text-sm font-medium text-app-text dark:text-blue-500 mb-4">Top Browsers</h3>
          <div className="space-y-3">
            {data.browsers.map((b, i) => {
              const pct = (b.value / maxBrowser) * 100;
              const color = COLORS[i % COLORS.length];
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="flex items-center gap-2    ">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }}></span>
                      {b.name}
                    </span>
                    <span className="font-semibold" style={{ color }}>{b.value.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-1.5 bg-app-text/[0.07] dark:bg-white/[0.08] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}99)` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* OS */}
        <div className="bg-app-surface rounded-none drop-shadow-xl p-4">
          <h3 className="text-sm font-medium text-app-text dark:text-purple-400 mb-4">Operating Systems</h3>
          <div className="space-y-3">
            {data.operatingSystems.map((os, i) => {
              const pct = (os.value / maxOs) * 100;
              const color = COLORS[(i + 3) % COLORS.length];
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="flex items-center gap-2    ">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }}></span>
                      {os.name}
                    </span>
                    <span className="font-semibold" style={{ color }}>{os.value.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-1.5 bg-app-text/[0.07] dark:bg-white/[0.08] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}99)` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceAnalytics;