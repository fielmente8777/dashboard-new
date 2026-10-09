import {
  AlertCircle,
  Building2,
  HelpCircle,
  MapPin,
  Package,
  Phone,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import { formatLabel } from "./kbHelpers";

// Title, icon and icon colour of the known sections. Any other section gets
// a title made from its key and the default icon.
const SECTION_CONFIG = {
  kb_meta: {
    title: "KB Meta",
    icon: Settings2,
    iconClassName: "bg-purple-500/10 text-purple-500",
  },
  business: {
    title: "Business",
    icon: Building2,
    iconClassName: "bg-amber-500/10 text-amber-500",
  },
  locations: {
    title: "Locations",
    icon: MapPin,
    iconClassName: "bg-orange-500/10 text-orange-500",
  },
  location: {
    title: "Location",
    icon: MapPin,
    iconClassName: "bg-orange-500/10 text-orange-500",
  },
  offerings: {
    title: "Offerings",
    icon: Package,
    iconClassName: "bg-emerald-500/10 text-emerald-500",
  },
  policies: {
    title: "Policies",
    icon: ShieldCheck,
    iconClassName: "bg-sky-500/10 text-sky-500",
  },
  contact: {
    title: "Contact",
    icon: Phone,
    iconClassName: "bg-pink-500/10 text-pink-500",
  },
  faqs: {
    title: "FAQs",
    icon: HelpCircle,
    iconClassName: "bg-indigo-500/10 text-indigo-500",
  },
  fields_to_populate: { title: "Fields To Populate", icon: AlertCircle },
  data_gaps: { title: "Data Gaps", icon: AlertCircle },
  knowledge_base: {
    title: "Knowledge Base",
    icon: Settings2,
    iconClassName: "bg-blue-500/10 text-blue-500",
  },
};

const DEFAULT_ICON_CLASS_NAME = "bg-gray-500/10 text-app-text-muted";

// Sections that list gaps or conflicts found while generating. They get an
// amber card and a count badge on their tab so they stand out.
const ALERT_SECTION_KEYS = new Set(["fields_to_populate", "data_gaps"]);

export const isAlertSection = (key) => ALERT_SECTION_KEYS.has(key);

export const getSectionConfig = (key) => ({
  title: formatLabel(key),
  icon: Settings2,
  iconClassName: DEFAULT_ICON_CLASS_NAME,
  ...SECTION_CONFIG[key],
});

// The tab for one section of the knowledge base.
export const toSectionTab = ([key, value]) => ({
  key,
  title: getSectionConfig(key).title,
  gapCount: isAlertSection(key) && Array.isArray(value) ? value.length : 0,
});
