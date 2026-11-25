import { useAnalyticsReport } from "../../../components/Analytics/analyticsRange";
import InsightList from "../../../components/insights/InsightList";
import {
  useGetConversionsQuery,
  useGetDeviceAnalyticsQuery,
  useGetGeoAnalyticsQuery,
  useGetTopPagesQuery,
  useGetTrafficSourcesQuery,
} from "../../../redux/api/analyticsApi";
import { changeOf, METRICS, totalOf } from "../analyticsUtils";

const pct = (part, whole) => (whole ? (part / whole) * 100 : 0);
const metric = (key) => METRICS.find((m) => m.key === key);

// Plain-language findings from this period's reports (the same queries the
// cards below use, so nothing extra is fetched): { tone, title, detail }.
const analyticsFindings = ({ rows, previousRows, channels, devices, conversions, pages, countries }) => {
  const out = [];
  if (!rows.length) return out;

  const users = totalOf(rows, metric("users"));
  const usersBefore = totalOf(previousRows, metric("users"));
  const usersChange = changeOf(users, usersBefore);
  if (usersChange !== null && Math.abs(usersChange) >= 10) {
    out.push({
      tone: usersChange > 0 ? "good" : "attention",
      title: `Visitors ${usersChange > 0 ? "up" : "down"} ${Math.abs(usersChange).toFixed(0)}% on the period before`,
      detail: `${Math.round(users).toLocaleString()} visitors, against ${Math.round(usersBefore).toLocaleString()} before.${usersChange < 0 ? " Check whether ads, posts or Google rankings changed." : ""}`,
    });
  }

  // bounce rate: the share of visits that left without doing anything
  const bounce = rows.length ? (rows.reduce((s, r) => s + (r.bounceRate || 0), 0) / rows.length) * 100 : 0;
  if (bounce >= 60) {
    out.push({
      tone: "attention",
      title: `${bounce.toFixed(0)}% of visits leave without doing anything`,
      detail: "Make the first screen show rooms, prices and a clear Book now / WhatsApp button, and check how fast the site loads on phones.",
    });
  } else if (bounce > 0 && bounce < 40) {
    out.push({ tone: "good", title: `Visitors stay engaged (${bounce.toFixed(0)}% bounce)`, detail: "Most visitors look at more than one page or take an action." });
  }

  const sessions = channels.reduce((s, c) => s + (c.sessions || 0), 0);
  const organic = channels.find((c) => c.channel === "Organic Search")?.sessions || 0;
  if (sessions) {
    const share = pct(organic, sessions);
    out.push(
      share < 20
        ? { tone: "attention", title: `Only ${share.toFixed(0)}% of visits come from Google search`, detail: "Free search traffic is low. See Insights › Search Console for the searches you nearly win." }
        : { tone: "good", title: `${share.toFixed(0)}% of visits come from Google search`, detail: "A healthy share of free traffic from Google." },
    );
    const top = [...channels].sort((a, b) => b.sessions - a.sessions)[0];
    if (top && top.channel !== "Organic Search") {
      out.push({ tone: "info", title: `Most visits come from ${top.channel}`, detail: `${pct(top.sessions, sessions).toFixed(0)}% of all visits.` });
    }
  }

  const deviceUsers = devices.reduce((s, d) => s + (d.value || 0), 0);
  const mobile = devices.find((d) => /mobile/i.test(d.name))?.value || 0;
  if (deviceUsers && pct(mobile, deviceUsers) >= 60) {
    out.push({
      tone: "info",
      title: `${pct(mobile, deviceUsers).toFixed(0)}% of visitors are on phones`,
      detail: "Test the booking and enquiry steps on a phone: that is how most guests see your site.",
    });
  }

  const keyEvents = conversions.reduce((s, c) => s + (c.conversions || 0), 0);
  out.push(
    keyEvents
      ? { tone: "good", title: `${keyEvents.toLocaleString()} key events (conversions)`, detail: `Top: ${[...conversions].sort((a, b) => b.conversions - a.conversions).slice(0, 3).map((c) => c.eventName).join(", ")}.` }
      : { tone: "attention", title: "No key events recorded", detail: "Mark bookings, enquiry forms, WhatsApp and call clicks as key events in Google Analytics, so you can see which visits turn into guests." },
  );

  const topPage = pages[0];
  if (topPage) {
    out.push({ tone: "info", title: `Most viewed page: ${topPage.pageName || topPage.pagePath}`, detail: `${(topPage.views || 0).toLocaleString()} views by ${(topPage.users || 0).toLocaleString()} visitors.` });
    const leaky = pages.find((p) => (p.views || 0) >= 50 && (p.bounceRate || 0) >= 0.7);
    if (leaky) {
      out.push({
        tone: "attention",
        title: `Visitors leave “${leaky.pageName || leaky.pagePath}” quickly`,
        detail: `${((leaky.bounceRate || 0) * 100).toFixed(0)}% bounce on a page with ${leaky.views.toLocaleString()} views. Add a clear next step there.`,
      });
    }
  }

  const geoUsers = countries.reduce((s, c) => s + (c.users || 0), 0);
  if (countries[0] && geoUsers) {
    out.push({ tone: "info", title: `Top country: ${countries[0].country}`, detail: `${pct(countries[0].users, geoUsers).toFixed(0)}% of visitors.${countries[1] ? ` Next: ${countries[1].country}.` : ""}` });
  }
  return out;
};

// The "Highlights & needs attention" card at the top of Google Analytics.
const AnalyticsHighlights = ({ rows, previousRows }) => {
  const traffic = useAnalyticsReport(useGetTrafficSourcesQuery);
  const devices = useAnalyticsReport(useGetDeviceAnalyticsQuery);
  const conversions = useAnalyticsReport(useGetConversionsQuery);
  const pages = useAnalyticsReport(useGetTopPagesQuery);
  const geo = useAnalyticsReport(useGetGeoAnalyticsQuery);
  const loading = [traffic, devices, conversions, pages, geo].some((r) => r.isLoading);

  const items = analyticsFindings({
    rows,
    previousRows,
    channels: traffic.data?.channels || [],
    devices: devices.data?.devices || [],
    conversions: conversions.data?.conversions || [],
    pages: pages.data || [],
    countries: geo.data?.countries || [],
  });

  return <InsightList items={items} loading={loading} />;
};

export default AnalyticsHighlights;
