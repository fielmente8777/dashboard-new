import axios from "axios";
import { Eye, Lock, MousePointerClick, Percent, Search, Settings } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { BASE_URL } from "../data/constant";
import { useAnalyticsRange } from "./Analytics/analyticsRange";
import Card from "./ui/Card";
import DataTable from "./ui/DataTable";
import Icon from "./ui/Icon";
import { EmptyState, Skeleton } from "./ui/States";

// What to show for each error_code the backend can answer with.
const STATES = {
  NOT_CONFIGURED: {
    icon: Settings,
    title: "Search Console isn't set up for this hotel",
    description: "Add the hotel's Search Console domain in Settings to start tracking search performance.",
  },
  PERMISSION_DENIED: {
    icon: Lock,
    title: "No Search Console access for this hotel",
    description: "The hotel's Google account hasn't granted Search Console access, or the domain isn't set up correctly.",
  },
  API_ERROR: {
    icon: Search,
    title: "Couldn't load search data",
    description: "Something went wrong fetching Search Console data. Please try again shortly.",
  },
  EMPTY: {
    icon: Search,
    title: "No search queries yet",
    description: "There's no Search Console data for the selected dates.",
  },
};
STATES.BAD_SITE_URL = STATES.PERMISSION_DENIED;

const Total = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 rounded-lg bg-app-surface-secondary px-3 py-1.5">
    <Icon icon={icon} size="sm" tone="muted" />
    <span className="text-xs text-app-text-muted">{label}</span>
    <span className="text-sm font-semibold tabular-nums text-app-text">{value}</span>
  </div>
);

// The searches people used to find the hotel's website on Google, for the
// Google Analytics property and date range picked on the page.
const SearchConsoleQueries = () => {
  const range = useAnalyticsRange();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusCode, setStatusCode] = useState(null);
  const [propertyId, setPropertyId] = useState(() => localStorage.getItem("activePropertyId"));

  // the backend works out the site from the GA property
  const fetchQueries = useCallback(async ({ start, end }, property) => {
    if (!property) {
      setLoading(false);
      setStatusCode("NOT_CONFIGURED");
      return;
    }
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${BASE_URL}/google/analytics-search-queries/${property}`,
        { params: { startDate: start, endDate: end, t: Date.now() } },
      );
      // expected failures come back as 200 with an error_code
      setStatusCode(data.error_code || null);
      setQueries(data.topQueries || []);
      if (!data.error_code) {
        window.dispatchEvent(new CustomEvent("gsc_configured", { detail: { property_id: property } }));
      }
    } catch (err) {
      console.error("GSC fetch failed:", err);
      setStatusCode("API_ERROR");
      setQueries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueries(range, propertyId);
  }, [range, propertyId, fetchQueries]);

  // the property can be switched in the Google Analytics card
  useEffect(() => {
    const onProperty = (e) =>
      setPropertyId(e.detail?.property_id || localStorage.getItem("activePropertyId"));
    window.addEventListener("dashboard_property_changed", onProperty);
    return () => window.removeEventListener("dashboard_property_changed", onProperty);
  }, []);

  const totals = queries.reduce(
    (acc, q) => ({ clicks: acc.clicks + (q.clicks || 0), impressions: acc.impressions + (q.impressions || 0) }),
    { clicks: 0, impressions: 0 },
  );
  const avgCtr = totals.impressions ? (totals.clicks / totals.impressions) * 100 : 0;
  const maxClicks = Math.max(...queries.map((q) => q.clicks || 0), 1);
  const state = statusCode ? STATES[statusCode] || STATES.API_ERROR : !queries.length && STATES.EMPTY;

  const columns = [
    {
      key: "keyword",
      header: "Search query",
      render: (row, index) => (
        <span className="flex max-w-80 items-center gap-3">
          <span
            className={`flex size-6 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold tabular-nums ${
              index < 3 ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "bg-app-surface-secondary text-app-text-muted"
            }`}
          >
            {index + 1}
          </span>
          <span className="truncate font-medium" title={row.keyword}>
            {row.keyword}
          </span>
        </span>
      ),
    },
    {
      key: "clicks",
      header: "Clicks",
      className: "text-right",
      render: (row) => (
        <span className="flex items-center justify-end gap-3">
          <span className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-app-surface-secondary sm:block">
            <span
              className="anim-grow-x block h-full rounded-full"
              style={{ width: `${((row.clicks || 0) / maxClicks) * 100}%`, backgroundColor: "var(--chart-1)" }}
            />
          </span>
          <span className="w-10 font-semibold tabular-nums">{(row.clicks || 0).toLocaleString()}</span>
        </span>
      ),
    },
    {
      key: "impressions",
      header: "Impressions",
      className: "text-right tabular-nums",
      render: (row) => (row.impressions || 0).toLocaleString(),
    },
    {
      key: "ctr",
      header: "CTR",
      className: "text-right tabular-nums",
      render: (row) => `${((row.ctr || 0) * 100).toFixed(1)}%`,
    },
    {
      key: "position",
      header: "Avg. position",
      className: "text-right tabular-nums",
      render: (row) => (
        <span className="text-app-text-muted">#{(row.position || 0).toFixed(1)}</span>
      ),
    },
  ];

  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          <Icon icon={Search} tone="primary" /> Top search queries
        </span>
      }
      description={`Google searches that brought visitors to your website · ${range.label}`}
      actions={
        !loading &&
        !state && (
          <div className="flex flex-wrap gap-2">
            <Total icon={MousePointerClick} label="Clicks" value={totals.clicks.toLocaleString()} />
            <Total icon={Eye} label="Impressions" value={totals.impressions.toLocaleString()} />
            <Total icon={Percent} label="Avg. CTR" value={`${avgCtr.toFixed(1)}%`} />
          </div>
        )
      }
    >
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-11" />
          ))}
        </div>
      ) : state ? (
        <EmptyState icon={state.icon} title={state.title} description={state.description} />
      ) : (
        <DataTable columns={columns} rows={queries} rowKey={(row, i) => `${row.keyword}-${i}`} />
      )}
    </Card>
  );
};

export default SearchConsoleQueries;
