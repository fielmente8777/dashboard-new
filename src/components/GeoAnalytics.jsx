import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import { BASE_URL } from "../data/constant";

// Bold, vibrant palette — distinct hues per country/city row
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

const GeoAnalytics = () => {
  const [data, setData] = useState({ countries: [], cities: [] });
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [dateRange, setDateRange] = useState({
    start: "30daysAgo",
    end: "today",
  });

  const fetchData = async () => {
    const hid = localStorage.getItem("hid");
    if (!hid) return;
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${BASE_URL}/google/analytics-geo/${hid}?startDate=${dateRange.start}&endDate=${dateRange.end}`
      );
      const countries = data.countries || [];
      const cities = data.cities || [];
      setData({ countries, cities });
      if (countries.length > 0) setSelectedCountry(countries[0].country);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

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

  if (loading || data.countries.length === 0) return null;

  const totalCountryUsers = data.countries.reduce((s, c) => s + c.users, 0);
  const filteredCities = data.cities
    .filter((c) => c.country === selectedCountry)
    .slice(0, 8);
  const uniqueCountries = [...new Set(data.cities.map((c) => c.country))];

  // Country flag emoji from code
  const flagEmoji = (code) => {
    if (!code || code.length !== 2) return "🌍";
    return String.fromCodePoint(
      ...code
        .toUpperCase()
        .split("")
        .map((c) => 0x1f1a5 + c.charCodeAt(0))
    );
  };

  return (
    <div className="">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-semibold text-app-text dark:text-app-text">
            Geographic Insights
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Where your visitors come from
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Countries */}
        <div className="bg-app-surface p-4 rounded-none drop-shadow-xl">
          <h3 className="text-sm font-medium text-app-text dark:text-app-text-muted mb-4">
            Top Countries
          </h3>
          <div className="space-y-3">
            {data.countries.slice(0, 8).map((c, i) => {
              const pct = totalCountryUsers
                ? (c.users / totalCountryUsers) * 100
                : 0;
              const color = COLORS[i % COLORS.length];
              return (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1.5 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {flagEmoji(c.countryCode)}
                      </span>
                      <span
                        className="font-medium"
                        style={{ color }}
                      >
                        {c.country}
                      </span>
                    </div>
                    <div className="text-right">
                      <span
                        className="font-semibold"
                        style={{ color }}
                      >
                        {c.users.toLocaleString()}
                      </span>
                      <span className=" ml-2 text-xs">
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-app-text/[0.07] dark:bg-white/[0.08] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${color}, ${color}99)`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cities */}
        <div className="bg-app-surface p-4 rounded-none drop-shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-app-text dark:text-app-text-muted">
              Top Cities
            </h3>
            {uniqueCountries.length > 0 && (
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="border border-gray-200 rounded-md px-2.5 py-1 text-xs text-gray-700 outline-none cursor-pointer bg-white shadow-sm hover:border-gray-300"
              >
                {uniqueCountries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="h-[260px]">
            {filteredCities.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredCities}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                >
                  <defs>
                    {filteredCities.map((_, i) => {
                      const color = COLORS[i % COLORS.length];
                      return (
                        <linearGradient
                          key={`city-grad-${i}`}
                          id={`cityGradient-${i}`}
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop offset="0%" stopColor={color} stopOpacity={0.6} />
                          <stop offset="100%" stopColor={color} stopOpacity={1} />
                        </linearGradient>
                      );
                    })}
                  </defs>
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="city"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    width={90}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(127,127,127,0.08)" }}
                    contentStyle={{
                      background: "var(--tooltip-bg)",
                      border: "1px solid var(--tooltip-border)",
                      borderRadius: "16px",
                      backdropFilter: "blur(16px)",
                      WebkitBackdropFilter: "blur(16px)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                      color: "var(--tooltip-text)",
                    }}
                    itemStyle={{
                      color: "var(--tooltip-text)",
                      fontSize: "14px",
                      fontWeight: 500,
                    }}
                    labelStyle={{
                      color: "var(--tooltip-label)",
                      fontWeight: 600,
                    }}
                  />
                  <Bar
                    dataKey="users"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                    animationDuration={700}
                    animationEasing="ease-out"
                  >
                    {filteredCities.map((_, i) => (
                      <Cell key={i} fill={`url(#cityGradient-${i})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500 text-sm">
                No city data available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeoAnalytics;