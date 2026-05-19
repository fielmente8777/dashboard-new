import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Loader from "./Loader";
import { BASE_URL } from "../data/constant";

// Define the exact date options from GA4
const dateOptions = [
  { label: "Today", start: "today", end: "today" },
  { label: "Yesterday", start: "yesterday", end: "yesterday" },
  { label: "This week (Sun - Today)", start: "7daysAgo", end: "today" },
  { label: "Last 7 days", start: "7daysAgo", end: "today" },
  { label: "Last 28 days", start: "28daysAgo", end: "today" },
  { label: "Last 30 days", start: "30daysAgo", end: "today" },
  { label: "Last 90 days", start: "90daysAgo", end: "today" },
];

const GoogleAnalyticsChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [properties, setProperties] = useState([]);
  const [activePropertyId, setActivePropertyId] = useState("");
  const [email, setEmail] = useState("");
  const [isSwitching, setIsSwitching] = useState(false);
  // Calculate Totals for the Metric Cards
  

  // New UI States
  const [dateRange, setDateRange] = useState(dateOptions[3]); // Default to Last 7 days
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("users"); // 'users', 'pageViews', or 'sessions'
  
  // Click outside ref for dropdown
  const dropdownRef = useRef(null);

  const fetchAnalytics = async () => {
    const hid = localStorage.getItem("hid");
    if (!hid) {
      setError("No Hotel ID found. Please select a location.");
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
      console.error("Failed to fetch GA data:", err);
      setError("Please connect your Google Analytics account in the Integrations tab.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPropertiesList = async (userEmail) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/google/properties?email=${userEmail}`);
      if (data.properties) setProperties(data.properties);
    } catch (err) {
      console.error("Failed to fetch properties", err);
    }
  };

  // Trigger fetch when date changes
  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  // Handle clicking outside the custom dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDateDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    } catch (err) {
      alert("Failed to switch property.");
    } finally {
      setIsSwitching(false);
    }
  };

  // Calculate Totals for the Metric Cards
  // Calculate Totals for the Metric Cards
  const totalUsers = chartData.reduce((sum, item) => sum + item.users, 0);
  const totalViews = chartData.reduce((sum, item) => sum + item.pageViews, 0);
  const totalEvents = chartData.reduce((sum, item) => sum + (item.eventCount || 0), 0);

  // Format large numbers (e.g., 20000 -> 20k)
  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toLocaleString();
  };

  if (loading && !isSwitching) return <div className="flex justify-center items-center h-64 bg-white rounded-md shadow-sm border border-gray-200"><Loader color="#132e69" /></div>;
  if (error) return <div className="flex justify-center items-center h-64 bg-white rounded-md shadow-sm border border-red-200"><p className="text-red-500 font-medium">{error}</p></div>;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full overflow-hidden">
      
      {/* 1. Header & Controls */}
      <div className="p-4 flex justify-between items-center border-b border-gray-100">
        <h2 className="text-xl font-normal text-gray-800">Home</h2>
        
        {properties.length > 0 && (
          <select
            value={activePropertyId}
            onChange={handlePropertyChange}
            disabled={isSwitching}
            className="border-none text-gray-600 bg-transparent text-sm outline-none cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
          >
            {properties.map((prop) => (
              <option key={prop.property_id} value={prop.property_id}>{prop.name}</option>
            ))}
          </select>
        )}
      </div>

      <div className="p-4">
        {/* 2. GA4 Style Metric Tabs */}
      {/* 2. PREMIUM GA4 Metric Tabs */}
      <div className="flex mb-6 bg-gray-50/50 rounded-t-xl overflow-hidden">
          
          {/* Active Users Tab */}
          <div 
            onClick={() => setActiveTab('users')}
            className={`flex-1 cursor-pointer p-5 transition-all duration-200 border-t-4 border-b ${
              activeTab === 'users' 
                ? 'bg-white border-t-blue-600 border-b-transparent shadow-[0_-2px_15px_rgba(0,0,0,0.03)] z-10' 
                : 'border-t-transparent border-b-gray-200 hover:bg-gray-100'
            }`}
          >
            <div className={`text-[12px] font-bold uppercase tracking-wider mb-1.5 transition-colors ${activeTab === 'users' ? 'text-blue-700' : 'text-gray-500'}`}>
              Active users
            </div>
            <div className={`text-3xl font-extrabold tracking-tight transition-colors ${activeTab === 'users' ? 'text-gray-900' : 'text-gray-600'}`}>
              {formatNumber(totalUsers)}
            </div>
          </div>

          {/* Page Views Tab */}
          <div 
            onClick={() => setActiveTab('pageViews')}
            className={`flex-1 cursor-pointer p-5 transition-all duration-200 border-t-4 border-b border-l ${
              activeTab === 'pageViews' 
                ? 'bg-white border-t-blue-600 border-b-transparent border-l-transparent shadow-[0_-2px_15px_rgba(0,0,0,0.03)] z-10' 
                : 'border-t-transparent border-b-gray-200 border-l-gray-200 hover:bg-gray-100'
            }`}
          >
            <div className={`text-[12px] font-bold uppercase tracking-wider mb-1.5 transition-colors ${activeTab === 'pageViews' ? 'text-blue-700' : 'text-gray-500'}`}>
              Page Views
            </div>
            <div className={`text-3xl font-extrabold tracking-tight transition-colors ${activeTab === 'pageViews' ? 'text-gray-900' : 'text-gray-600'}`}>
              {formatNumber(totalViews)}
            </div>
          </div>

          {/* Event Count Tab */}
          <div 
            onClick={() => setActiveTab('eventCount')}
            className={`flex-1 cursor-pointer p-5 transition-all duration-200 border-t-4 border-b border-l ${
              activeTab === 'eventCount' 
                ? 'bg-white border-t-blue-600 border-b-transparent border-l-transparent shadow-[0_-2px_15px_rgba(0,0,0,0.03)] z-10' 
                : 'border-t-transparent border-b-gray-200 border-l-gray-200 hover:bg-gray-100'
            }`}
          >
            <div className={`text-[12px] font-bold uppercase tracking-wider mb-1.5 transition-colors ${activeTab === 'eventCount' ? 'text-blue-700' : 'text-gray-500'}`}>
              Event count
            </div>
            <div className={`text-3xl font-extrabold tracking-tight transition-colors ${activeTab === 'eventCount' ? 'text-gray-900' : 'text-gray-600'}`}>
              {formatNumber(totalEvents)}
            </div>
          </div>
        </div>

        {/* 3. Date Dropdown & Chart Area */}
        <div className="relative">
          
          {/* Custom GA4 Date Dropdown Trigger */}
          <div className="absolute top-0 left-4 z-20" ref={dropdownRef}>
            <button 
              onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm text-gray-700 font-medium shadow-sm transition-all"
            >
              {dateRange.label}
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>

            {/* Dropdown Menu */}
            {isDateDropdownOpen && (
              <div className="absolute top-10 left-0 w-64 bg-white border border-gray-200 shadow-xl rounded-md py-2 z-50">
                {dateOptions.map((option, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      setDateRange(option);
                      setIsDateDropdownOpen(false);
                    }}
                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${dateRange.label === option.label ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chart Container */}
          <div className="w-full h-[320px] pt-12 relative">
            {isSwitching && (
              <div className="absolute inset-0 flex justify-center items-center bg-white/60 backdrop-blur-sm z-10"><Loader color="#132e69" /></div>
            )}

            {chartData && chartData.length === 0 ? (
              <div className="flex justify-center items-center h-full text-gray-500 text-sm">No traffic data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12, fill: "#9ca3af" }} 
                    axisLine={false} 
                    tickLine={false}
                    tickFormatter={(tick) => {
                      const date = new Date(tick);
                      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}
                  />
                  
                  {/* Dynamically render the line based on the selected tab */}
                  {/* Dynamically render the line color based on the selected tab */}
                  <Line 
                    type="monotone" 
                    name={activeTab === 'users' ? 'Active Users' : activeTab === 'pageViews' ? 'Page Views' : 'Event Count'} 
                    dataKey={activeTab} 
                    // Dynamic Stroke Color (Blue for users, Green for views, Orange for events)
                    stroke={activeTab === 'users' ? '#1a73e8' : activeTab === 'pageViews' ? '#00A94B' : '#f9ab00'} 
                    strokeWidth={3} 
                    dot={false} 
                    activeDot={{ 
                      r: 6, 
                      fill: activeTab === 'users' ? '#1a73e8' : activeTab === 'pageViews' ? '#00A94B' : '#f9ab00', 
                      stroke: "#fff", 
                      strokeWidth: 2 
                    }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleAnalyticsChart;