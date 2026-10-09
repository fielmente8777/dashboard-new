// What a team member can be given access to, per location.

// the access areas offered when creating or editing a user
export const accessRoles = [
  "CMS",
  "Social Media",
  "Front Desk",
  "Seo Manager",
  "Theme Manager",
  "Booking Engine",
  "Reservation Desk",
  "Channel Manager",
  "Food Manager",
  "Gateway Manager",
  "Enquiries Management",
  "Meta Leads",
  "Analytics Reporting",
  "Conversational Tool",
  "Eazobot",
  "Email Marketing",
  "Lead Gen Form",
  "SMS Marketing",
  "User Management",
  "WhatsApp Marketing",
  "FrontDesk",
  "Themes Manager",
  "SEO Manager",
  "Payment Gateway",
  "GRM",
  "HRM",
];

export const accessScopeMap = {
  CMS: "cms",
  "Booking Engine": "bookingEngine",
  "Front Desk": "frontDesk",
  "Social Media": "social_media",
  "Enquiries Management": "enquiriesManagement",
  "Reservation Desk": "booking_engine",
  // Frontdesk: "frontDesk",
  // "Channel Manager": "channelManager",
  "Seo Manager": "seoManager",
  // "Food Manager": "foodManager",
  // "Themes Manager": "themes",
  "Payment Gateway": "gatewayManager",
  "Leads Form": "leadgenform",
  // HRM: "humanResourceManagement",
  GRM: "grm",
  // "Analytics Reporting": "analyticsandreporting",
  // "Conversational Tool": "conversationaltool",
  Eazobot: "eazbot",
  "Email Marketing": "emailmarketing",
  "SMS Marketing": "smsmarketing",
  "User Management": "usermanagement",
  "WhatsApp Marketing": "whatsapp",
  WhatsApp: "whatsapp",
  // whatsapp: "whatsapp",
  // Exotel: "exotel",
  Exotel: "humanResourceManagement",
  "Leads Management": "enquiriesManagement",
  "Google Ads Insights": "googleadsinsights",
  "Google Analytics": "analyticsandreporting",
  "Meta Insights": "analyticsandreporting",
};

export const appAccessScopeMap = {
  "Leads Management": "leadsManagement",
};

// Every permission a new user starts with (all off). The keys are what the
// users API stores; they are not all the same as the keys in accessScopeMap.
export const NO_PERMISSIONS = {
  analyticsandreporting: false,
  bookingEngine: false,
  channelManager: false,
  cms: false,
  conversationaltool: false,
  eazobot: false,
  emailmarketing: false,
  enquiriesManagement: false,
  foodManager: false,
  frontDesk: false,
  gatewayManager: false,
  guestRequestManagement: false,
  humanResourceManagement: false,
  leadgenform: false,
  reservationDesk: false,
  seoManager: false,
  smsmarketing: false,
  socialMedia: false,
  themes: false,
  usermanagement: false,
  whatsappmarketing: false,
};

// the API stores "on" as the string "true" or as a boolean
export const isGranted = (value) => value === true || value === "true";
