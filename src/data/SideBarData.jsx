import { FaFilePdf } from "react-icons/fa";
import { FaCircleQuestion, FaCodePullRequest } from "react-icons/fa6";
import { HiOutlineUserGroup } from "react-icons/hi";
import { IoMdHome, IoMdSettings } from "react-icons/io";
import { MdEmergencyShare, MdOutlineSos } from "react-icons/md";
import { SiGoogleanalytics } from "react-icons/si";
import { BASE_PATH } from "./constant";

export const SidebarData = [
  {
    name: "Dashboard",
    link: `${BASE_PATH}`,
    icon: <IoMdHome size={24} />,
  },

  {
    name: "Content Management system",
    link: `${BASE_PATH}/content-management-system`,
    icon: <MdOutlineSos size={26} />,
    subLinks: [
      {
        name: "Profile and Links",
        link: `${BASE_PATH}/cms/profile-and-links`,
        icon: <SiGoogleanalytics size={16} />,
      },
      {
        name: "Gallery",
        link: `${BASE_PATH}/cms/gallery`,
        icon: <IoMdSettings size={18} />,
      },
      {
        name: "Offers",
        link: `${BASE_PATH}/cms/offers`,
        icon: <IoMdSettings size={18} />,
      },
      {
        name: "Events",
        link: `${BASE_PATH}/cms/events`,
        icon: <IoMdSettings size={18} />,
      },
      {
        name: "Blogs",
        link: `${BASE_PATH}/cms/blogs`,
        icon: <IoMdSettings size={18} />,
      },
      {
        name: "Faq",
        link: `${BASE_PATH}/cms/faq`,
        icon: <IoMdSettings size={18} />,
      },
      {
        name: "Privacy Policy",
        link: `${BASE_PATH}/cms/privacy-policy`,
        icon: <IoMdSettings size={18} />,
      },
      {
        name: "Terms & Conditions",
        link: `${BASE_PATH}/cms/terms-and-conditions`,
        icon: <IoMdSettings size={18} />,
      },
      {
        name: "Cancellation and refund Policy",
        link: `${BASE_PATH}/cms/cancellation-and-refund-policy`,
        icon: <IoMdSettings size={18} />,
      },
    ],
  },

  {
    name: "Guest Request Management",
    link: `${BASE_PATH}/guest-request-management`,
    icon: <MdOutlineSos size={26} />,
    subLinks: [
      {
        name: "Analytics",
        link: `${BASE_PATH}/grm/analytics`,
        icon: <SiGoogleanalytics size={16} />,
      },
      {
        name: "All Requests",
        link: `${BASE_PATH}/grm/all-requests`,
        icon: <FaCodePullRequest size={16} />,
      },
      {
        name: "Emergency Request",
        link: `${BASE_PATH}/grm/emergency-request`,
        icon: <MdEmergencyShare size={18} />,
      },
      {
        name: "GRM Settings",
        link: `${BASE_PATH}/grm/settings`,
        icon: <IoMdSettings size={18} />,
      },
    ],
  },

  {
    name: "Enquiries Management",
    link: `${BASE_PATH}/enquiries-management`,
    icon: <HiOutlineUserGroup />,
    subLinks: [
      {
        name: "Enquiries Analytics",
        link: `${BASE_PATH}/enquiries-management/enquiries-analytics`,
        icon: <SiGoogleanalytics size={16} />,
      },
      {
        name: "Enquiries",
        link: `${BASE_PATH}/enquiries-management/enquiries`,
        icon: <FaCircleQuestion size={18} />,
      },
    ],
  },

  {
    name: "Human Resources Management",
    link: `${BASE_PATH}/human-resources-management`,
    icon: <HiOutlineUserGroup />,
    subLinks: [
      {
        name: "Analytics",
        link: `${BASE_PATH}/human-resources-management/analytics`,
        icon: <SiGoogleanalytics size={16} />,
      },
      {
        name: "Applications",
        link: `${BASE_PATH}/human-resources-management/applications`,
        icon: <FaFilePdf size={18} />,
      },
    ],
  },

  {
    name: "User Management",
    link: `${BASE_PATH}/user-management/all-users`,
    icon: <HiOutlineUserGroup />,
  },
];
