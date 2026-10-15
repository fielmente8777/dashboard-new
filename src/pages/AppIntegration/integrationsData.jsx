import { FaMeta } from "react-icons/fa6";
import { IoLogoWhatsapp } from "react-icons/io";
import { MdOutlineStorefront, MdOutlineTrackChanges } from "react-icons/md";
import { SiGoogleads, SiGoogleanalytics } from "react-icons/si";
import { PAGES } from "../../routes/paths";
import GmailIcon from "./GmailIcon";


export const CATEGORIES = ["All", "Messaging", "Leads & ads", "Analytics"];

// Every app the dashboard can connect to.
//   statusKey  - where integrationStatus says it is connected (dot path)
//   disconnectId - what /integration/update clears (defaults to statusKey)
//   access     - subscription.appAccess key that unlocks it
//   openPage   - dashboard page to manage it once connected
//   comingSoon - shown but not connectable yet
export const INTEGRATIONS = [
  {
    id: "metaWhatsapp",
    name: "WhatsApp Business",
    description: "Chat with guests, send templates and run campaigns from the dashboard.",
    icon: <IoLogoWhatsapp className="size-6 text-[#25D366]" />,
    category: "Messaging",
    statusKey: "metaWhatsapp",
    access: "whatsapp",
    openPage: PAGES.CHAT_WHATSAPP,
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "Read and reply to your hotel's email inside the dashboard.",
    icon: <GmailIcon />,
    category: "Messaging",
    statusKey: "gmail",
    openPage: PAGES.EAZMAIL,
  },
  {
    id: "exotel",
    name: "Exotel",
    description: "Record and track guest calls made to your Exotel number.",
    img: "/exotel.jpg",
    category: "Messaging",
    statusKey: "exotel",
    access: "exotel",
    openPage: PAGES.CALLS,
  },
  {
    id: "otp-less",
    name: "OTPless",
    description: "Let guests sign in with WhatsApp or phone, without passwords.",
    img: "/otp.png",
    category: "Messaging",
  },
  {
    id: "meta",
    name: "Meta lead ads",
    description: "Bring leads from Facebook and Instagram lead forms straight in.",
    icon: <FaMeta className="size-6 text-[#0281F0]" />,
    category: "Leads & ads",
    statusKey: "meta",
    access: "meta",
    openPage: PAGES.LEADS_META,
  },
  {
    id: "googleadsinsights",
    name: "Google Ads",
    description: "See spend, clicks and conversions from your Google Ads campaigns.",
    icon: <SiGoogleads className="size-6 text-[#4285F4]" />,
    category: "Leads & ads",
    statusKey: "googleAdsInsight.status",
    access: "googleadsinsights",
    openPage: PAGES.GOOGLE_ADS_INSIGHTS,
  },
  {
    id: "gmb",
    name: "Google Business Profile",
    description: "Manage reviews and see how guests find you on Google Maps.",
    icon: <MdOutlineStorefront className="size-6 text-[#4285F4]" />,
    category: "Leads & ads",
    comingSoon: true,
  },
  {
    id: "google_analytics",
    name: "Google Analytics",
    description: "Track website traffic and where your bookings come from.",
    icon: <SiGoogleanalytics className="size-6 text-[#E37400]" />,
    category: "Analytics",
    access: "google_analytics",
    openPage: PAGES.INSIGHTS_GOOGLE_ANALYTICS,
  },
  {
    id: "WebsiteTracking",
    name: "Website tracking",
    description: "See who visits your website and which pages they look at.",
    icon: <MdOutlineTrackChanges className="size-6 text-[#7C3AED]" />,
    category: "Analytics",
    statusKey: "WebsiteTracking",
    openPage: PAGES.WEBSITE_VISITORS,
  },
];

// reads "googleAdsInsight.status" style paths
export const readPath = (object, path) =>
  path.split(".").reduce((value, key) => value?.[key], object);
