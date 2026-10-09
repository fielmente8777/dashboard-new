import { Activity, Clock, Eye, MousePointerClick, TrendingUp, Users } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useApiAction } from "../../hooks/useApiAction";
import {
  useGetAnalyticsOverviewQuery,
  useGetAnalyticsPropertiesQuery,
  useSaveAnalyticsPropertyMutation,
} from "../../redux/api/analyticsApi";
import { selectHid } from "../../redux/slice/UserSlice";
import { PAGES, dashboardPath } from "../../routes/paths";
import {
  CHART_COLORS,
  axisProps,
  formatCompact,
  formatDayLabel,
  formatDuration,
  gridProps,
  tooltipProps,
} from "../Charts/chartTheme";
import Card from "../ui/Card";
import { Select } from "../ui/Field";
import { Skeleton } from "../ui/States";
import {
  DATE_OPTIONS,
  announceAnalyticsRange,
  announcePropertyChange,
  setAnalyticsRange,
  useAnalyticsRange,
  useAnalyticsReport,
} from "./analyticsRange";
import Icon from "../ui/Icon";

// Only this account manages more than one Google Analytics property.
const PROPERTY_SWITCHER_EMAIL = "abhijeet@eazotel.com";

// Each metric keeps its own colour. `average` metrics are averaged over the
// range instead of summed.
const METRICS = [
  { key: "users", label: "Active Users", icon: Users },
  { key: "newUsers", label: "New Users", icon: TrendingUp },
  { key: "sessions", label: "Sessions", icon: Activity },
  { key: "pageViews", label: "Page Views", icon: Eye },
  { key: "eventCount", label: "Events", icon: MousePointerClick },
  { key: "avgSessionDuration", label: "Avg Duration", icon: Clock, average: true },
].map((metric, index) => ({ ...metric, color: CHART_COLORS[index] }));

const getTotal = (rows, metric) => {
  const sum = rows.reduce((total, row) => total + (row[metric.key] || 0), 0);
  return metric.average && rows.length ? sum / rows.length : sum;
};

const formatMetric = (metric, value) =>
  metric.average ? formatDuration(value) : formatCompact(value);

const GoogleAnalyticsChart = () => {
  const gradientId = useId().replace(/:/g, "");
  const run = useApiAction();
  const hid = useSelector(selectHid);
  const hotelEmail = useSelector(
    (state) => state.userProfile.user?.Profile?.hotelEmail,
  );
  const [metricKey, setMetricKey] = useState(METRICS[0].key);

  const overview = useAnalyticsReport(useGetAnalyticsOverviewQuery);
  const { chartData = [], activePropertyId, email, error } = overview.data || {};
  const range = useAnalyticsRange();

  const canSwitchProperty = hotelEmail === PROPERTY_SWITCHER_EMAIL;
  const properties = useGetAnalyticsPropertiesQuery(email, {
    skip: !email || !canSwitchProperty,
  });
  const [saveProperty, { isLoading: isSwitching }] =
    useSaveAnalyticsPropertyMutation();

  // widgets outside this folder start on their own default range
  useEffect(announceAnalyticsRange, []);

  // the Search Console widgets read the active property from localStorage
  useEffect(() => {
    if (activePropertyId) {
      localStorage.setItem("activePropertyId", activePropertyId);
    }
  }, [activePropertyId]);

  const handlePropertyChange = async (e) => {
    const propertyId = e.target.value;
    const saved = await run(
      saveProperty({ hid, email, property_id: propertyId }),
      { error: "Failed to switch property." },
    );
    if (saved) announcePropertyChange(propertyId);
  };

  if (overview.isLoading || overview.isUninitialized) {
    return <Skeleton className="h-96" />;
  }

  if (overview.isError || error) {
    return (
      <Card>
        <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm font-medium text-app-text">
            {error || "Google Analytics is not connected."}
          </p>
          <Link
            to={dashboardPath(PAGES.INTEGRATION)}
            className="text-sm font-medium text-blue-500 hover:underline"
          >
            Connect it in Integrations
          </Link>
        </div>
      </Card>
    );
  }

  const metric = METRICS.find((item) => item.key === metricKey);

  return (
    <Card
      title="Eaz Analytics"
      description={`Website traffic · ${range.label}`}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {properties.data?.length > 0 && (
            <div className="w-48">
              <Select
                aria-label="Analytics property"
                value={activePropertyId || ""}
                disabled={isSwitching}
                onChange={handlePropertyChange}
                options={properties.data.map((property) => ({
                  value: property.property_id,
                  label: property.name,
                }))}
              />
            </div>
          )}
          <div className="w-40">
            <Select
              aria-label="Date range"
              value={range.start}
              onChange={(e) =>
                setAnalyticsRange(
                  DATE_OPTIONS.find((option) => option.start === e.target.value),
                )
              }
              options={DATE_OPTIONS.map((option) => ({
                value: option.start,
                label: option.label,
              }))}
            />
          </div>
        </div>
      }
    >
      <div role="tablist" className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {METRICS.map((item) => {
          const active = item.key === metricKey;

          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setMetricKey(item.key)}
              className={`rounded-lg border p-3 text-left transition-colors ${
                active
                  ? "border-blue-500! bg-app-surface"
                  : "border-transparent! bg-app-surface-secondary hover:border-app-border!"
              }`}
            >
              <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-app-text-muted">
                <Icon icon={item.icon} size="sm" color={item.color} />
                {item.label}
              </span>
              <span className="mt-1 block text-xl font-semibold tabular-nums text-app-text">
                {formatMetric(item, getTotal(chartData, item))}
              </span>
            </button>
          );
        })}
      </div>

      <div
        className={`mt-5 h-80 transition-opacity ${overview.isFetching || isSwitching ? "opacity-50" : ""}`}
      >
        {chartData.length === 0 ? (
          <p className="flex h-full items-center justify-center text-sm text-app-text-muted">
            No traffic data for this period.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 12, left: -8, bottom: 0 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={metric.color} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={metric.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridProps} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDayLabel}
                minTickGap={24}
                {...axisProps}
              />
              <YAxis
                tickFormatter={(value) => formatMetric(metric, value)}
                {...axisProps}
              />
              <Tooltip
                {...tooltipProps}
                formatter={(value) => formatMetric(metric, value)}
                labelFormatter={(date) =>
                  new Date(date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })
                }
              />
              <Area
                type="monotone"
                name={metric.label}
                dataKey={metric.key}
                stroke={metric.color}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                activeDot={{
                  r: 5,
                  fill: metric.color,
                  stroke: "var(--app-surface)",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};

export default GoogleAnalyticsChart;
