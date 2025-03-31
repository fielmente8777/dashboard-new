import { IoMdHome } from "react-icons/io";
import { RiFeedbackFill } from "react-icons/ri";
import { MdOutlineSos } from "react-icons/md";
import { HiOutlineUserGroup } from "react-icons/hi";

export const SidebarData = [
    {
        "name": "Dashboard",
        "link": "/",
        "icon": <IoMdHome size={24} />
    },

    {
        "name": "Guest Request Management",
        "link": "/guest-request-management",
        "icon": <MdOutlineSos size={26} />,
        "subLinks": [
            {
                "name": "Analytics",
                "link": "/grm/analytics",
                "icon": <IoMdHome size={22} />,
            },
            {
                "name": "All Requests",
                "link": "/grm/all-requests",
                "icon": <IoMdHome size={22} />,
            },
            {
                "name": "Emergency Request",
                "link": "/grm/emergency-request",
                "icon": <IoMdHome size={22} />
            },

            {
                "name": "Guest Feedback",
                "link": "/grm/guest-feedback",
                "icon": <RiFeedbackFill size={20} />
            },
            {
                "name": "GRM Settings",
                "link": "/grm/settings",
                "icon": <IoMdHome size={22} />
            },
        ]
    },

    {
        "name": "User Management",
        "link": "/user-management",
        "icon": <HiOutlineUserGroup />,
        "subLinks": [
            {
                "name": "All Users",
                "link": "/user-management/all-users",
                "icon": <IoMdHome size={22} />,
            },
            {
                "name": "User Settings",
                "link": "/user-management/settings",
                "icon": <IoMdHome size={22} />
            },

        ]
    },
    {
        "name": "Leads Management",
        "link": "/leads-management",
        "icon": <HiOutlineUserGroup />,
        "subLinks": [
            {
                "name": "Leads Analytics",
                "link": "/leads-management/leads-analytics",
                "icon": <IoMdHome size={22} />,
            },
            {
                "name": "Leads",
                "link": "/leads-management/leads",
                "icon": <IoMdHome size={22} />,
            },
            // {
            //     "name": "Leads Settings",
            //     "link": "/leads-management/settings",
            //     "icon": <IoMdHome size={22} />
            // },

        ]
    },
    {
        "name": "Talent acquisition",
        "link": "/talent-acquisition",
        "icon": <HiOutlineUserGroup />,
        "subLinks": [
            {
                "name": "Analytics",
                "link": "/talent-acquisition/analytics",
                "icon": <IoMdHome size={22} />,
            },
            {
                "name": "Applications",
                "link": "/talent-acquisition/applications",
                "icon": <IoMdHome size={22} />,
            },
            // {
            //     "name": "Leads Settings",
            //     "link": "/leads-management/settings",
            //     "icon": <IoMdHome size={22} />
            // },

        ]
    },

    {
        "name": "Feedback",
        "link": "/feedback",
        "icon": <RiFeedbackFill />
    },


    {
        "name": "Reports",
        "link": "/reports"
    },
    {
        "name": "Analytics",
        "link": "/analytics"
    },
    {
        "name": "Help",
        "link": "/help"
    }
];