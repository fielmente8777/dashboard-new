import React, { useMemo, useState } from "react";
import GscSettings from "../../components/GscSettings";
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
import { EmptyState, ErrorState, Skeleton } from "../../components/ui/States";
import { useGetLeadStatsQuery } from "../../redux/api/leadsApi";
import LocalSeoModule from "../../components/LocalSEO/LocalSeoModule";

import AnalyticsCard from "../../components/Card/AnalyticsCard";
import TemperatureCard from "../../components/Card/TemperatureCard";
import { useSelector } from "react-redux";
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

// Placeholder in the shape of the page: the KPI row and the two charts.
const DashboardSkeleton = () => (
  <div className="min-h-screen space-y-3 bg-app-bg p-3 md:space-y-6 md:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>
      <Skeleton className="h-9 w-56" />
    </div>
    <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-5">
      {Array.from({ length: 5 }, (_, i) => (
        <Skeleton key={i} className="h-24" />
      ))}
    </div>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Skeleton className="h-72" />
      <Skeleton className="h-72" />
    </div>
  </div>
);

function Dashboard() {
  const { hid } = useSelector((state) => state.userProfile);
  const analyticsRange = useAnalyticsRange();
  // refetched on every visit, like before, so the counts are never stale
  const stats = useGetLeadStatsQuery(hid, {
    skip: !hid,
    refetchOnMountOrArgChange: true,
  });
  const data = stats.data;
  const [currentAnalytics, setCurrentAnalytics] = useState("overview");

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

  const getStatusCount = (status) => cleanedStatus.find((s) => s.name === status)?.count || 0;

  if (stats.isError && !data) {
    return (
      <div className="p-3 md:p-6">
        <ErrorState message="Could not load your dashboard." onRetry={stats.refetch} />
      </div>
    );
  }
  if (!data) return <DashboardSkeleton />;

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
        {/* <DateRangePicker value={analyticsRange} onChange={setAnalyticsRange} /> */}
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
          value={whatsapp.toLocaleString()} />
      </div>

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
                unit="leads" />
              <div className="max-h-72 overflow-y-auto pr-1">
                <ProgressList
                  showShare
                  total={stageItems.reduce((sum, item) => sum + item.value, 0)}
                  items={stageItems} />
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
}

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
