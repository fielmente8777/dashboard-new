import React, { useState, useEffect } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Loader from "./Loader";

// Premium Google Colors
const COLORS = ["#1a73e8", "#00A94B", "#f9ab00", "#ea4335"];

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
          `http://localhost:8001/google/analytics-audience/${hid}?startDate=${dateRange.start}&endDate=${dateRange.end}`
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
    return <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-sm border border-gray-200 mt-6"><Loader color="#132e69" /></div>;
  }

  if (data.devices.length === 0 && data.countries.length === 0) return null;

  // Find max country users to calculate progress bar widths
  const maxCountryUsers = Math.max(...data.countries.map(c => c.users), 1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 w-full">
      
      {/* 1. Device Breakdown Card */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Users by Device</h2>
        <div className="h-[250px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.devices}
                innerRadius={70}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.devices.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Custom Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Devices</span>
          </div>
        </div>

        {/* Custom Legend */}
        <div className="flex justify-center gap-6 mt-4">
          {data.devices.map((device, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
              <span className="text-sm font-medium text-gray-700">{device.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Top Countries Card */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Users by Country</h2>
        <div className="flex flex-col gap-4">
          {data.countries.map((country, idx) => {
            const percentage = (country.users / maxCountryUsers) * 100;
            return (
              <div key={idx} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-sm font-medium text-gray-700">
                  <span>{country.name}</span>
                  <span>{country.users.toLocaleString()}</span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${percentage}%` }}
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