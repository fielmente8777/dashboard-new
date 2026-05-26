import { useLocation } from "react-router-dom";
import LeadAnalytics from "../Enquiry/LeadAnalytics";
import Leads from "../Enquiry/Leads";
import Feedback from "../Feedback/Feedback";
import AllRequest from "../Grm/AllRequest";
import GrmAnalytics from "../Grm/Analytics";
import EmergencyRequest from "../Grm/EmergencyRequest";
import GrmFeedback from "../Grm/Feedback";
import Settings from "../Grm/Settings";
import Dashboard from "../Home/Dashboard";
import TalentAnalytics from "../TalentMgmt/Analytics";
import Application from "../TalentMgmt/Application";
import Usermanagement from "../UserMgmt/Usermanagement";

import Blogs from "../CMS/Blogs";
import Cancellationrefund from "../CMS/Cancellationrefund";
import Events from "../CMS/Events";
import Faq from "../CMS/Faq";
import Gallery from "../CMS/Gallery";
import Offers from "../CMS/Offers";
import Privacy from "../CMS/Privacy";
import Profile from "../CMS/Profile";
import Tandc from "../CMS/Tandc";
import { BASE_PATH } from "../../data/constant";
import handleLocalStorage from "../../utils/handleLocalStorage";
import LeadGenForm from "../MetaLeads/LeadGenForm";
import Eazobot from "../Eazobot/Eazobot";
import ConversationalTool from "../ConversationalTool/ConversationalTool";
import EmailMarketing from "../Marketing/EmailMarketing";
import WhatsappMarketing from "../Marketing/WhatsappMarketing";
import ThemesManager from "../Manager/ThemesManager";
import ChannelManager from "../Manager/ChannelManager";
import PaymentGateway from "../Gateways/PaymentGateway";
import SocialMedia from "../Social/SocialMedia";
import AnalyticsReporting from "../Analytics/AnalyticsReporting";
import BookingEngine from "../BookingEngine/BookingEngine";
import BookingSetup from "../BookingEngine/BookingSetup";
import AdsPackages from "../BookingEngine/AdsPackages";
import ReservationDesk from "../ReservationDesk/ReservationDesk";
import Website from "../CustomWebsite/Website";
import OTAListing from "../OTA/OTAListing";
import OTAOptimization from "../OTA/OTAOptimization";
import OTAManagement from "../OTA/OTAManagement";
import Accounting from "../Accounting/Accounting";
import GSTFiling from "../Accounting/GSTFiling";
import PerformanceMarketing from "../PerformanceMarketing/PerformanceMarketing";
import PublicRelation from "../Social/PublicRelation";
import RoomsAndInventory from "../BookingEngine/RoomsAndInventory";
import Linktree from "../Linktree/Linktree";
import GoogleMapItiration from "../GoogleListing/GoogleMapItiration";
import GMBProfile from "../GoogleListing/GMBProfile";
import InfluencerMarketing from "../Social/InfluencerMarketing";
import Seo from "../SEO/Seo";
import Newsletter from "../CMS/Newsletter";
import PricePackage from "../BookingEngine/PricePackage";
import BookingCustom from "../BookingEngine/BookingCustom";
// import AdsLeadsUsingGoogleSheet from "../Enquiry/AdsLeadsUsingGoogleSheet";
import AdLeadsAnalytics from "../Enquiry/AdLeadsAnalytics";
import WhatsApp from "../ConversationalTool/WhatsApp/WhatsApp";
import Instagram from "../ConversationalTool/Instagram/Instagram";
import Facebook from "../ConversationalTool/Facebook/Facebook";
// import Eazbot from "../Eazobot/Eazbot";
import Eazbot from "../Eazobot/Eazobot";
import EazbotChat from "../ConversationalTool/Eazbot/EazbotChat";
import LeadGenFormTable from "../MetaLeads/LeadGenFormTable";
import AiSaleAgent from "../AiSalesAgents/AiSaleAgent";
import KnowledgeBase from "../KnowledgeBase/KnowledgeBase";
import WebsiteTracker from "../WebsiteTracker/WebsiteTracker";
import VisitorActivity from "../WebsiteTracker/VisitorActivity";
import MetaMessages from "../Meta/MetaMessage";
import MetaConnections from "../Meta/MetaConnection";
import MetaSettings from "../Meta/MetaSetting";
import Calls from "../Calls/Calls";
import EmailMarketingManagement from "../EmailMarketing/EmailMarketing";
import Contacts from "../Contacts/Contacts";
import EazbotEnquiries from "../Enquiry/EazbotEnquiries";
import Overview from "../Gmb/Overview";
import Ranks from "../Gmb/Rank";
import Keywords from "../Gmb/Keyword";
import Reviews from "../Gmb/Review";
import GoogleAdsInsights from "../GoogleAdsInsights/GoogleAdsInsights";
import WhatsAppBusiness from "../Channels/Whatsapp/WhatsAppBusiness";
import AdsLeadsUsingGoogleSheet from "../Enquiry/AdsLeadsUsingGoogleSheet";
import AllLeads from "../Enquiry/AllLeads";
import GoogleAds from "../Enquiry/GoogleAds";
import EazbotLeads from "../Enquiry/EazbotEnquiries";
import WebformLeads from "../Enquiry/WebformLeads";
import AllVisitors from "../Enquiry/AllVisitors";
import MetaLeads from "../Enquiry/MetaLeads";
import WhatsAppLeads from "../Enquiry/WhatsAppLeads";
import WhatsappBroadcasting from "../BroadCasting/WhatsappBroadcasting";
import ViewAndMangeLeads from "../Enquiry/ViewAndManageLead/ViewAndManageLeads";


