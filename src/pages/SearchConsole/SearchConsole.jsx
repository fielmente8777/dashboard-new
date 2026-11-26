import {
  ArrowDown,
  ArrowUp,
  Eye,
  Lock,
  MousePointerClick,
  Percent,
  Plug,
  RefreshCw,
  Search,
  Settings,
  Trophy,
} from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { setAnalyticsRange, useAnalyticsRange } from "../../components/Analytics/analyticsRange";
import GscSettings from "../../components/GscSettings";
import InsightList from "../../components/insights/InsightList";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import DateRangePicker from "../../components/ui/DateRangePicker";
import Icon from "../../components/ui/Icon";
import { Skeleton } from "../../components/ui/States";
import {
  useGetAnalyticsOverviewQuery,
  useGetSearchQueriesQuery,
} from "../../redux/api/analyticsApi";
import { selectHid } from "../../redux/slice/UserSlice";
import { integrationPath } from "../../routes/paths";
import Delta from "../GoogleAnalytics/components/Delta";
import { previousRange } from "../GoogleAnalytics/analyticsUtils";
import {
  changeOf,
  isBrandSearch,
  positionBand,
  searchInsights,
  totalsOf,
  withPrevious,
} from "./searchConsoleUtils";

// What to show for each failure the backend names.
const STATES = {
  NOT_CONFIGURED: {
    icon: Settings,
    title: "Search Console isn't set up yet",
    description: "Add your website's Search Console domain below. We find it from your Google Analytics property when we can.",
  },
  PERMISSION_DENIED: {
    icon: Lock,
    title: "No Search Console access",
    description: "The connected Google account has no access to this website in Search Console, or the domain below is not the one in Search Console.",
  },
  BAD_SITE_URL: {
    icon: Lock,
    title: "The Search Console address looks wrong",
    description: "Check the domain below: a Domain property is just the domain (example.com); a URL-prefix property is the full address (https://www.example.com/).",
  },
  USER_NOT_FOUND: {
    icon: Plug,
    title: "Google account not found",
    description: "Reconnect Google Analytics in Integrations, then come back here.",
  },
  API_ERROR: {
    icon: Search,
    title: "Couldn't load your search data",
    description: "Google did not answer this time. Try again in a moment.",
  },
};

const KPIS = [
  { key: "clicks", label: "Clicks", icon: MousePointerClick, hint: "Visits to your website from Google Search", format: (v) => v.toLocaleString() },
  { key: "impressions", label: "Impressions", icon: Eye, hint: "Times your website appeared in results", format: (v) => v.toLocaleString() },
  { key: "ctr", label: "Click-through rate", icon: Percent, hint: "Clicks out of impressions", format: (v) => `${v.toFixed(1)}%` },
  // lower is better, so the change is turned round
  { key: "position", label: "Average position", icon: Trophy, hint: "Where you appear on Google (1 = top)", format: (v) => (v ? v.toFixed(1) : "—"), lowerIsBetter: true },
];

const Kpi = ({ kpi, value, before, loading }) => {
  const change = changeOf(value, before);
  return (
    <div className="rounded-xl border border-app-border! bg-app-surface p-4">
      <div className="flex items-center gap-2 text-app-text-muted">
        <Icon icon={kpi.icon} size="sm" />
        <span className="text-xs font-medium">{kpi.label}</span>
      </div>
      {loading ? (
        <Skeleton className="mt-2 h-8 w-24" />
      ) : (
        <p className="mt-1.5 text-2xl font-semibold tabular-nums text-app-text">{kpi.format(value)}</p>
      )}
      <div className="mt-1 flex items-center gap-2">
        {!loading && <Delta value={change === null ? null : kpi.lowerIsBetter ? -change : change} />}
      </div>
      <p className="mt-1.5 text-[11px] leading-snug text-app-text-faint">{kpi.hint}</p>
    </div>
  );
};

const Bar = ({ value, max, color = "var(--chart-1)" }) => (
  <div className="h-1.5 w-full overflow-hidden rounded-full bg-seo-track">
    <div className="h-full rounded-full" style={{ width: `${max ? Math.min((value / max) * 100, 100) : 0}%`, backgroundColor: color }} />
  </div>
);

const PositionMove = ({ gain }) => {
  if (gain === null || Math.abs(gain) < 0.5) return <span className="text-xs text-app-text-faint">{gain === null ? "new" : "same"}</span>;
  const up = gain > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${up ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
      <Icon icon={up ? ArrowUp : ArrowDown} size="xs" />
      {Math.abs(gain).toFixed(1)}
    </span>
  );
};

