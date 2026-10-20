import { LEAD_SOURCES } from "../pages/Leads/leadSources";
import { PAGES } from "./paths";

// Every page inside the dashboard. To add a page: add its path to PAGES in
// paths.js, then add one line here.
// Each page is its own chunk, downloaded the first time it is opened.

// `load` imports the page module; `render` turns its component into the element.
const page =
  (load, render = (Page) => <Page />) =>
  async () => ({ element: render((await load()).default) });

// The leads lists are one page with a different source each; the key gives
// every route its own state.
const leadsList = (source) =>
  page(
    () => import("../pages/Leads/LeadsList"),
    (LeadsList) => <LeadsList key={source.key} source={source} />,
  );
// The EazStore service pages share one layout; the content is in
// pages/Services/serviceCatalog.js.
const servicePage = (id) =>
  page(
    () => import("../pages/Services/ServicePage"),
    (ServicePage) => <ServicePage key={id} service={id} />,
  );
// Settings sections also open on their own; Settings gives them this gutter.
const padded = (Page) => (
  <div className="px-3 py-4 sm:px-5 sm:py-5">
    <Page />
  </div>
);

export const dashboardRoutes = [
  // Home & account
  { path: PAGES.HOME, lazy: page(() => import("../pages/Home/Dashboard")) },
  { path: PAGES.PROFILE, lazy: page(() => import("../pages/Setting/Setting"), padded) },
  { path: PAGES.SETTINGS, lazy: page(() => import("../pages/Settings/Settings")) },
  { path: PAGES.INTEGRATION, lazy: page(() => import("../pages/AppIntegration/Integration"), padded) },
  { path: PAGES.QR_CODE, lazy: page(() => import("../pages/Grm/Settings")) },
  { path: PAGES.USER_MANAGEMENT_ALL_USERS, lazy: page(() => import("../pages/UserMgmt/Usermanagement"), padded) },
  { path: PAGES.USER_MANAGEMENT_SETTINGS, lazy: page(() => import("../pages/UserMgmt/Usermanagement"), padded) },
  { path: PAGES.CONTACTS, lazy: page(() => import("../pages/Contacts/Contacts")) },

  // Live chat
  { path: PAGES.CHAT_WHATSAPP, lazy: page(() => import("../pages/ConversationalTool/WhatsApp/WhatsApp")) },
  { path: PAGES.CHAT_INSTAGRAM, lazy: page(() => import("../pages/ConversationalTool/Instagram/Instagram")) },
  { path: PAGES.CHAT_FACEBOOK, lazy: page(() => import("../pages/ConversationalTool/Facebook/Facebook")) },
  { path: PAGES.CHAT_EAZBOT, lazy: page(() => import("../pages/ConversationalTool/Eazbot/EazbotChat")) },
  { path: PAGES.CONVERSATIONAL_TOOL, lazy: page(() => import("../pages/ConversationalTool/ConversationalTool")) },

  // Leads management
  { path: PAGES.LEADS_ALL, lazy: leadsList(LEAD_SOURCES.all) },
  { path: PAGES.LEADS_META, lazy: leadsList(LEAD_SOURCES.meta) },
  { path: PAGES.LEADS_WHATSAPP, lazy: leadsList(LEAD_SOURCES.whatsapp) },
  { path: PAGES.LEADS_GOOGLE_ADS, lazy: leadsList(LEAD_SOURCES.googleAds) },
  { path: PAGES.LEADS_WEBFORM, lazy: leadsList(LEAD_SOURCES.webform) },
  { path: PAGES.LEADS_EAZBOT, lazy: leadsList(LEAD_SOURCES.eazbot) },
  { path: PAGES.LEADS_VISITORS, lazy: leadsList(LEAD_SOURCES.visitors) },
  { path: PAGES.LEADS_IMPORT, lazy: page(() => import("../pages/Enquiry/ImportAndConvertLeads/ImportAndConvertLeads")) },
  { path: PAGES.LEADS_GEN_FORM_TABLE, lazy: page(() => import("../pages/MetaLeads/LeadGenFormTable")) },
  { path: PAGES.LEADS_ANALYTICS, lazy: page(() => import("../pages/Leads/LeadsAnalytics")) },
  { path: PAGES.LEADS_META_ANALYTICS, lazy: page(() => import("../pages/Enquiry/AdLeadsAnalytics")) },
  { path: PAGES.LEADS_SETTINGS, lazy: page(() => import("../pages/Feedback/Feedback")) },
  { path: PAGES.LEAD_VIEW, lazy: page(() => import("../pages/Leads/LeadDetails/LeadDetails")) },
  { path: PAGES.LEAD_GEN_FORM, lazy: page(() => import("../pages/Leads/LeadForms/LeadForms")) },

  // Calls
  { path: PAGES.CALLS, lazy: page(() => import("../pages/Calls/Calls")) },
  { path: PAGES.CALL_VIEW, lazy: page(() => import("../pages/Calls/CallDetails/CallDetails")) },

  // Marketing
  { path: PAGES.MARKETING_WHATSAPP, lazy: page(() => import("../pages/BroadCasting/WhatsappBroadcasting")) },
  { path: PAGES.BROADCAST_DETAILS, lazy: page(() => import("../pages/BroadCasting/BroadcastDetails")) },
  { path: PAGES.MARKETING_EMAIL, lazy: page(() => import("../pages/EmailMarketing/EmailMarketing").then((m) => ({ default: m.EmailMarketingManagement }))) },
  { path: PAGES.MARKETING_SMS, lazy: servicePage("smsMarketing") },
  { path: PAGES.EAZMAIL, lazy: page(() => import("../pages/EmailMarketing/EmailMarketing").then((m) => ({ default: m.EmailMarketingManagement }))) },

  // Insights, SEO & Meta
  { path: PAGES.GOOGLE_ADS_INSIGHTS, lazy: page(() => import("../pages/GoogleAdsInsights/GoogleAdsInsights")) },
  { path: PAGES.SEO, lazy: page(() => import("../pages/SEO/Seo")) },
  { path: PAGES.SEO_LOCAL, lazy: page(() => import("../pages/SEO/LocalSeo/LocalSeo")) },
  { path: PAGES.SEO_WEBSITE, lazy: page(() => import("../pages/SEO/WebsiteSeo/WebsiteSeo")) },
  { path: PAGES.INSIGHTS_GOOGLE_ANALYTICS, lazy: page(() => import("../pages/GoogleAnalytics/GoogleAnalytics")) },
  { path: PAGES.INSIGHTS_META_ADS, lazy: page(() => import("../pages/Feedback/Feedback")) },
  { path: PAGES.INSIGHTS_GOOGLE_CONSOLE, lazy: page(() => import("../pages/Feedback/Feedback")) },
  { path: PAGES.INSIGHTS_GMB, lazy: page(() => import("../pages/Feedback/Feedback")) },
  { path: PAGES.INSIGHTS_SOCIAL_MEDIA, lazy: page(() => import("../pages/Feedback/Feedback")) },
  { path: PAGES.INSIGHTS_WEBSITE, lazy: page(() => import("../pages/Feedback/Feedback")) },
  { path: PAGES.INSIGHTS_LEADS, lazy: page(() => import("../pages/Feedback/Feedback")) },
  { path: PAGES.ANALYTICS_REPORTING, lazy: page(() => import("../pages/Analytics/AnalyticsReporting")) },
  { path: PAGES.META_INSIGHTS, lazy: page(() => import("../pages/Meta/MetaPageInsights")) },
  { path: PAGES.META_LEADS, lazy: leadsList(LEAD_SOURCES.meta) },
  { path: PAGES.GMB_OVERVIEW, lazy: page(() => import("../pages/Gmb/Overview")) },
  { path: PAGES.GMB_KEYWORDS, lazy: page(() => import("../pages/Gmb/Keyword")) },
  { path: PAGES.GMB_RANK, lazy: page(() => import("../pages/Gmb/Rank")) },
  { path: PAGES.GMB_REVIEWS, lazy: page(() => import("../pages/Gmb/Review")) },
  { path: PAGES.WEBSITE_VISITORS, lazy: page(() => import("../pages/WebsiteTracker/WebsiteTracker")) },
  { path: PAGES.WEBSITE_ACTIVITIES, lazy: page(() => import("../pages/WebsiteTracker/VisitorActivity")) },

  // Booking engine & reservations
  { path: PAGES.BOOKING_ENGINE, lazy: page(() => import("../pages/BookingEngine/BookingEngine")) },
  { path: PAGES.BOOKING_ALL, lazy: page(() => import("../pages/BookingEngine/BookingEngine")) },
  { path: PAGES.BOOKING_ROOMS_SETUP, lazy: page(() => import("../pages/BookingEngine/BookingSetup")) },
  { path: PAGES.BOOKING_ROOMS_INVENTORY, lazy: page(() => import("../pages/BookingEngine/RoomsAndInventory")) },
  { path: PAGES.BOOKING_PRICE_PACKAGES, lazy: page(() => import("../pages/BookingEngine/PricePackage")) },
  { path: PAGES.BOOKING_ADS_PACKAGES, lazy: page(() => import("../pages/BookingEngine/AdsPackages")) },
  { path: PAGES.BOOKING_CUSTOMIZATION, lazy: page(() => import("../pages/BookingEngine/BookingCustom")) },
  { path: PAGES.RESERVATION_DESK, lazy: page(() => import("../pages/ReservationDesk/ReservationDesk")) },
  { path: PAGES.FRONT_DESK, lazy: page(() => import("../pages/FrontDesk/FrontDesk")) },
  { path: PAGES.PAYMENT_GATEWAY, lazy: page(() => import("../pages/Gateways/PaymentGateway")) },

  // Guest request management
  { path: PAGES.GRM_ALL_REQUESTS, lazy: page(() => import("../pages/Grm/AllRequest")) },
  { path: PAGES.GRM_EMERGENCY, lazy: page(() => import("../pages/Grm/EmergencyRequest")) },
  { path: PAGES.GRM_SETTINGS, lazy: page(() => import("../pages/Grm/Settings")) },
  { path: PAGES.GRM_ANALYTICS, lazy: page(() => import("../pages/Grm/Analytics")) },
  { path: PAGES.GRM_FEEDBACK, lazy: page(() => import("../pages/Grm/Feedback")) },

  // Content management
  { path: PAGES.CMS_PROFILE, lazy: page(() => import("../pages/CMS/Profile")) },
  { path: PAGES.CMS_GALLERY, lazy: page(() => import("../pages/CMS/Gallery")) },
  { path: PAGES.CMS_OFFERS, lazy: page(() => import("../pages/CMS/Offers")) },
  { path: PAGES.CMS_EVENTS, lazy: page(() => import("../pages/CMS/Events")) },
  { path: PAGES.CMS_BLOGS, lazy: page(() => import("../pages/CMS/Blogs")) },
  { path: PAGES.CMS_FAQ, lazy: page(() => import("../pages/CMS/Faq")) },
  { path: PAGES.CMS_PRIVACY, lazy: page(() => import("../pages/CMS/Privacy")) },
  { path: PAGES.CMS_TERMS, lazy: page(() => import("../pages/CMS/Tandc")) },
  { path: PAGES.CMS_CANCELLATION, lazy: page(() => import("../pages/CMS/Cancellationrefund")) },
  { path: PAGES.NEWSLETTER, lazy: page(() => import("../pages/CMS/Newsletter")) },

  // AI
  { path: PAGES.KNOWLEDGE_BASE, lazy: page(() => import("../pages/KnowledgeBase/KnowledgeBase")) },
  { path: PAGES.AI_TRAINING, lazy: page(() => import("../pages/AiTraining/AiTrainingPage")) },
  { path: PAGES.EAZBOT, lazy: page(() => import("../pages/Eazobot/Eazobot")) },

  // Human resources
  { path: PAGES.HR_ANALYTICS, lazy: page(() => import("../pages/TalentMgmt/Analytics")) },
  { path: PAGES.HR_APPLICATIONS, lazy: page(() => import("../pages/TalentMgmt/Application")) },

  // Marketplace services
  { path: PAGES.WHATSAPP_MARKETING_SERVICE, lazy: servicePage("whatsappMarketing") },
  { path: PAGES.SMS_MARKETING_SERVICE, lazy: servicePage("smsMarketing") },
  { path: PAGES.SOCIAL_MEDIA, lazy: servicePage("socialMedia") },
  { path: PAGES.INFLUENCER_MARKETING, lazy: servicePage("influencerMarketing") },
  { path: PAGES.PR, lazy: servicePage("publicRelations") },
  { path: PAGES.PERFORMANCE_MARKETING, lazy: servicePage("performanceMarketing") },
  { path: PAGES.OTA_LISTING, lazy: servicePage("otaListing") },
  { path: PAGES.OTA_OPTIMIZATION, lazy: servicePage("otaOptimization") },
  { path: PAGES.OTA_MANAGEMENT, lazy: servicePage("otaManagement") },
  { path: PAGES.ACCOUNTING, lazy: servicePage("accounting") },
  { path: PAGES.GST_FILING, lazy: servicePage("gstFiling") },
  { path: PAGES.LINKTREE_SETUP, lazy: servicePage("linktree") },
  { path: PAGES.GOOGLE_LISTING, lazy: servicePage("googleListing") },
  { path: PAGES.GOOGLE_MAP_ITERATIONS, lazy: servicePage("googleMapIterations") },
  { path: PAGES.GOOGLE_MAP_ITRATIONS, lazy: servicePage("googleMapIterations") },
  { path: PAGES.CUSTOM_WEBSITE, lazy: servicePage("customWebsite") },
  { path: PAGES.CHANNEL_MANAGER, lazy: servicePage("channelManager") },
  { path: PAGES.PMS_SOFTWARE, lazy: servicePage("pmsSoftware") },
  { path: PAGES.THEMES_MANAGER, lazy: servicePage("themesManager") },

  // Placeholders
  { path: PAGES.FEEDBACK, lazy: page(() => import("../pages/Feedback/Feedback")) },
  { path: PAGES.REPORTS, lazy: page(() => import("../pages/Feedback/Feedback")) },
  { path: PAGES.ANALYTICS, lazy: page(() => import("../pages/Feedback/Feedback")) },
  { path: PAGES.HELP, lazy: page(() => import("../pages/Feedback/Feedback")) },
];
