// Single place for every backend URL, third-party URL and public key.
// Change a value here and it changes everywhere; or override it per
// environment in .env (see .env.example) without touching the code.
//
// Never hard-code "https://..." or a key in a page or service: add it here
// and import it. Everything in this file ends up in the browser, so only
// PUBLIC keys belong here (never a secret key or a password).
const env = import.meta.env;

const trimSlash = (url) => url.replace(/\/+$/, "");

export const API_URLS = {
  core: trimSlash(env.VITE_CORE_API_URL || "https://nexon-0l4r.onrender.com"),
  node: trimSlash(env.VITE_NODE_API_URL || "https://gian-1eve.onrender.com"),
  salesAgent: trimSlash(
    env.VITE_SALES_AGENT_API_URL || "https://ai-sales-agent-o4wi.onrender.com",
  ),
  // guest request management (requests raised by guests from the GRM site)
  grm: trimSlash(env.VITE_GRM_API_URL || "https://hmsbackend-7pyp.onrender.com"),
};

// the site guests open (usually by scanning the QR code) to raise requests
export const GRM_SITE_URL = trimSlash(
  env.VITE_GRM_SITE_URL || "https://grm.eazotel.com",
);

export const WS_URL = env.VITE_WS_URL || API_URLS.node.replace(/^http/, "ws");

export const GOOGLE_CLIENT_ID =
  env.VITE_CLIENT_ID ||
  "737012285391-mvm0kikmmfqm8vu8hr3lmcc39lb8blj2.apps.googleusercontent.com";

export const ONBOARDING_SIGNUP_URL =
  env.VITE_ONBOARDING_SIGNUP_URL || "https://onboarding.eazotel.com/sign-in";

// --- our own sites the dashboard links to ---
export const BILLING_PORTAL_URL =
  env.VITE_BILLING_PORTAL_URL ||
  "https://accounts.eazotel.com/portal/eazoteltechnologiespvtltd/signin";

export const SOCIAL_PORTAL_URL = trimSlash(
  env.VITE_SOCIAL_PORTAL_URL || "https://social.eazotel.com",
);
export const SOCIAL_PORTAL_LOGIN_URL = `${SOCIAL_PORTAL_URL}/client/eazotel/clientlogin.do`;

// --- scripts our clients paste into their own websites ---
export const WHATSAPP_WIDGET_SCRIPT_URL =
  env.VITE_WHATSAPP_WIDGET_SCRIPT_URL ||
  "https://whatsapp-widget-tau.vercel.app/widget/whatsapp.js";

export const CHATBOT_WIDGET_SCRIPT_URL =
  env.VITE_CHATBOT_WIDGET_SCRIPT_URL ||
  "https://cb-script.dyq28lyxrazm2.amplifyapp.com/widget/lead-chatbot.js";

// --- payments (Razorpay) ---
// Key ids are public (the secret stays on the server).
export const RAZORPAY_CHECKOUT_SCRIPT_URL =
  "https://checkout.razorpay.com/v1/checkout.js";

// used when buying a plan (Wallet > pricing cards)
export const RAZORPAY_KEY_ID =
  env.VITE_RAZORPAY_KEY_ID || "rzp_live_ShEPN150XB1irg";

// used on the Billing page. NOTE: this has been a TEST key, so payments
// made there are not real. Set it to the live key when Billing goes live.
export const RAZORPAY_BILLING_KEY_ID =
  env.VITE_RAZORPAY_BILLING_KEY_ID || "rzp_test_UZ0V9jh3jMC0C9";

// --- third-party services ---
// weather on the home dashboard (weatherapi.com)
export const WEATHER_API_URL = "https://api.weatherapi.com/v1";
export const WEATHER_API_KEY =
  env.VITE_WEATHER_API_KEY || "8611baa95180437492f54121230505";

// countries, their states and cities (free, no key)
export const PLACES_API_URL = "https://countriesnow.space/api/v0.1/countries";

// coordinates -> place name (OpenStreetMap, free, no key)
export const GEOCODING_API_URL = "https://nominatim.openstreetmap.org";