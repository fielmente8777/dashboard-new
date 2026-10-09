import Dashboard from "../pages/Home/Dashboard";
import Setting from "../pages/Setting/Setting";
import Settings from "../pages/Settings/Settings";
import Integration from "../pages/AppIntegration/Integration";
import GrmSettings from "../pages/Grm/Settings";
import Usermanagement from "../pages/UserMgmt/Usermanagement";
import Contacts from "../pages/Contacts/Contacts";
import WhatsApp from "../pages/ConversationalTool/WhatsApp/WhatsApp";
import Instagram from "../pages/ConversationalTool/Instagram/Instagram";
import Facebook from "../pages/ConversationalTool/Facebook/Facebook";
import EazbotChat from "../pages/ConversationalTool/Eazbot/EazbotChat";
import ConversationalTool from "../pages/ConversationalTool/ConversationalTool";
import LeadsList from "../pages/Leads/LeadsList";
import { LEAD_SOURCES } from "../pages/Leads/leadSources";
import ImportAndConvertLeads from "../pages/Enquiry/ImportAndConvertLeads/ImportAndConvertLeads";
import LeadGenFormTable from "../pages/MetaLeads/LeadGenFormTable";
import LeadsAnalytics from "../pages/Leads/LeadsAnalytics";
import AdLeadsAnalytics from "../pages/Enquiry/AdLeadsAnalytics";
import Feedback from "../pages/Feedback/Feedback";
import LeadDetails from "../pages/Leads/LeadDetails/LeadDetails";
import LeadForms from "../pages/Leads/LeadForms/LeadForms";
import Calls from "../pages/Calls/Calls";
import CallDetails from "../pages/Calls/CallDetails/CallDetails";
import WhatsappBroadcasting from "../pages/BroadCasting/WhatsappBroadcasting";
import BroadcastDetails from "../pages/BroadCasting/BroadcastDetails";
import { EmailMarketingManagement } from "../pages/EmailMarketing/EmailMarketing";
import EmailMarketing from "../pages/Marketing/EmailMarketing";
import GoogleAdsInsights from "../pages/GoogleAdsInsights/GoogleAdsInsights";
import ChannelManager from "../pages/Manager/ChannelManager";
import Seo from "../pages/SEO/Seo";
import SeoIntelligenceDashboard from "../components/LocalSEO/SeoIntelligenceDashboard";
import WebsiteSeo from "../pages/SEO/WebsiteSeo";
import GoogleAnalytics from "../pages/GoogleAnalytics/GoogleAnalytics";
import AnalyticsReporting from "../pages/Analytics/AnalyticsReporting";
import MetaPageInsights from "../pages/Meta/MetaPageInsights";
import MetaMessages from "../pages/Meta/MetaMessage";
import MetaConnections from "../pages/Meta/MetaConnection";
import MetaSettings from "../pages/Meta/MetaSetting";
import Overview from "../pages/Gmb/Overview";
import Keywords from "../pages/Gmb/Keyword";
import Ranks from "../pages/Gmb/Rank";
import Reviews from "../pages/Gmb/Review";
import WebsiteTracker from "../pages/WebsiteTracker/WebsiteTracker";
import VisitorActivity from "../pages/WebsiteTracker/VisitorActivity";
import BookingEngine from "../pages/BookingEngine/BookingEngine";
import BookingSetup from "../pages/BookingEngine/BookingSetup";
import RoomsAndInventory from "../pages/BookingEngine/RoomsAndInventory";
import PricePackage from "../pages/BookingEngine/PricePackage";
import AdsPackages from "../pages/BookingEngine/AdsPackages";
import BookingCustom from "../pages/BookingEngine/BookingCustom";
import ReservationDesk from "../pages/ReservationDesk/ReservationDesk";
import FrontDesk from "../pages/FrontDesk/FrontDesk";
import PaymentGateway from "../pages/Gateways/PaymentGateway";
import AllRequest from "../pages/Grm/AllRequest";
import EmergencyRequest from "../pages/Grm/EmergencyRequest";
import GrmAnalytics from "../pages/Grm/Analytics";
import GrmFeedback from "../pages/Grm/Feedback";
import Profile from "../pages/CMS/Profile";
import Gallery from "../pages/CMS/Gallery";
import Offers from "../pages/CMS/Offers";
import Events from "../pages/CMS/Events";
import Blogs from "../pages/CMS/Blogs";
import Faq from "../pages/CMS/Faq";
import Privacy from "../pages/CMS/Privacy";
import Tandc from "../pages/CMS/Tandc";
import Cancellationrefund from "../pages/CMS/Cancellationrefund";
import Newsletter from "../pages/CMS/Newsletter";
import KnowledgeBase from "../pages/KnowledgeBase/KnowledgeBase";
import AiTrainingPage from "../pages/AiTraining/AiTrainingPage";
import Eazbot from "../pages/Eazobot/Eazobot";
import TalentAnalytics from "../pages/TalentMgmt/Analytics";
import Application from "../pages/TalentMgmt/Application";
import WhatsappMarketing from "../pages/Marketing/WhatsappMarketing";
import SocialMedia from "../pages/Social/SocialMedia";
import InfluencerMarketing from "../pages/Social/InfluencerMarketing";
import PublicRelation from "../pages/Social/PublicRelation";
import PerformanceMarketing from "../pages/PerformanceMarketing/PerformanceMarketing";
import OTAListing from "../pages/OTA/OTAListing";
import OTAOptimization from "../pages/OTA/OTAOptimization";
import Accounting from "../pages/Accounting/Accounting";
import GSTFiling from "../pages/Accounting/GSTFiling";
import Linktree from "../pages/Linktree/Linktree";
import GMBProfile from "../pages/GoogleListing/GMBProfile";
import GoogleMapItiration from "../pages/GoogleListing/GoogleMapItiration";
import Website from "../pages/CustomWebsite/Website";
import ThemesManager from "../pages/Manager/ThemesManager";
import { PAGES } from "./paths";

