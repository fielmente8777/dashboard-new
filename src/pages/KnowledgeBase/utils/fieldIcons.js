import {
  Accessibility,
  AirVent,
  Ban,
  Baby,
  BadgePercent,
  Bath,
  BedDouble,
  Briefcase,
  Building2,
  Bus,
  Calendar,
  CalendarX,
  Car,
  Cigarette,
  CircleHelp,
  Clock,
  Coffee,
  ConciergeBell,
  CreditCard,
  Dumbbell,
  Facebook,
  FileText,
  Gift,
  Globe,
  Hash,
  Heart,
  Image,
  IndianRupee,
  Info,
  Instagram,
  KeyRound,
  Landmark,
  Languages,
  Layers,
  Leaf,
  Link,
  List,
  Mail,
  Map,
  MapPin,
  MessageCircle,
  Mountain,
  Music,
  Navigation,
  PawPrint,
  Phone,
  Plane,
  Ruler,
  Shield,
  ShieldCheck,
  Shirt,
  Sparkles,
  Star,
  Tag,
  ToggleRight,
  Train,
  TreePalm,
  Tv,
  Type,
  User,
  Users,
  UtensilsCrossed,
  Video,
  Waves,
  Wifi,
  Wine,
} from "lucide-react";

// A field's name → an icon (and a colour), so a long knowledge base reads at a glance: phone,
// email, check-in, prices, rooms, Wi-Fi… First match wins, so the specific words come first.
// Names are matched as words: "check_in_time", "Check-in time" and "checkInTime" all work.
const RULES = [
  [/whats ?app/, MessageCircle, "emerald"],
  [/phone|mobile|contact number|telephone|landline|call/, Phone, "emerald"],
  [/e ?mail/, Mail, "sky"],
  [/insta/, Instagram, "pink"],
  [/facebook|fb/, Facebook, "blue"],
  [/website|web site|url|link|href|booking engine/, Globe, "sky"],
  [/check ?in|check ?out|time|hours|timing|open|close/, Clock, "amber"],
  [/cancel|refund|no ?show/, CalendarX, "rose"],
  [/date|season|period|valid/, Calendar, "amber"],
  [/price|rate|tariff|cost|fee|charge|amount|inr|rupee|plan|meal plan/, IndianRupee, "emerald"],
  [/discount|offer|deal|promo|coupon/, BadgePercent, "rose"],
  [/payment|card|upi|deposit/, CreditCard, "emerald"],
  [/room|suite|villa|cottage|bed|inventory|unit/, BedDouble, "violet"],
  [/occupancy|capacity|guest|adult|people|pax|person|max/, Users, "violet"],
  [/child|kid|infant|baby/, Baby, "pink"],
  [/size|area|sq ?ft|sqm|square/, Ruler, "slate"],
  [/view|mountain|hill/, Mountain, "teal"],
  [/beach|sea|island|palm/, TreePalm, "teal"],
  [/pool|swim/, Waves, "sky"],
  [/wi ?fi|internet/, Wifi, "sky"],
  [/parking|car|cab|taxi|transfer|drive/, Car, "slate"],
  [/airport|flight/, Plane, "sky"],
  [/railway|train|station/, Train, "slate"],
  [/bus/, Bus, "slate"],
  [/distance|direction|route|how to reach|nearby|near/, Navigation, "teal"],
  [/address|location|city|state|country|pin ?code|zip|area name|locality|lat|lng|long/, MapPin, "rose"],
  [/map/, Map, "teal"],
  [/breakfast|coffee|tea|cafe/, Coffee, "amber"],
  [/bar|wine|drink|alcohol/, Wine, "rose"],
  [/restaurant|dining|food|cuisine|menu|meal|kitchen/, UtensilsCrossed, "amber"],
  [/spa|wellness|massage|ayurved/, Sparkles, "pink"],
  [/gym|fitness/, Dumbbell, "slate"],
  [/yoga|meditation|nature|garden|eco/, Leaf, "emerald"],
  [/pet|dog|cat/, PawPrint, "amber"],
  [/smok/, Cigarette, "slate"],
  [/accessib|wheelchair|disab/, Accessibility, "sky"],
  [/bath|toilet|shower|toiletr/, Bath, "sky"],
  [/tv|television/, Tv, "slate"],
  [/ac|air ?condition|heating/, AirVent, "sky"],
  [/laundry|iron|dress/, Shirt, "slate"],
  [/wedding|honeymoon|romantic|couple/, Heart, "pink"],
  [/event|conference|meeting|banquet|mice|corporate|business/, Briefcase, "violet"],
  [/music|dj|entertain/, Music, "violet"],
  [/gift|complimentary|free/, Gift, "pink"],
  [/attraction|sightseeing|temple|monument|heritage/, Landmark, "amber"],
  [/policy|policies|rule|terms|condition/, ShieldCheck, "slate"],
  [/not allowed|prohibit|restrict/, Ban, "rose"],
  [/security|safety|safe/, Shield, "slate"],
  [/key|access|password|code/, KeyRound, "slate"],
  [/language/, Languages, "sky"],
  [/faq|question|answer/, CircleHelp, "sky"],
  [/rating|star|review/, Star, "amber"],
  [/amenit|facilit|feature|service|highlight|inclusion|include/, ConciergeBell, "violet"],
  [/photo|image|picture|gallery|logo|banner|thumbnail/, Image, "pink"],
  [/video|reel|tour/, Video, "pink"],
  [/hotel|property|resort|brand|company|business name/, Building2, "blue"],
  [/owner|manager|staff|contact person|host/, User, "blue"],
  [/description|about|summary|note|detail|overview|story|text|info/, FileText, "slate"],
  [/name|title|label|type|category|kind/, Tag, "blue"],
];

const TONES = {
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  sky: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  pink: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  teal: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  slate: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
};

// each word of a rule: up to 3 letters must be a whole word ("ac", "tv", "bar"), longer ones
// the start of a word ("amenit" → amenities), so "place" never reads as "ac"
const COMPILED = RULES.map(([re, icon, tone]) => [
  new RegExp(
    re.source
      .split("|")
      .map((w) => (w.replace(/ \?/g, "").length <= 3 ? ` (?:${w}) ` : ` (?:${w})`))
      .join("|"),
  ),
  icon,
  tone,
]);

/** "checkInTime" / "check_in_time" / "Check-in time" → "check in time" */
const words = (key) =>
  ` ${String(key)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()} `;

/**
 * The icon and colour classes for a field, from its name, else from its value
 * (yes/no, number, list, group, text). → { icon, tone }
 */
export function fieldIcon(key, value) {
  const name = words(key);
  for (const [re, icon, tone] of COMPILED) if (re.test(name)) return { icon, tone: TONES[tone] };
  if (typeof value === "boolean") return { icon: ToggleRight, tone: TONES.blue };
  if (typeof value === "number") return { icon: Hash, tone: TONES.slate };
  if (Array.isArray(value)) return { icon: List, tone: TONES.violet };
  if (value && typeof value === "object") return { icon: Layers, tone: TONES.violet };
  if (typeof value === "string" && /^https?:\/\//i.test(value)) return { icon: Link, tone: TONES.sky };
  if (typeof value === "string" && value.length > 90) return { icon: FileText, tone: TONES.slate };
  return { icon: typeof value === "string" ? Type : Info, tone: TONES.slate };
}
