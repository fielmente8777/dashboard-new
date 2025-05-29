import { FaFilePdf, FaWhatsappSquare, FaThemeco } from "react-icons/fa";
import {
  FaCircleQuestion,
  FaCodePullRequest,
  FaCommentSms,
} from "react-icons/fa6";
import { HiOutlineUserGroup } from "react-icons/hi";
import { IoMdSettings, IoIosChatbubbles } from "react-icons/io";
import { MdEmergencyShare, MdOutlineSos } from "react-icons/md";
import { SiGoogleanalytics } from "react-icons/si";
import { MdDashboard } from "react-icons/md";
import { SiPayloadcms, SiAnalogue } from "react-icons/si";
import { MdAnalytics } from "react-icons/md";
import { MdLeaderboard } from "react-icons/md";
import { GrResources } from "react-icons/gr";
import { FaRobot } from "react-icons/fa6";
import { MdMarkEmailUnread, MdPayment } from "react-icons/md";
import { SiGoogleearthengine, SiGoogleforms } from "react-icons/si";
import { TbSeo } from "react-icons/tb";
import { TiSocialSkype } from "react-icons/ti";
import { RiWechatChannelsLine } from "react-icons/ri";
export const SidebarData = [
  {
    name: "Dashboard",
    link: ``,
    icon: <MdDashboard size={24} />,
  },

  {
    name: "Content Management system",
    link: ``,
    key: "CMS",
    icon: <SiPayloadcms size={24} />,
    subLinks: [
      {
        name: "Profile and Links",
        link: `cms/profile-and-links`,
        icon: <SiGoogleanalytics size={16} />,
      },
      {
        name: "Gallery",
        link: `cms/gallery`,
        icon: <IoMdSettings size={18} />,
      },
      {
        name: "Offers",
        link: `cms/offers`,
        icon: <IoMdSettings size={18} />,
      },
      {
        name: "Events",
        link: `cms/events`,
        icon: <IoMdSettings size={18} />,
      },
      {
        name: "Blogs",
        link: `cms/blogs`,
        icon: <IoMdSettings size={18} />,
      },
      {
        name: "Faq",
        link: `cms/faq`,
        icon: <IoMdSettings size={18} />,
      },
      {
        name: "Privacy Policy",
        link: `cms/privacy-policy`,
        icon: <IoMdSettings size={18} />,
      },
      {
        name: "Terms & Conditions",
        link: `cms/terms-and-conditions`,
        icon: <IoMdSettings size={18} />,
      },
      {
        name: "Cancellation and refund Policy",
        link: `cms/cancellation-and-refund-policy`,
        icon: <IoMdSettings size={18} />,
      },
    ],
  },

  {
    name: "Guest Request Management",
    link: `guest-request-management`,
    key: "GRM",
    icon: <MdOutlineSos size={26} />,
    subLinks: [
      {
        name: "Analytics",
        link: `grm/analytics`,
        icon: <SiGoogleanalytics size={16} />,
      },
      {
        name: "All Requests",
        link: `grm/all-requests`,
        icon: <FaCodePullRequest size={16} />,
      },
      {
        name: "Emergency Request",
        link: `grm/emergency-request`,
        icon: <MdEmergencyShare size={18} />,
      },
      {
        name: "GRM Settings",
        link: `grm/settings`,
        icon: <IoMdSettings size={18} />,
      },
    ],
  },

  {
    name: "Enquiries Management",
    link: `enquiries-management`,
    key: "Enquiries Management",
    icon: <MdAnalytics size={24} />,
    subLinks: [
      {
        name: "Enquiries Analytics",
        link: `enquiries-management/enquiries-analytics`,
        icon: <SiGoogleanalytics size={16} />,
      },
      {
        name: "Enquiries",
        link: `enquiries-management/enquiries`,
        icon: <FaCircleQuestion size={18} />,
      },
    ],
  },

  {
    name: "Human Resources Management",
    link: `human-resources-management`,
    key: "HRM",
    icon: <GrResources size={24} />,
    subLinks: [
      {
        name: "Analytics",
        link: `human-resources-management/analytics`,
        icon: <SiGoogleanalytics size={16} />,
      },
      {
        name: "Applications",
        link: `human-resources-management/applications`,
        icon: <FaFilePdf size={18} />,
      },
    ],
  },

  {
    name: "Leads Form",
    key: "Leads Form",
    icon: <MdLeaderboard size={24} />,
    key: "",
    subLinks: [
      {
        name: "Lead Gen Form",
        link: `lead-form/lead-gen-form`,
        icon: <SiGoogleforms size={16} />,
      },
    ],
  },

  {
    name: "User Management",
    key: "User Management",
    link: `user-management/all-users`,
    icon: <HiOutlineUserGroup size={22} />,
  },

  {
    name: "Analytics & Reporting",
    key: "Analytics Reporting",
    link: `analytics-and-reporting`,
    icon: <SiAnalogue size={22} />,
  },

  {
    name: "Conversational Tool",
    key: "Conversational Tool",
    link: `conversational-tool`,
    icon: <IoIosChatbubbles size={24} />,
  },

  {
    name: "Social Media",
    key: "Social Media",
    link: `social-media`,
    icon: <TiSocialSkype size={24} />,
  },

  {
    name: "Eazobot",
    key: "Eazobot",
    link: `eazobot`,
    icon: <FaRobot size={24} />,
  },

  {
    name: "Email Marketing",
    key: "Email Marketing",
    link: `email-marketing`,
    icon: <MdMarkEmailUnread size={24} />,
  },

  {
    name: "SMS Marketing",
    key: "SMS Marketing",
    link: `sms-marketing`,
    icon: <FaCommentSms size={24} />,
  },

  {
    name: "WhatsApp Marketing",
    key: "WhatsApp Marketing",
    link: `whatsapp-marketing`,
    icon: <FaWhatsappSquare size={24} />,
  },

  {
    name: "Booking Engine",
    key: "Booking Engine",
    link: `booking-engine`,
    icon: <SiGoogleearthengine size={20} />,
  },

  {
    name: "FrontDesk",
    key: "FrontDesk",
    link: `frontdesk`,
    icon: <HiOutlineUserGroup />,
  },

  {
    name: "SEO Manager",
    key: "SEO Manager",
    link: `seo-manager`,
    icon: <TbSeo size={24} />,
  },

  {
    name: "Themes Manager",
    key: "Themes Manager",
    link: `themes-manager`,
    icon: <FaThemeco size={22} />,
  },

  {
    name: "Channel Manager",
    key: "Channel Manager",
    link: `channel-manager`,
    icon: <RiWechatChannelsLine size={22} />,
  },

  {
    name: "Payment Gateway",
    key: "Payment Gateway",
    link: `payment-gateway`,
    icon: <MdPayment size={22} />,
  },
];

// "CMS",
//   "Social Media",
//   "Front Desk",
//   "Seo Manager",
//   "Theme Manager",
//   "Booking Engine",
//   "Reservation Desk",
//   "Channel Manager",
//   "Food Manager",
//   "Gateway Manager",
//   "GRM",
//   "HRM",

// New added

// "analyticsandreporting": false,
//     "conversationaltool": false,
//     "eazobot": false,
//     "emailmarketing": false,
//     "leadgenform": false,
//     "smsmarketing": false,
//     "usermanagement": false,
//     "whatsappmarketing": false