// Google Search Console of the hotel's website: how people find it on Google.
// Built on the core API's Search Console endpoint, which gives the top 10
// searches for a period; the page compares them with the period before and
// says what to do about them. The date range is shared with Google Analytics.
const SearchConsole = () => {
  const hid = useSelector(selectHid);
  const hotelName = useSelector((state) => state.userProfile.user?.Profile?.hotelName) || "";
  const range = useAnalyticsRange();
  const [showSettings, setShowSettings] = useState(false);

  // the Search Console site comes from the Google Analytics property
  const ga = useGetAnalyticsOverviewQuery({ hid, range: { start: range.start, end: range.end } }, { skip: !hid });
  const propertyId = ga.data?.activePropertyId || null;
  const gaMissing = !ga.isLoading && (ga.isError || ga.data?.error || !propertyId);

  const current = useGetSearchQueriesQuery({ propertyId, range: { start: range.start, end: range.end } }, { skip: !propertyId });
  const previous = useGetSearchQueriesQuery({ propertyId, range: previousRange(range) }, { skip: !propertyId || !range.start });

  const errorCode = current.error?.errorCode || current.data?.errorCode || null;
  const rows = current.data?.queries || [];
  const previousRows = previous.data?.queries || [];
  const loading = ga.isLoading || current.isLoading || (Boolean(propertyId) && current.isUninitialized);
  const totals = totalsOf(rows);
  const previousTotals = totalsOf(previousRows);
  const table = withPrevious(rows, previousRows);
  const maxClicks = Math.max(...rows.map((r) => r.clicks || 0), 1);
  const maxImpressions = Math.max(...rows.map((r) => r.impressions || 0), 1);
  const insights = searchInsights({ rows, previousRows, totals, previousTotals, hotelName });
  const state = errorCode ? STATES[errorCode] || STATES.API_ERROR : null;

  return (
    <div className="analytics-scope min-h-full p-4 sm:p-6">
      <div className="mx-auto space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-app-text-muted">Insights</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-app-text">Search Console</h1>
            <p className="mt-1.5 text-sm text-app-text-muted">How people find your website on Google: the searches, clicks and your position.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DateRangePicker value={range} onChange={setAnalyticsRange} />
            <Button
              variant="secondary"
              icon={RefreshCw}
              aria-label="Refresh"
              title="Refresh"
              loading={current.isFetching && !current.isLoading}
              onClick={() => {
                if (!current.isUninitialized) current.refetch();
                if (!previous.isUninitialized) previous.refetch();
              }}
            />
            {!gaMissing && (
              <Button variant="secondary" icon={Settings} onClick={() => setShowSettings((v) => !v)}>
                {showSettings ? "Hide settings" : "Settings"}
              </Button>
            )}
          </div>
        </header>

        {gaMissing ? (
          <div className="seo-hero flex flex-col items-center gap-4 rounded-2xl px-6 py-14 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-300">
              <Icon icon={Search} size={28} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-app-text">Connect Google first</h2>
              <p className="mt-1 max-w-md text-sm text-app-text-muted">
                Search Console uses the Google account connected for Google Analytics. Connect it in Integrations, then your search data shows here.
              </p>
            </div>
            <Link
              to={integrationPath("google-analytics")}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90 dark:bg-blue-600"
            >
              <Icon icon={Plug} />
              Connect in Integrations
            </Link>
          </div>
        ) : (
          <>
            {(showSettings || errorCode === "NOT_CONFIGURED" || errorCode === "BAD_SITE_URL" || errorCode === "PERMISSION_DENIED") && <GscSettings />}

            {state ? (
              <Card>
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <Icon icon={state.icon} size="2xl" tone="faint" />
                  <p className="font-semibold text-app-text">{state.title}</p>
                  <p className="max-w-lg text-sm text-app-text-muted">{current.data?.message && errorCode === "API_ERROR" ? current.data.message : state.description}</p>
                </div>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {KPIS.map((kpi) => (
                    <Kpi key={kpi.key} kpi={kpi} value={totals[kpi.key]} before={previous.isLoading ? null : previousTotals[kpi.key]} loading={loading} />
                  ))}
                </div>
                <p className="-mt-3 text-xs text-app-text-faint">
                  From your top {rows.length || 10} searches on Google for {range.label?.toLowerCase() || "this period"}, compared with the same length of time before.
                </p>

                <InsightList items={insights} loading={loading} description="What your search numbers say, and what to do next" />

                <Card title="Top searches" description="The searches that showed your website on Google">
                  {loading ? (
                    <Skeleton className="h-72" />
                  ) : !rows.length ? (
                    <div className="flex flex-col items-center gap-2 py-10 text-center">
                      <Icon icon={Search} size="2xl" tone="faint" />
                      <p className="text-sm text-app-text-muted">No searches for these dates. Google can take 2-3 days to report a day.</p>
                    </div>
                  ) : (
                    <>
                      {/* table on wide screens */}
                      <div className="hidden overflow-x-auto md:block">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-app-border! text-left text-[11px] uppercase tracking-wide text-app-text-muted">
                              <th className="pb-2 pr-3 font-medium">Search</th>
                              <th className="w-44 pb-2 pr-3 font-medium">Clicks</th>
                              <th className="w-44 pb-2 pr-3 font-medium">Impressions</th>
                              <th className="pb-2 pr-3 font-medium">CTR</th>
                              <th className="pb-2 pr-3 font-medium">Position</th>
                              <th className="pb-2 font-medium">Move</th>
                            </tr>
                          </thead>
                          <tbody>
                            {table.map((r) => {
                              const band = positionBand(r.position);
                              return (
                                <tr key={r.keyword} className="border-b border-app-border! last:border-0">
                                  <td className="py-2.5 pr-3">
                                    <span className="font-medium text-app-text">{r.keyword}</span>
                                    {isBrandSearch(r.keyword, hotelName) && <Badge className="ml-2">Your name</Badge>}
                                  </td>
                                  <td className="py-2.5 pr-3">
                                    <div className="flex items-center gap-2">
                                      <span className="w-10 tabular-nums text-app-text">{r.clicks.toLocaleString()}</span>
                                      <Bar value={r.clicks} max={maxClicks} />
                                    </div>
                                  </td>
                                  <td className="py-2.5 pr-3">
                                    <div className="flex items-center gap-2">
                                      <span className="w-12 tabular-nums text-app-text-muted">{r.impressions.toLocaleString()}</span>
                                      <Bar value={r.impressions} max={maxImpressions} color="var(--chart-2)" />
                                    </div>
                                  </td>
                                  <td className="py-2.5 pr-3 tabular-nums text-app-text">{(r.ctr * 100).toFixed(1)}%</td>
                                  <td className="py-2.5 pr-3">
                                    <span className="mr-2 tabular-nums text-app-text">{r.position.toFixed(1)}</span>
                                    <Badge tone={band.tone}>{band.label}</Badge>
                                  </td>
                                  <td className="py-2.5"><PositionMove gain={r.positionGain} /></td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* cards on phones */}
                      <ul className="space-y-2 md:hidden">
                        {table.map((r) => {
                          const band = positionBand(r.position);
                          return (
                            <li key={r.keyword} className="rounded-lg border border-app-border! p-3">
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-medium text-app-text">{r.keyword}</p>
                                <Badge tone={band.tone}>{band.label}</Badge>
                              </div>
                              <div className="mt-2 grid grid-cols-4 gap-2 text-center text-xs">
                                <div><p className="font-semibold tabular-nums text-app-text">{r.clicks}</p><p className="text-app-text-faint">Clicks</p></div>
                                <div><p className="font-semibold tabular-nums text-app-text">{r.impressions}</p><p className="text-app-text-faint">Seen</p></div>
                                <div><p className="font-semibold tabular-nums text-app-text">{(r.ctr * 100).toFixed(1)}%</p><p className="text-app-text-faint">CTR</p></div>
                                <div><p className="font-semibold tabular-nums text-app-text">{r.position.toFixed(1)}</p><PositionMove gain={r.positionGain} /></div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  )}
                </Card>

                <Card title="How to read this" description="A short guide to the numbers">
                  <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    <div><dt className="font-medium text-app-text">Impressions</dt><dd className="mt-0.5 text-xs text-app-text-muted">Your site appeared in someone's Google results.</dd></div>
                    <div><dt className="font-medium text-app-text">Clicks</dt><dd className="mt-0.5 text-xs text-app-text-muted">They clicked through to your website.</dd></div>
                    <div><dt className="font-medium text-app-text">CTR</dt><dd className="mt-0.5 text-xs text-app-text-muted">Clicks out of impressions. 3-5% is healthy for most searches; your own name should be far higher.</dd></div>
                    <div><dt className="font-medium text-app-text">Position</dt><dd className="mt-0.5 text-xs text-app-text-muted">1-3 is the top of Google, up to 10 is page 1. Lower is better.</dd></div>
                  </dl>
                </Card>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchConsole;
