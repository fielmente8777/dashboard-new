// URL contract: Deep_Link_URL_Structure_for_Booking_Engine.pdf.
export const BOOKING_STEPS = [
  { value: "property-select", label: "Property selection" },
  { value: "search", label: "Calendar / search" },
  { value: "availability", label: "Room selection" },
  { value: "item", label: "Rate selection" },
  { value: "summary", label: "Summary (existing booking session)" },
  { value: "checkout", label: "Checkout (existing booking session)" },
  { value: "thank-you", label: "Thank you (completed booking)" },
];

export function createDeepLinkDefaults() {
  return {
    baseUrl: "", propertyId: "", language: "en", currency: "INR",
    step: "availability", includeDates: false, checkIn: "", checkOut: "",
    adults: "2", childGroups: [], expanded: true, promoCode: "", preferredRate: "",
    sessionId: "", packageId: "", roomId: "", rateId: "",
    utmSource: "", utmMedium: "", utmCampaign: "",
  };
}

export function localDateString(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function wholeNumber(value, minimum) {
  return /^\d+$/.test(String(value)) && Number.isSafeInteger(Number(value)) && Number(value) >= minimum;
}

const text = (value) => String(value ?? "").trim();
const privateParameters = new Set(["token", "access_token", "refresh_token", "authorization", "password", "api_key", "apikey"]);

export function validateDeepLink(config, today = localDateString()) {
  const errors = {};
  try {
    const url = new URL(text(config.baseUrl));
    if (!["https:", "http:"].includes(url.protocol) || !url.hostname || url.username || url.password) {
      errors.baseUrl = "Enter a public HTTP or HTTPS booking-engine URL without login credentials.";
    } else if ([...url.searchParams.keys()].some((key) => privateParameters.has(key.toLowerCase()))) {
      errors.baseUrl = "Use the public booking URL without dashboard tokens or API credentials.";
    } else if (url.hash) {
      errors.baseUrl = "Use the booking page URL without a # fragment.";
    }
  } catch {
    errors.baseUrl = "Enter the full booking-engine URL, starting with https://.";
  }
  if (!BOOKING_STEPS.some((step) => step.value === config.step)) errors.step = "Choose a booking step.";
  if (!wholeNumber(config.adults, 1)) errors.adults = "Enter at least one adult using a whole number.";
  if (text(config.language)) {
    try { Intl.getCanonicalLocales(text(config.language)); }
    catch { errors.language = "Enter a language tag such as en, th-TH or en-US."; }
  }
  if (text(config.currency) && !/^[A-Z]{3}$/.test(text(config.currency))) errors.currency = "Use a three-letter currency code such as INR, THB or EUR.";
  if (config.includeDates) {
    if (!validDate(config.checkIn)) errors.checkIn = "Choose a valid check-in date.";
    else if (config.checkIn < today) errors.checkIn = "Check-in cannot be in the past.";
    if (!validDate(config.checkOut)) errors.checkOut = "Choose a valid check-out date.";
    else if (!errors.checkIn && config.checkOut <= config.checkIn) errors.checkOut = "Check-out must be after check-in.";
  }
  const groupIds = new Set();
  config.childGroups.forEach((group, index) => {
    const id = text(group.id);
    if (!/^[A-Za-z0-9_-]+$/.test(id)) errors[`group-${index}-id`] = "Enter the hotel's child-group ID (letters, numbers, - or _).";
    else if (groupIds.has(id)) errors[`group-${index}-id`] = "Each child-group ID must be unique.";
    groupIds.add(id);
    if (!wholeNumber(group.count, 0)) errors[`group-${index}-count`] = "Enter zero or more children using a whole number.";
  });
  for (const key of ["sessionId", "packageId", "roomId", "rateId"]) {
    if (/[,\s]/.test(text(config[key]))) errors[key] = "IDs cannot contain commas or spaces.";
  }
  return errors;
}

export function buildBookingDeepLink(config, today) {
  const errors = validateDeepLink(config, today);
  if (Object.keys(errors).length) return { url: "", errors, parameters: [] };
  const url = new URL(text(config.baseUrl));
  // Remove managed fields first so turning an option off also removes stale values
  // from a pasted URL. Keep unrelated parameters and the hotel's path intact.
  for (const key of ["lg", "cu", "d", "br", "p", "c", "fo", "pc", "pr", "utm_source", "utm_medium", "utm_campaign"]) url.searchParams.delete(key);
  if (text(config.propertyId)) url.searchParams.set("pid", text(config.propertyId));
  const children = config.childGroups.length
    ? config.childGroups.map((group) => `${text(group.id)}:${Number(group.count)}`).join(",")
    : "0:0"; // The document's no-children sentinel; not a hotel's age-group ID.
  const bookingRequest = [
    text(config.sessionId) || "_", text(config.packageId) || "_",
    text(config.roomId) || "_", text(config.rateId) || "_",
    Number(config.adults), children,
  ].join(",");
  const parameters = {
    lg: text(config.language), cu: text(config.currency),
    d: config.includeDates ? `${config.checkIn},${config.checkOut}` : "",
    br: bookingRequest, p: "base", c: config.step,
    fo: config.expanded ? "true" : "", pc: text(config.promoCode), pr: text(config.preferredRate),
    utm_source: text(config.utmSource), utm_medium: text(config.utmMedium), utm_campaign: text(config.utmCampaign),
  };
  for (const [key, value] of Object.entries(parameters)) if (value) url.searchParams.set(key, value);
  return { url: url.toString(), errors: {}, parameters: [...url.searchParams.entries()] };
}

export function bookingButtonHtml(url) {
  const escaped = url.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  return `<a href="${escaped}">Book your stay</a>`;
}

export function clientHandoff(config, url) {
  return [
    "BOOKING ENGINE DEEP LINK", "", "Booking URL", url, "", "Website button HTML", bookingButtonHtml(url), "",
    config.includeDates
      ? `Fixed dates: ${config.checkIn} to ${config.checkOut}. Update this link before these dates expire.`
      : "No fixed dates: guests choose their dates in the booking engine.",
    "For a website search form, generate the date and occupancy parameters from the guest's selections on submission.",
    "The linked page must have a booking engine that supports this URL format. Test the link before adding it to the website.",
    "Prices, room availability and promo eligibility are confirmed by the booking engine.",
    "",
  ].join("\n");
}
