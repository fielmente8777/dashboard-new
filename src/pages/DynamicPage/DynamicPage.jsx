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
const DynamicPage = () => {

    const location = useLocation();

    const routeComponents = {
        "/": <Dashboard />,

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