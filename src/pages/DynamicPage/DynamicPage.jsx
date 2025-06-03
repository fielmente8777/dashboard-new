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

const DynamicPage = () => {
  const location = useLocation();
  const hid = handleLocalStorage("hid");
  const routeComponents = {
    // Dashboard
    [`${BASE_PATH}/${hid}`]: <Dashboard />,

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

    // Bookin Engine
    [`${BASE_PATH}/${hid}/booking-engine/all-bookings`]: <BookingEngine />,
    [`${BASE_PATH}/${hid}/booking-engine/rooms-setup`]: <BookingSetup />,

    // GRM
    [`${BASE_PATH}/${hid}/grm/analytics`]: <GrmAnalytics />,
    [`${BASE_PATH}/${hid}/grm/all-requests`]: <AllRequest />,
    [`${BASE_PATH}/${hid}/grm/emergency-request`]: <EmergencyRequest />,
    [`${BASE_PATH}/${hid}/grm/settings`]: <Settings />,
    [`${BASE_PATH}/${hid}/grm/guest-feedback`]: <GrmFeedback />,

    // User Management
    [`${BASE_PATH}/${hid}/user-management/all-users`]: <Usermanagement />,
    [`${BASE_PATH}/${hid}/user-management/settings`]: <Usermanagement />,

    // Enquiries Management
    [`${BASE_PATH}/${hid}/enquiries-management/enquiries-analytics`]: (
      <LeadAnalytics />
    ),
    [`${BASE_PATH}/${hid}/enquiries-management/enquiries`]: <Leads />,
    [`${BASE_PATH}/${hid}/enquiries-management/settings`]: <Feedback />,

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
    [`${BASE_PATH}/${hid}/eazobot`]: <Eazobot />,
    [`${BASE_PATH}/${hid}/booking-engine`]: <BookingEngine />,
    [`${BASE_PATH}/${hid}/sms-marketing`]: <EmailMarketing />,
    [`${BASE_PATH}/${hid}/email-marketing`]: <EmailMarketing />,
    [`${BASE_PATH}/${hid}/whatsapp-marketing`]: <WhatsappMarketing />,
    [`${BASE_PATH}/${hid}/conversational-tool`]: <ConversationalTool />,
    [`${BASE_PATH}/${hid}/themes-manager`]: <ThemesManager />,
    [`${BASE_PATH}/${hid}/channel-manager`]: <ChannelManager />,
    [`${BASE_PATH}/${hid}/payment-gateway`]: <PaymentGateway />,
    [`${BASE_PATH}/${hid}/social-media`]: <SocialMedia />,
    [`${BASE_PATH}/${hid}/analytics-and-reporting`]: <AnalyticsReporting />,
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
