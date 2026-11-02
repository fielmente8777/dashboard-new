import { BarChart3, Database, Mail, Plug, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { setAnalyticsRange } from "../../components/Analytics/analyticsRange";
import { MetaItem } from "../../components/Seo/SeoShell";
import Button from "../../components/ui/Button";
import DateRangePicker from "../../components/ui/DateRangePicker";
import Icon from "../../components/ui/Icon";
import SelectMenu from "../../components/ui/SelectMenu";
import { Skeleton } from "../../components/ui/States";
import { integrationPath } from "../../routes/paths";
import { metricByKey, METRICS } from "./analyticsUtils";
import { ChannelsCard, SourcesCard } from "./components/AcquisitionCards";
import { DevicesCard, LocationsCard, TechnologyCard } from "./components/AudienceCards";
import { EventsCard, KeyEventsCard, TopPagesCard } from "./components/ContentCards";
import { AudienceQualityCard, EngagementChart } from "./components/EngagementCards";
import MetricTiles from "./components/MetricTiles";
import TrafficChart from "./components/TrafficChart";
import { useAnalyticsOverview } from "./hooks/useAnalyticsOverview";

// A titled group of cards, like the report sections of GA4.
const Section = ({ title, description, children }) => (
  <section className="space-y-3">
    <div className="flex items-baseline gap-3 border-b border-app-border! pb-2">
      <h2 className="text-base font-semibold tracking-tight text-app-text">{title}</h2>
      <p className="text-sm text-app-text-muted">{description}</p>
    </div>
    {children}
  </section>
);

const NotConnected = ({ message }) => (
  <div className="seo-hero flex flex-col items-center gap-4 rounded-2xl px-6 py-14 text-center">
    <span className="flex size-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-300">
      <Icon icon={BarChart3} size={28} />
    </span>
    <div>
      <h2 className="text-lg font-semibold text-app-text">Connect Google Analytics</h2>
      <p className="mt-1 max-w-md text-sm text-app-text-muted">
        {message || "Link your GA4 property to see traffic, acquisition, audience and conversions here."}
      </p>
    </div>
    <Link
      to={integrationPath("google-analytics")}
      className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white transition hover:bg-primary/90 dark:bg-blue-600 dark:hover:bg-blue-500"
    >
      <Icon icon={Plug} />
      Connect in Integrations
    </Link>
  </div>
);

const LoadingLayout = () => (
  <>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">
      {METRICS.map((metric) => (
        <Skeleton key={metric.key} className="h-40" />
      ))}
    </div>
    <Skeleton className="h-112" />
  </>
);

// Google Analytics (GA4) of the hotel's website, laid out like a reporting
// dashboard: headline metrics, the traffic trend, then acquisition,
// engagement, audience and content. One date range drives every report.
const GoogleAnalytics = () => {
  const ga = useAnalyticsOverview();
  const [metricKey, setMetricKey] = useState(METRICS[0].key);
  const metric = metricByKey(metricKey);

  const meta = !ga.notConnected && !ga.isLoading && (
    <>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
        <span className="size-1.5 rounded-full bg-emerald-500" />
        Connected
      </span>
      {ga.email && <MetaItem icon={Mail}>{ga.email}</MetaItem>}
      {ga.activePropertyId && <MetaItem icon={Database}>Property {ga.activePropertyId}</MetaItem>}
    </>
  );

  return (
    <div className="analytics-scope min-h-full p-4 sm:p-6">
      <div className="anim-stagger mx-auto space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-app-text-muted">Insights</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-app-text">Google Analytics</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-app-text-muted">
              {meta || "Traffic, audience and conversions of your website."}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {ga.properties.length > 0 && (
              <SelectMenu
                label="Analytics property"
                icon={Database}
                options={ga.properties.map((p) => ({ value: p.property_id, label: p.name }))}
                value={ga.activePropertyId || null}
                onChange={ga.switchProperty}
                disabled={ga.switching}
                className="w-52"
              />
            )}
            <DateRangePicker value={ga.range} onChange={setAnalyticsRange} />
            <Button
              variant="secondary"
              icon={RefreshCw}
              onClick={ga.refetch}
              loading={ga.isFetching && !ga.isLoading}
              aria-label="Refresh reports"
              title="Refresh reports"
            />
          </div>
        </header>

        {ga.isLoading ? (
          <LoadingLayout />
        ) : ga.notConnected ? (
          <NotConnected message={ga.error} />
        ) : (
          <>
            <MetricTiles
              rows={ga.rows}
              previousRows={ga.previousRows}
              value={metricKey}
              onChange={setMetricKey}
            />

            <TrafficChart
              metric={metric}
              rows={ga.rows}
              previousRows={ga.previousRows}
              rangeLabel={ga.range.label}
              fetching={ga.isFetching}
            />

            <Section title="Acquisition" description="How visitors find your website">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
                <ChannelsCard className="xl:col-span-3" />
                <SourcesCard className="xl:col-span-2" />
              </div>
            </Section>

            <Section title="Engagement" description="How long visitors stay and how deep they go">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <EngagementChart rows={ga.rows} className="xl:col-span-2" />
                <AudienceQualityCard rows={ga.rows} />
              </div>
            </Section>

            <Section title="Audience" description="Who your visitors are">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <DevicesCard />
                <TechnologyCard />
                <LocationsCard />
              </div>
            </Section>

            <Section title="Content & conversions" description="What visitors read and do">
              <TopPagesCard />
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <EventsCard />
                <KeyEventsCard />
              </div>
            </Section>
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleAnalytics;
