import { Navigate, Route, Routes } from "react-router-dom";
import { BASE_PATH } from "../data/constant";
import { SidebarData } from "../data/SideBarData";
import DynamicPage from "../pages/DynamicPage/DynamicPage";
import Dashboard from "../pages/Home/Dashboard";
import Login from "../pages/Login/Login";
import ProtectedRoute from "../Protected/ProtecRoute";
import RootRoute from "./RootRoute";
import Whatsapp from "../components/Contacts/WhtasApp";
import Signup from "../pages/Register/Signup";
import WhatsappMarketing from "../pages/Marketing/WhatsappMarketing";
import SocialMedia from "../pages/Social/SocialMedia";
import OTAListing from "../pages/OTA/OTAListing";
import OTAOptimization from "../pages/OTA/OTAOptimization";
import Accounting from "../pages/Accounting/Accounting";
import GSTFiling from "../pages/Accounting/GSTFiling";
import PublicRelation from "../pages/Social/PublicRelation";
import Linktree from "../pages/Linktree/Linktree";
import GMBProfile from "../pages/GoogleListing/GMBProfile";
import GoogleMapItiration from "../pages/GoogleListing/GoogleMapItiration";
import InfluencerMarketing from "../pages/Social/InfluencerMarketing";
import EmailMarketing from "../pages/Marketing/EmailMarketing";
import ConversationalTool from "../pages/ConversationalTool/ConversationalTool";
import Website from "../pages/CustomWebsite/Website";
import Seo from "../pages/SEO/Seo";
import ChannelManager from "../pages/Manager/ChannelManager";
import PerformanceMarketing from "../pages/PerformanceMarketing/PerformanceMarketing";
import FrontDesk from "../pages/FrontDesk/FrontDesk";

const Navigation = () => {
  const dashboardRootPath = "/dashboard/client";

  return (
    <Routes>
      {/* Public */}
      {/* navigate to dashboard client  */}
      <Route path="/" element={<ProtectedRoute />} replace>
        <Route index element={<RootRoute />} />
      </Route>
      {/* Route for auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Route for /dashboard/client */}
      <Route path={`${dashboardRootPath}/:ndid/*`} element={<ProtectedRoute />}>
        <Route index element={<Dashboard />} />
        <Route path="whatsapp-marketing" element={<WhatsappMarketing />} />
        <Route path="social-media" element={<SocialMedia />} />
        <Route path="ota-listing" element={<OTAListing />} />
        <Route path="ota-optimization" element={<OTAOptimization />} />
        <Route path="ota-management" element={<OTAOptimization />} />
        <Route path="accounting" element={<Accounting />} />
        <Route path="gst-filing" element={<GSTFiling />} />
        <Route
          path="performance-marketing"
          element={<PerformanceMarketing />}
        />

        <Route path="pr" element={<PublicRelation />} />
        <Route path="linktree-setup" element={<Linktree />} />
        <Route path="google-listing" element={<GMBProfile />} />
        <Route path="google-map-itrations" element={<GoogleMapItiration />} />
        <Route path="influencer-marketing" element={<InfluencerMarketing />} />
        <Route path="email-marketing" element={<EmailMarketing />} />
        <Route path="conversational-tool" element={<ConversationalTool />} />
        <Route path="custom-website" element={<Website />} />
        <Route path="seo" element={<Seo />} />
        <Route path="channel-manager" element={<ChannelManager />} />
        {/* <Route path="leads-management" element={<Leads />} /> */}
        <Route path="pms-software" element={<ChannelManager />} />
        <Route path="sms-marketing" element={<EmailMarketing />} />
        <Route path="front-desk" element={<FrontDesk />} />

        {SidebarData?.map((data, index) => {
          if (!data?.subLinks)
            return (
              <Route key={index} path={data?.link} element={<DynamicPage />} />
            );

          return data?.subLinks?.map((subLinks) => {
            return (
              <Route
                key={index}
                path={subLinks?.link}
                element={<DynamicPage />}
              />
            );
          });
        })}
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default Navigation;
