import React, { useEffect, useMemo, useState } from "react";
import { FaWhatsapp, FaPhoneAlt, FaWpforms } from "react-icons/fa";
import GscSettings from "../../components/GscSettings";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
} from "recharts";
import { getAnalyticsService } from "../../services/api/analytics.api";
import DashboardCard from "../../components/Card/DashboardCard";
import LocalSeoModule from "../../components/LocalSEO/LocalSeoModule";
import SeoIntelligenceDashboard from "../../components/LocalSEO/SeoIntelligenceDashboard";

import AnalyticsCard from "../../components/Card/AnalyticsCard";
import TemperatureCard from "../../components/Card/TemperatureCard";
import { useSelector } from "react-redux";
import Loading from "../../components/Loading";
import AudienceInsights from "../../components/AudienceInsight";

// ===== GA COMPONENTS =====
import GoogleAnalyticsChart from "../../components/GoogleAnalyticsChart";
import TrafficSources from "../../components/TrafficSources";
import TopPagesTable from "../../components/TopPagesTable";
import ConversionEvents from "../../components/ConversionEvent";
import DeviceAnalytics from "../../components/DeviceAnalytics";
import GeoAnalytics from "../../components/GeoAnalytics";
import SearchConsoleQueries from "../../components/SearchConsoleQueries";
import { BASE_URL } from "../../data/constant";
const COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f97316",
  "#eab308",
  "#a855f7",
  "#ef4444",
  "#14b8a6",
];

