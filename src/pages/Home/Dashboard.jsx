import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  MessageCircle,
  Phone,
  PieChart as PieChartIcon,
  UserPlus,
  Users,
} from "lucide-react";
import { CHART_COLORS } from "../../components/Charts/chartTheme";
import DonutChart from "../../components/Charts/DonutChart";
import UiCard from "../../components/ui/Card";
import Icon from "../../components/ui/Icon";
import ProgressList from "../../components/ui/ProgressList";
import Tabs from "../../components/ui/Tabs";
// import DateRangePicker from "../../components/ui/DateRangePicker";
import { EmptyState, ErrorState, Skeleton } from "../../components/ui/States";
import { useGetLeadStatsQuery } from "../../redux/api/leadsApi";
import { selectCurrentLocation } from "../../redux/slice/UserSlice";
import { PAGES, dashboardPath } from "../../routes/paths";
import {
  // setAnalyticsRange,
  useAnalyticsRange,
} from "../../components/Analytics/analyticsRange";
import GoogleAnalyticsChart from "../../components/Analytics/GoogleAnalyticsChart";
import TrafficSources from "../../components/Analytics/TrafficSources";
import TopPagesTable from "../../components/Analytics/TopPagesTable";
import ConversionEvents from "../../components/Analytics/ConversionEvents";
import DeviceAnalytics from "../../components/Analytics/DeviceAnalytics";
import GeoAnalytics from "../../components/Analytics/GeoAnalytics";
import SearchConsoleQueries from "../../components/SearchConsoleQueries";
import CallsAnalytics from "../Calls/CallsAnalytics";
import RecentLeads from "./RecentLeads";

// Only the open tab is mounted, so a tab's requests run when it is opened.
// The tab lives in ?view= so it survives a reload and the back button.
const VIEWS = [
  { value: "leads", label: "Leads" },
  { value: "calls", label: "Calls" },
  { value: "website", label: "Website" },
];

const SHORTCUTS = [
  { label: "All leads", icon: Users, page: PAGES.LEADS_ALL },
  { label: "WhatsApp chat", icon: MessageCircle, page: PAGES.CHAT_WHATSAPP },
  { label: "Calls", icon: Phone, page: PAGES.CALLS },
  { label: "Website analytics", icon: BarChart3, page: PAGES.INSIGHTS_GOOGLE_ANALYTICS },
];

// icon chip colour per headline number
const ACCENTS = {
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  green: "bg-green-500/10 text-green-600 dark:text-green-400",
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  return "Good evening";
};

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

const Kpi = ({ icon, label, value, caption, accent }) => (
  <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-app-border! bg-app-surface p-3.5 sm:p-4">
    <span className={`flex size-9 items-center justify-center rounded-lg ${ACCENTS[accent]}`}>
      <Icon icon={icon} />
    </span>
    <div className="min-w-0">
      <p className="text-2xl font-semibold tabular-nums leading-tight text-app-text sm:text-[1.75rem]">
        {value}
      </p>
      <p className="mt-0.5 truncate text-xs font-medium text-app-text-muted sm:text-sm">
        {label}
      </p>
      {caption && (
        <p className="mt-1 truncate text-xs text-app-text-faint">{caption}</p>
      )}
    </div>
  </div>
);

const HomeSkeleton = () => (
  <div className="space-y-4 p-3 sm:space-y-6 sm:p-6">
    <div className="space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-7 w-64 max-w-full" />
    </div>
    <div className="flex gap-2 overflow-hidden">
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="h-9 w-36 shrink-0" />
      ))}
    </div>
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
    <Skeleton className="h-10 w-64 max-w-full" />
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Skeleton className="h-72" />
      <Skeleton className="h-72" />
    </div>
  </div>
);

