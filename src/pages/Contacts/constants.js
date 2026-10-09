export const PAGE_SIZE = 10;

// values are what the backend stores in `added_from`
export const CONTACT_SOURCES = [
  { value: "google_ads", label: "Google Ads" },
  { value: "meta", label: "Meta Leads" },
  { value: "website", label: "Website" },
  { value: "Eazobot", label: "Eazbot" },
  { value: "web-form", label: "Webform" },
  { value: "landing-page", label: "Landing Page" },
  { value: "Call", label: "Call" },
];

export const getSourceLabel = (value) =>
  CONTACT_SOURCES.find((source) => source.value === value)?.label ||
  value?.replace(/[_-]/g, " ") ||
  "—";
