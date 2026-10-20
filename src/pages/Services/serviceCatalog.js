import {
  BarChart3,
  Calculator,
  Globe,
  Link2,
  ListChecks,
  Map,
  MapPin,
  Megaphone,
  MessageCircle,
  MessageSquareText,
  MonitorSmartphone,
  Newspaper,
  Palette,
  RadioTower,
  ReceiptText,
  Share2,
  SlidersHorizontal,
  TrendingUp,
} from "lucide-react";
import { SOCIAL_PORTAL_LOGIN_URL } from "../../config/env";

// The EazStore service pages (see ServicePage). One entry per page:
//   name        - must match an entry of MarketPlaceService (data/constant.js),
//                 so the interest dialog opens with it selected
//   kind        - "done-for-you" (our team does it) | "coming-soon"
//   included    - what the service covers
//   benefits    - { title, text } cards
//   platforms   - optional chips (e.g. the OTAs we list on)
//   plans       - optional price cards
//   link        - optional { label, href } to an outside tool
export const SERVICES = {
  otaListing: {
    name: "OTA Listing",
    icon: ListChecks,
    kind: "done-for-you",
    tagline: "Get listed on the booking sites your guests use.",
    intro:
      "Our OTA (Online Travel Agency) Listing service gets your property listed across the top booking platforms to maximize your visibility and boost occupancy. We make sure your property stands out with well-crafted profiles and optimized content.",
    platforms: ["Booking.com", "Airbnb", "Agoda", "MakeMyTrip", "Expedia", "Goibibo", "Cleartrip", "Trip.com"],
    included: [
      "Property profile creation",
      "Content writing (title, description, amenities)",
      "Image uploading and optimization",
      "Room/category setup with pricing & availability",
      "Policy configuration (cancellation, check-in/out, etc.)",
      "SEO optimization for listings",
      "OTA account management support",
    ],
    benefits: [
      { title: "End-to-end onboarding", text: "We handle the setup on every platform for you." },
      { title: "Always up to date", text: "Your listings stay current and competitive." },
      { title: "Issue support", text: "We help resolve OTA issues and improve your rankings regularly." },
    ],
  },

  otaOptimization: {
    name: "OTA Optimization",
    icon: SlidersHorizontal,
    kind: "done-for-you",
    tagline: "Rank higher and convert more on booking sites.",
    intro:
      "Our OTA Optimization service makes sure your property performs its best on platforms like Booking.com, Airbnb and Agoda. Through data-driven insights and strategic improvements, we increase your visibility, ranking and conversion on every connected OTA.",
    included: [
      "Profile audit & optimization suggestions",
      "Improved property descriptions and content",
      "Dynamic pricing strategy alignment",
      "Room & rate plan adjustments",
      "Optimized images and amenity tagging",
      "Review management & response templates",
      "Ranking boost tactics (promo, visibility boosters)",
      "Competitive analysis & market benchmarking",
    ],
    benefits: [
      { title: "Higher visibility", text: "Better OTA ranking puts you in front of more guests." },
      { title: "Better conversion", text: "More bookings with an improved guest experience." },
      { title: "Fewer cancellations", text: "Better guest targeting means fewer drop-offs." },
    ],
  },

  otaManagement: {
    name: "OTA Management",
    icon: TrendingUp,
    kind: "done-for-you",
    tagline: "Rates and listings handled for you, every day.",
    intro:
      "We manage your property on the booking platforms day to day, so your rates, availability and content stay right without you logging in to each one. Through data-driven insights and strategic improvements, we keep your visibility, ranking and conversion growing.",
    included: [
      "Profile audit & optimization suggestions",
      "Improved property descriptions and content",
      "Dynamic pricing strategy alignment",
      "Room & rate plan adjustments",
      "Optimized images and amenity tagging",
      "Review management & response templates",
      "Ranking boost tactics (promo, visibility boosters)",
      "Competitive analysis & market benchmarking",
    ],
    benefits: [
      { title: "Higher visibility", text: "Better OTA ranking puts you in front of more guests." },
      { title: "Better conversion", text: "More bookings with an improved guest experience." },
      { title: "Fewer cancellations", text: "Better guest targeting means fewer drop-offs." },
    ],
  },

  accounting: {
    name: "Accounting",
    icon: Calculator,
    kind: "done-for-you",
    tagline: "Books, cash flow and reports, kept for you.",
    intro:
      "Our accounting service is designed for hospitality businesses. We manage your financial records, cash flow, revenue tracking and cost allocation, so your property stays profitable and follows financial best practice.",
    included: [
      "Daily revenue and expense tracking",
      "Income statement and balance sheet preparation",
      "Cash flow monitoring and reporting",
      "Bank reconciliation and ledger maintenance",
      "Vendor payments and receivables management",
      "Budgeting and forecasting support",
      "Financial insights and profitability analysis",
      "Collaboration with GST filing and tax compliance",
    ],
    benefits: [
      { title: "Clear financial health", text: "See how your property is really doing." },
      { title: "Lower costs", text: "Optimized bookkeeping reduces operating costs." },
      { title: "Audit-ready", text: "Organized, transparent records at all times." },
      { title: "Smarter decisions", text: "Decide based on up-to-date numbers." },
    ],
  },

  gstFiling: {
    name: "GST Filing",
    icon: ReceiptText,
    kind: "done-for-you",
    tagline: "Your GST returns filed accurately and on time.",
    intro:
      "Our GST Filing service keeps your property business fully compliant with government tax rules. From accurate invoicing to timely returns, we take the hassle out of your monthly and quarterly GST responsibilities.",
    included: [
      "Monthly/quarterly GST return preparation and filing",
      "Input tax credit (ITC) reconciliation and tracking",
      "GST invoice format compliance",
      "E-way bill and document support (if applicable)",
      "Handling of notices or queries from the GST portal",
      "Coordination with accounting for accurate data",
      "GST audit and annual return support",
    ],
    benefits: [
      { title: "Fully compliant", text: "Stay 100% compliant with tax laws." },
      { title: "No penalties", text: "Avoid penalties and interest on late filings." },
      { title: "More tax credit", text: "Claim the most input tax credit you can." },
      { title: "Credibility", text: "Keep your business professional and trusted." },
    ],
  },

  performanceMarketing: {
    name: "Performance Marketing",
    icon: BarChart3,
    kind: "done-for-you",
    tagline: "Paid ads that bring bookings, not just clicks.",
    intro:
      "We run data-driven campaigns on Google Ads, Facebook and Instagram to bring in qualified leads, increase visibility and maximize the return on your ad spend (ROAS).",
    included: [
      "Search & display ads management",
      "Facebook & Instagram campaign setup",
      "Landing page A/B testing & conversion tracking",
      "Weekly performance optimization",
      "Analytics & reporting",
    ],
    benefits: [
      { title: "Qualified leads", text: "Reach guests who are ready to book." },
      { title: "Better ROAS", text: "Every rupee of ad spend works harder." },
      { title: "Clear reporting", text: "Know exactly what your campaigns deliver." },
    ],
  },

  publicRelations: {
    name: "Public Relations (PR)",
    icon: Newspaper,
    kind: "done-for-you",
    tagline: "Press and media coverage for your property.",
    intro:
      "Build a strong brand reputation through curated press releases, influencer outreach and media partnerships.",
    included: [
      "Press release creation & distribution",
      "Media outreach & coordination",
      "Reputation monitoring",
    ],
    benefits: [
      { title: "Brand visibility", text: "Get your property in front of new audiences." },
      { title: "Earned trust", text: "Media mentions build credibility." },
      { title: "Organic growth", text: "Grow your reputation without paid ads." },
    ],
  },

  influencerMarketing: {
    name: "Influencer Marketing",
    icon: Megaphone,
    kind: "done-for-you",
    tagline: "Creators who promote your stay.",
    intro:
      "Use the reach of influencers to grow your brand with curated stays, reviews and social media content.",
    included: [
      "Influencer shortlisting & outreach",
      "Collaboration coordination & logistics",
      "Content usage rights & repost strategy",
    ],
    benefits: [
      { title: "Wider reach", text: "Tap into audiences that trust the creator." },
      { title: "Authentic content", text: "Real stays, real reviews, real photos." },
      { title: "Reusable assets", text: "Content you can repost on your own channels." },
    ],
  },

  socialMedia: {
    name: "Social Media",
    icon: Share2,
    kind: "done-for-you",
    tagline: "Posts, stories and reels, managed for you.",
    intro:
      "Full social media management: posts, stories, reels, engagement and insight tracking.",
    included: [
      "Monthly content calendar",
      "High-quality graphics & captions",
      "Engagement & follower growth strategy",
    ],
    benefits: [
      { title: "Always active", text: "A steady stream of content every month." },
      { title: "On-brand", text: "Graphics and captions that match your property." },
      { title: "Growing audience", text: "A plan to grow followers and engagement." },
    ],
    link: { label: "Open social media dashboard", href: SOCIAL_PORTAL_LOGIN_URL },
  },

  linktree: {
    name: "Linktree Setup",
    icon: Link2,
    kind: "done-for-you",
    tagline: "One link for all your pages.",
    intro:
      "Get a custom Linktree page that brings all your important links (website, OTAs, WhatsApp, social media and more) together in one clean, mobile-friendly page.",
    included: [
      "Custom layout and design",
      "Link tracking integration",
      "Embedded WhatsApp & call buttons",
    ],
    benefits: [
      { title: "One link everywhere", text: "Use it in bios, messages and QR codes." },
      { title: "Mobile-first", text: "Looks right on every phone." },
      { title: "Measurable", text: "See which links guests open." },
    ],
  },

  googleListing: {
    name: "Google Listing",
    icon: MapPin,
    kind: "done-for-you",
    tagline: "A Google Business profile that brings guests in.",
    intro:
      "We set up and optimize your Google Business Profile to improve local SEO, manage reviews, and get you more visibility on Google Maps and in search results.",
    included: [
      "Business profile setup or audit",
      "Category, hours, and location updates",
      "Review management support",
    ],
    benefits: [
      { title: "Found locally", text: "Show up when guests search nearby." },
      { title: "Accurate details", text: "Correct hours, photos and contact info." },
      { title: "Stronger reviews", text: "Support to collect and answer reviews." },
    ],
  },

  googleMapIterations: {
    name: "Google Map Iterations",
    icon: Map,
    kind: "done-for-you",
    tagline: "Get your Maps pin right and easy to find.",
    intro:
      "We correct, optimize or update your location pin and how you appear on Google Maps, for better discoverability and accurate directions.",
    included: [
      "Location accuracy checks",
      "Map tagging & keyword optimization",
      "Issue resolution (duplicate listing, wrong location, etc.)",
    ],
    benefits: [
      { title: "Accurate directions", text: "Guests arrive at the right place." },
      { title: "Better discoverability", text: "Appear for the right map searches." },
      { title: "Clean listing", text: "Duplicates and wrong pins removed." },
    ],
  },

  whatsappMarketing: {
    name: "WhatsApp Marketing",
    icon: MessageCircle,
    kind: "done-for-you",
    tagline: "Reach guests where they already chat.",
    intro:
      "Use WhatsApp as a direct channel to connect with guests, promote offers and send booking confirmations.",
    included: [
      "Broadcast campaign setup",
      "Quick replies and automation templates",
      "Link integration for direct bookings",
    ],
    benefits: [
      { title: "High open rates", text: "Messages guests actually read." },
      { title: "Direct bookings", text: "Booking links right in the chat." },
      { title: "Less manual work", text: "Automated replies and templates." },
    ],
  },

  smsMarketing: {
    name: "SMS Marketing",
    icon: MessageSquareText,
    kind: "done-for-you",
    tagline: "Offers and updates by text message.",
    intro:
      "Reach past and potential guests with text messages for offers, reminders and booking updates.",
    included: [
      "Campaign setup and sending",
      "Message templates",
      "Delivery reports",
    ],
    benefits: [
      { title: "Works on every phone", text: "No app or internet needed." },
      { title: "Read quickly", text: "Text messages are opened fast." },
      { title: "Timely reminders", text: "Offers and updates at the right moment." },
    ],
  },

  customWebsite: {
    name: "Custom Website",
    icon: Globe,
    kind: "done-for-you",
    tagline: "A website built for your property.",
    intro: "Choose the plan that fits your project. Every plan includes a custom design and a mobile-friendly site.",
    plans: [
      {
        name: "Landing Page",
        price: "$499",
        features: ["Single high-converting page", "Custom design", "Mobile responsive", "Basic SEO", "Contact form", "1 week delivery"],
      },
      {
        name: "Business Website",
        price: "$1,499",
        popular: true,
        features: ["Up to 5 pages", "Custom design", "Mobile responsive", "Basic SEO", "Contact form", "1 month support"],
      },
      {
        name: "Multi-Location CMS",
        price: "$3,499",
        features: ["Multi-location support", "CMS integration (e.g. WordPress)", "Custom design", "Advanced SEO", "Up to 20 pages", "3 months support"],
      },
      {
        name: "Single Page + Booking",
        price: "$2,499",
        features: ["Single page design", "Integrated booking engine", "Mobile responsive", "Custom design", "Payment integration", "2 months support"],
      },
    ],
  },

  channelManager: {
    name: "Channel Manager",
    icon: RadioTower,
    kind: "coming-soon",
    tagline: "Sync rooms and rates across booking sites.",
    intro:
      "Keep availability and rates in sync on every booking site from one place, so you never get double bookings. We are building it now - tell us you are interested and we will let you know when it is ready.",
  },

  pmsSoftware: {
    name: "PMS Software",
    icon: MonitorSmartphone,
    kind: "coming-soon",
    tagline: "Run day-to-day hotel operations.",
    intro:
      "A property management system for your day-to-day operations, connected to the rest of your dashboard. We are building it now - tell us you are interested and we will let you know when it is ready.",
  },

  themesManager: {
    name: "Custom Website",
    title: "Themes Manager",
    icon: Palette,
    kind: "coming-soon",
    tagline: "Change your website's look in a few clicks.",
    intro:
      "Pick and customize themes for your Eazotel website. We are building it now - tell us you are interested and we will let you know when it is ready.",
  },
};
