import { SOCIAL_PORTAL_URL } from "./env";

// Which paid app unlocks which part of the dashboard. The key is the app's `code` in the
// catalogue (gian-new billing), which is also its key in the subscription's `appAccess`.
// Pages not listed here (dashboard, contacts, CMS, SEO, front desk, settings…) come with every
// plan. Paths are relative to /dashboard/client/:hid; the first match wins, so the more
// specific path goes first.
const APP_FOR_PATH = [
  ["channel/wa", "whatsapp"],
  ["channel/eb", "eazbot"],
  ["leads-management/meta-leads", "meta"],
  ["leads-management/meta-analytics", "meta"],
  ["leads-management/whatsapp", "whatsapp"],
  ["leads-management/eazbot-leads", "eazbot"],
  ["leads-management/google-ads-leads", "googleadsinsights"],
  ["leads-management", "lead_management"],
  ["marketing/whatsapp-marketing", "whatsapp"],
  ["calls-management", "exotel"],
  ["google-ads-insights", "googleadsinsights"],
  ["meta-insights", "meta"],
  ["meta/leads", "meta"],
  ["booking-engine", "booking_engine"],
  ["reservation-desk", "booking_engine"],
  ["grm", "grm"],
  ["eazbot", "eazbot"],
  [SOCIAL_PORTAL_URL, "social_media"],
];

// The app code a dashboard path needs, or null when every plan has it.
export const appForPath = (path = "") => {
  const clean = path.replace(/^\/+/, "");
  const match = APP_FOR_PATH.find(([prefix]) => clean === prefix || clean.startsWith(`${prefix}/`));
  return match ? match[1] : null;
};

// Whether the hotel's subscription has this app on. No subscription record, or no appAccess
// at all (very old accounts), means nothing is locked, as before.
export const hasApp = (subscription, code) => {
  if (!code) return true;
  const access = subscription && !Array.isArray(subscription) ? subscription.appAccess : null;
  return !access || access[code] === true;
};
