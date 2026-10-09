import { useState } from "react";
import { useSelector } from "react-redux";
import { Select } from "../../components/ui/Field";
import PageShell from "../../components/ui/PageShell";
import StatCard from "../../components/ui/StatCard";
import { ErrorState, Skeleton } from "../../components/ui/States";
import { getApiErrorMessage } from "../../redux/api/baseApi";
import { useGetMetaPageOverviewQuery } from "../../redux/api/metaApi";
import { selectHid } from "../../redux/slice/UserSlice";
import MetaPerformanceCharts from "./components/MetaPerformanceCharts";
import MetaTopPosts from "./components/MetaTopPosts";

const PERIODS = [
  { value: "day", label: "Today" },
  { value: "week", label: "Last 7 days" },
  { value: "28_days", label: "Last 28 days" },
  { value: "90_days", label: "Last 90 days" },
];

// titles of the headline cards the API sends
const CARD_LABELS = {
  followers: "Followers",
  newFollowers: "New Followers",
  reach: "Reach",
  impressions: "Impressions",
  videoViews: "Video Views",
};

const MetaPageInsights = () => {
  const hid = useSelector(selectHid);
  const [period, setPeriod] = useState("28_days");
  const overview = useGetMetaPageOverviewQuery(
    { hid, period },
    { skip: !hid, refetchOnMountOrArgChange: true },
  );

  const data = overview.data;
  const isLoading = overview.isLoading || overview.isUninitialized;
  const cards = Object.entries(data?.cards || {});

  return (
    <PageShell
      title="Meta Page Insights"
      description="Track page performance, reach, followers and engagement."
      actions={
        <div className="w-44">
          <Select
            aria-label="Period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            options={PERIODS}
          />
        </div>
      }
    >
      {overview.isError ? (
        <ErrorState
          message={getApiErrorMessage(
            overview.error,
            "Could not load the Meta page insights.",
          )}
          onRetry={overview.refetch}
        />
      ) : (
        <div
          className={`space-y-5 transition-opacity ${overview.isFetching && !isLoading ? "opacity-60" : ""}`}
        >
          <div className="anim-stagger grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
            {isLoading
              ? Object.keys(CARD_LABELS).map((key) => (
                  <Skeleton key={key} className="h-28" />
                ))
              : cards.map(([key, metric]) => (
                  <StatCard
                    key={key}
                    label={CARD_LABELS[key] || key}
                    value={Number(metric.value || 0).toLocaleString()}
                    trend={metric.trend}
                    growth={metric.growth}
                  />
                ))}
          </div>

          {isLoading ? (
            <Skeleton className="h-80" />
          ) : (
            <MetaPerformanceCharts data={data?.performanceOverview} />
          )}

          <MetaTopPosts posts={data?.topPosts} loading={isLoading} />
        </div>
      )}
    </PageShell>
  );
};

export default MetaPageInsights;
