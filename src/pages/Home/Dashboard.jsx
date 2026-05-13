import React, { useEffect, useMemo, useState } from "react";
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

import AnalyticsCard from "../../components/Card/AnalyticsCard";
import TemperatureCard from "../../components/Card/TemperatureCard";
import { useSelector } from "react-redux";
import Loading from "../../components/Loading";

// 1. IMPORT YOUR NEW CHART HERE
import GoogleAnalyticsChart from "../../components/GoogleAnalyticsChart"; 
import TopPagesTable from "../../components/TopPagesTable";
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

  const getAnalytics = async () => {
    try {
      const response = await getAnalyticsService();
      setData(response?.result?.docs);
    } catch (error) {
      console.log("Error fetching analytics:", error);
    }
  };

  useEffect(() => {
    getAnalytics();
  }, [hid]);

  // -----------------------
  // Derived Values
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
    <div className="p-3 md:p-6 bg-gray-100 min-h-screen space-y-3 md:space-y-6">
      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <DashboardCard
          amount={total}
          label={"Total Leads"}
        />
        <DashboardCard
          amount={converted}
          label={"Converted Leads"}
        />
        <DashboardCard
          amount={conversionRate}
          label={"Conversion Rate"}
          progress={conversionRate}
        />
        <DashboardCard
          amount={whatsapp}
          label={"WhatsApp Conversations"}
        />
      </div>

      {/* --------------------------------------------------- */}
      {/* 2. GOOGLE ANALYTICS CHART PLACED HERE (FULL WIDTH)  */}
      {/* --------------------------------------------------- */}
      <div className="w-full">
        <GoogleAnalyticsChart />
        <TopPagesTable />
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attractive Source Distribution */}
        <div className="bg-white rounded md:rounded-lg p-3 md:p-5">
          <h2 className="text-lg font-semibold mb-4">Source Distribution</h2>

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
              <Tooltip />
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
        <div className="bg-white rounded md:rounded-lg p-3 md:p-5">
          <h2 className="text-lg font-semibold mb-4">Stages Breakdown</h2>

          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={cleanedStatus} margin={{ top: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" style={{ fontSize: "15px" }} />
              <YAxis width={50} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                <LabelList dataKey="count" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* FUNNEL */}
      <div className="bg-white rounded md:rounded-lg p-5">
        <h2 className="text-lg font-semibold mb-4">Lead Funnel</h2>

        <FunnelBar label="Open" value={getStatusCount("open")} total={total} />
        <FunnelBar label="Hot" value={getStatusCount("hot")} total={total} />
        <FunnelBar label="Converted" value={converted} total={total} />
      </div>
    </div>
  );
};

const Card = ({ title, value }) => (
  <div className="bg-white rounded p-5">
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