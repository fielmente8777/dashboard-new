import AudienceInsights from "../../components/Analytics/AudienceInsights";
import ConversionEvents from "../../components/Analytics/ConversionEvents";
import DeviceAnalytics from "../../components/Analytics/DeviceAnalytics";
import GeoAnalytics from "../../components/Analytics/GeoAnalytics";
import GoogleAnalyticsChart from "../../components/Analytics/GoogleAnalyticsChart";
import TopPagesTable from "../../components/Analytics/TopPagesTable";
import TrafficSources from "../../components/Analytics/TrafficSources";
import PageShell from "../../components/ui/PageShell";

// Every widget loads its own report. The date range picked in the first
// chart applies to all of them.
const GoogleAnalytics = () => (
  <PageShell
    title="Google Analytics"
    description="Traffic, audience and conversions of your website."
  >
    <GoogleAnalyticsChart />
    <TrafficSources />
    <TopPagesTable />
    <ConversionEvents />
    <DeviceAnalytics />
    <GeoAnalytics />
    <AudienceInsights />
  </PageShell>
);

export default GoogleAnalytics;
