import {
  ExternalLink,
  Eye,
  Heart,
  Megaphone,
  Plug,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
import { FaFacebook } from "react-icons/fa6";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Icon from "../../components/ui/Icon";
import PageShell from "../../components/ui/PageShell";
import Segmented from "../../components/ui/Segmented";
import StatCard from "../../components/ui/StatCard";
import { EmptyState, ErrorState, Skeleton } from "../../components/ui/States";
import { getApiErrorMessage } from "../../redux/api/baseApi";
import { useGetMetaPageOverviewQuery } from "../../redux/api/metaApi";
import { selectHid } from "../../redux/slice/UserSlice";
import { integrationPath } from "../../routes/paths";
import MetaPerformanceCharts from "./components/MetaPerformanceCharts";
import MetaTopPosts from "./components/MetaTopPosts";

const PERIODS = [
  { value: "day", label: "Today", days: 1 },
  { value: "week", label: "7 days", days: 7 },
  { value: "28_days", label: "28 days", days: 28 },
  { value: "90_days", label: "90 days", days: 90 },
];

const nf = new Intl.NumberFormat("en-IN");
const compact = new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 });
const count = (n) => nf.format(Math.round(Number(n) || 0));

// the four numbers people look at first; `key` is the card gian sends
const HEADLINE = [
  { key: "reach", label: "Reach", icon: Users, hint: "People who saw your page or posts" },
  { key: "impressions", label: "Views", icon: Eye, hint: "Times your page and posts were seen" },
  { key: "engagements", label: "Engagements", icon: Heart, hint: "Reactions, comments, shares and clicks" },
  { key: "newFollowers", label: "New followers", icon: UserPlus, hint: "People who started following" },
];

const Change = ({ value }) =>
  value == null || value === 0 ? null : (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        value > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
      }`}
    >
      <Icon icon={value > 0 ? TrendingUp : TrendingDown} size="sm" />
      {Math.abs(value)}%
    </span>
  );

// The Facebook page this location is connected to.
const PageHeader = ({ page, followers }) => (
  <Card>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        {page?.picture ? (
          <img src={page.picture} alt="" className="size-14 shrink-0 rounded-full object-cover ring-1 ring-app-border" />
        ) : (
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#1877F2]/10 text-[#1877F2]">
            <FaFacebook size={28} />
          </span>
        )}
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-app-text-muted">
            <FaFacebook className="text-[#1877F2]" /> Facebook page
          </p>
          <h2 className="truncate text-lg font-semibold text-app-text">{page?.name || "Your page"}</h2>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-app-text-muted">
            <span>
              <span className="font-semibold tabular-nums text-app-text">{count(followers?.value ?? page?.followers)}</span>{" "}
              followers
            </span>
            <Change value={followers?.growth} />
          </p>
        </div>
      </div>
      {page?.link && (
        <a
          href={page.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          View on Facebook <Icon icon={ExternalLink} size="sm" />
        </a>
      )}
    </div>
  </Card>
);

// ratios that say how well the posts land
const Efficiency = ({ cards }) => {
  const reach = cards.reach?.value || 0;
  const items = [
    {
      label: "Engagement rate",
      hint: "Engagements ÷ reach",
      value: reach ? `${(((cards.engagements?.value || 0) / reach) * 100).toFixed(2)}%` : "—",
    },
    { label: "Reactions", hint: "Likes and other reactions", value: count(cards.reactions?.value), change: cards.reactions?.growth },
    { label: "Video views", hint: "Times your videos were watched", value: count(cards.videoViews?.value), change: cards.videoViews?.growth },
    {
      label: "Views per person",
      hint: "Views ÷ reach",
      value: reach ? ((cards.impressions?.value || 0) / reach).toFixed(1) : "—",
    },
  ];
  return (
    <dl className="grid grid-cols-2 overflow-hidden rounded-xl border border-app-border! bg-app-surface lg:grid-cols-4 lg:divide-x lg:divide-app-border!">
      {items.map((item) => (
        <div key={item.label} className="px-4 py-3" title={item.hint}>
          <dt className="text-xs font-medium text-app-text-muted">{item.label}</dt>
          <dd className="mt-1 flex items-baseline gap-2">
            <span className="text-lg font-semibold tabular-nums text-app-text">{item.value}</span>
            <Change value={item.change} />
          </dd>
        </div>
      ))}
    </dl>
  );
};

const LoadingLayout = () => (
  <>
    <Skeleton className="h-24" />
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {HEADLINE.map((card) => (
        <Skeleton key={card.key} className="h-28" />
      ))}
    </div>
    <Skeleton className="h-16" />
    <Skeleton className="h-80" />
  </>
);

const NotConnected = () => {
  const navigate = useNavigate();
  return (
    <Card>
      <EmptyState
        icon={Plug}
        title="Connect your Facebook page"
        description="Link the Facebook page of this property to see its reach, followers and best posts here."
        action={
          <Button icon={Plug} onClick={() => navigate(integrationPath("meta-lead-ads"))}>
            Go to Integrations
          </Button>
        }
      />
    </Card>
  );
};

const MetaPageInsights = () => {
  const hid = useSelector(selectHid);
  const [period, setPeriod] = useState("28_days");
  const overview = useGetMetaPageOverviewQuery(
    { hid, period },
    { skip: !hid, refetchOnMountOrArgChange: true },
  );

  const data = overview.data;
  const cards = data?.cards || {};
  const isLoading = overview.isLoading || overview.isUninitialized;
  const days = PERIODS.find((p) => p.value === period)?.days;
  const caption = days === 1 ? "vs the day before" : `vs previous ${days} days`;
  const notConnected = overview.error?.status === 404;
  const quiet =
    !isLoading && !overview.isError && !cards.reach?.value && !cards.impressions?.value && !cards.engagements?.value;

  return (
    <PageShell
      title="Meta insights"
      description="Reach, followers and engagement of your Facebook page."
      actions={
        <Segmented
          label="Period"
          options={PERIODS}
          value={period}
          onChange={setPeriod}
          disabled={overview.isFetching}
        />
      }
    >
      {notConnected ? (
        <NotConnected />
      ) : overview.isError ? (
        <ErrorState
          message={getApiErrorMessage(overview.error, "Could not load the Meta page insights.")}
          onRetry={overview.refetch}
        />
      ) : isLoading ? (
        <LoadingLayout />
      ) : (
        <div className={`space-y-4 transition-opacity ${overview.isFetching ? "opacity-60" : ""}`}>
          <PageHeader page={data?.page} followers={cards.followers} />

          {quiet && (
            <Card>
              <EmptyState
                icon={Megaphone}
                title="A quiet period"
                description="Your page had no reach or engagement in these dates. Post something, or pick a longer period."
              />
            </Card>
          )}

          <div className="anim-stagger grid grid-cols-2 gap-3 xl:grid-cols-4">
            {HEADLINE.map((card) => {
              const metric = cards[card.key] || {};
              const growth = metric.growth;
              return (
                <div key={card.key} title={card.hint}>
                  <StatCard
                    label={card.label}
                    icon={card.icon}
                    value={compact.format(Number(metric.value) || 0)}
                    {...(growth != null && {
                      growth,
                      trend: growth > 0 ? "up" : growth < 0 ? "down" : "flat",
                      caption,
                    })}
                  />
                </div>
              );
            })}
          </div>

          <Efficiency cards={cards} />

          <MetaPerformanceCharts data={data?.performanceOverview} />

          <MetaTopPosts posts={data?.topPosts} />
        </div>
      )}
    </PageShell>
  );
};

export default MetaPageInsights;
