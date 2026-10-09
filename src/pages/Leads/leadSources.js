// One entry per leads list page. They all share LeadsList; this says what
// each one shows.
//   createdFrom    - the source the page is limited to ("" = every source)
//   columns        - column keys, in order (see LeadsTable)
//   sourceFilter   - offer the "Source" filter
//   campaignFilter - offer the campaign filter (fills the search)
//   canAdd / canImport / canSync - header actions
//   exportNeedsOtp - ask for a date range and a one-time password before exporting
//   live           - refresh when a new lead arrives over the websocket
const BASE_COLUMNS = [
  "created",
  "name",
  "phone",
  "email",
  "notes",
  "assignee",
  "stage",
  "turnAway",
];

const withColumns = (...extra) => {
  const columns = [...BASE_COLUMNS];
  // "source" goes after the time, "campaign" after the notes
  if (extra.includes("source")) columns.splice(1, 0, "source");
  if (extra.includes("campaign")) {
    columns.splice(columns.indexOf("notes") + 1, 0, "campaign");
  }
  return columns;
};

export const LEAD_SOURCES = {
  all: {
    key: "all",
    title: "All Leads",
    description: "Every enquiry, from every source, in one place.",
    createdFrom: "",
    columns: withColumns("source", "campaign"),
    sourceFilter: true,
    canAdd: true,
    canImport: true,
    exportNeedsOtp: true,
  },
  meta: {
    key: "meta",
    title: "Meta Leads",
    description: "Leads from your Facebook and Instagram lead forms.",
    createdFrom: "facebook",
    columns: withColumns("campaign"),
    campaignFilter: true,
    canSync: true,
    live: true,
  },
  whatsapp: {
    key: "whatsapp",
    title: "WhatsApp Leads",
    description: "People who reached you on WhatsApp.",
    createdFrom: "whatsapp",
    columns: BASE_COLUMNS,
  },
  googleAds: {
    key: "googleAds",
    title: "Google Ads Leads",
    description: "Leads from your Google Ads campaigns.",
    createdFrom: "google_ads",
    columns: BASE_COLUMNS,
  },
  webform: {
    key: "webform",
    title: "Webform Leads",
    description: "Enquiries sent from the forms on your website.",
    createdFrom: "webform",
    columns: BASE_COLUMNS,
  },
  eazbot: {
    key: "eazbot",
    title: "Eazbot Leads",
    description: "Enquiries collected by your Eazbot chatbot.",
    createdFrom: "eazbot",
    columns: BASE_COLUMNS,
  },
  visitors: {
    key: "visitors",
    title: "All Visitors",
    description: "Visitors who left their details on your website.",
    createdFrom: "visitors",
    columns: BASE_COLUMNS,
  },
};

export const NOTES_FILTERS = [
  { value: "", label: "All" },
  { value: "true", label: "Has notes" },
  { value: "false", label: "No notes" },
];

// how many leads can be selected (and deleted) at once
export const MAX_SELECTED_LEADS = 10;
