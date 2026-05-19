import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell
} from "recharts";

const GeoAnalytics = () => {
  const [data, setData] = useState({ countries: [], cities: [] });
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [dateRange, setDateRange] = useState({ start: "30daysAgo", end: "today" });

  const fetchData = async () => {
    const hid = localStorage.getItem("hid");
    if (!hid) return;
    try {
      setLoading(true);
      const { data } = await axios.get(
        `http://localhost:8001/google/analytics-geo/${hid}?startDate=${dateRange.start}&endDate=${dateRange.end}`
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

  if (loading || data.countries.length === 0) return null;

  const totalCountryUsers = data.countries.reduce((s, c) => s + c.users, 0);
  const filteredCities = data.cities
    .filter(c => c.country === selectedCountry)
    .slice(0, 8);
  const uniqueCountries = [...new Set(data.cities.map(c => c.country))];

  // Country flag emoji from code
  const flagEmoji = (code) => {
    if (!code || code.length !== 2) return "🌍";
    return String.fromCodePoint(
      ...code.toUpperCase().split("").map(c => 0x1f1a5 + c.charCodeAt(0))
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Geographic Insights</h2>
          <p className="text-xs text-gray-500 mt-0.5">Where your visitors come from</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Countries */}
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-4">Top Countries</h3>
          <div className="space-y-3">
            {data.countries.slice(0, 8).map((c, i) => {
              const pct = totalCountryUsers ? (c.users / totalCountryUsers) * 100 : 0;
              return (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1.5 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{flagEmoji(c.countryCode)}</span>
                      <span className="font-medium text-gray-800">{c.country}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-gray-900">{c.users.toLocaleString()}</span>
                      <span className="text-gray-400 ml-2 text-xs">{pct.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cities */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-600">Top Cities</h3>
            {uniqueCountries.length > 0 && (
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="border border-gray-200 rounded-md px-2.5 py-1 text-xs text-gray-700 outline-none cursor-pointer bg-white shadow-sm hover:border-gray-300"
              >
                {uniqueCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            )}
          </div>

          <div className="h-[260px]">
            {filteredCities.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredCities} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
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
                    cursor={{ fill: "#f9fafb" }}
                    contentStyle={{ borderRadius: "10px", border: "1px solid #e5e7eb" }}
                  />
                  <Bar dataKey="users" radius={[0, 4, 4, 0]} barSize={20}>
                    {filteredCities.map((_, i) => (
                      <Cell key={i} fill="#1a73e8" />
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