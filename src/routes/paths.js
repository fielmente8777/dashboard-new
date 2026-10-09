import { generatePath } from "react-router-dom";
import handleLocalStorage from "../utils/handleLocalStorage";

// Every URL in the app is defined in this file.
// To link to a page use the helpers below - never write "/dashboard/client/..." by hand.

export const BASE_PATH = "/dashboard/client";

// Pages outside the dashboard
export const ROUTES = {
  ROOT: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  PLANS: "/plans",
  ONBOARDING_FORM: "/onboarding/form",
};

// Pages inside the dashboard, relative to /dashboard/client/:hid
export const PAGES = {
  // Home & account
  HOME: "",
  PROFILE: "profile",
  SETTINGS: "settings",
  INTEGRATION: "integration",
  QR_CODE: "qr-code",
  USER_MANAGEMENT_ALL_USERS: "user-management/all-users",
  USER_MANAGEMENT_SETTINGS: "user-management/settings",
  CONTACTS: "contacts",

  // Live chat
  CHAT_WHATSAPP: "channel/wa/chat",
  CHAT_INSTAGRAM: "channel/ig/chat",
  CHAT_FACEBOOK: "channel/fb/chat",
  CHAT_EAZBOT: "channel/eb/chat",
  CONVERSATIONAL_TOOL: "conversational-tool",

  // Leads management
  LEADS_ALL: "leads-management/all-leads",
  LEADS_META: "leads-management/meta-leads",
  LEADS_WHATSAPP: "leads-management/whatsapp",
  LEADS_GOOGLE_ADS: "leads-management/google-ads-leads",
  LEADS_WEBFORM: "leads-management/webform-leads",
  LEADS_EAZBOT: "leads-management/eazbot-leads",
  LEADS_VISITORS: "leads-management/all-visitors",
  LEADS_IMPORT: "leads-management/import-convert",
  LEADS_GEN_FORM_TABLE: "leads-management/lead-gen-form",
  LEADS_ANALYTICS: "leads-management/enquiries-analytics",
  LEADS_META_ANALYTICS: "leads-management/meta-analytics",
  LEADS_SETTINGS: "leads-management/settings",
  LEAD_VIEW: "leads-management/:slug/:leadId/view",
  LEAD_GEN_FORM: "lead-form/lead-gen-form",

  // Calls
  CALLS: "calls-management",
  CALL_VIEW: "calls-management/:slug/:sid/view",

  // Marketing
  MARKETING_WHATSAPP: "marketing/whatsapp-marketing",
  BROADCAST_DETAILS: "marketing/whatsapp-marketing/broadcast/:id",
  MARKETING_EMAIL: "marketing/email-marketing",
  MARKETING_SMS: "marketing/sms-marketing",
  EAZMAIL: "eazmail",

  // Insights, SEO & Meta
  GOOGLE_ADS_INSIGHTS: "google-ads-insights",
  SEO: "seo",
  SEO_LOCAL: "seo/local-seo",
  SEO_WEBSITE: "seo/website-seo",
  INSIGHTS_GOOGLE_ANALYTICS: "insights-analytics/google-analytics",
  INSIGHTS_META_ADS: "insights-analytics/meta-ads-insights",
  INSIGHTS_GOOGLE_CONSOLE: "insights-analytics/google-console",
  INSIGHTS_GMB: "insights-analytics/gmb-insights",
  INSIGHTS_SOCIAL_MEDIA: "insights-analytics/social-media-insights",
  INSIGHTS_WEBSITE: "insights-analytics/website-analytics",
  INSIGHTS_LEADS: "insights-analytics/leads-analytics",
  ANALYTICS_REPORTING: "analytics-and-reporting",
  META_INSIGHTS: "meta-insights",
  META_LEADS: "meta/leads",
  META_MESSAGES: "meta/messages",
  META_CONNECTIONS: "meta/connections",
  META_SETTINGS: "meta/settings",
  GMB_OVERVIEW: "gmb/overview",
  GMB_KEYWORDS: "gmb/keywords",
  GMB_RANK: "gmb/rank",
  GMB_REVIEWS: "gmb/reviews",
  WEBSITE_VISITORS: "website-tracking/visitors",
  WEBSITE_ACTIVITIES: "website-tracking/activities",

  // Booking engine & reservations
  BOOKING_ENGINE: "booking-engine",
  BOOKING_ALL: "booking-engine/all-bookings",
  BOOKING_ROOMS_SETUP: "booking-engine/rooms-setup",
  BOOKING_ROOMS_INVENTORY: "booking-engine/rooms-and-inventory",
  BOOKING_PRICE_PACKAGES: "booking-engine/price-packages",
  BOOKING_ADS_PACKAGES: "booking-engine/ads-packages",
  BOOKING_CUSTOMIZATION: "booking-engine/customization",
  RESERVATION_DESK: "reservation-desk",
  FRONT_DESK: "front-desk",
  PAYMENT_GATEWAY: "payment-gateway",

  // Guest request management
  GRM_ALL_REQUESTS: "grm/all-requests",
  GRM_EMERGENCY: "grm/emergency-request",
  GRM_SETTINGS: "grm/settings",
  GRM_ANALYTICS: "grm/analytics",
  GRM_FEEDBACK: "grm/guest-feedback",

  // Content management
  CMS_PROFILE: "cms/profile-and-links",
  CMS_GALLERY: "cms/gallery",
  CMS_OFFERS: "cms/offers",
  CMS_EVENTS: "cms/events",
  CMS_BLOGS: "cms/blogs",
  CMS_FAQ: "cms/faq",
  CMS_PRIVACY: "cms/privacy-policy",
  CMS_TERMS: "cms/terms-and-conditions",
  CMS_CANCELLATION: "cms/cancellation-and-refund-policy",
  NEWSLETTER: "newsletter",

  // AI
  KNOWLEDGE_BASE: "knowledge-base",
  AI_TRAINING: "ai-training",
  EAZBOT: "eazbot",

  // Human resources
  HR_ANALYTICS: "human-resources-management/analytics",
  HR_APPLICATIONS: "human-resources-management/applications",

  // Marketplace services
  WHATSAPP_MARKETING_SERVICE: "whatsapp-marketing",
  SMS_MARKETING_SERVICE: "sms-marketing",
  SOCIAL_MEDIA: "social-media",
  INFLUENCER_MARKETING: "influencer-marketing",
  PR: "pr",
  PERFORMANCE_MARKETING: "performance-marketing",
  OTA_LISTING: "ota-listing",
  OTA_OPTIMIZATION: "ota-optimization",
  OTA_MANAGEMENT: "ota-management",
  ACCOUNTING: "accounting",
  GST_FILING: "gst-filing",
  LINKTREE_SETUP: "linktree-setup",
  GOOGLE_LISTING: "google-listing",
  GOOGLE_MAP_ITERATIONS: "google-map-iterations",
  GOOGLE_MAP_ITRATIONS: "google-map-itrations", // old spelling, still linked from the apps popup
  CUSTOM_WEBSITE: "custom-website",
  CHANNEL_MANAGER: "channel-manager",
  PMS_SOFTWARE: "pms-software",
  THEMES_MANAGER: "themes-manager",

  // Placeholders
  FEEDBACK: "feedback",
  REPORTS: "reports",
  ANALYTICS: "analytics",
  HELP: "help",
};

