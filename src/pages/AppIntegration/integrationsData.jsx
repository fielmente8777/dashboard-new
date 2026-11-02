import { KeyRound, PhoneCall } from "lucide-react";
import { FaMeta } from "react-icons/fa6";
import { IoLogoWhatsapp } from "react-icons/io";
import { MdOutlineStorefront, MdOutlineTrackChanges } from "react-icons/md";
import { SiGoogleads, SiGoogleanalytics } from "react-icons/si";
import { PAGES } from "../../routes/paths";
import GmailIcon from "./GmailIcon";


export const CATEGORIES = ["All", "Messaging", "Leads & ads", "Analytics"];

// Every app the dashboard can connect to.
//   slug       - its page: /integration/<slug>
//   statusKey  - where integrationStatus says it is connected (dot path)
//   disconnectId - what /integration/update clears (defaults to statusKey)
//   access     - subscription.appAccess key that unlocks it
//   openPage   - dashboard page to manage it once connected (openLabel names it)
//   comingSoon - shown but not connectable yet
//   features   - what it adds to the dashboard, shown on its page
//   steps      - how connecting works, shown on its page
//   providerUrl - the app's own dashboard, for things only it can change
export const INTEGRATIONS = [
  {
    id: "metaWhatsapp",
    slug: "whatsapp",
    name: "WhatsApp Business",
    description: "Chat with guests, send templates and run campaigns from the dashboard.",
    icon: <IoLogoWhatsapp className="size-6 text-[#25D366]" />,
    category: "Messaging",
    statusKey: "metaWhatsapp",
    access: "whatsapp",
    openPage: PAGES.CHAT_WHATSAPP,
    openLabel: "Open WhatsApp chats",
    providerUrl: "https://business.facebook.com/wa/manage/home/",
    features: [
      "Reply to guests from the shared inbox",
      "Send approved message templates and broadcasts",
      "AI replies and automatic follow-ups",
      "Leads created from new conversations",
    ],
    steps: [
      "Click Connect and sign in with the Facebook account that manages your business.",
      "Pick or create your WhatsApp Business account and phone number.",
      "Verify the number with the code Meta sends you.",
    ],
  },
  {
    id: "gmail",
    slug: "gmail",
    name: "Gmail",
    description: "Read and reply to your hotel's email inside the dashboard.",
    icon: <GmailIcon />,
    category: "Messaging",
    statusKey: "gmail",
    openPage: PAGES.EAZMAIL,
    openLabel: "Open EazMail",
    features: [
      "Your inbox inside the dashboard",
      "Booking enquiries turned into leads",
      "Reply without switching apps",
    ],
    steps: [
      "Click Connect and choose the Google account of your hotel's mailbox.",
      "Allow Eazotel to read and send mail for it.",
    ],
  },
  {
    id: "exotel",
    slug: "exotel",
    name: "Exotel",
    description: "Call guests from the dashboard and record every call on your Exotel number.",
    icon: <PhoneCall className="size-6 text-[#2BB673]" />,
    category: "Messaging",
    statusKey: "exotel",
    access: "exotel",
    openPage: PAGES.CALLS,
    openLabel: "Open calls",
    providerUrl: "https://my.exotel.com/",
    features: [
      "Click-to-call from leads, chats and the calls list",
      "Recordings and outcomes saved for every call",
      "Incoming calls on your Exotel number listed too",
      "Live wallet balance, so calls never fail unannounced",
    ],
    steps: [
      "In my.exotel.com open Settings → API and copy the API key, API token and Account SID.",
      "Note your subdomain (api.exotel.com, or api.in.exotel.com for the Mumbai cluster).",
      "Click Connect, paste them with your Exotel virtual number and save.",
    ],
  },
  {
    id: "otp-less",
    slug: "otpless",
    name: "OTPless",
    description: "Let guests sign in with WhatsApp or phone, without passwords.",
    icon: <KeyRound className="size-6 text-[#6366F1]" />,
    category: "Messaging",
    providerUrl: "https://otpless.com/dashboard",
    features: ["One-tap guest sign-in on your booking engine", "No passwords to forget"],
    steps: [
      "In the OTPless dashboard copy your Client ID and Client secret.",
      "Click Connect and paste them.",
    ],
  },
  {
    id: "meta",
    slug: "meta-lead-ads",
    name: "Meta lead ads",
    description: "Bring leads from Facebook and Instagram lead forms straight in.",
    icon: <FaMeta className="size-6 text-[#0281F0]" />,
    category: "Leads & ads",
    statusKey: "meta",
    access: "meta",
    openPage: PAGES.LEADS_META,
    openLabel: "Open Meta leads",
    providerUrl: "https://business.facebook.com/latest/instant_forms",
    features: [
      "New form leads arrive within seconds",
      "Page reach and engagement insights",
      "Bulk import of older form leads",
    ],
    steps: [
      "Click Connect and sign in with the Facebook account that manages your page.",
      "Allow access to the page and its lead forms.",
    ],
  },
  {
    id: "googleadsinsights",
    slug: "google-ads",
    name: "Google Ads",
    description: "See spend, clicks and conversions from your Google Ads campaigns.",
    icon: <SiGoogleads className="size-6 text-[#4285F4]" />,
    category: "Leads & ads",
    statusKey: "googleAdsInsight.status",
    access: "googleadsinsights",
    openPage: PAGES.GOOGLE_ADS_INSIGHTS,
    openLabel: "Open Google Ads insights",
    providerUrl: "https://ads.google.com/",
    features: [
      "Spend, clicks and conversions per campaign",
      "Device and ad group breakdowns",
      "Compare campaigns side by side",
    ],
    steps: [
      "Click Connect and sign in with the Google account that has access to your Ads account.",
      "Open Google Ads insights and sync once to pull your accounts.",
    ],
  },
  {
    id: "gmb",
    slug: "google-business-profile",
    name: "Google Business Profile",
    description: "Manage reviews and see how guests find you on Google Maps.",
    icon: <MdOutlineStorefront className="size-6 text-[#4285F4]" />,
    category: "Leads & ads",
    openPage: PAGES.GMB_REVIEWS,
    openLabel: "Open Google reviews",
    providerUrl: "https://business.google.com/",
    features: [
      "Every Google review in one place",
      "AI-written replies you check before posting",
      "Autopilot: AI replies to new good reviews on its own",
    ],
    steps: [
      "Click Connect and sign in with the Google account that manages your Business Profile.",
      "Allow Eazotel to manage the listing.",
      "Come back to this tab: your listings are synced automatically.",
    ],
  },
  {
    id: "google_analytics",
    slug: "google-analytics",
    name: "Google Analytics",
    description: "Track website traffic and where your bookings come from.",
    icon: <SiGoogleanalytics className="size-6 text-[#E37400]" />,
    category: "Analytics",
    access: "google_analytics",
    openPage: PAGES.INSIGHTS_GOOGLE_ANALYTICS,
    openLabel: "Open Google Analytics",
    providerUrl: "https://analytics.google.com/",
    features: [
      "Visitors, sessions and traffic sources",
      "Search Console clicks and keywords",
      "Website numbers on your home dashboard",
    ],
    steps: [
      "Click Connect and sign in with the Google account that owns your website's Analytics.",
      "Pick the Analytics 4 property of your website.",
      "Optionally choose the Search Console site below.",
    ],
  },
  {
    id: "WebsiteTracking",
    slug: "website-tracking",
    name: "Website tracking",
    description: "See who visits your website and which pages they look at.",
    icon: <MdOutlineTrackChanges className="size-6 text-[#7C3AED]" />,
    category: "Analytics",
    statusKey: "WebsiteTracking",
    openPage: PAGES.WEBSITE_VISITORS,
    openLabel: "Open visitors",
    features: [
      "Every visitor and the pages they viewed",
      "Sessions and activity timelines",
    ],
    steps: [
      "Open Settings → Eazbot and finish the setup.",
      "Copy the code from the Install step into your website.",
    ],
  },
];

export const findIntegration = (slug) => INTEGRATIONS.find((app) => app.slug === slug);

// reads "googleAdsInsight.status" style paths
export const readPath = (object, path) =>
  path.split(".").reduce((value, key) => value?.[key], object);
