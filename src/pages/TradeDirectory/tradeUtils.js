import { Heart, Briefcase, CircleDashed, Flower2, Instagram, Landmark, Plane, Sparkles, PenLine, UtensilsCrossed } from "lucide-react";

// the built-in categories: shown until the server's list (useTradeCategories) has loaded
export const SEGMENTS = [
  { value: "travel_agent", label: "Travel Agents", icon: Plane, color: "#3b82f6" },
  { value: "mice", label: "MICE & Corporate", icon: Briefcase, color: "#8b5cf6" },
  { value: "wedding_planner", label: "Wedding Planners", icon: Heart, color: "#ec4899" },
  { value: "yoga_retreat", label: "Yoga & Retreats", icon: Flower2, color: "#10b981" },
  { value: "wellness", label: "Wellness", icon: Sparkles, color: "#14b8a6" },
  { value: "spiritual", label: "Spiritual Orgs", icon: Landmark, color: "#f59e0b" },
  { value: "instagram", label: "Instagram Partners", icon: Instagram, color: "#e11d48" },
  { value: "blogger", label: "Bloggers & Creators", icon: PenLine, color: "#64748b" },
  { value: "restaurant", label: "Restaurants & Cafés", icon: UtensilsCrossed, color: "#ea580c" },
  { value: "unsorted", label: "Not sorted yet", icon: CircleDashed, color: "#94a3b8" },
];
export const segmentOf = (value) => SEGMENTS.find((s) => s.value === value) || SEGMENTS[0];

export const CHANNEL_LABEL = { email: "Email", whatsapp: "WhatsApp", call: "Call" };

export const formatNumber = (n) => Number(n || 0).toLocaleString("en-IN");

export const PAGE_SIZE = 50;
/** rows per upload call: small enough for the API's 100 kb body limit */
export const ROWS_PER_UPLOAD = 200;

// header words gian-new understands (trade-directory ColumnMapper); used to find the header row
const KNOWN = new Set([
  "id", "company", "companyagency", "companyname", "agency", "agencyname", "travelagency", "travelcompany",
  "travelcomapanys", "emcname", "name", "contactperson", "personname", "contactname", "designation",
  "destignation", "mobilephone", "mobile", "mobileno", "phone", "phonenumber", "number", "contactnumber",
  "whatsapp", "otherphones", "email", "emailid", "mailid", "otheremails", "city", "state", "stateregion",
  "segment", "category", "nichetype", "address", "website", "websiteinstagram", "instagram", "leadsourceevent",
  "notes", "remarks",
  // restaurant sheets (Zomato exports, POS outlet lists)
  "outletname", "outlet", "restaurant", "restaurantname", "accountname", "contactnumbers", "phone1", "pincode",
  "locality", "cuisines", "url", 
]);
const headerKey = (h) => String(h ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Reads an Excel / CSV file in the browser (the server never parses files). Returns every sheet
 * with its header row found automatically: { sheets: [{ name, headers, rows, recognised }] }.
 */
export async function readContactFile(file) {
  const XLSX = await import("xlsx");
  const wb = XLSX.read(await file.arrayBuffer(), { type: "array", dense: true });
  const sheets = wb.SheetNames.map((name) => {
    // raw values: Excel shows long numbers (phones) as 9.18081E+11 in formatted text, which loses digits
    // (918080806267 became 91808111). Numbers are turned into plain digits when sent.
    const all = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: "", raw: true, blankrows: false });
    let at = 0;
    let best = 0;
    for (let i = 0; i < Math.min(all.length, 15); i += 1) {
      const hits = (all[i] || []).filter((c) => KNOWN.has(headerKey(c))).length;
      if (hits > best) {
        best = hits;
        at = i;
      }
      if (hits >= 3) break;
    }
    const headers = (all[at] || []).map((h) => String(h ?? "").trim());
    const rows = all.slice(at + 1).filter((r) => r.some((c) => String(c ?? "").trim()));
    return { name, headers, rows, recognised: best };
  });
  sheets.sort((a, b) => b.recognised - a.recognised || b.rows.length - a.rows.length);
  return { sheets };
}

/** Sends rows in batches, one after the other (one import per list runs at a time). */
export async function uploadInBatches(rows, send, onProgress, signal) {
  if (!rows.length) return send([], true);
  let last = null;
  for (let i = 0; i < rows.length; i += ROWS_PER_UPLOAD) {
    if (signal?.aborted) return last;
    const batch = rows
      .slice(i, i + ROWS_PER_UPLOAD)
      .map((r) => r.map((c) => (c === "" || c === undefined ? null : typeof c === "number" ? String(c) : c)));
    last = await send(batch, i + ROWS_PER_UPLOAD >= rows.length);
    onProgress(Math.min(i + ROWS_PER_UPLOAD, rows.length), last);
  }
  return last;
}

export const relativeDate = (iso) =>
  iso ? new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";
