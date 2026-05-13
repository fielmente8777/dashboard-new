import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Loader from "./Loader";

const GoogleAnalyticsChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  const [properties, setProperties] = useState([]);
  const [activePropertyId, setActivePropertyId] = useState("");
  const [email, setEmail] = useState("");
  const [isSwitching, setIsSwitching] = useState(false);

  
  const fetchAnalytics = async () => {
    const hid = localStorage.getItem("hid");
    if (!hid) {
      setError("No Hotel ID found. Please select a location.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.get(`http://localhost:8001/google/analytics-data/${hid}`);
      
      if (data.error) {
        setError(data.error);
      } else {
        setChartData(data.chartData);
        setActivePropertyId(data.activePropertyId);
        setEmail(data.email);

        
        if (data.email) {
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
      const { data } = await axios.get(`http://localhost:8001/google/properties?email=${userEmail}`);
      if (data.properties) {
        setProperties(data.properties);
      }
    } catch (err) {
      console.error("Failed to fetch properties list", err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);


  const handlePropertyChange = async (e) => {
    const newPropertyId = e.target.value;
    setActivePropertyId(newPropertyId);
    setIsSwitching(true); 

    try {
      const hid = localStorage.getItem("hid");
      
      
      await axios.post(`http://localhost:8001/google/save-property`, {
        hid,
        email: email,
        property_id: newPropertyId,
      });

      await fetchAnalytics();
    } catch (err) {
      console.error("Failed to switch property:", err);
      alert("Failed to switch property. Please try again.");
    } finally {
      setIsSwitching(false);
    }
  };

  if (loading && !isSwitching) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-md shadow-sm border border-gray-200">
        <Loader color="#132e69" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-md shadow-sm border border-red-200">
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 w-full">
      
      {/* Header & Dropdown Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Website Traffic (Last 30 Days)
        </h2>

        {/* The dynamic dropdown menu */}
        {properties.length > 0 && (
          <select
            value={activePropertyId}
            onChange={handlePropertyChange}
            disabled={isSwitching}
            className="border border-gray-300 text-gray-700 rounded-md px-3 py-1.5 text-sm outline-none focus:border-blue-500 bg-white shadow-sm cursor-pointer disabled:opacity-50"
          >
            {properties.map((prop) => (
              <option key={prop.property_id} value={prop.property_id}>
                {prop.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Chart Container */}
      <div className="w-full h-[350px] relative">
        
        {/* Loading overlay when switching properties */}
        {isSwitching && (
          <div className="absolute inset-0 flex justify-center items-center bg-white/60 backdrop-blur-sm z-10 rounded-md">
            <Loader color="#132e69" />
          </div>
        )}

        {/* Empty State vs Real Chart */}
        {chartData && chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-gray-500 text-sm">No traffic data available for the selected property.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "#6B7280" }}
                tickMargin={10}
                tickFormatter={(tick) => {
                  const date = new Date(tick);
                  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                }}
              />
              <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                labelFormatter={(label) => new Date(label).toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' })}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <Line type="monotone" name="Page Views" dataKey="pageViews" stroke="#0281F0" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              <Line type="monotone" name="Active Users" dataKey="users" stroke="#00A94B" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default GoogleAnalyticsChart;