// Every page inside the dashboard. To add a page: add its path to PAGES in
// paths.js, then add one line here.
// The leads lists are one page with a different source each; the key gives
// every route its own state.
const leadsList = (source) => <LeadsList key={source.key} source={source} />;

export const dashboardRoutes = [
  // Home & account
  { path: PAGES.HOME, element: <Dashboard /> },
  { path: PAGES.PROFILE, element: <Setting /> },
  { path: PAGES.SETTINGS, element: <Settings /> },
  { path: PAGES.INTEGRATION, element: <Integration /> },
  { path: PAGES.QR_CODE, element: <GrmSettings /> },
  { path: PAGES.USER_MANAGEMENT_ALL_USERS, element: <Usermanagement /> },
  { path: PAGES.USER_MANAGEMENT_SETTINGS, element: <Usermanagement /> },
  { path: PAGES.CONTACTS, element: <Contacts /> },

  // Live chat
  { path: PAGES.CHAT_WHATSAPP, element: <WhatsApp /> },
  { path: PAGES.CHAT_INSTAGRAM, element: <Instagram /> },
  { path: PAGES.CHAT_FACEBOOK, element: <Facebook /> },
  { path: PAGES.CHAT_EAZBOT, element: <EazbotChat /> },
  { path: PAGES.CONVERSATIONAL_TOOL, element: <ConversationalTool /> },

  // Leads management
  { path: PAGES.LEADS_ALL, element: leadsList(LEAD_SOURCES.all) },
  { path: PAGES.LEADS_META, element: leadsList(LEAD_SOURCES.meta) },
  { path: PAGES.LEADS_WHATSAPP, element: leadsList(LEAD_SOURCES.whatsapp) },
  { path: PAGES.LEADS_GOOGLE_ADS, element: leadsList(LEAD_SOURCES.googleAds) },
  { path: PAGES.LEADS_WEBFORM, element: leadsList(LEAD_SOURCES.webform) },
  { path: PAGES.LEADS_EAZBOT, element: leadsList(LEAD_SOURCES.eazbot) },
  { path: PAGES.LEADS_VISITORS, element: leadsList(LEAD_SOURCES.visitors) },
  { path: PAGES.LEADS_IMPORT, element: <ImportAndConvertLeads /> },
  { path: PAGES.LEADS_GEN_FORM_TABLE, element: <LeadGenFormTable /> },
  { path: PAGES.LEADS_ANALYTICS, element: <LeadsAnalytics /> },
  { path: PAGES.LEADS_META_ANALYTICS, element: <AdLeadsAnalytics /> },
  { path: PAGES.LEADS_SETTINGS, element: <Feedback /> },
  { path: PAGES.LEAD_VIEW, element: <LeadDetails /> },
  { path: PAGES.LEAD_GEN_FORM, element: <LeadForms /> },

  // Calls
  { path: PAGES.CALLS, element: <Calls /> },
  { path: PAGES.CALL_VIEW, element: <CallDetails /> },

  // Marketing
  { path: PAGES.MARKETING_WHATSAPP, element: <WhatsappBroadcasting /> },
  { path: PAGES.BROADCAST_DETAILS, element: <BroadcastDetails /> },
  { path: PAGES.MARKETING_EMAIL, element: <EmailMarketingManagement /> },
  { path: PAGES.MARKETING_SMS, element: <EmailMarketing /> },
  { path: PAGES.EAZMAIL, element: <EmailMarketingManagement /> },

  // Insights, SEO & Meta
  { path: PAGES.GOOGLE_ADS_INSIGHTS, element: <GoogleAdsInsights /> },
  { path: PAGES.SEO, element: <Seo /> },
  { path: PAGES.SEO_LOCAL, element: <SeoIntelligenceDashboard /> },
  { path: PAGES.SEO_WEBSITE, element: <WebsiteSeo /> },
  { path: PAGES.INSIGHTS_GOOGLE_ANALYTICS, element: <GoogleAnalytics /> },
  { path: PAGES.INSIGHTS_META_ADS, element: <Feedback /> },
  { path: PAGES.INSIGHTS_GOOGLE_CONSOLE, element: <Feedback /> },
  { path: PAGES.INSIGHTS_GMB, element: <Feedback /> },
  { path: PAGES.INSIGHTS_SOCIAL_MEDIA, element: <Feedback /> },
  { path: PAGES.INSIGHTS_WEBSITE, element: <Feedback /> },
  { path: PAGES.INSIGHTS_LEADS, element: <Feedback /> },
  { path: PAGES.ANALYTICS_REPORTING, element: <AnalyticsReporting /> },
  { path: PAGES.META_INSIGHTS, element: <MetaPageInsights /> },
  { path: PAGES.META_LEADS, element: leadsList(LEAD_SOURCES.meta) },
  { path: PAGES.META_MESSAGES, element: <MetaMessages /> },
  { path: PAGES.META_CONNECTIONS, element: <MetaConnections /> },
  { path: PAGES.META_SETTINGS, element: <MetaSettings /> },
  { path: PAGES.GMB_OVERVIEW, element: <Overview /> },
  { path: PAGES.GMB_KEYWORDS, element: <Keywords /> },
  { path: PAGES.GMB_RANK, element: <Ranks /> },
  { path: PAGES.GMB_REVIEWS, element: <Reviews /> },
  { path: PAGES.WEBSITE_VISITORS, element: <WebsiteTracker /> },
  { path: PAGES.WEBSITE_ACTIVITIES, element: <VisitorActivity /> },

  // Booking engine & reservations
  { path: PAGES.BOOKING_ENGINE, element: <BookingEngine /> },
  { path: PAGES.BOOKING_ALL, element: <BookingEngine /> },
  { path: PAGES.BOOKING_ROOMS_SETUP, element: <BookingSetup /> },
  { path: PAGES.BOOKING_ROOMS_INVENTORY, element: <RoomsAndInventory /> },
  { path: PAGES.BOOKING_PRICE_PACKAGES, element: <PricePackage /> },
  { path: PAGES.BOOKING_ADS_PACKAGES, element: <AdsPackages /> },
  { path: PAGES.BOOKING_CUSTOMIZATION, element: <BookingCustom /> },
  { path: PAGES.RESERVATION_DESK, element: <ReservationDesk /> },
  { path: PAGES.FRONT_DESK, element: <FrontDesk /> },
  { path: PAGES.PAYMENT_GATEWAY, element: <PaymentGateway /> },

  // Guest request management
  { path: PAGES.GRM_ALL_REQUESTS, element: <AllRequest /> },
  { path: PAGES.GRM_EMERGENCY, element: <EmergencyRequest /> },
  { path: PAGES.GRM_SETTINGS, element: <GrmSettings /> },
  { path: PAGES.GRM_ANALYTICS, element: <GrmAnalytics /> },
  { path: PAGES.GRM_FEEDBACK, element: <GrmFeedback /> },

  // Content management
  { path: PAGES.CMS_PROFILE, element: <Profile /> },
  { path: PAGES.CMS_GALLERY, element: <Gallery /> },
  { path: PAGES.CMS_OFFERS, element: <Offers /> },
  { path: PAGES.CMS_EVENTS, element: <Events /> },
  { path: PAGES.CMS_BLOGS, element: <Blogs /> },
  { path: PAGES.CMS_FAQ, element: <Faq /> },
  { path: PAGES.CMS_PRIVACY, element: <Privacy /> },
  { path: PAGES.CMS_TERMS, element: <Tandc /> },
  { path: PAGES.CMS_CANCELLATION, element: <Cancellationrefund /> },
  { path: PAGES.NEWSLETTER, element: <Newsletter /> },

  // AI
  { path: PAGES.KNOWLEDGE_BASE, element: <KnowledgeBase /> },
  { path: PAGES.AI_TRAINING, element: <AiTrainingPage /> },
  { path: PAGES.EAZBOT, element: <Eazbot /> },

  // Human resources
  { path: PAGES.HR_ANALYTICS, element: <TalentAnalytics /> },
  { path: PAGES.HR_APPLICATIONS, element: <Application /> },

  // Marketplace services
  { path: PAGES.WHATSAPP_MARKETING_SERVICE, element: <WhatsappMarketing /> },
  { path: PAGES.SMS_MARKETING_SERVICE, element: <EmailMarketing /> },
  { path: PAGES.SOCIAL_MEDIA, element: <SocialMedia /> },
  { path: PAGES.INFLUENCER_MARKETING, element: <InfluencerMarketing /> },
  { path: PAGES.PR, element: <PublicRelation /> },
  { path: PAGES.PERFORMANCE_MARKETING, element: <PerformanceMarketing /> },
  { path: PAGES.OTA_LISTING, element: <OTAListing /> },
  { path: PAGES.OTA_OPTIMIZATION, element: <OTAOptimization /> },
  { path: PAGES.OTA_MANAGEMENT, element: <OTAOptimization /> },
  { path: PAGES.ACCOUNTING, element: <Accounting /> },
  { path: PAGES.GST_FILING, element: <GSTFiling /> },
  { path: PAGES.LINKTREE_SETUP, element: <Linktree /> },
  { path: PAGES.GOOGLE_LISTING, element: <GMBProfile /> },
  { path: PAGES.GOOGLE_MAP_ITERATIONS, element: <GoogleMapItiration /> },
  { path: PAGES.GOOGLE_MAP_ITRATIONS, element: <GoogleMapItiration /> },
  { path: PAGES.CUSTOM_WEBSITE, element: <Website /> },
  { path: PAGES.CHANNEL_MANAGER, element: <ChannelManager /> },
  { path: PAGES.PMS_SOFTWARE, element: <ChannelManager /> },
  { path: PAGES.THEMES_MANAGER, element: <ThemesManager /> },

  // Placeholders
  { path: PAGES.FEEDBACK, element: <Feedback /> },
  { path: PAGES.REPORTS, element: <Feedback /> },
  { path: PAGES.ANALYTICS, element: <Feedback /> },
  { path: PAGES.HELP, element: <Feedback /> },
];