const LeadsView = ({ sourceItems, stageItems }) => (
  <div className="anim-stagger grid grid-cols-1 gap-4 lg:grid-cols-2">
    <UiCard
      title="Where leads come from"
      description="All time, by source"
      actions={
        <Link
          to={dashboardPath(PAGES.LEADS_ALL)}
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          View leads <Icon icon={ArrowRight} size="sm" />
        </Link>
      }
    >
      {sourceItems.length ? (
        <div className="max-h-80 overflow-y-auto pr-1">
          <ProgressList showShare items={sourceItems} />
        </div>
      ) : (
        <EmptyState icon={PieChartIcon} title="No leads yet" />
      )}
    </UiCard>

    <UiCard title="Pipeline stages" description="Leads in each stage">
      {stageItems.length ? (
        <div className="grid grid-cols-1 items-center gap-5 sm:grid-cols-2">
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
);

const WebsiteView = () => (
  <div className="space-y-4">
    <GoogleAnalyticsChart showDatePicker={false} />
    <TrafficSources />
    <TopPagesTable />
    <SearchConsoleQueries />
    <ConversionEvents />
    <DeviceAnalytics />
    <GeoAnalytics />
  </div>
);

function Dashboard() {
  const { hid, user: hotel } = useSelector((state) => state.userProfile);
  const currentLocation = useSelector(selectCurrentLocation);
  const analyticsRange = useAnalyticsRange();
  const [searchParams, setSearchParams] = useSearchParams();
  const view = VIEWS.some((v) => v.value === searchParams.get("view"))
    ? searchParams.get("view")
    : VIEWS[0].value;

  // refetched on every visit so the counts are never stale
  const stats = useGetLeadStatsQuery(hid, {
    skip: !hid,
    refetchOnMountOrArgChange: true,
  });
  const data = stats.data;

  const total = data?.totalLeads?.[0]?.count || 0;
  const converted = data?.convertedLeads?.[0]?.count || 0;
  const whatsapp = data?.totalWhatsappConversations || 0;
  const today = data?.todayLeads || 0;
  const conversionRate = total ? ((converted / total) * 100).toFixed(1) : 0;

  const sourceItems = useMemo(
    () =>
      toListItems(
        data?.sourceBreakdown?.map((item) => ({ name: item._id, count: item.count })) || [],
      ),
    [data],
  );
  const stageItems = useMemo(
    () =>
      toListItems(
        data?.statusBreakdown
          ?.filter((item) => item._id)
          .map((item) => ({ name: item._id, count: item.count })) || [],
      ),
    [data],
  );

  const setView = (value) =>
    setSearchParams(
      (params) => {
        params.set("view", value);
        return params;
      },
      { replace: true },
    );

  if (stats.isError && !data) {
    return (
      <div className="p-3 sm:p-6">
        <ErrorState message="Could not load your dashboard." onRetry={stats.refetch} />
      </div>
    );
  }
  if (!data) return <HomeSkeleton />;

  const name = currentLocation?.local || hotel?.Profile?.hotelName || "";
  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 p-3 transition-colors duration-200 sm:space-y-6 sm:p-6">
      {/* Greeting */}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-app-text-muted">{todayLabel}</p>
          <h1 className="mt-0.5 truncate text-xl font-semibold text-app-text sm:text-2xl">
            {getGreeting()}
            {name && <span className="capitalize">, {name}</span>}
          </h1>
        </div>
        {/* off until the lead, call and website APIs take a date range;
            would drive every tab below */}
        {/* <DateRangePicker value={analyticsRange} onChange={setAnalyticsRange} /> */}
      </header>

      {/* Shortcuts: one swipeable row on phones */}
      <nav
        aria-label="Shortcuts"
        className="-mx-3 flex gap-2 overflow-x-auto px-3 scrollbar-hidden sm:mx-0 sm:flex-wrap sm:px-0"
      >
        {SHORTCUTS.map(({ label, icon, page }) => (
          <Link
            key={page}
            to={dashboardPath(page)}
            className="flex shrink-0 items-center gap-2 rounded-full border border-app-border! bg-app-surface px-3.5 py-2 text-sm font-medium text-app-text transition-colors hover:border-blue-500! hover:text-blue-600 dark:hover:text-blue-400"
          >
            <Icon icon={icon} size="sm" className="text-app-text-muted" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Headline numbers */}
      <section aria-label="Lead summary" className="anim-stagger grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Kpi icon={UserPlus} accent="blue" label="Today's leads" value={today.toLocaleString()} />
        <Kpi icon={Users} accent="amber" label="Total leads" value={total.toLocaleString()} />
        <Kpi
          icon={BadgeCheck}
          accent="emerald"
          label="Converted"
          value={converted.toLocaleString()}
          caption={`${conversionRate}% conversion rate`}
        />
        <Kpi
          icon={MessageCircle}
          accent="green"
          label="WhatsApp chats"
          value={whatsapp.toLocaleString()}
        />
      </section>

      {/* only shown when leads came in during the last 24 hours */}
      <RecentLeads />

      {/* Sections */}
      <div className="-mx-3 overflow-x-auto border-b border-app-border! px-3 pb-3 scrollbar-hidden sm:mx-0 sm:px-0">
        <Tabs tabs={VIEWS} value={view} onChange={setView} className="flex-nowrap!" />
      </div>

      <div key={view} className="anim-enter">
        {view === "leads" && <LeadsView sourceItems={sourceItems} stageItems={stageItems} />}
        {view === "calls" && <CallsAnalytics dateRange={analyticsRange} />}
        {view === "website" && <WebsiteView />}
      </div>
    </div>
  );
}

export default Dashboard;
