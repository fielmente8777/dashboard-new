import { IoMdHome } from "react-icons/io";
import { RiFeedbackFill } from "react-icons/ri";
import { MdOutlineSos } from "react-icons/md";
import { HiOutlineUserGroup } from "react-icons/hi";
import { SiGoogleanalytics } from "react-icons/si";
import { FaCodePullRequest } from "react-icons/fa6";
import { MdEmergencyShare } from "react-icons/md";
import { IoMdSettings } from "react-icons/io";
import { FaCircleQuestion } from "react-icons/fa6";
import { FaFilePdf } from "react-icons/fa";
export const SidebarData = [
    {
        "name": "Dashboard",
        "link": "/",
        "icon": <IoMdHome size={24} />
    },

    {
        "name": "Content Management system",
        "link": "/content-management-system",
        "icon": <MdOutlineSos size={26} />,
        "subLinks": [
            {
                "name": "Profile and Links",
                "link": "/cms/profile-and-links",
                "icon": <SiGoogleanalytics size={16} />,
            },
            // {
            //     "name": "Work and Celebrate",
            //     "link": "/cms/work-and-celebrate",
            //     "icon": <FaCodePullRequest size={16} />,
            // },
            // {
            //     "name": "Cafes",
            //     "link": "/cms/cafes",
            //     "icon": <MdEmergencyShare size={18} />
            // },

            // {
            //     "name": "Guest Feedback",
            //     "link": "/cms/guest-feedback",
            //     "icon": <RiFeedbackFill size={20} />
            // },
            // {
            //     "name": "Experiences",
            //     "link": "/cms/experiences",
            //     "icon": <IoMdSettings size={18} />
            // },
            {
                "name": "Gallery",
                "link": "/cms/gallery",
                "icon": <IoMdSettings size={18} />
            },
            {
                "name": "Offers",
                "link": "/cms/offers",
                "icon": <IoMdSettings size={18} />
            },
            {
                "name": "Events",
                "link": "/cms/events",
                "icon": <IoMdSettings size={18} />
            },
            {
                "name": "Faq",
                "link": "/cms/faq",
                "icon": <IoMdSettings size={18} />
            },
            {
                "name": "Privacy Policy",
                "link": "/cms/privacy-policy",
                "icon": <IoMdSettings size={18} />
            },
            {
                "name": "Terms & Conditions",
                "link": "/cms/terms-and-conditions",
                "icon": <IoMdSettings size={18} />
            },
            {
                "name": "Cancellation and refund Policy",
                "link": "/cms/cancellation-and-refund-policy",
                "icon": <IoMdSettings size={18} />
            }
        ]
    },

    {
        "name": "Guest Request Management",
        "link": "/guest-request-management",
        "icon": <MdOutlineSos size={26} />,
        "subLinks": [
            {
                "name": "Analytics",
                "link": "/grm/analytics",
                "icon": <SiGoogleanalytics size={16} />,
            },
            {
                "name": "All Requests",
                "link": "/grm/all-requests",
                "icon": <FaCodePullRequest size={16} />,
            },
            {
                "name": "Emergency Request",
                "link": "/grm/emergency-request",
                "icon": <MdEmergencyShare size={18} />
            },

            // {
            //     "name": "Guest Feedback",
            //     "link": "/grm/guest-feedback",
            //     "icon": <RiFeedbackFill size={20} />
            // },
            {
                "name": "GRM Settings",
                "link": "/grm/settings",
                "icon": <IoMdSettings size={18} />
            },
        ]
    },


    {
        "name": "Enquiries Management",
        "link": "/enquiries-management",
        "icon": <HiOutlineUserGroup />,
        "subLinks": [
            {
                "name": "Enquiries Analytics",
                "link": "/enquiries-management/enquiries-analytics",
                "icon": <SiGoogleanalytics size={16} />,
            },
            {
                "name": "Enquiries",
                "link": "/enquiries-management/enquiries",
                "icon": <FaCircleQuestion size={18} />,
            },
            // {
            //     "name": "Leads Settings",
            //     "link": "/leads-management/settings",
            //     "icon": <IoMdHome size={22} />
            // },

        ]
    },
    {
        "name": "Human Resources Management",
        "link": "/human-resources-management",
        "icon": <HiOutlineUserGroup />,
        "subLinks": [
            {
                "name": "Analytics",
                "link": "/human-resources-management/analytics",
                "icon": <SiGoogleanalytics size={16} />,
            },
            {
                "name": "Applications",
                "link": "/human-resources-management/applications",
                "icon": <FaFilePdf size={18} />,
            },
            // {
            //     "name": "Leads Settings",
            //     "link": "/leads-management/settings",
            //     "icon": <IoMdHome size={22} />
            // },

        ]
    },

    {
        "name": "User Management",
        // "link": "/user-management",
        "link": "/user-management/all-users",
        "icon": <HiOutlineUserGroup />,
        // "subLinks": [
        //     {
        //         "name": "All Users",
        //         "link": "/user-management/all-users",
        //         "icon": <IoMdHome size={22} />,
        //     },
        //     {
        //         "name": "User Settings",
        //         "link": "/user-management/settings",
        //         "icon": <IoMdHome size={22} />
        //     },

        // ]
    },

    // {
    //     "name": "Feedback",
    //     "link": "/feedback",
    //     "icon": <RiFeedbackFill />
    // },


    // {
    //     "name": "Reports",
    //     "link": "/reports"
    // },
    // {
    //     "name": "Analytics",
    //     "link": "/analytics"
    // },
    // {
    //     "name": "Help",
    //     "link": "/help"
    // }
];