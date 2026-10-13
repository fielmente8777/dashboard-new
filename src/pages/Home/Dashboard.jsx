import React, { useEffect, useMemo, useState } from "react";
import { FaWhatsapp, FaPhoneAlt, FaWpforms } from "react-icons/fa";
import GscSettings from "../../components/GscSettings";
import axios from "axios";
import {
  BadgeCheck,
  MessageCircle,
  Percent,
  PieChart as PieChartIcon,
  UserPlus,
  Users,
} from "lucide-react";
import { CHART_COLORS } from "../../components/Charts/chartTheme";
import DonutChart from "../../components/Charts/DonutChart";
import UiCard from "../../components/ui/Card";
import ProgressList from "../../components/ui/ProgressList";
import StatCard from "../../components/ui/StatCard";
import { EmptyState } from "../../components/ui/States";
import { getAnalyticsService } from "../../services/api/analytics.api";
import LocalSeoModule from "../../components/LocalSEO/LocalSeoModule";

import AnalyticsCard from "../../components/Card/AnalyticsCard";
import TemperatureCard from "../../components/Card/TemperatureCard";
import { useSelector } from "react-redux";
import Loading from "../../components/Loading";
import AudienceInsights from "../../components/Analytics/AudienceInsights";

// ===== GA COMPONENTS =====
import GoogleAnalyticsChart from "../../components/Analytics/GoogleAnalyticsChart";
import {
  setAnalyticsRange,
  useAnalyticsRange,
} from "../../components/Analytics/analyticsRange";
import DateRangePicker from "../../components/ui/DateRangePicker";
import TrafficSources from "../../components/Analytics/TrafficSources";
import TopPagesTable from "../../components/Analytics/TopPagesTable";
import ConversionEvents from "../../components/Analytics/ConversionEvents";
import DeviceAnalytics from "../../components/Analytics/DeviceAnalytics";
import GeoAnalytics from "../../components/Analytics/GeoAnalytics";
import SearchConsoleQueries from "../../components/SearchConsoleQueries";
import { BASE_URL } from "../../data/constant";
import CallsAnalytics from "../Calls/CallsAnalytics";
// [{ name, count }] -> ProgressList items, biggest first. The colour follows
// the name (its place in alphabetical order), so it doesn't change when the
// counts reorder the list.
const toListItems = (rows) => {
  const names = rows.map((row) => row.name).sort();
  return [...rows]
    .sort((a, b) => b.count - a.count)
    .map((row) => ({
      key: row.name,
      label: row.name,
      value: row.count,
      color: CHART_COLORS[names.indexOf(row.name) % CHART_COLORS.length],
    }));
};

const Dashboard = () => {
  const { hid } = useSelector((state) => state.userProfile);
  const analyticsRange = useAnalyticsRange();
  const [data, setData] = useState(null);
  const [currentAnalytics, setCurrentAnalytics] = useState("overview");

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
        `${BASE_URL}/google/analytics-conversions/${currentHid}?startDate=${currentDates.startDate}&endDate=${currentDates.endDate}&t=${timestamp}`,
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
        handlePropertyChange,
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
  const today = data?.todayLeads || 0;

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

  const sourceItems = useMemo(() => toListItems(cleanedSource), [cleanedSource]);
  const stageItems = useMemo(() => toListItems(cleanedStatus), [cleanedStatus]);

  const getStatusCount = (status) =>
    cleanedStatus.find((s) => s.name === status)?.count || 0;

  if (!data) return <Loading />;

  if (currentAnalytics === "call-analytics") {
    return <CallsAnalytics />;
  }

  return (
    <div className="p-3 md:p-6 min-h-screen space-y-3 md:space-y-6 bg-app-bg transition-colors duration-200">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Analytics Overview</h1>
          <p className="mt-1 text-sm text-app-text-muted">
            Monitor leads, performance and trends.
          </p>
        </div>
        {/* drives the call and Google Analytics sections below */}
        <DateRangePicker value={analyticsRange} onChange={setAnalyticsRange} />
        {/* <select
          name=""
          id=""
          onChange={(e) => setCurrentAnalytics(e.target.value)}
          className="border! border-primary/10! outline-none px-3 py-1 rounded-md cursor-pointer"
        >
          <option value="overview">Overview</option>
          <option value="call-analytics">Call Analytics</option>
        </select> */}
      </div>
      {/* CRM KPI CARDS */}
      <div className="anim-stagger grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-5">
        <StatCard icon={Users} label="Total leads" value={total.toLocaleString()} />
        <StatCard icon={UserPlus} label="Today's leads" value={today.toLocaleString()} />
        <StatCard icon={BadgeCheck} label="Converted leads" value={converted.toLocaleString()} />
        <StatCard icon={Percent} label="Conversion rate" value={`${conversionRate}%`} />
        <StatCard
          icon={MessageCircle}
          label="WhatsApp conversations"
          value={whatsapp.toLocaleString()}
        />
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
          <div className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
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

          <div className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
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

          <div className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <UiCard title="Source distribution" description="Where your leads come from">
          {sourceItems.length ? (
            <div className="max-h-80 overflow-y-auto pr-1">
              <ProgressList showShare items={sourceItems} />
            </div>
          ) : (
            <EmptyState icon={PieChartIcon} title="No leads yet" />
          )}
        </UiCard>

        <UiCard title="Stages breakdown" description="Leads in each pipeline stage">
          {stageItems.length ? (
            <div className="grid items-center gap-5 sm:grid-cols-2">
              <DonutChart
                data={stageItems.map(({ label, value, color }) => ({ name: label, value, color }))}
                centerLabel="Leads"
                unit="leads"
              />
              <div className="max-h-72 overflow-y-auto pr-1">
                <ProgressList
                  showShare
                  total={stageItems.reduce((sum, item) => sum + item.value, 0)}
                  items={stageItems}
                />
              </div>
            </div>
          ) : (
            <EmptyState icon={PieChartIcon} title="No leads yet" />
          )}
        </UiCard>
      </div>
      <CallsAnalytics dateRange={analyticsRange} />

      {/* ===== GOOGLE ANALYTICS SECTION ===== */}
      <div className="w-full space-y-4">
        <GoogleAnalyticsChart showDatePicker={false} />
        <TrafficSources />
        <TopPagesTable />
        {/* <GscSettings /> */}
        <SearchConsoleQueries />
        <ConversionEvents />
        <DeviceAnalytics />
        <GeoAnalytics />
        <AudienceInsights />
      </div>

      {/* <div className="w-full space-y-6 mt-6">
        <LocalSeoModule />
      </div> */}

      {/* <div className="w-full space-y-6 mt-6">
        <WebsiteSeoDashboard />
      </div> */}
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