const Dashboard = () => {
  const { hid } = useSelector((state) => state.userProfile);
  const [data, setData] = useState(null);

  // 1. STATE FOR OUR CLEAN GA METRICS
  const [gaMetrics, setGaMetrics] = useState({
    whatsapp_clicks: 0,
    call_clicks: 0,
    form_submissions: 0,
  });

  // 2. NAYI STATE: Sirf GA (Website Actions) ki loading track karne ke liye
  const [isGaLoading, setIsGaLoading] = useState(false);

  const [dateRange, setDateRange] = useState({
    startDate: "30daysAgo",
    endDate: "today",
  });

  // CRM Fetcher (Isko humne bilkul touch nahi kiya)
  const getAnalytics = async () => {
    try {
      const response = await getAnalyticsService();
      setData(response?.result?.docs);
    } catch (error) {
      console.log("Error fetching CRM analytics:", error);
    }
  };

  // Python GA API Fetcher (Isme loading ON/OFF lagaya hai)
  const fetchGaTrackingData = async (currentHid, currentDates) => {
    if (!currentHid) return;
    try {
      setIsGaLoading(true); // Data aane se pehle Loading ON

      const timestamp = new Date().getTime(); // Cache buster
      const response = await axios.get(
        `${BASE_URL}/google/analytics-conversions/${currentHid}?startDate=${currentDates.startDate}&endDate=${currentDates.endDate}&t=${timestamp}`
      );

      if (response.data && response.data.dashboardMetrics) {
        setGaMetrics(response.data.dashboardMetrics);
      }
    } catch (error) {
      console.log("Error fetching GA tracking data:", error);
    } finally {
      setIsGaLoading(false); // Data aane ke baad Loading OFF
    }
  };

  // ==========================================
  // MAGIC LISTENERS FOR DATE & PROPERTY CHANGE
  // ==========================================
  useEffect(() => {
    const handleDateChange = (e) => {
      if (e.detail) {
        setDateRange({
          startDate: e.detail.start || "30daysAgo",
          endDate: e.detail.end || "today",
        });
      }
    };

    const handlePropertyChange = () => {
      // Jab dropdown se property change ho, toh sirf GA data update karo
      if (hid) {
        fetchGaTrackingData(hid, dateRange);
      }
    };

    window.addEventListener("dashboard_date_changed", handleDateChange);
    window.addEventListener("dashboard_property_changed", handlePropertyChange);

    return () => {
      window.removeEventListener("dashboard_date_changed", handleDateChange);
      window.removeEventListener(
        "dashboard_property_changed",
        handlePropertyChange
      );
    };
  }, [hid, dateRange]);

  // Main Effect: Runs when Redux 'hid' or 'dateRange' state changes
  useEffect(() => {
    if (hid) {
      getAnalytics();
      fetchGaTrackingData(hid, dateRange);
    }
  }, [hid, dateRange]);

  // -----------------------
  // Derived Values (CRM)
  // -----------------------
  const total = data?.totalLeads?.[0]?.count || 0;
  const converted = data?.convertedLeads?.[0]?.count || 0;
  const whatsapp = data?.totalWhatsappConversations || 0;

  const conversionRate = total ? ((converted / total) * 100).toFixed(1) : 0;

  const cleanedSource = useMemo(() => {
    return (
      data?.sourceBreakdown
        ?.map((item) => ({
          name: item._id,
          count: item.count,
        }))
        .sort((a, b) => b.count - a.count) || []
    );
  }, [data]);

  const cleanedStatus = useMemo(() => {
    return (
      data?.statusBreakdown
        ?.filter((item) => item._id && item._id !== "")
        .map((item) => ({
          name: item._id,
          count: item.count,
        })) || []
    );
  }, [data]);

  const getStatusCount = (status) =>
    cleanedStatus.find((s) => s.name === status)?.count || 0;

  if (!data) return <Loading />;

  return (
    <div className="p-3 md:p-6 min-h-screen space-y-3 md:space-y-6 bg-app-bg transition-colors duration-200">
      {/* CRM KPI CARDS (Normal, no fade) */}
      <div>
        <h2 className="text-lg font-bold text-app-text dark:text-app-text mb-3">
          CRM Data
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6  text-app-text dark:text-app-text-muted">
          <DashboardCard amount={total} label={"Total Leads"} />
          {/* <DashboardCard amount={total} label={"Today Leads"} /> */}
          <DashboardCard amount={converted} label={"Converted Leads"} />
          <DashboardCard
            amount={conversionRate}
            label={"Conversion Rate"}
            progress={conversionRate}
          />
          <DashboardCard amount={whatsapp} label={"WhatsApp Conversations"} />
        </div>
      </div>

      {/* 3. NEW SECTION: PREMIUM WEBSITE TRACKING KPI CARDS */}
      {/* <div className="mt-8 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-app-text dark:text-app-text tracking-tight">
            Website Actions{" "}
            <span className="text-sm font-medium text-app-text ml-2">
              (Google Analytics)
            </span>
          </h2>
          
          {isGaLoading && (
            <span className="flex items-center gap-2 text-sm text-blue-600 font-medium animate-pulse">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              Fetching live data...
            </span>
          )}
        </div>

        <div 
          className={`grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 transition-all duration-500 ease-out ${
            isGaLoading
              ? "opacity-50 scale-[0.98] blur-[1px] pointer-events-none"
              : "opacity-100 scale-100 blur-0"
          }`}
        >
          <div className="relative overflow-hidden bg-app-surface dark:bg-app-surface rounded-2xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-green-50 opacity-60 group-hover:scale-150 transition-transform duration-700 ease-in-out"></div>

            <div className="flex items-center gap-5 relative z-10">
              <div className="p-3.5 rounded-xl bg-app-surface dark:bg-app-surface text-green-600 shadow-sm border border-green-100">
                <FaWhatsapp className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-semibold text-green-600 uppercase tracking-wider mb-1">
                  WhatsApp
                </p>
                <h3 className="text-3xl font-black text-gray-400">
                  {gaMetrics.whatsapp_clicks}
                </h3>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-app-surface dark:bg-app-surface rounded-2xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-blue-50 opacity-60 group-hover:scale-150 transition-transform duration-700 ease-in-out"></div>

            <div className="flex items-center gap-5 relative z-10">
              <div className="p-3.5 rounded-xl bg-app-surface dark:bg-app-surface text-blue-600 shadow-sm border border-blue-100">
                <FaPhoneAlt className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-1">
                  Call Clicks
                </p>
                <h3 className="text-3xl font-black text-gray-400">
                  {gaMetrics.call_clicks}
                </h3>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-app-surface dark:bg-app-surface rounded-2xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-purple-50 opacity-60 group-hover:scale-150 transition-transform duration-700 ease-in-out"></div>

            <div className="flex items-center gap-5 relative z-10">
              <div className="p-3.5 rounded-xl bg-app-surface dark:bg-app-surface text-purple-600 shadow-sm border border-purple-100">
                <FaWpforms className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-semibold text-purple-600 uppercase tracking-wider mb-1">
                  Form Fills
                </p>
                <h3 className="text-3xl font-black text-gray-400">
                  {gaMetrics.form_submissions}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source Distribution */}
        <div className="bg-app-surface dark:bg-app-surface rounded md:rounded-lg p-3 md:p-5">
          <h2 className="text-lg font-semibold text-app-text dark:text-app-text mb-4">
            Source Distribution
          </h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={cleanedSource}
              layout="vertical"
              margin={{ right: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                style={{ fontSize: "15px" }}
                tickFormatter={(value) =>
                  value.charAt(0).toUpperCase() + value.slice(1)
                }
              />
              <Tooltip
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
              <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                {cleanedSource.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
                <LabelList dataKey="count" position="right" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Breakdown */}
        <div className="bg-app-surface dark:bg-app-surface rounded md:rounded-lg p-3 md:p-5">
          <h2 className="text-lg font-semibold text-app-text dark:text-app-text mb-4">
            Stages Breakdown
          </h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={cleanedStatus} margin={{ top: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" style={{ fontSize: "15px" }} />
              <YAxis width={50} />
              <Tooltip
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
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                <LabelList dataKey="count" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* ===== GOOGLE ANALYTICS SECTION ===== */}
      <div className="w-full space-y-6">
        <GoogleAnalyticsChart />
        <TrafficSources />
        <TopPagesTable />
        <GscSettings />
        <SearchConsoleQueries />
        <ConversionEvents />
        <DeviceAnalytics />
        <GeoAnalytics />
        <AudienceInsights />
        {/* <SeoIntelligenceDashboard /> */}
      </div>

      {/* <div className="w-full space-y-6 mt-6">
        <LocalSeoModule />
      </div> */}



      {/* FUNNEL */}
      <div className="bg-app-surface dark:bg-app-surface rounded md:rounded-lg p-5">
        <h2 className="text-lg font-semibold mb-4">Lead Funnel</h2>

        <FunnelBar label="Open" value={getStatusCount("open")} total={total} />
        <FunnelBar label="Hot" value={getStatusCount("hot")} total={total} />
        <FunnelBar label="Converted" value={converted} total={total} />
      </div>
    </div>
  );
};

const Card = ({ title, value }) => (
  <div className="bg-app-surface dark:bg-app-surface rounded p-5">
    <p className="text-gray-500 text-sm">{title}</p>
    <h3 className="text-3xl font-bold mt-2">{value}</h3>
  </div>
);

const FunnelBar = ({ label, value, total }) => {
  const percentage = total ? (value / total) * 100 : 0;

  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="font-medium">{label}</span>
        <span>{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-green-500 h-3 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default Dashboard;
