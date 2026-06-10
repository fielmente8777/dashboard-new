import {
  FaFilePdf,
  FaWhatsappSquare,
  FaThemeco,
  FaWhatsapp,
  FaInstagram,
  FaFacebook,
  FaCalendarCheck,
} from "react-icons/fa";
import {
  FaBots,
  FaCircleQuestion,
  FaCodePullRequest,
  FaCommentSms,
  FaMeta,
  FaRankingStar,
  FaUser,
} from "react-icons/fa6";
import { HiOutlineUserGroup } from "react-icons/hi";
import {
  IoMdSettings,
  IoIosChatbubbles,
  IoMdGlobe,
  IoMdEye,
} from "react-icons/io";
import {
  MdCampaign,
  MdChat,
  MdEmergencyShare,
  MdLink,
  MdOutlineChatBubbleOutline,
  MdOutlineReviews,
  MdOutlineSos,
  MdPhone,
  MdUnsubscribe,
} from "react-icons/md";
import { SiGoogleanalytics, SiGooglesheets, SiLivechat } from "react-icons/si";
import { MdDashboard } from "react-icons/md";
import {
  PiChatCircleLight,
  PiGlobeSimpleLight,
  PiUsersThreeFill,
} from "react-icons/pi";
import { SiPayloadcms, SiAnalogue } from "react-icons/si";
import { MdAnalytics } from "react-icons/md";
import { MdLeaderboard } from "react-icons/md";
import { GrAnnounce, GrResources } from "react-icons/gr";
import { FaRobot } from "react-icons/fa6";
import { MdMarkEmailUnread, MdPayment } from "react-icons/md";
import { SiGoogleearthengine, SiGoogleforms } from "react-icons/si";
import { TbMessageChatbotFilled, TbSeo } from "react-icons/tb";
import { TiSocialSkype } from "react-icons/ti";
import {
  RiMetaFill,
  RiWechatChannelsLine,
  RiWhatsappFill,
} from "react-icons/ri";
import { CgProfile } from "react-icons/cg";
import { RiFolderUserFill } from "react-icons/ri";
import { RiGalleryFill } from "react-icons/ri";
import { BiSolidOffer, BiCreditCardFront } from "react-icons/bi";
import { MdEventSeat } from "react-icons/md";
import { FaBloggerB } from "react-icons/fa";
import { FaQuestion } from "react-icons/fa";
import { MdPrivacyTip } from "react-icons/md";
import { MdPolicy } from "react-icons/md";
import { MdOutlineFreeCancellation } from "react-icons/md";
import { MdBedroomParent, MdOutlineInventory } from "react-icons/md";
import { RiReservedFill } from "react-icons/ri";
import { IoBookOutline, IoFastFood } from "react-icons/io5";
import { SiGoogleadsense } from "react-icons/si";
import { SiGoogleads } from "react-icons/si";
import { CiGlobe, CiViewBoard } from "react-icons/ci";
import { FiDatabase, FiEye, FiUsers } from "react-icons/fi";
import {
  DocumentIcon,
  ChatIcon,
  MailIcon,
  TeamIcon,
  WhatsappIcon,
  LiveChatIcon,
  Dashboard,
} from "../icons/icon";

