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
import Leads from '../Leads/Leads'
import TalentAnalytics from '../TalentMgmt/Analytics'
import Application from '../TalentMgmt/Application'
import LeadAnalytics from '../Leads/LeadAnalytics'
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
        "/leads-management/leads-analytics": <LeadAnalytics />,
        "/leads-management/leads": <Leads />,
        "/leads-management/settings": <Feedback />,

        // talent-acquisition/applications
        "/talent-acquisition/analytics": <TalentAnalytics />,
        "/talent-acquisition/applications": <Application />,
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