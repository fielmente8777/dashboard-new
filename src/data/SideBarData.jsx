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
import { IoFastFood } from "react-icons/io5";
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
        icon: <RiFolderUserFill size={22} />,
      },
      {
        name: "Gallery",
        link: `cms/gallery`,
        icon: <RiGalleryFill size={22} />,
      },
      {
        name: "Offers",
        link: `cms/offers`,
        icon: <BiSolidOffer size={22} />,
      },
      {
        name: "Events",
        link: `cms/events`,
        icon: <MdEventSeat size={22} />,
      },
      {
        name: "Blogs",
        link: `cms/blogs`,
        icon: <FaBloggerB size={22} />,
      },
      {
        name: "Faq",
        link: `cms/faq`,
        icon: <FaQuestion size={22} />,
      },
      {
        name: "Privacy Policy",
        link: `cms/privacy-policy`,
        icon: <MdPrivacyTip size={22} />,
      },
      {
        name: "Terms & Conditions",
        link: `cms/terms-and-conditions`,
        icon: <MdPolicy size={22} />,
      },
      {
        name: "Cancellation and refund Policy",
        link: `cms/cancellation-and-refund-policy`,
        icon: <MdOutlineFreeCancellation size={22} />,
      },
    ],
  },

  {
    name: "Booking Engine",
    key: "Booking Engine",
    link: `booking-engine`,
    icon: <SiGoogleearthengine size={20} />,
    subLinks: [
      {
        name: "Rooms & Inventory",
        link: `booking-engine/rooms-and-inventory`,
        icon: <MdOutlineInventory size={18} />,
      },
      {
        name: "Rooms Setup",
        link: `booking-engine/rooms-setup`,
        icon: <MdBedroomParent size={18} />,
      },
    ],
  },
  {
    name: "Reservation Desk",
    link: `reservation-desk`,
    key: "Reservation Desk",
    icon: <RiReservedFill size={24} />,
    // subLinks: [
    //   {
    //     name: "Enquiries",
    //     link: `enquiries-management/enquiries`,
    //     icon: <FaCircleQuestion size={18} />,
    //   },
    // ],
  },

  {
    name: "Enquiries Management",
    link: `enquiries-management`,
    key: "Enquiries Management",
    icon: <MdAnalytics size={24} />,
    subLinks: [
      {
        name: "Enquiries",
        link: `enquiries-management/enquiries`,
        icon: <FaCircleQuestion size={18} />,
      },
    ],
  },

  {
    name: "Guest Request Management",
    link: `guest-request-management`,
    key: "GRM",
    icon: <IoFastFood size={22} />,
    subLinks: [
      {
        name: "All Requests",
        link: `grm/all-requests`,
        icon: <FaCodePullRequest size={16} />,
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
    name: "Human Resources Management",
    link: `human-resources-management`,
    key: "HRM",
    icon: <GrResources size={24} />,
    subLinks: [
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
    key: "Leads Form",
    subLinks: [
      {
        name: "Lead Gen Form",
        link: `lead-form/lead-gen-form`,
        icon: <SiGoogleforms size={16} />,
      },
    ],
  },

  {
    name: "Analytics & Reporting",
    key: "Analytics Reporting",
    link: ``,
    icon: <SiAnalogue size={22} />,
    subLinks: [
      {
        name: "HRM Analytics",
        link: `human-resources-management/analytics`,
        key: "HRM",
        icon: <SiGoogleanalytics size={16} />,
      },
      {
        name: "Enquiries Analytics",
        link: `enquiries-management/enquiries-analytics`,
        key: "Enquiries Management",
        icon: <SiGoogleanalytics size={16} />,
      },
      {
        name: "GRM Analytics",
        link: `grm/analytics`,
        key: "GRM",
        icon: <SiGoogleanalytics size={16} />,
      },
    ],
  },

  {
    name: "User Management",
    key: "User Management",
    link: `user-management/all-users`,
    icon: <HiOutlineUserGroup size={22} />,
  },

  // {
  //   name: "Eazobot",
  //   key: "Eazobot",
  //   link: `eazobot`,
  //   icon: <TiSocialSkype size={24} />,
  // },

  // {
  //   name: "Conversational Tool",
  //   key: "Conversational Tool",
  //   link: `conversational-tool`,
  //   icon: <IoIosChatbubbles size={24} />,
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

  // {
  //   name: "Email Marketing",
  //   key: "Email Marketing",
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

  {
    name: "FrontDesk",
    key: "FrontDesk",
    link: `frontdesk`,
    icon: <BiCreditCardFront />,
  },

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

  {
    name: "Payment Gateway",
    key: "Payment Gateway",
    link: `payment-gateway`,
    icon: <MdPayment size={22} />,
  },
  {
    name: "Front Desk",
    key: "Front Desk",
    link: `front-desk`,
    icon: <HiOutlineUserGroup />,
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
