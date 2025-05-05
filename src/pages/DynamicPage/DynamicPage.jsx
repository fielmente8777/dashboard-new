import React from 'react'
import Dashboard from '../Home/Dashboard'
import { useLocation } from 'react-router-dom'
import AllRequest from '../Grm/AllRequest'
import Settings from '../Grm/Settings'
import GrmFeedback from '../Grm/Feedback'
import GrmAnalytics from '../Grm/Analytics'
import EmergencyRequest from '../Grm/EmergencyRequest'
import Usermanagement from '../UserMgmt/Usermanagement'
import Feedback from '../Feedback/Feedback'
import TalentAnalytics from '../TalentMgmt/Analytics'
import Application from '../TalentMgmt/Application'
import LeadAnalytics from "../Enquiry/LeadAnalytics"
import Leads from "../Enquiry/Leads"

import Privacy from '../CMS/Privacy'
import Tandc from '../CMS/Tandc'
import Cancellationrefund from '../CMS/Cancellationrefund'
import Experience from '../CMS/Experience'
import Gallery from '../CMS/Gallery'
import Profile from '../CMS/Profile'
import Faq from '../CMS/Faq'
import Offers from '../CMS/Offers'
import Events from '../CMS/Events'
import Development from '../CMS/Development'
import Blogs from '../CMS/Blogs'

const DynamicPage = () => {

    const location = useLocation();

    const routeComponents = {
        "/": <Dashboard />,


        // CMS
        "/cms/privacy-policy": <Privacy />,
        "/cms/terms-and-conditions": <Tandc />,
        "/cms/cancellation-and-refund-policy": <Cancellationrefund />,
        // "/cms/experiences": <Experience />,
        "/cms/gallery": <Gallery />,
        "/cms/profile-and-links": <Profile />,
        // "/cms/work-and-celebrate": <Faq />,
        // "/cms/cafes": <Faq />,
        "/cms/faq": <Faq />,
        "/cms/offers": <Offers />,
        "/cms/events": <Events />,
        "/cms/blogs": <Blogs />,
        // "/cms/development": <Development />,

        // grm route
        "/grm/analytics": <GrmAnalytics />,
        "/grm/all-requests": <AllRequest />,
        "/grm/emergency-request": <EmergencyRequest />,
        "/grm/settings": <Settings />,
        "/grm/guest-feedback": <GrmFeedback />,

        // user mgmt route
        "/user-management/all-users": <Usermanagement />,
        "/user-management/settings": <Usermanagement />,

        // Leads mgmt
        "/enquiries-management/enquiries-analytics": <LeadAnalytics />,
        "/enquiries-management/enquiries": <Leads />,
        "/enquiries-management/settings": <Feedback />,

        // talent-acquisition/applications
        "/human-resources-management/analytics": <TalentAnalytics />,
        "/human-resources-management/applications": <Application />,
        // Feedback
        "/feedback": <Feedback />,

        //Reports
        "/reports": <Feedback />,

        // Analytics
        "/analytics": <Feedback />,

        // help
        "/help": <Feedback />,
    };


    return <div>{routeComponents[location.pathname] || <h2>Page Not Found</h2>}</div>;
}

export default DynamicPage