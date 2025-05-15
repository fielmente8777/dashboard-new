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

const DynamicPage = () => {
  const location = useLocation();
  
  const routeComponents = {
    // Dashboard
    [`${BASE_PATH}/`]: <Dashboard />,

    // CMS
    [`${BASE_PATH}/cms/privacy-policy`]: <Privacy />,
    [`${BASE_PATH}/cms/terms-and-conditions`]: <Tandc />,
    [`${BASE_PATH}/cms/cancellation-and-refund-policy`]: <Cancellationrefund />,
    [`${BASE_PATH}/cms/gallery`]: <Gallery />,
    [`${BASE_PATH}/cms/profile-and-links`]: <Profile />,
    [`${BASE_PATH}/cms/faq`]: <Faq />,
    [`${BASE_PATH}/cms/offers`]: <Offers />,
    [`${BASE_PATH}/cms/events`]: <Events />,
    [`${BASE_PATH}/cms/blogs`]: <Blogs />,

    // GRM
    [`${BASE_PATH}/grm/analytics`]: <GrmAnalytics />,
    [`${BASE_PATH}/grm/all-requests`]: <AllRequest />,
    [`${BASE_PATH}/grm/emergency-request`]: <EmergencyRequest />,
    [`${BASE_PATH}/grm/settings`]: <Settings />,
    [`${BASE_PATH}/grm/guest-feedback`]: <GrmFeedback />,

    // User Management
    [`${BASE_PATH}/user-management/all-users`]: <Usermanagement />,
    [`${BASE_PATH}/user-management/settings`]: <Usermanagement />,

    // Enquiries Management
    [`${BASE_PATH}/enquiries-management/enquiries-analytics`]: (
      <LeadAnalytics />
    ),
    [`${BASE_PATH}/enquiries-management/enquiries`]: <Leads />,
    [`${BASE_PATH}/enquiries-management/settings`]: <Feedback />,

    // Human Resources Management
    [`${BASE_PATH}/human-resources-management/analytics`]: <TalentAnalytics />,
    [`${BASE_PATH}/human-resources-management/applications`]: <Application />,

    // Feedback, Reports, Analytics, Help
    [`${BASE_PATH}/feedback`]: <Feedback />,
    [`${BASE_PATH}/reports`]: <Feedback />,
    [`${BASE_PATH}/analytics`]: <Feedback />,
    [`${BASE_PATH}/help`]: <Feedback />,
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
