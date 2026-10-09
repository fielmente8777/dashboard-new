import {
  BarChart3,
  ClipboardList,
  Globe,
  Link2,
  ListChecks,
  Mail,
  Map,
  MapPin,
  Megaphone,
  MessageCircle,
  MessageSquareText,
  MessagesSquare,
  MonitorSmartphone,
  Newspaper,
  RadioTower,
  ReceiptText,
  Search,
  SlidersHorizontal,
  TrendingUp,
} from "lucide-react";
import { PAGES } from "../../routes/paths";

// Everything listed in the EazStore drawer. To add a service: add a line to
// one of the groups. `page` is a key of PAGES in routes/paths.js.
export const SERVICE_GROUPS = [
  {
    title: "Premium services",
    description: "Done for you by the Eazotel team.",
    services: [
      {
        name: "OTA Listing",
        description: "Get listed on the booking sites",
        icon: ListChecks,
        page: PAGES.OTA_LISTING,
      },
      {
        name: "OTA Optimization",
        description: "Rank higher on booking sites",
        icon: SlidersHorizontal,
        page: PAGES.OTA_OPTIMIZATION,
      },
      {
        name: "OTA Management",
        description: "Rates and listings handled for you",
        icon: TrendingUp,
        page: PAGES.OTA_MANAGEMENT,
      },
      {
        name: "GST Filing",
        description: "Returns filed on time",
        icon: ReceiptText,
        page: PAGES.GST_FILING,
      },
      {
        name: "Performance Marketing",
        description: "Paid ads that bring bookings",
        icon: BarChart3,
        page: PAGES.PERFORMANCE_MARKETING,
      },
      {
        name: "Public Relations (PR)",
        description: "Press and media coverage",
        icon: Newspaper,
        page: PAGES.PR,
      },
      {
        name: "Linktree Setup",
        description: "One link for all your pages",
        icon: Link2,
        page: PAGES.LINKTREE_SETUP,
      },
      {
        name: "Google Listing",
        description: "Your Google Business profile",
        icon: MapPin,
        page: PAGES.GOOGLE_LISTING,
      },
      {
        name: "Google Map Iterations",
        description: "Improve your Google Maps presence",
        icon: Map,
        page: PAGES.GOOGLE_MAP_ITERATIONS,
      },
      {
        name: "Influencer Marketing",
        description: "Creators who promote your stay",
        icon: Megaphone,
        page: PAGES.INFLUENCER_MARKETING,
      },
      {
        name: "Email Marketing",
        description: "Campaigns to your guest list",
        icon: Mail,
        page: PAGES.MARKETING_EMAIL,
      },
      {
        name: "WhatsApp Marketing",
        description: "Broadcasts on WhatsApp",
        icon: MessageCircle,
        page: PAGES.WHATSAPP_MARKETING_SERVICE,
      },
    ],
  },
  {
    title: "Other services",
    description: "Tools you can use yourself.",
    services: [
      {
        name: "Conversational Tool",
        description: "All guest chats in one inbox",
        icon: MessagesSquare,
        page: PAGES.CONVERSATIONAL_TOOL,
      },
      {
        name: "Custom Website",
        description: "A website built for your property",
        icon: Globe,
        page: PAGES.CUSTOM_WEBSITE,
      },
      {
        name: "SEO",
        description: "Be found on Google",
        icon: Search,
        page: PAGES.SEO,
      },
      {
        name: "Channel Manager",
        description: "Sync rooms across booking sites",
        icon: RadioTower,
        page: PAGES.CHANNEL_MANAGER,
      },
      {
        name: "Leads Management",
        description: "Track every enquiry",
        icon: ClipboardList,
        page: PAGES.LEADS_ALL,
      },
      {
        name: "PMS Software",
        description: "Run day-to-day hotel operations",
        icon: MonitorSmartphone,
        page: PAGES.PMS_SOFTWARE,
      },
      {
        name: "SMS Marketing",
        description: "Offers by text message",
        icon: MessageSquareText,
        page: PAGES.SMS_MARKETING_SERVICE,
      },
    ],
  },
];