const DynamicPage = () => {
  const location = useLocation();
  const hid = handleLocalStorage("hid");
  const routeComponents = {
    // Dashboard
    [`${BASE_PATH}/${hid}`]: <Dashboard />,
    [`${BASE_PATH}/${hid}/google-ads-insights`]: <GoogleAdsInsights />,
    // CMS
    [`${BASE_PATH}/${hid}/cms/privacy-policy`]: <Privacy />,
    [`${BASE_PATH}/${hid}/cms/terms-and-conditions`]: <Tandc />,
    [`${BASE_PATH}/${hid}/cms/cancellation-and-refund-policy`]: (
      <Cancellationrefund />
    ),
    [`${BASE_PATH}/${hid}/cms/gallery`]: <Gallery />,
    [`${BASE_PATH}/${hid}/cms/profile-and-links`]: <Profile />,
    [`${BASE_PATH}/${hid}/cms/faq`]: <Faq />,
    [`${BASE_PATH}/${hid}/cms/offers`]: <Offers />,
    [`${BASE_PATH}/${hid}/cms/events`]: <Events />,
    [`${BASE_PATH}/${hid}/cms/blogs`]: <Blogs />,

    // Reservation Desk

    [`${BASE_PATH}/${hid}/reservation-desk`]: <ReservationDesk />,

    // Bookin Engine
    [`${BASE_PATH}/${hid}/booking-engine/all-bookings`]: <BookingEngine />,
    [`${BASE_PATH}/${hid}/booking-engine/rooms-setup`]: <BookingSetup />,
    [`${BASE_PATH}/${hid}/booking-engine/rooms-and-inventory`]: (
      <RoomsAndInventory />
    ),

    [`${BASE_PATH}/${hid}/booking-engine/ads-packages`]: <AdsPackages />,
    [`${BASE_PATH}/${hid}/booking-engine/price-packages`]: <PricePackage />,
    [`${BASE_PATH}/${hid}/booking-engine/customization`]: <BookingCustom />,

    // GRM
    [`${BASE_PATH}/${hid}/grm/analytics`]: <GrmAnalytics />,
    [`${BASE_PATH}/${hid}/grm/all-requests`]: <AllRequest />,
    [`${BASE_PATH}/${hid}/grm/emergency-request`]: <EmergencyRequest />,
    [`${BASE_PATH}/${hid}/grm/settings`]: <Settings />,
    [`${BASE_PATH}/${hid}/grm/guest-feedback`]: <GrmFeedback />,

    // newsletter
    [`${BASE_PATH}/${hid}/newsletter`]: <Newsletter />,
    // User Management
    [`${BASE_PATH}/${hid}/user-management/all-users`]: <Usermanagement />,
    [`${BASE_PATH}/${hid}/user-management/settings`]: <Usermanagement />,

    // TODO: Enquiries Management
    [`${BASE_PATH}/${hid}/leads-management/enquiries-analytics`]: (
      <LeadAnalytics />
    ),

    [`${BASE_PATH}/${hid}/leads-management/all-leads`]: <AllLeads />,
    [`${BASE_PATH}/${hid}/leads-management/meta-leads`]: <MetaLeads />,
    [`${BASE_PATH}/${hid}/leads-management/whatsapp`]: <WhatsAppLeads />,

    [`${BASE_PATH}/${hid}/leads-management/google-ads-leads`]: <GoogleAds />,
    [`${BASE_PATH}/${hid}/leads-management/webform-leads`]: <WebformLeads />,
    [`${BASE_PATH}/${hid}/leads-management/eazbot-leads`]: <EazbotLeads />,

    // [`${BASE_PATH}/${hid}/leads-management/enquiries`]: <Leads />,
    [`${BASE_PATH}/${hid}/leads-management/all-visitors`]: <AllVisitors />,
    [`${BASE_PATH}/${hid}/leads-management/lead-gen-form`]: (
      <LeadGenFormTable />
    ),

    // [`${BASE_PATH}/${hid}/leads-management/all-leads/:leadId/view`]: (
    //   <ViewAndMangeLeads />
    // ),
    // [`${BASE_PATH}/${hid}/leads-management/meta-leads:leadId/view`]: (
    //   <ViewAndMangeLeads />
    // ),

    // [`${BASE_PATH}/${hid}/leads-management/meta-leads`]: <MetaLeads />,
    [`${BASE_PATH}/${hid}/leads-management/meta-analytics`]: (
      <AdLeadsAnalytics />
    ),
    [`${BASE_PATH}/${hid}/leads-management/settings`]: <Feedback />,

    // Human Resources Management
    [`${BASE_PATH}/${hid}/human-resources-management/analytics`]: (
      <TalentAnalytics />
    ),
    [`${BASE_PATH}/${hid}/human-resources-management/applications`]: (
      <Application />
    ),

    // Feedback, Reports, Analytics, Help
    [`${BASE_PATH}/${hid}/feedback`]: <Feedback />,
    [`${BASE_PATH}/${hid}/reports`]: <Feedback />,
    [`${BASE_PATH}/${hid}/analytics`]: <Feedback />,
    [`${BASE_PATH}/${hid}/help`]: <Feedback />,

    // Feedback, Reports, Analytics, Help
    [`${BASE_PATH}/${hid}/lead-form/lead-gen-form`]: <LeadGenForm />,

    [`${BASE_PATH}/${hid}/eazbot`]: <Eazbot />,
    [`${BASE_PATH}/${hid}/booking-engine`]: <BookingEngine />,

    [`${BASE_PATH}/${hid}/google-ads-insights`]: (
      <GoogleAdsInsights />
    ),
    [`${BASE_PATH}/${hid}/insights-analytics/meta-ads-insights`]: <Feedback />,
    [`${BASE_PATH}/${hid}/google-analytics`]: <GoogleAnalytics />,
    [`${BASE_PATH}/${hid}/insights-analytics/google-console`]: <Feedback />,
    [`${BASE_PATH}/${hid}/insights-analytics/gmb-insights`]: <Feedback />,
    [`${BASE_PATH}/${hid}/insights-analytics/social-media-insights`]: (
      <Feedback />
    ),
    [`${BASE_PATH}/${hid}/insights-analytics/website-analytics`]: <Feedback />,
    [`${BASE_PATH}/${hid}/insights-analytics/leads-analytics`]: <Feedback />,

    // TODO: Campaign Management

    [`${BASE_PATH}/${hid}/marketing/sms-marketing`]: <EmailMarketing />,
    [`${BASE_PATH}/${hid}/marketing/email-marketing`]: (
      <EmailMarketingManagement />
    ),
    [`${BASE_PATH}/${hid}/marketing/whatsapp-marketing`]: (
      <WhatsappBroadcasting />
    ),

    // [`${BASE_PATH}/${hid}/conversational-tool`]: <ConversationalTool />,
    [`${BASE_PATH}/${hid}/channel/eb/chat`]: <EazbotChat />,
    [`${BASE_PATH}/${hid}/channel/wa/chat`]: <WhatsApp />,
    [`${BASE_PATH}/${hid}/channel/ig/chat`]: <Instagram />,
    [`${BASE_PATH}/${hid}/channel/fb/chat`]: <Facebook />,

    [`${BASE_PATH}/${hid}/themes-manager`]: <ThemesManager />,
    [`${BASE_PATH}/${hid}/channel-manager`]: <ChannelManager />,
    [`${BASE_PATH}/${hid}/payment-gateway`]: <PaymentGateway />,
    [`${BASE_PATH}/${hid}/social-media`]: <SocialMedia />,
    [`${BASE_PATH}/${hid}/analytics-and-reporting`]: <AnalyticsReporting />,

    // Marketplace services
    [`${BASE_PATH}/${hid}/custom-website`]: <Website />,

    // OTA
    [`${BASE_PATH}/${hid}/ota-listing`]: <OTAListing />,
    [`${BASE_PATH}/${hid}/ota-optimization`]: <OTAOptimization />,
    [`${BASE_PATH}/${hid}/ota-management`]: <OTAManagement />,

    // Accounting
    [`${BASE_PATH}/${hid}/accounting`]: <Accounting />,
    [`${BASE_PATH}/${hid}/gst-filing`]: <GSTFiling />,

    // performance marketing
    [`${BASE_PATH}/${hid}/performance-marketing`]: <PerformanceMarketing />,
    [`${BASE_PATH}/${hid}/pr`]: <PublicRelation />,

    // link tree setup
    [`${BASE_PATH}/${hid}/linktree-setup`]: <Linktree />,

    // google listing
    [`${BASE_PATH}/${hid}/google-listing`]: <GMBProfile />,
    [`${BASE_PATH}/${hid}/google-map-itrations`]: <GoogleMapItiration />,

    // influencer Marketing
    [`${BASE_PATH}/${hid}/influencer-marketing`]: <InfluencerMarketing />,

    // seo
    [`${BASE_PATH}/${hid}/seo`]: <ChannelManager />,

    // sms
    [`${BASE_PATH}/${hid}/sms-marketing`]: <ChannelManager />,

    // pms
    [`${BASE_PATH}/${hid}/pms-software`]: <ChannelManager />,

    // gmb
    [`${BASE_PATH}/${hid}/gmb/overview`]: <Overview />,
    [`${BASE_PATH}/${hid}/gmb/keywords`]: <Keywords />,
    [`${BASE_PATH}/${hid}/gmb/rank`]: <Ranks />,
    [`${BASE_PATH}/${hid}/gmb/reviews`]: <Reviews />,

    // [`${BASE_PATH}/${hid}/ai-sales-agent`]: <AiSaleAgent />,
    [`${BASE_PATH}/${hid}/calls-management`]: <Calls />,

    [`${BASE_PATH}/${hid}/website-tracking/visitors`]: <WebsiteTracker />,
    [`${BASE_PATH}/${hid}/website-tracking/activities`]: <VisitorActivity />,
    [`${BASE_PATH}/${hid}/knowledge-base`]: <KnowledgeBase />,

    [`${BASE_PATH}/${hid}/eazmail`]: <EmailMarketingManagement />,

    [`${BASE_PATH}/${hid}/meta/leads`]: <MetaLeads />,
    [`${BASE_PATH}/${hid}/meta/messages`]: <MetaMessages />,
    [`${BASE_PATH}/${hid}/meta/connections`]: <MetaConnections />,
    [`${BASE_PATH}/${hid}/meta/settings`]: <MetaSettings />,
    [`${BASE_PATH}/${hid}/contacts`]: <Contacts />,
  };

  return (
    <div>{routeComponents[location.pathname] || <h2>Page Not Found</h2>}</div>
  );
};

