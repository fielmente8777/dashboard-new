import { createElement as h } from "react";
import { Bot, FileUp, Globe, UserRound } from "lucide-react";
import { FaInstagram, FaMeta, FaWhatsapp } from "react-icons/fa6";
import { SiGoogleads } from "react-icons/si";
import Icon from "../../../components/ui/Icon";

// Where a caller is known from (gian: services/callContacts/callerIdentity.ts). "exotel" is a
// number found nowhere else: someone who rang the Exotel number directly.
export const CALL_SOURCES = {
  whatsapp: { label: "WhatsApp", brand: FaWhatsapp, color: "#25D366" },
  meta: { label: "Meta lead", brand: FaMeta, color: "#0866FF" },
  instagram: { label: "Instagram", brand: FaInstagram, color: "#E1306C" },
  google: { label: "Google Ads", brand: SiGoogleads, color: "#4285F4" },
  eazbot: { label: "Eazbot", icon: Bot },
  website: { label: "Website form", icon: Globe },
  contact: { label: "Saved contact", icon: UserRound },
  import: { label: "Imported", icon: FileUp },
  manual: { label: "Added by the team", icon: UserRound },
  exotel: { label: "Exotel call", img: "/exotel.svg" },
};

export const callSourceOf = (call) =>
  CALL_SOURCES[call?.guest?.source] || CALL_SOURCES.exotel;

// the source's mark: the Exotel logo, a brand icon (Meta, WhatsApp ...) or a plain icon
export const renderSourceMark = (source, size = "size-4") => {
  if (source.img) return h("img", { src: source.img, alt: "", className: `${size} shrink-0` });
  if (source.brand) {
    return h(source.brand, { className: `${size} shrink-0`, style: { color: source.color } });
  }
  return h(Icon, { icon: source.icon, className: `${size} shrink-0 text-app-text-muted` });
};

// For the source filter: every source with its mark and name.
export const CALL_SOURCE_OPTIONS = Object.entries(CALL_SOURCES).map(([value, source]) => ({
  value,
  label: h(
    "span",
    { className: "inline-flex items-center gap-2" },
    renderSourceMark(source),
    source.label,
  ),
}));
