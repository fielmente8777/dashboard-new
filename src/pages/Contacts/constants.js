export const PAGE_SIZE = 25;

// values are what the backend stores in `added_from`
// `tone` is the Badge colour on the Contacts page
export const CONTACT_SOURCES = [
  { value: "google_ads", label: "Google Ads", tone: "blue" },
  { value: "meta", label: "Meta Leads", tone: "sky" },
  { value: "website", label: "Website", tone: "purple" },
  { value: "Eazobot", label: "Eazbot", tone: "purple" },
  { value: "web-form", label: "Webform", tone: "amber" },
  { value: "landing-page", label: "Landing Page", tone: "amber" },
  { value: "Call", label: "Call", tone: "green" },
  { value: "email-campaign", label: "Email campaign", tone: "sky" },
  // added through email marketing (imports, links, campaign lists, the newsletter box)
  { value: "import", label: "Imported list", tone: "sky" },
  { value: "email_list", label: "Email list", tone: "sky" },
  { value: "newsletter", label: "Newsletter", tone: "sky" },
  { value: "manual", label: "Added by the team", tone: "gray" },
];

export const getSourceTone = (value) =>
  CONTACT_SOURCES.find((source) => source.value === value)?.tone || "gray";

export const getSourceLabel = (value) =>
  CONTACT_SOURCES.find((source) => source.value === value)?.label ||
  value?.replace(/[_-]/g, " ") ||
  "—";