export const SidebarData = [
  {
    name: "Dashboard",
    link: ``,
    icon: <MdDashboard color={"#c2ccd6"} size={16} />,
  },
  {
    name: "Live Chat",
    link: `channel`,
    key: "WhatsApp",
    icon: <PiChatCircleLight />,
    subLinks: [
      {
        name: "WhatsApp",
        link: `channel/wa/chat`,
        // key: "whatsapp",
        icon: <MdChat />,
      },
      // {
      //   name: "Instagram",
      //   link: `channel/ig/chat`,
      //   icon: <FaInstagram size={16} />,
      // },
      // {
      //   name: "Facebook",
      //   link: `channel/fb/chat`,
      //   icon: <FaFacebook size={18} />,
      // },

      // {
      //   name: "Eazbot",
      //   link: `channel/eb/chat`,
      //   icon: <FaRobot size={18} />,
      // },
    ],
  },

  // {
  //   name: "Website Tracking",
  //   // key: "",
  //   link: `website-tracking`,
  //   icon: <MdAnalytics size={24} />,
  //   subLinks: [
  //     {
  //       name: "Visitors",
  //       link: `website-tracking/visitors`,
  //       icon: <MdLeaderboard size={18} />,
  //     },
  //     {
  //       name: "Activities",
  //       link: `website-tracking/activities`,
  //       icon: <MdLeaderboard size={18} />,
  //     },
  //   ],
  // },

  {
    name: "Leads Management",
    link: `leads-management`,
    key: "Leads Management",
    icon: <FiUsers />,
    subLinks: [
      {
        name: "All",
        link: `leads-management/all-leads`,
        icon: <MdLeaderboard size={18} />,
      },
      {
        name: "Meta",
        // key: "Meta",
        link: `leads-management/meta-leads`,
        icon: <PiGlobeSimpleLight size={18} />,

        // <RiMetaFill color="#0266df" />,
      },
      {
        name: "WhatsApp",
        // key: "WhatsApp",
        link: `leads-management/whatsapp`,
        icon: <MdOutlineChatBubbleOutline />,
      },

      {
        name: "Google Ads",
        link: `leads-management/google-ads-leads`,
        icon: <SiGoogleads size={14} />,
      },
      {
        name: "Webform",
        link: `leads-management/webform-leads`,
        icon: <SiGooglesheets />,
      },
      {
        name: "Eazbot",
        link: `leads-management/eazbot-leads`,
        icon: <FaRobot size={18} />,
      },
      {
        name: "Visitors",
        link: `leads-management/all-visitors`,
        icon: <FiEye />,
      },
      // {
      //   name: "Form",
      //   link: `enquiries-management/lead-gen-form`,
      //   icon: <SiGoogleadsense size={18} />,
      // },
    ],
  },

  {
    name: "Marketing",
    key: "WhatsApp",
    link: `marketing`,
    icon: <GrAnnounce size={16} />,
    subLinks: [
      {
        name: "Whatsapp Marketing",
        link: `marketing/whatsapp-marketing`,
        icon: <RiWhatsappFill color="green" />,
      },
      // {
      //   name: "Email Marketing",
      //   link: `marketing/email-marketing`,
      //   icon: <MailIcon />,
      // },
    ],
  },

  // {
  //   name: "Insights & Analytics",
  //   link: `insights-analytics`,
  //   icon: <SiAnalogue size={22} />,
  //   subLinks: [
  //     {
  //       name: "Google Ads Insights",
  //       link: `insights-analytics/google-ads-insights`,

  //       icon: <SiGoogleanalytics size={18} />,
  //     },
  //     {
  //       name: "Meta Ads Insights",
  //       link: `insights-analytics/meta-ads-insights`,

  //       icon: <SiGoogleanalytics size={18} />,
  //     },
  //     {
  //       name: "Google Analytics",
  //       link: `insights-analytics/google-analytics`,

  //       icon: <SiGoogleanalytics size={18} />,
  //     },
  //     {
  //       name: "Google Console",
  //       link: `insights-analytics/google-console`,

  //       icon: <SiGoogleanalytics size={18} />,
  //     },
  //     {
  //       name: "GMB Insights",
  //       link: `insights-analytics/gmb-insights`,

  //       icon: <SiGoogleanalytics size={18} />,
  //     },
  //     {
  //       name: "Social Media Insights",
  //       link: `insights-analytics/social-media-insights`,

  //       icon: <SiGoogleanalytics size={18} />,
  //     },
  //     {
  //       name: "Website Analytics",
  //       link: `insights-analytics/website-analytics`,

  //       icon: <SiGoogleanalytics size={18} />,
  //     },
  //     {
  //       name: "Leads Analytics",
  //       link: `insights-analytics/leads-analytics`,

  //       icon: <SiGoogleanalytics size={18} />,
  //     },
  //   ],
  // },

  // {
  //   name: "AI Sales Agent",
  //   // key: "",
  //   link: `ai-sales-agent`,
  //   icon: <HiOutlineUserGroup />,
  // },

  {
    name: "Calls Management",
    key: "Exotel",
    link: `calls-management`,
    icon: <MdPhone />,
  },

  {
    name: "Google Ads Insights",
    key: "Google Ads Insights",
    link: `google-ads-insights`,
    icon: <SiGoogleadsense />,
  },
  {
    name: "LOCAL SEO",
    // key: "",
    link: `local-seo`,
    icon: <SiGoogleadsense />,
  },
  {
    name: "Google Analytics",
    link: `insights-analytics/google-analytics`,
    icon: <SiGoogleanalytics size={18} />,
  },

  {
    name: "Meta Insights",
    // key: "Google Ads Insights",
    link: `meta-insights`,
    icon: <FaMeta />,
  },
  // {
  //   name: "Meta",
  //   key: "",
  //   link: `meta`,
  //   icon: <FaFacebook size={24} />,
  //   subLinks: [
  //     {
  //       name: "Meta Connections",
  //       link: `meta/connections`,
  //       icon: <FaFacebook size={18} />,
  //     },
  //     // {
  //     //   name: "Meta Leads",
  //     //   link: `meta/leads`,
  //     //   icon: <SiGoogleads size={18} />,
  //     // },
  //     {
  //       name: "Meta Messages",
  //       link: `meta/messages`,
  //       icon: <IoIosChatbubbles size={18} />,
  //     },
  //     {
  //       name: "Meta Settings",
  //       link: `meta/settings`,
  //       icon: <IoMdSettings size={18} />,
  //     },
  //   ],
  // },
  {
    name: "Social Media",
    key: "Social Media",
    target: "_blank",
    link: `https://social.eazotel.com`,
    icon: <TiSocialSkype size={18} />,
  },

  // {
  //   name: "GMB",
  //   // key: "gmb",
  //   icon: <MdLeaderboard size={24} />,
  //   // link: `lead-form/lead-gen-form`,
  //   subLinks: [
  //     {
  //       name: "Overview",
  //       link: `gmb/overview`,
  //       icon: <CiViewBoard size={18} />,
  //     },
  //     {
  //       name: "Rank",
  //       link: `gmb/rank`,
  //       icon: <FaRankingStar size={18} />,
  //     },
  //     {
  //       name: "Keywords",
  //       link: `gmb/keywords`,
  //       icon: <SiGoogleforms size={18} />,
  //     },
  //     {
  //       name: "Reviews",
  //       link: `gmb/reviews`,
  //       icon: <MdOutlineReviews size={18} />,
  //     },
  //   ],
  // },
  // {
  //   name: "Eazbot",
  //   // key: "Eazobot",
  //   link: `eazbot`,
  //   icon: <IoIosChatbubbles size={24} />,
  // },
  // {
  //   name: "EazeMail",
  //   // key: "Eazobot",
  //   link: `eazmail`,
  //   icon: <IoIosChatbubbles size={24} />,
  // },
  {
    name: "Booking Engine",
    key: "Booking Engine",
    link: `booking-engine`,
    icon: <FaCalendarCheck size={16} />,
    subLinks: [
      {
        name: "Rooms Setup",
        link: `booking-engine/rooms-setup`,
        icon: <MdBedroomParent size={18} />,
      },
      {
        name: "Rooms & Inventory",
        link: `booking-engine/rooms-and-inventory`,
        icon: <MdOutlineInventory size={18} />,
      },
      {
        name: "Price Packages",
        link: `booking-engine/price-packages`,
        icon: <MdBedroomParent size={18} />,
      },
      {
        name: "Ads Packages",
        link: `booking-engine/ads-packages`,
        icon: <MdBedroomParent size={18} />,
      },
      {
        name: "Customization",
        link: `booking-engine/customization`,
        icon: <MdBedroomParent size={18} />,
      },
    ],
  },

  {
    name: "Guest Request Management",
    link: `guest-request-management`,
    key: "GRM",
    icon: <FaUser size={18} />,
    subLinks: [
      {
        name: "All Requests",
        link: `grm/all-requests`,
        icon: <FaCodePullRequest size={14} />,
      },
      // {
      //   name: "Emergency Request",
      //   link: `grm/emergency-request`,
      //   icon: <MdEmergencyShare size={18} />,
      // },
      {
        name: "GRM Settings",
        link: `grm/settings`,
        icon: <IoMdSettings size={18} />,
      },
    ],
  },
  {
    name: "Reservation Desk",
    link: `reservation-desk`,
    key: "Reservation Desk",
    icon: <IoBookOutline size={18} />,
    // subLinks: [
    //   {
    //     name: "Enquiries",
    //     link: `enquiries-management/enquiries`,
    //     icon: <FaCircleQuestion size={18} />,
    //   },
    // ],
  },

  {
    name: "Content Management system",
    link: ``,
    key: "CMS",
    icon: <FiDatabase size={18} />,
    subLinks: [
      {
        name: "Profile and Links",
        link: `cms/profile-and-links`,
        icon: <RiFolderUserFill size={18} />,
      },
      {
        name: "Gallery",
        link: `cms/gallery`,
        icon: <RiGalleryFill size={18} />,
      },
      {
        name: "Offers",
        link: `cms/offers`,
        icon: <BiSolidOffer size={18} />,
      },
      {
        name: "Events",
        link: `cms/events`,
        icon: <MdEventSeat size={18} />,
      },
      {
        name: "Blogs",
        link: `cms/blogs`,
        icon: <FaBloggerB size={18} />,
      },
      {
        name: "Faq",
        link: `cms/faq`,
        icon: <FaQuestion size={18} />,
      },
      // {
      //   name: "Newsletter",
      //   link: `cms/newsletter`,
      //   icon: <FaQuestion size={22} />,
      // },
      {
        name: "Privacy Policy",
        link: `cms/privacy-policy`,
        icon: <MdPrivacyTip size={18} />,
      },
      {
        name: "Terms & Conditions",
        link: `cms/terms-and-conditions`,
        icon: <MdPolicy size={18} />,
      },
      {
        name: "Cancellation and refund Policy",
        link: `cms/cancellation-and-refund-policy`,
        icon: <MdOutlineFreeCancellation size={20} />,
      },
    ],
  },

  // {
  //   name: "Human Resources Management",
  //   link: `human-resources-management`,
  //   key: "HRM",
  //   icon: <GrResources size={24} />,
  //   subLinks: [
  //     {
  //       name: "Applications",
  //       link: `human-resources-management/applications`,
  //       icon: <FaFilePdf size={18} />,
  //     },
  //   ],
  // },

  // {
  //   name: "Lead Gen Form",
  //   key: "Leads Form",
  //   icon: <MdLeaderboard size={24} />,
  //   link: `lead-form/lead-gen-form`,
  //   // subLinks: [
  //   //   {
  //   //     name: "My Form",
  //   //     link: `lead-form/lead-gen-form`,
  //   //     icon: <SiGoogleforms size={18} />,
  //   //   },
  //   // ],
  // },

  {
    name: "Payment Gateway",
    // key: "Payment Gateway",
    link: `payment-gateway`,
    icon: <MdPayment />,
  },

  {
    name: "Knowledge Base",
    // key: "",
    link: `knowledge-base`,
    icon: <HiOutlineUserGroup />,
  },

  {
    name: "Front Desk",
    // key: "Front Desk",
    link: `front-desk`,
    icon: <HiOutlineUserGroup />,
  },

  {
    name: "Newsletter",
    link: `newsletter`,
    icon: <MdUnsubscribe size={20} />,
  },

  // {
  //   name: "User Management",
  //   key: "User Management",
  //   link: `user-management/all-users`,
  //   icon: <HiOutlineUserGroup size={22} />,
  // },

  // {
  //   name: "Account & Billing",
  //   icon: <FaRobot size={24} />,
  //   // key: "Accounting",
  //   target: "_blank",
  //   link: "https://accounts.eazotel.com/portal/eazoteltechnologiespvtltd/signin",
  // },

  // {
  //   name: "Settings",
  //   // key: "Setting",
  //   link: `setting`,
  //   icon: <HiOutlineUserGroup size={22} />,
  // },

  // {
  //   name: "Custom Website",
  //   key: "Custom Website",
  //   link: `custom-website`,
  //   icon: <IoIosChatbubbles size={24} />,
  // },

  // {
  //   name: "Social Media",
  //   key: "Social Media",
  //   link: `social-media`,
  //   icon: <TiSocialSkype size={24} />,
  // },

  // {
  //   name: "Leads Management",
  //   icon: <TiSocialSkype size={24} />,
  //   key: "Leads Management",
  //   link: "leads-management",
  // },

  // {
  //   name: "PMS Software",
  //   icon: <TiSocialSkype size={24} />,
  //   key: "PMS Software",
  //   link: "pms-software",
  // },

  // {
  //   name: "OTA Listing",
  //   icon: <FaRobot size={24} />,
  //   key: "OTA Listing",
  //   link: "ota-listing",
  // },

  // {
  //   name: "OTA Optimization",
  //   icon: <FaRobot size={24} />,
  //   key: "OTA Optimization",
  //   link: "ota-optimization",
  // },

  // {
  //   name: "OTA Management",
  //   icon: <FaRobot size={24} />,
  //   key: "OTA Management",
  //   link: "ota-management",
  // },

  // {
  //   name: "Accounting",
  //   icon: <FaRobot size={24} />,
  //   key: "Accounting",
  //   link: "accounting",
  // },

  // {
  //   name: "GST Filing",
  //   icon: <FaRobot size={24} />,
  //   key: "GST Filing",
  //   link: "gst-filing",
  // },

  // {
  //   name: "Performance Marketing",
  //   icon: <FaRobot size={24} />,
  //   key: "Performance Marketing",
  //   link: "performance-marketing",
  // },

  // {
  //   name: "Public Relations (PR)",
  //   icon: <FaRobot size={24} />,
  //   key: "PR",
  //   link: "pr",
  // },

  // {
  //   name: "Linktree Setup",
  //   icon: <FaRobot size={24} />,
  //   key: "Linktree Setup",
  //   link: "linktree-setup",
  // },

  // {
  //   name: "Google Listing",
  //   icon: <FaRobot size={24} />,
  //   key: "Google Listing",
  //   link: "google-listing",
  // },

  // {
  //   name: "Google Map Itrations",
  //   icon: <FaRobot size={24} />,
  //   key: "Google Map Itrations",
  //   link: "google-map-itrations",
  // },

  // {
  //   name: "Influencer Marketing",
  //   icon: <FaRobot size={24} />,
  //   key: "Influencer Marketing",
  //   link: "influencer-marketing",
  // },

  {
    name: "Contacts",
    key: "",
    link: `contacts`,
    icon: <MdMarkEmailUnread size={18} />,
  },

  // {
  //   name: "Email Marketing",
  //   key: "",
  //   link: `email-marketing`,
  //   icon: <MdMarkEmailUnread size={24} />,
  // },

  // {
  //   name: "SMS Marketing",
  //   key: "SMS Marketing",
  //   link: `sms-marketing`,
  //   icon: <FaCommentSms size={24} />,
  // },

  // {
  //   name: "WhatsApp Marketing",
  //   key: "WhatsApp Marketing",
  //   link: `whatsapp-marketing`,
  //   icon: <FaWhatsappSquare size={24} />,
  // },

  // {
  //   name: "SEO",
  //   key: "SEO",
  //   link: `seo`,
  //   icon: <TbSeo size={24} />,
  // },

  // {
  //   name: "Themes Manager",
  //   key: "Themes Manager",
  //   link: `themes-manager`,
  //   icon: <FaThemeco size={22} />,
  // },

  // {
  //   name: "Channel Manager",
  //   key: "Channel Manager",
  //   link: `channel-manager`,
  //   icon: <RiWechatChannelsLine size={22} />,
  // },
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
