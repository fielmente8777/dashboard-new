import {
  BadgePercent,
  BedDouble,
  BookOpen,
  Bot,
  BrainCircuit,
  CalendarCheck,
  CalendarDays,
  ChartNoAxesCombined,
  CircleHelp,
  ClipboardList,
  ConciergeBell,
  Contact,
  CreditCard,
  Eye,
  FileSpreadsheet,
  FileText,
  Globe,
  Hotel,
  Image,
  LayoutDashboard,
  LayoutList,
  Mail,
  MapPin,
  Megaphone,
  MessagesSquare,
  Newspaper,
  Package,
  Palette,
  PenLine,
  PhoneCall,
  ReceiptText,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Tags,
  Users,
} from "lucide-react";
import { createElement } from "react";
import { FaMeta, FaWhatsapp } from "react-icons/fa6";
import { SiGoogleads, SiGoogleanalytics } from "react-icons/si";
import { SOCIAL_PORTAL_URL } from "../config/env";

// Every icon is drawn in the text colour, so the menu reads as one set.
const top = (icon) => createElement(icon, { size: 18, strokeWidth: 1.75 });
const sub = (icon) => createElement(icon, { size: 15, strokeWidth: 1.75 });
const brand = (icon) => createElement(icon, { size: 14 });

// The dashboard menu.
//   key    - on a top-level entry: the access area that shows it
//            (see accessScopeMap in pages/UserMgmt/userAccess.js)
//            on a sub-link: the subscription app that shows it
//   access - on a sub-link: the same check as a top-level `key`, for pages
//            that were top-level before being grouped
// A group with no visible sub-link is hidden.
export const SidebarData = [
  {
    name: "Dashboard",
    link: ``,
    icon: top(LayoutDashboard),
  },
  {
    name: "Live Chat",
    link: `channel`,
    key: "WhatsApp",
    icon: top(MessagesSquare),
    subLinks: [
      { name: "WhatsApp", link: `channel/wa/chat`, icon: brand(FaWhatsapp) },
    ],
  },
  {
    name: "Leads",
    link: `leads-management`,
    key: "Leads Management",
    icon: top(Users),
    subLinks: [
      { name: "All leads", link: `leads-management/all-leads`, icon: sub(LayoutList) },
      { name: "Meta", link: `leads-management/meta-leads`, icon: brand(FaMeta) },
      { name: "WhatsApp", link: `leads-management/whatsapp`, icon: brand(FaWhatsapp) },
      { name: "Webform", link: `leads-management/webform-leads`, icon: sub(FileSpreadsheet) },
      { name: "Eazbot", link: `leads-management/eazbot-leads`, icon: sub(Bot) },
      { name: "Visitors", link: `leads-management/all-visitors`, icon: sub(Eye) },
    ],
  },
  {
    name: "Contacts",
    link: `contacts`,
    icon: top(Contact),
  },
  {
    name: "Marketing",
    link: `marketing`,
    icon: top(Megaphone),
    subLinks: [
      {
        name: "WhatsApp campaigns",
        link: `marketing/whatsapp-marketing`,
        access: "WhatsApp",
        icon: brand(FaWhatsapp),
      },
      {
        name: "Email campaigns",
        link: `marketing/email-marketing`,
        access: "WhatsApp",
        icon: sub(Mail),
      },
      { name: "Newsletter", link: `newsletter`, icon: sub(Newspaper) },
      {
        name: "Social media",
        link: SOCIAL_PORTAL_URL,
        access: "Social Media",
        icon: sub(Share2),
      },
    ],
  },
  {
    name: "Calls",
    key: "Exotel",
    link: `calls-management`,
    icon: top(PhoneCall),
  },
  {
    name: "Insights",
    link: `insights`,
    icon: top(ChartNoAxesCombined),
    subLinks: [
      {
        name: "Google Analytics",
        link: `insights-analytics/google-analytics`,
        access: "Google Analytics",
        icon: brand(SiGoogleanalytics),
      },
      {
        name: "Google Ads",
        link: `google-ads-insights`,
        access: "Google Ads Insights",
        icon: brand(SiGoogleads),
      },
      {
        name: "Meta",
        link: `meta-insights`,
        access: "Meta Insights",
        icon: brand(FaMeta),
      },
    ],
  },
  {
    name: "SEO",
    key: "SEO",
    link: `seo`,
    icon: top(Search),
    subLinks: [
      { name: "Local SEO", link: `seo/local-seo`, icon: sub(MapPin) },
      { name: "Website SEO", link: `seo/website-seo`, icon: sub(Globe) },
    ],
  },
  {
    name: "Booking Engine",
    key: "Booking Engine",
    link: `booking-engine`,
    icon: top(CalendarCheck),
    subLinks: [
      { name: "Rooms setup", link: `booking-engine/rooms-setup`, icon: sub(BedDouble) },
      { name: "Rooms & inventory", link: `booking-engine/rooms-and-inventory`, icon: sub(Package) },
      { name: "Price packages", link: `booking-engine/price-packages`, icon: sub(Tags) },
      { name: "Ads packages", link: `booking-engine/ads-packages`, icon: sub(Megaphone) },
      { name: "Customization", link: `booking-engine/customization`, icon: sub(Palette) },
    ],
  },
  {
    name: "Front Office",
    link: `front-office`,
    icon: top(Hotel),
    subLinks: [
      {
        name: "Reservation desk",
        link: `reservation-desk`,
        access: "Reservation Desk",
        icon: sub(ClipboardList),
      },
      {
        name: "Front desk",
        link: `front-desk`,
        access: "Front Desk",
        icon: sub(ConciergeBell),
      },
      {
        name: "Guest requests",
        link: `grm/all-requests`,
        access: "GRM",
        icon: sub(MessagesSquare),
      },
      {
        name: "Request settings",
        link: `grm/settings`,
        access: "GRM",
        icon: sub(Settings),
      },
    ],
  },
  {
    name: "Website Content",
    link: `cms`,
    key: "CMS",
    icon: top(Globe),
    subLinks: [
      { name: "Profile and links", link: `cms/profile-and-links`, icon: sub(Contact) },
      { name: "Gallery", link: `cms/gallery`, icon: sub(Image) },
      { name: "Offers", link: `cms/offers`, icon: sub(BadgePercent) },
      { name: "Events", link: `cms/events`, icon: sub(CalendarDays) },
      { name: "Blogs", link: `cms/blogs`, icon: sub(PenLine) },
      { name: "FAQ", link: `cms/faq`, icon: sub(CircleHelp) },
      { name: "Privacy policy", link: `cms/privacy-policy`, icon: sub(ShieldCheck) },
      { name: "Terms & conditions", link: `cms/terms-and-conditions`, icon: sub(FileText) },
      {
        name: "Cancellation & refund",
        link: `cms/cancellation-and-refund-policy`,
        icon: sub(ReceiptText),
      },
    ],
  },
  {
    name: "AI Assistant",
    link: `ai`,
    icon: top(BrainCircuit),
    subLinks: [
      { name: "Knowledge base", link: `knowledge-base`, icon: sub(BookOpen) },
      { name: "AI training", link: `ai-training`, icon: sub(Bot) },
    ],
  },
  {
    name: "Payment Gateway",
    link: `payment-gateway`,
    icon: top(CreditCard),
  },
];