export default DynamicPage;

// const routeComponents = {
//   "/": <Dashboard />,

//   // CMS
//   "dashboard/client/cms/privacy-policy": <Privacy />,
//   "dashboard/client/cms/terms-and-conditions": <Tandc />,
//   "/cms/cancellation-and-refund-policy": <Cancellationrefund />,
//   // "/cms/experiences": <Experience />,
//   "dashboard/client/cms/gallery": <Gallery />,
//   "dashboard/client/cms/profile-and-links": <Profile />,
//   // "/cms/work-and-celebrate": <Faq />,
//   // "/cms/cafes": <Faq />,
//   "dashboard/client/cms/faq": <Faq />,
//   "dashboard/client/cms/offers": <Offers />,
//   "dashboard/client/cms/events": <Events />,
//   "dashboard/client/cms/blogs": <Blogs />,
//   // "/cms/development": <Development />,

//   // grm route
//   "/grm/analytics": <GrmAnalytics />,
//   "/grm/all-requests": <AllRequest />,
//   "/grm/emergency-request": <EmergencyRequest />,
//   "/grm/settings": <Settings />,
//   "/grm/guest-feedback": <GrmFeedback />,

//   // user mgmt route
//   "/user-management/all-users": <Usermanagement />,
//   "/user-management/settings": <Usermanagement />,

//   // Leads mgmt
//   "/enquiries-management/enquiries-analytics": <LeadAnalytics />,
//   "/enquiries-management/enquiries": <Leads />,
//   "/enquiries-management/settings": <Feedback />,

//   // talent-acquisition/applications
//   "/human-resources-management/analytics": <TalentAnalytics />,
//   "/human-resources-management/applications": <Application />,
//   // Feedback
//   "/feedback": <Feedback />,

//   //Reports
//   "/reports": <Feedback />,

//   // Analytics
//   "/analytics": <Feedback />,

//   // help
//   "/help": <Feedback />,
// };
