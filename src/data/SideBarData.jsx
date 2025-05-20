import { FaFilePdf } from "react-icons/fa";
import { FaCircleQuestion, FaCodePullRequest } from "react-icons/fa6";
import { HiOutlineUserGroup } from "react-icons/hi";
import { IoMdHome, IoMdSettings } from "react-icons/io";
import { MdEmergencyShare, MdOutlineSos } from "react-icons/md";
import { SiGoogleanalytics } from "react-icons/si";

export const SidebarData = [
  {
    name: "Dashboard",
    link: ``,
    icon: <IoMdHome size={24} />,
  },

  {
    name: "Content Management system",
    link: `content-management-system`,
    key: "CMS",
    icon: <MdOutlineSos size={26} />,
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
    key: "Enquire Management",
    icon: <HiOutlineUserGroup />,
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
    icon: <HiOutlineUserGroup />,
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
    name: "User Management",
    link: `user-management/all-users`,
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
