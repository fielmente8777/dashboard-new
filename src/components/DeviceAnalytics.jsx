import React, { useState, useEffect } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { FiMonitor, FiSmartphone, FiTablet } from "react-icons/fi";
import { BASE_URL } from "../data/constant";

const DEVICE_COLORS = { desktop: "#1a73e8", mobile: "#10b981", tablet: "#f59e0b" };
const DEVICE_ICONS = { Desktop: FiMonitor, Mobile: FiSmartphone, Tablet: FiTablet };

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

  return (
    <div className="bg-app-surface rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
      <h2 className="text-lg font-semibold text-app-text dark:text-app-text mb-6">Device & Tech</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Device Breakdown */}
        <div>
          <h3 className="text-sm font-medium text-app-text dark:text-app-text-muted mb-4">Device Category</h3>
          <div className="h-[180px] mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.devices}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={2}
                >
                  {data.devices.map((entry, i) => (
                    <Cell key={i} fill={DEVICE_COLORS[entry.name.toLowerCase()] || "#9ca3af"} />
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
              return (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5" style={{ color: DEVICE_COLORS[d.name.toLowerCase()] }} />
                    <span className="text-app-text-faint">{d.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-app-text-faint">{pct.toFixed(1)}%</span>
                    <span className="text-app-text-faint ml-2 text-xs">({d.value.toLocaleString()})</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Browsers */}
        <div>
          <h3 className="text-sm font-medium text-app-text dark:text-blue-500 mb-4">Top Browsers</h3>
          <div className="space-y-3">
            {data.browsers.map((b, i) => {
              const pct = (b.value / maxBrowser) * 100;
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-app-text-faint">{b.name}</span>
                    <span className="font-semibold text-app-text-faint">{b.value.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* OS */}
        <div>
          <h3 className="text-sm font-medium text-app-text dark:text-purple-400 mb-4">Operating Systems</h3>
          <div className="space-y-3">
            {data.operatingSystems.map((os, i) => {
              const max = Math.max(...data.operatingSystems.map(o => o.value), 1);
              const pct = (os.value / max) * 100;
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-app-text-faint">{os.name}</span>
                    <span className="font-semibold text-app-text-faint">{os.value.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${pct}%` }} />
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