const toSearch = (query) => {
  if (!query) return "";
  if (typeof query === "string") return query;
  if (query instanceof URLSearchParams) return query.toString();
  const entries = Object.entries(query).filter(
    ([, value]) => value !== undefined && value !== null && value !== "",
  );
  return new URLSearchParams(entries).toString();
};

// dashboardPath(PAGES.CMS_FAQ)                           -> /dashboard/client/123/cms/faq
// dashboardPath(PAGES.SETTINGS, { query: { tab: "x" } }) -> /dashboard/client/123/settings?tab=x
// `hid` defaults to the hotel that is currently selected.
export const dashboardPath = (page = "", { hid, query } = {}) => {
  const hotelId = hid ?? handleLocalStorage("hid");
  const path = [BASE_PATH, hotelId, page].filter(Boolean).join("/");
  const search = toSearch(query);
  return search ? `${path}?${search}` : path;
};

export const leadViewPath = (leadId, options) =>
  dashboardPath(
    generatePath(PAGES.LEAD_VIEW, { slug: "all-leads", leadId }),
    options,
  );

export const callViewPath = (callId, options) =>
  dashboardPath(
    generatePath(PAGES.CALL_VIEW, { slug: "all-calls", sid: callId }),
    options,
  );

export const broadcastPath = (id, options) =>
  dashboardPath(generatePath(PAGES.BROADCAST_DETAILS, { id }), options);

// true when `pathname` is a page of the given hotel's dashboard
export const isInsideDashboard = (pathname, hid) => {
  const root = dashboardPath(PAGES.HOME, { hid });
  return pathname === root || pathname.startsWith(`${root}/`);
};
