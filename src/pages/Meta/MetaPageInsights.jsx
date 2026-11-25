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
import { useEffect, useRef, useState } from "react";
import { FaFacebook } from "react-icons/fa6";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "../../components/ui/Button";
import DateRangePicker from "../../components/ui/DateRangePicker";
import Card from "../../components/ui/Card";
import Icon from "../../components/ui/Icon";
import PageShell from "../../components/ui/PageShell";
import Segmented from "../../components/ui/Segmented";
import Tabs from "../../components/ui/Tabs";
import StatCard from "../../components/ui/StatCard";
import { EmptyState, ErrorState, Skeleton } from "../../components/ui/States";
import { getApiErrorMessage } from "../../redux/api/baseApi";
import { useGetMetaPageOverviewQuery } from "../../redux/api/metaApi";
import { selectHid } from "../../redux/slice/UserSlice";
import { integrationPath } from "../../routes/paths";
import { addDays, DATE_PRESETS, toISODate } from "../../utils/datePresets";
import CreateReportButton from "./components/CreateReportButton";
import MetaPerformanceCharts from "./components/MetaPerformanceCharts";
import MetaReportsPanel from "./components/MetaReportsPanel";
import PostsGrid from "./components/PostsGrid";
import InstagramCard from "./components/live/InstagramCard";
import LiveStatus from "./components/live/LiveStatus";
import MetaAdsTab from "./components/live/MetaAdsTab";
import MetaLeadsTab from "./components/live/MetaLeadsTab";
import MetaOverviewTab from "./components/live/MetaOverviewTab";
import useMetaLive from "./components/live/useMetaLive";

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

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "ads", label: "Ads" },
  { value: "content", label: "Content" },
  { value: "leads", label: "Leads" },
  { value: "reports", label: "Reports" },
];
const TAB_VALUES = new Set(TABS.map((t) => t.value));
// tabs that read the live Meta snapshot for the dates picked at the top
const LIVE_TABS = new Set(["overview", "ads", "leads"]);

const last30 = DATE_PRESETS.find((p) => p.key === "last30");
const DEFAULT_RANGE = { ...last30.get(), preset: "last30", label: last30.label };

// the Content tab's quick periods, as dates for the Instagram card
const periodRange = (value) => {
  const days = PERIODS.find((p) => p.value === value)?.days || 28;
  return { since: toISODate(addDays(new Date(), -(days - 1))), until: toISODate(new Date()) };
};

const LiveLoading = () => (
  <div className="space-y-4">
    <p className="text-sm text-app-text-muted">
      Reading your ads, page and Instagram from Meta. The first time for these dates can take up to a minute.
    </p>
    <Skeleton className="h-28" />
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-6">
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="h-28" />
      ))}
    </div>
    <Skeleton className="h-72" />
  </div>
);

// The Facebook page view (the page's own insights endpoint, with its quick periods), with
// Instagram for the same days underneath.
const ContentTab = ({ hid, period, overview, instagramLive }) => {
  const data = overview.data;
  const cards = data?.cards || {};
  const isLoading = overview.isLoading || overview.isUninitialized;
  const days = PERIODS.find((p) => p.value === period)?.days;
  const caption = days === 1 ? "vs the day before" : `vs previous ${days} days`;
  const quiet =
    !isLoading && !overview.isError && !cards.reach?.value && !cards.impressions?.value && !cards.engagements?.value;

  if (overview.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(overview.error, "Could not load the Meta page insights.")}
        onRetry={overview.refetch}
      />
    );
  }
  if (isLoading) return <LoadingLayout />;

  return (
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


      <InstagramCard
        instagram={instagramLive.data?.snapshot?.instagram}
        loading={!instagramLive.data && !instagramLive.isError}
        error={instagramLive.isError && !instagramLive.data}
      />

      <PostsGrid hid={hid} />
    </div>
  );
};

const MetaPageInsights = () => {
  const hid = useSelector(selectHid);
  const [period, setPeriod] = useState("28_days");
  const [range, setRange] = useState(DEFAULT_RANGE);
  const [searchParams, setSearchParams] = useSearchParams();
  const asked = searchParams.get("tab");
  // older links used ?tab=insights for the page view
  const tab = asked === "insights" ? "content" : TAB_VALUES.has(asked) ? asked : "overview";
  const setTab = (next) => setSearchParams(next === "overview" ? {} : { tab: next }, { replace: true });

  const utmRef = useRef(null);
  const [scrollToUtm, setScrollToUtm] = useState(false);
  const showUtm = () => {
    setTab("ads");
    setScrollToUtm(true);
  };

  const isLive = LIVE_TABS.has(tab);
  const live = useMetaLive({ hid, since: range.start, until: range.end, skip: !isLive });
  const instagramLive = useMetaLive({ hid, ...periodRange(period), skip: tab !== "content" });
  const overview = useGetMetaPageOverviewQuery(
    { hid, period },
    { skip: !hid || tab !== "content", refetchOnMountOrArgChange: true },
  );

  useEffect(() => {
    if (!scrollToUtm || tab !== "ads" || !utmRef.current) return;
    utmRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    setScrollToUtm(false);
  }, [scrollToUtm, tab, live.data]);

  const notConnected = overview.error?.status === 404 || live.error?.status === 404;

  const liveBody = () => {
    if (live.isError && !live.data) {
      return (
        <ErrorState
          message={getApiErrorMessage(live.error, "Could not read Meta. Try again in a minute.")}
          onRetry={live.refetch}
        />
      );
    }
    if (!live.data) return <LiveLoading />;
    return (
      <div className={`space-y-4 transition-opacity ${live.isFetching ? "opacity-60" : ""}`}>
        <LiveStatus live={live} />
        {tab === "overview" && <MetaOverviewTab data={live.data} onShowUtm={showUtm} />}
        {tab === "ads" && <MetaAdsTab data={live.data} utmRef={utmRef} hid={hid} range={range} />}
        {tab === "leads" && <MetaLeadsTab data={live.data} />}
      </div>
    );
  };

  return (
    <PageShell
      title="Meta insights"
      description="Your Facebook and Instagram ads, page, posts and leads in one place, and PDF reports to share."
      actions={
        <>
          {isLive && !notConnected && (
            <DateRangePicker value={range} onChange={(next) => next && setRange(next)} className="w-full sm:w-64" />
          )}
          {tab === "content" && (
            <Segmented
              label="Period"
              options={PERIODS}
              value={period}
              onChange={setPeriod}
              disabled={overview.isFetching}
            />
          )}
          {!notConnected && <CreateReportButton hid={hid} onCreated={() => setTab("reports")} />}
        </>
      }
    >
      <Tabs tabs={TABS} value={tab} onChange={setTab} className="mb-4" />

      {notConnected ? (
        <NotConnected />
      ) : tab === "reports" ? (
        <MetaReportsPanel hid={hid} />
      ) : tab === "content" ? (
        <ContentTab hid={hid} period={period} overview={overview} instagramLive={instagramLive} />
      ) : (
        liveBody()
      )}
    </PageShell>
  );
};

export default MetaPageInsights;
