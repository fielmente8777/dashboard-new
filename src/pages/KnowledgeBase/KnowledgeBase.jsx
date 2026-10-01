// import { useEffect, useState } from "react";

// import axios from "axios";
// import KnowledgeBaseForm from "./KnowledgeBaseForm";
// import { JsonEditor } from "json-edit-react";
// import { NEW_BASE_URL, SALES_AGEENT_BASE_URL } from "../../data/constant";
// import UploadDocument from "./UploadDocument";
// import { ArrowBigUp } from "lucide-react";
// const KnowledgeBase = () => {
//   const [jsondata, setJsonData] = useState(null);
//   const [url, setUrl] = useState("");
//   const [activeTab, setActiveTab] = useState("url"); // "url" or "manual"
//   const [loading, setLoading] = useState(false);
//   const [kbLoading, setKbLoading] = useState(false);

//   const fetchData = async (link) => {
//     setLoading(true);
//     try {
//       const { data } = await axios.post(
//         `${SALES_AGEENT_BASE_URL}/api/v1/knowledgebase/create`,
//         {
//           url: link,
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );
//       // console.log("API response", data);
//       setJsonData(data?.data?.knowledge_base);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (url.trim()) {
//       fetchData(url);
//     }
//   };

//   const handleFormSave = async (formData) => {
//     setLoading(true);
//     try {
//       // You can send this form data to your API
//       const { data } = await axios.post(
//         "http://127.0.0.1:5000/leadeazbot/create-knowledge-base",
//         {
//           manualData: formData,
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );
//       // console.log("Form data saved:", data);
//       setJsonData(formData); // Display the form data
//     } catch (error) {
//       console.error("Error saving form data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchKnowledgeBaseData = async () => {
//     setKbLoading(true);
//     try {
//       const { data } = await axios.get(`${SALES_AGEENT_BASE_URL}/api/v1/knowledgebase`, {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       });
//       setJsonData(data?.data?.knowledge_base);
//     } catch (error) {
//       // console.log(error);
//     } finally {
//       setKbLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchKnowledgeBaseData();
//   }, []);

//  const [show, setShow] = useState(false);

//   useEffect(() => {
//     const handleScroll = () => {
//       setShow(window.scrollY > 100);
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);
//   return (
//     <div className="p-4 space-y-6">
//       <h1 className="text-2xl font-bold">Knowledge Base</h1>

//       {/* Tab Navigation */}
//       <div className="flex border-b border-gray-200">
//         <button
//           onClick={() => setActiveTab("url")}
//           className={`px-4 py-2 font-medium ${
//             activeTab === "url"
//               ? "text-blue-600 border-b-2 border-blue-600"
//               : "text-gray-500 hover:text-gray-700"
//           }`}
//         >
//           Import from URL
//         </button>
//         <button
//           onClick={() => setActiveTab("manual")}
//           className={`px-4 py-2 font-medium ${
//             activeTab === "manual"
//               ? "text-blue-600 border-b-2 border-blue-600"
//               : "text-gray-500 hover:text-gray-700"
//           }`}
//         >
//           Manual Entry
//         </button>
//         <button
//           onClick={() => setActiveTab("document")}
//           className={`px-4 py-2 font-medium ${
//             activeTab === "document"
//               ? "text-blue-600 border-b-2 border-blue-600"
//               : "text-gray-500 hover:text-gray-700"
//           }`}
//         >
//           Upload Documents
//         </button>
//       </div>

//       {/* URL Input Tab */}
//       {activeTab === "url" && (
//         <div className="space-y-4">
//           <form onSubmit={handleSubmit} className="flex gap-2">
//             <input
//               type="url"
//               placeholder="Enter website link..."
//               value={url}
//               onChange={(e) => setUrl(e.target.value)}
//               className="flex-1 border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             <button
//               type="submit"
//               disabled={!url.trim() || loading}
//               className="px-6 py-2 rounded-md bg-blue-600 text-white disabled:bg-app"
//             >
//               {loading ? "Fetching..." : "Fetch"}
//             </button>
//           </form>
//         </div>
//       )}

//       {/* Manual Entry Tab */}
//       {activeTab === "manual" && (
//         <div>
//           <KnowledgeBaseForm onSave={handleFormSave} initialData={jsondata} />
//         </div>
//       )}
//       {activeTab === "document" && (
//         <div>
//          <UploadDocument/>
//         </div>
//       )}

//       {/* JSON Viewer */}
//       {/* {!jsondata && (
//         <div className="border rounded-md p-4">
//           <h2 className="text-lg font-semibold mb-3">Data Preview</h2>
//           <p>No data available.</p>
//         </div>
//       )} */}

//       {/* {kbLoading ? (
//         <div>Loading...</div>
//       ) : !jsondata ? (
//         <div className="border rounded-md p-4">
//           <h2 className="text-lg font-semibold mb-3">Data Preview</h2>
//           <p>No data available.</p>
//         </div>
//       ) : (
//         <div className="border rounded-md p-4">
//           <h2 className="text-lg font-semibold mb-3">Data Preview</h2>
//           <JsonEditor data={jsondata} />
//           {JSON.stringify(jsondata,null,2)}
//         </div>
//       )} */}

//   <RenderValue data={jsondata} />

//       {/* Loading State */}
//       {loading && (
//         <div className="flex justify-center items-center py-8">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//           <span className="ml-2 text-gray-600">Processing...</span>
//         </div>
//       )}

//       {show&&<button onClick={() =>{
//         console.log("jhjgfc");
//           window.scrollTo({ top: 0, behavior: "smooth" })}} className="border absolute bottom-5 right-5 h-10 w-10 bg-primary text-ternary flex items-center justify-center rounded-full text-xs"><ArrowBigUp size={20}/></button>
//           }
//     </div>
//   );
// };

// export default KnowledgeBase;

//   const RenderValue = ({ data }) => {
//     if (Array.isArray(data)) {
//       return (
//         <ul className="list-disc ml-5 space-y-1">
//           {data.map((item, idx) => (
//             <li key={idx}>
//               <RenderValue data={item} />
//             </li>
//           ))}
//         </ul>
//       );
//     }

//     if (typeof data === "object" && data !== null) {
//       return (
//         <div className="ml-4 border-l pl-4 space-y-2">
//           {Object.entries(data).map(([key, value]) => (
//             <div key={key}>
//               <p className="font-medium text-gray-400 capitalize">{key}:</p>
//               <RenderValue data={value} />
//             </div>
//           ))}
//         </div>
//       );
//     }

//     return <p className="text-gray-900 dark:text-app-text-faint">{String(data)}</p>;
//   };

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Pencil,
  Trash2,
  Plus,
  Building2,
  MapPin,
  Package,
  ShieldCheck,
  Phone,
  HelpCircle,
  AlertCircle,
  AlertTriangle,
  Save,
  Settings2,
  X,
  Check,
  Globe,
  FileUp,
  Sparkles,
  Loader2,
  RefreshCw,
  FileText,
  ArrowLeft,
  Hash,
  Clock,
  Image as ImageIcon,
  Lock,
  ChevronDown,
} from "lucide-react";
import { NEW_BASE_URL } from "../../data/constant";

// ---------------------------------------------------------------------------
// Wire these to your real backend. Left as constants so it's a one-line swap.
// ---------------------------------------------------------------------------
const SALES_AGENT_BASE_URL = NEW_BASE_URL; // <-- replace with your real base url
const GENERATE_ENDPOINT = `${SALES_AGENT_BASE_URL}/api/v1/kb-generator/generate`;
// Same base used for list / get / create / update / delete — the CRUD
// routes for saved knowledge bases (see knowledgeBase.routes.ts).
const KB_ENDPOINT = `${SALES_AGENT_BASE_URL}/api/v1/knowledgebase`;
// Point this at whatever route uploads a file to S3 and hands back its URL.
// Expected contract: POST multipart/form-data with a "file" field, response
// { url: "https://your-bucket.s3..../..." }. Swap the path/response parsing
// below to match your real AWS upload route once it exists.
const UPLOAD_ENDPOINT = `${SALES_AGENT_BASE_URL}/api/v1/uploads`;

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const getTenantContext = () => {
  let hid = localStorage.getItem("hid");
  let ndid = localStorage.getItem("ndid");

  // Agar localStorage me nahi hai, to create karo
  if (!hid) {
    hid = crypto.randomUUID();
    localStorage.setItem("hid", hid);
  }

  if (!ndid) {
    ndid = crypto.randomUUID();
    localStorage.setItem("ndid", ndid);
  }

  return { hid, ndid };
};

const emptyKb = {
  url: "",
  knowledge_base: {
    kb_meta: {
      kb_name: "",
      version: "1.0",
      built_on: "",
      source_domain: "",
      default_language: "en",
      currency: "",
      timezone: "",
    },
    business: { brand: "", category: "", positioning: "", description: "" },
    contact: { phone: "", whatsapp: "", email: "", social: {} },
    booking: {},
    location: {},
    rooms: { shared_attributes: {}, inventory: [], inventory_note: "" },
    dining: {},
    experiences: {},
    policies: { cancellation: "", payment: "", other: [] },
    cancellation_policy: {},
    buyout_and_events: {},
    brochures: [],
    chatbot_config: {},
    faqs: [],
    data_gaps: [],
  },
};

// Fills in any missing keys/arrays on whatever JSON the backend returns, so a
// partial or slightly-different-shaped response never crashes the form.
const normalizeKb = (raw = {}) => structuredClone(raw);

// n8n sometimes wraps the generated KB in an array (multiple items),
// sometimes returns it as a plain object — handle both shapes safely.
const unwrapGeneratedKb = (data) => {
  const payload = data?.knowledgeBase ?? data;
  return Array.isArray(payload) ? payload[0] : payload;
};

// Turns a human-typed label into a safe JSON key: "Spa Services" -> "spa_services".
// Shared by the top-level "Add section" control and every nested level's
// "Add section" control, so a new key is generated consistently everywhere.
const slugifyKey = (label) =>
  label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

// A value counts as a "group" (gets its own sub-tab) when it's an object or
// array — i.e. it has its own internal structure. Plain strings/numbers/
// booleans are "leaf" fields and stay inline instead of getting a tab.
const isGroupValue = (value) => value !== null && typeof value === "object";

// Rough English singularizer for array-item button labels, e.g. formatLabel
// output "Rooms" -> "Room", "Inventory" -> "Inventory" (left alone), so
// "Add Field"-style buttons can read "Add Room" instead of generic "Add item".
const singularize = (label) => {
  if (/ies$/i.test(label)) return label.replace(/ies$/i, "y");
  if (/ses$/i.test(label)) return label;
  if (/s$/i.test(label) && !/ss$/i.test(label)) return label.slice(0, -1);
  return label;
};

// Clones an existing array item's shape but blanks out every leaf value, so
// "Add Room" gives you the same fields as your other rooms, empty and ready
// to fill in, instead of a single bare text box.
const blankLikeTemplate = (sample) => {
  if (Array.isArray(sample)) return [];
  if (sample !== null && typeof sample === "object") {
    const out = {};
    for (const [k, v] of Object.entries(sample)) {
      out[k] = blankLikeTemplate(v);
    }
    return out;
  }
  if (typeof sample === "number") return 0;
  if (typeof sample === "boolean") return false;
  return "";
};

// ---------------------------------------------------------------------------
// Media helpers — a "media" value is just a plain string URL, same as any
// other text field. What changes is how it's *rendered*: any string whose
// path ends in an image/video/pdf extension gets a thumbnail + Replace
// button instead of a plain text box, whether it was just uploaded here or
// was already sitting in the loaded document.
// ---------------------------------------------------------------------------

const IMAGE_EXT_RE = /\.(png|jpe?g|gif|webp|svg|bmp)(\?.*)?$/i;
const MEDIA_EXT_RE =
  /\.(png|jpe?g|gif|webp|svg|bmp|mp4|webm|mov|avi|pdf)(\?.*)?$/i;

const isMediaUrl = (value) =>
  typeof value === "string" && MEDIA_EXT_RE.test(value.trim());

async function uploadMediaFile(file) {
  const form = new FormData();
  form.append("file", file);

  const res = await axios.post(UPLOAD_ENDPOINT, form, {
    headers: { "Content-Type": "multipart/form-data", ...authHeaders() },
  });

  // Accept a couple of common response shapes so this doesn't break the
  // moment the real endpoint's field naming differs slightly.
  const url = res.data?.url || res.data?.location || res.data?.Location;

  if (!url) {
    throw new Error("Upload succeeded but no URL was returned");
  }

  return url;
}

// Renders an already-uploaded media value: thumbnail (or a generic file
// icon for non-images, e.g. PDFs), the URL in small text, and a Replace
// button that re-opens the file picker and uploads over it.
function MediaValue({ value, onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadMediaFile(file);
      onChange(url);
    } catch (err) {
      alert(err?.response?.data?.error || err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const isImage = IMAGE_EXT_RE.test(value || "");

  return (
    <div className="flex items-center gap-3">
      {isImage ? (
        <img
          src={value}
          alt=""
          className="h-14 w-14 shrink-0 rounded-md border border-[#232836] object-cover"
        />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-[#232836] bg-[#0d1017] text-gray-500">
          <FileText size={20} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-gray-500">{value}</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="mt-1 flex items-center gap-1.5 rounded-md border border-[#232836] px-2.5 py-1 text-xs text-gray-300 transition-colors hover:border-blue-500 hover:text-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 size={12} className="animate-spin" /> Uploading...
            </>
          ) : (
            "Replace"
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*,application/pdf"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// The "+ Add media" control shown next to "+ Add item" on array fields
// (photo galleries, brochure lists, etc). Uploads immediately and appends
// the resulting URL as a new array item.
function ArrayAddMediaButton({ onAdd }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadMediaFile(file);
      onAdd(url);
    } catch (err) {
      alert(err?.response?.data?.error || err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-1.5 rounded-md border border-dashed border-[#2a3040] px-4 py-2 text-sm text-gray-300 transition-colors hover:border-blue-500 hover:text-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {uploading ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <ImageIcon size={15} />
        )}
        {uploading ? "Uploading..." : "Add media"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*,application/pdf"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

const IconButton = ({ onClick, variant = "edit", title }) => {
  const styles =
    variant === "delete"
      ? "text-red-500 hover:text-red-400 hover:bg-red-500/10"
      : variant === "confirm"
        ? "text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
        : "text-gray-400 hover:text-white hover:bg-white/5";
  const Icon =
    variant === "delete" ? Trash2 : variant === "confirm" ? Check : Pencil;
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded-md p-1.5 transition-colors ${styles}`}
    >
      <Icon size={16} />
    </button>
  );
};

const AddButton = ({ onClick, label = "Add" }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-1.5 rounded-md border border-dashed border-[#2a3040] px-4 py-2 text-sm text-gray-300 transition-colors hover:border-blue-500 hover:text-blue-400"
  >
    <Plus size={15} />
    {label}
  </button>
);

// `tone="alert"` switches the card to the amber flagged style used for
// fields_to_populate / data_gaps (info gaps or conflicts found while
// generating).
const SectionCard = ({
  icon: Icon,
  title,
  subtitle,
  description,
  children,
  iconColor = "text-orange-400",
  iconBg = "bg-orange-400/10",
  tone = "default",
}) => {
  if (tone === "alert") {
    return (
      <section className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] p-6">
        <div className="mb-2 flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/15 text-amber-400">
            <AlertTriangle size={18} />
          </span>
          <h2 className="text-lg font-bold text-amber-200">{title}</h2>
          {subtitle && (
            <span className="text-xs text-amber-500/70">{subtitle}</span>
          )}
        </div>
        {description && (
          <p className="mb-4 text-sm text-amber-100/80">{description}</p>
        )}
        {children}
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[#1f242e] bg-[#12151c] p-6">
      <div className="mb-4 flex items-center gap-2.5">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}
        >
          <Icon size={18} />
        </span>
        <h2 className="text-lg font-bold text-white">{title}</h2>
        {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
      </div>
      {children}
    </section>
  );
};

// ---------------------------------------------------------------------------
// STEP 0 — Saved knowledge bases list: every card shows its unique slug
// (the id used to look it up / edit it) next to an Edit button.
// ---------------------------------------------------------------------------

function SavedListStep({
  items,
  loading,
  error,
  onEdit,
  onCreateNew,
  onDelete,
}) {
  // A tenant may only have a single knowledge base. Once one exists, hide
  // the "Generate New" action entirely instead of letting them create a
  // second one — they edit (or delete) the existing record instead.
  const hasSavedKb = !loading && items.length > 0;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Saved Knowledge Bases
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {hasSavedKb
              ? "You already have a knowledge base. Edit it below."
              : "Generate your knowledge base to get started."}
          </p>
        </div>
        {!hasSavedKb && !loading && (
          <button
            type="button"
            onClick={onCreateNew}
            className="flex items-center gap-2 rounded-md bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600"
          >
            <Sparkles size={15} /> Generate New
          </button>
        )}
        {hasSavedKb && (
          <span
            title="You can only have one knowledge base. Delete the existing one to generate a new one."
            className="flex items-center gap-1.5 rounded-md border border-[#232836] px-3 py-2 text-xs text-gray-500"
          >
            <Lock size={12} /> One knowledge base per account
          </span>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2 rounded-2xl border border-[#1f242e] bg-[#12151c] p-6 text-sm text-gray-400">
          <Loader2 size={16} className="animate-spin" /> Loading saved knowledge
          bases...
        </div>
      )}

      {!loading && error && (
        <p className="flex items-center gap-1.5 rounded-2xl border border-red-900/40 bg-red-500/5 p-4 text-sm text-red-400">
          <AlertCircle size={14} /> {error}
        </p>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#2a3040] p-10 text-center text-sm text-gray-500">
          No knowledge bases saved yet. Generate one to get started.
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="space-y-3">
          {items.map((item) => {
            const name =
              item?.knowledge_base?.kb_meta?.kb_name ||
              item?.knowledge_base?.business?.brand ||
              item.client_name ||
              "Untitled";
            const domain =
              item?.knowledge_base?.kb_meta?.source_domain || item?.url;
            return (
              <div
                key={item._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#1f242e] bg-[#12151c] p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Hash size={11} /> {item._id}
                    </span>
                    {domain && <span className="truncate">{domain}</span>}
                    {item.updatedAt && (
                      <span className="flex items-center gap-1">
                        <Clock size={11} />{" "}
                        {new Date(item.updatedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(item._id)}
                    className="flex items-center gap-1.5 rounded-md border border-[#232836] px-3 py-1.5 text-sm text-gray-200 hover:border-blue-500 hover:text-blue-400"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <IconButton
                    variant="delete"
                    title="Delete"
                    onClick={() => onDelete(item._id)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// STEP 1 — Intake: client gives a URL and/or a PDF, then generates the KB
// ---------------------------------------------------------------------------

const MAX_IMAGES = 8;

function IntakeStep({
  url,
  setUrl,
  clientName,
  setClientName,
  file,
  setFile,
  images,
  setImages,
  onGenerate,
  generating,
  error,
  onBack,
}) {
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [imagesDragOver, setImagesDragOver] = useState(false);

  const pickFile = (f) => {
    if (f && f.type === "application/pdf") setFile(f);
  };

  const pickImages = (fileList) => {
    const incoming = Array.from(fileList || []).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (incoming.length === 0) return;

    setImages((prev) => {
      const room = Math.max(0, MAX_IMAGES - prev.length);
      const accepted = incoming.slice(0, room).map((f) => ({
        file: f,
        previewUrl: URL.createObjectURL(f),
      }));
      return [...prev, ...accepted];
    });
  };

  const removeImage = (index) => {
    setImages((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-400"
      >
        <ArrowLeft size={14} /> Back to saved knowledge bases
      </button>

      <div className="mb-8 text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-400/10 text-orange-400">
          <Sparkles size={22} />
        </span>
        <h1 className="text-2xl font-bold text-white">
          Generate Knowledge Base
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
          Give us your website link (required), and optionally a PDF (brochure,
          tariff sheet, policy doc) — we'll pull everything into a structured
          knowledge base you can review and edit.
        </p>
      </div>

      <div className="space-y-5 rounded-2xl border border-[#1f242e] bg-[#12151c] p-6">
        {/* URL input */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-blue-400">
            <Globe size={13} /> Website URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://yourhotel.com"
            className="w-full rounded-md border border-[#232836] bg-[#0d1017] px-3 py-2.5 text-sm text-gray-200 outline-none placeholder:text-gray-600 focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-blue-400">
            Client Name (optional)
          </label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="e.g. Test Multi"
            className="w-full rounded-md border border-[#232836] bg-[#0d1017] px-3 py-2.5 text-sm text-gray-200 outline-none placeholder:text-gray-600 focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-600">
          <div className="h-px flex-1 bg-[#1f242e]" />
          optional
          <div className="h-px flex-1 bg-[#1f242e]" />
        </div>

        {/* PDF upload */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-blue-400">
            <FileUp size={13} /> Upload PDF
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              pickFile(e.dataTransfer.files?.[0]);
            }}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed px-4 py-8 text-center transition-colors ${
              dragOver
                ? "border-blue-500 bg-blue-500/5"
                : "border-[#2a3040] hover:border-blue-500/60"
            }`}
          >
            {file ? (
              <div className="flex items-center gap-2 text-sm text-gray-200">
                <FileText size={16} className="text-orange-400" />
                {file.name}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="ml-1 rounded p-0.5 text-gray-500 hover:bg-white/10 hover:text-red-400"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <FileUp size={20} className="text-gray-500" />
                <p className="text-sm text-gray-400">
                  Drop a PDF here, or{" "}
                  <span className="text-blue-400">browse</span>
                </p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0])}
            />
          </div>
        </div>

        {/* Image upload */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-blue-400">
            <ImageIcon size={13} /> Upload Images
            <span className="normal-case tracking-normal text-gray-600">
              ({images.length}/{MAX_IMAGES})
            </span>
          </label>
          <div
            onClick={() =>
              images.length < MAX_IMAGES && imageInputRef.current?.click()
            }
            onDragOver={(e) => {
              e.preventDefault();
              if (images.length < MAX_IMAGES) setImagesDragOver(true);
            }}
            onDragLeave={() => setImagesDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setImagesDragOver(false);
              pickImages(e.dataTransfer.files);
            }}
            className={`flex flex-col items-center justify-center gap-2 rounded-md border border-dashed px-4 py-8 text-center transition-colors ${
              images.length >= MAX_IMAGES
                ? "cursor-not-allowed border-[#1f242e] opacity-50"
                : "cursor-pointer"
            } ${
              imagesDragOver
                ? "border-blue-500 bg-blue-500/5"
                : "border-[#2a3040] hover:border-blue-500/60"
            }`}
          >
            <ImageIcon size={20} className="text-gray-500" />
            <p className="text-sm text-gray-400">
              {images.length >= MAX_IMAGES ? (
                "Maximum images reached"
              ) : (
                <>
                  Drop images here, or{" "}
                  <span className="text-blue-400">browse</span>
                </>
              )}
            </p>
            <p className="text-xs text-gray-600">
              Property photos, room shots, menu images, logos — JPG, PNG, or
              WEBP
            </p>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                pickImages(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {images.map((img, index) => (
                <div
                  key={img.previewUrl}
                  className="group relative aspect-square overflow-hidden rounded-md border border-[#232836]"
                >
                  <img
                    src={img.previewUrl}
                    alt={img.file.name}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-gray-200 opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                    title="Remove"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <p className="flex items-center gap-1.5 text-sm text-red-400">
            <AlertCircle size={14} /> {error}
          </p>
        )}

        <button
          type="button"
          disabled={!url.trim() || generating}
          onClick={onGenerate}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-[#232836] disabled:text-gray-500"
        >
          {generating ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Generating
              knowledge base...
            </>
          ) : (
            <>
              <Sparkles size={16} /> Generate Knowledge Base
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dynamic JSON helpers
// ---------------------------------------------------------------------------

const cloneValue = (value) => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
};

const setValueAtPath = (object, path, value) => {
  const result = cloneValue(object);

  if (path.length === 0) {
    return value;
  }

  let current = result;

  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];

    if (
      current[key] === null ||
      current[key] === undefined ||
      typeof current[key] !== "object"
    ) {
      current[key] = {};
    }

    current = current[key];
  }

  current[path[path.length - 1]] = value;

  return result;
};

const deleteValueAtPath = (object, path) => {
  const result = cloneValue(object);

  if (!path.length) {
    return result;
  }

  let current = result;

  for (let i = 0; i < path.length - 1; i++) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== "object"
    ) {
      return result;
    }

    current = current[path[i]];
  }

  const lastKey = path[path.length - 1];

  if (Array.isArray(current)) {
    current.splice(Number(lastKey), 1);
  } else if (current && typeof current === "object") {
    delete current[lastKey];
  }

  return result;
};

// ---------------------------------------------------------------------------
// Dynamic Field Editor
// ---------------------------------------------------------------------------

const HIDDEN_FIELDS = new Set([
  "_id",
  "__v",
  "hid",
  "ndid",
  "createdAt",
  "updatedAt",
  "normalized_source_url",
]);

const formatLabel = (key) => {
  return key
    .replace(/_/g, " ")
    .replace(/\./g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

// `existingKeys` lets a caller override what counts as "already taken" for
// the Add Field duplicate check — needed when `value` passed in is a
// filtered subset (see NestedSection's "General" tab below), so a new leaf
// field can't accidentally collide with a sibling group key that isn't
// visible in this particular view.
// A collapsible card for one object item inside an array (a room, an FAQ, an
// offering...). Collapsed by default, titled from a name/title/brand-ish
// field when the item has one, so a long list doesn't turn into one huge
// scroll. Non-object array items (plain strings, media, numbers) skip this
// and render in the simpler flat box, since there's nothing to hide.
function ArrayItemCard({
  item,
  index,
  expanded,
  onToggle,
  onDelete,
  children,
}) {
  const summary = (() => {
    const nameKey = Object.keys(item || {}).find((k) =>
      ["name", "title", "kb_name", "brand", "label"].includes(k.toLowerCase()),
    );
    const val = nameKey ? item[nameKey] : null;
    if (typeof val === "string" && val.trim()) return val;
    return `Item ${index + 1}`;
  })();

  return (
    <div className="rounded-xl border border-[#1f242e] bg-[#0d1017]">
      <div className="flex w-full items-center justify-between gap-2 px-4 py-3">
        <button
          type="button"
          onClick={onToggle}
          className="flex flex-1 items-center gap-2 text-left text-sm font-medium text-white"
        >
          <ChevronDown
            size={15}
            className={`shrink-0 text-gray-500 transition-transform ${
              expanded ? "" : "-rotate-90"
            }`}
          />
          <span className="truncate">{summary}</span>
        </button>
        <IconButton variant="delete" title="Delete" onClick={onDelete} />
      </div>
      {expanded && (
        <div className="border-t border-[#1f242e] p-4">{children}</div>
      )}
    </div>
  );
}

function DynamicJsonEditor({
  value,
  path = [],
  onChange,
  onDelete,
  existingKeys,
}) {
  const [newKey, setNewKey] = useState("");
  const [newType, setNewType] = useState("text");
  const [addingMedia, setAddingMedia] = useState(false);
  const addMediaInputRef = useRef(null);
  const [expandedIndices, setExpandedIndices] = useState(new Set());

  const isArray = Array.isArray(value);

  const isObject =
    value !== null && typeof value === "object" && !Array.isArray(value);

  const visibleEntries = isObject
    ? Object.entries(value).filter(([key]) => !HIDDEN_FIELDS.has(key))
    : [];

  // --------------------------------------------------
  // Primitive
  // --------------------------------------------------

  if (!isObject && !isArray) {
    if (typeof value === "boolean") {
      return (
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(path, e.target.checked)}
            className="h-4 w-4 rounded border-[#232836] bg-[#0d1017]"
          />
          <span>{value ? "Enabled" : "Disabled"}</span>
        </label>
      );
    }

    // Any string that looks like an uploaded file's URL gets the media
    // widget (thumbnail + Replace) instead of a plain text box.
    if (isMediaUrl(value)) {
      return (
        <MediaValue value={value} onChange={(url) => onChange(path, url)} />
      );
    }

    return (
      <input
        type={typeof value === "number" ? "number" : "text"}
        value={value ?? ""}
        onChange={(e) => {
          let nextValue = e.target.value;

          if (typeof value === "number") {
            nextValue = e.target.value === "" ? "" : Number(e.target.value);
          }

          onChange(path, nextValue);
        }}
        className="w-full rounded-md border border-[#232836] bg-[#0d1017] px-3 py-2 text-sm text-gray-200 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
    );
  }

  // --------------------------------------------------
  // ARRAY
  // --------------------------------------------------

  if (isArray) {
    // "Rooms" -> "Room", "Offerings" -> "Offering" — used in the Add
    // button's label so it reads "Add Room" instead of generic "Add item".
    const itemLabel = singularize(formatLabel(path[path.length - 1] || "item"));
    const lastItem = value.length > 0 ? value[value.length - 1] : null;
    const lastIsObject =
      lastItem !== null &&
      typeof lastItem === "object" &&
      !Array.isArray(lastItem);

    const pushItem = (item) => {
      onChange(path, [...value, item]);
      setExpandedIndices((prev) => new Set(prev).add(value.length));
    };

    // Copies the shape of the most recent item (same field names, blanked
    // out) so a new room/offering/FAQ starts with the fields you expect
    // instead of one bare text box.
    const handleAddItem = () => {
      pushItem(lastIsObject ? blankLikeTemplate(lastItem) : "");
    };

    const handleDeleteItem = (index) => {
      onDelete([...path, index]);
      // Re-map expanded indices so collapse state doesn't drift after a
      // delete shifts everything after it down by one.
      setExpandedIndices((prev) => {
        const next = new Set();
        prev.forEach((i) => {
          if (i === index) return;
          next.add(i > index ? i - 1 : i);
        });
        return next;
      });
    };

    if (value.length === 0) {
      return (
        <div className="space-y-3">
          <div className="rounded-lg border border-dashed border-[#232836] p-5 text-center text-sm text-gray-500">
            No {itemLabel.toLowerCase()} items added yet.
          </div>
          <div className="flex flex-wrap gap-2">
            <AddButton
              label={`Add ${itemLabel} (text)`}
              onClick={() => pushItem("")}
            />
            <AddButton
              label={`Add ${itemLabel} (with fields)`}
              onClick={() => pushItem({})}
            />
            <ArrayAddMediaButton onAdd={(url) => pushItem(url)} />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {value.map((item, index) => {
          const itemIsObject =
            item !== null && typeof item === "object" && !Array.isArray(item);

          if (!itemIsObject) {
            return (
              <div
                key={index}
                className="rounded-xl border border-[#1f242e] bg-[#0d1017] p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-white">
                    Item {index + 1}
                  </span>
                  <IconButton
                    variant="delete"
                    title="Delete"
                    onClick={() => handleDeleteItem(index)}
                  />
                </div>
                <DynamicJsonEditor
                  value={item}
                  path={[...path, index]}
                  onChange={onChange}
                  onDelete={onDelete}
                />
              </div>
            );
          }

          return (
            <ArrayItemCard
              key={index}
              item={item}
              index={index}
              expanded={expandedIndices.has(index)}
              onToggle={() =>
                setExpandedIndices((prev) => {
                  const next = new Set(prev);
                  if (next.has(index)) {
                    next.delete(index);
                  } else {
                    next.add(index);
                  }
                  return next;
                })
              }
              onDelete={() => handleDeleteItem(index)}
            >
              <DynamicJsonEditor
                value={item}
                path={[...path, index]}
                onChange={onChange}
                onDelete={onDelete}
              />
            </ArrayItemCard>
          );
        })}

        <div className="flex flex-wrap gap-2">
          <AddButton label={`Add ${itemLabel}`} onClick={handleAddItem} />
          <ArrayAddMediaButton onAdd={(url) => pushItem(url)} />
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // OBJECT
  // --------------------------------------------------

  const takenKeys = existingKeys || Object.keys(value);

  const handleAddField = () => {
    const key = newKey.trim();
    if (!key) return;

    if (takenKeys.includes(key)) {
      alert("Field already exists");
      return;
    }

    if (newType === "media") {
      // Don't create the field yet — open the file picker first, so a
      // "media" field is never left sitting empty. handleAddMediaFile
      // below creates it once the upload actually succeeds.
      addMediaInputRef.current?.click();
      return;
    }

    let newValue = "";

    if (newType === "number") newValue = 0;
    if (newType === "boolean") newValue = false;
    if (newType === "object") newValue = {};
    if (newType === "array") newValue = [];

    onChange([...path, key], newValue);

    setNewKey("");
    setNewType("text");
  };

  const handleAddMediaFile = async (file) => {
    if (!file) return;
    const key = newKey.trim();
    if (!key) return;

    setAddingMedia(true);
    try {
      const url = await uploadMediaFile(file);
      onChange([...path, key], url);
      setNewKey("");
      setNewType("text");
    } catch (err) {
      alert(err?.response?.data?.error || err?.message || "Upload failed");
    } finally {
      setAddingMedia(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Fields grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {visibleEntries.map(([key, childValue]) => {
          const childIsObject =
            childValue !== null &&
            typeof childValue === "object" &&
            !Array.isArray(childValue);

          const childIsArray = Array.isArray(childValue);

          const isLargeField =
            childIsObject ||
            childIsArray ||
            (typeof childValue === "string" && childValue.length > 150);

          return (
            <div key={key} className={isLargeField ? "sm:col-span-2" : ""}>
              <div className="rounded-xl border border-[#1f242e] bg-[#0d1017] p-4">
                {/* Field header */}
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-medium uppercase tracking-wide text-blue-400">
                    {formatLabel(key)}
                  </label>

                  <IconButton
                    variant="delete"
                    title="Delete"
                    onClick={() => onDelete([...path, key])}
                  />
                </div>

                {/* Field value */}
                <DynamicJsonEditor
                  value={childValue}
                  path={[...path, key]}
                  onChange={onChange}
                  onDelete={onDelete}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Add field */}
      <div className="rounded-xl border border-dashed border-[#2a3040] bg-[#0a0c10] p-4">
        <div className="mb-3 flex items-center gap-2">
          <Plus size={15} className="text-blue-400" />
          <span className="text-sm font-medium text-gray-300">Add Field</span>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="Field name"
            className="flex-1 rounded-md border border-[#232836] bg-[#0d1017] px-3 py-2 text-sm text-gray-200 outline-none focus:border-blue-500"
          />

          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            className="rounded-md border border-[#232836] bg-[#0d1017] px-3 py-2 text-sm text-gray-200 outline-none"
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
            <option value="media">Media</option>
            <option value="object">Object</option>
            <option value="array">Array</option>
          </select>

          <button
            type="button"
            disabled={!newKey.trim() || addingMedia}
            onClick={handleAddField}
            className="flex items-center justify-center gap-1 rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-[#232836] disabled:text-gray-500"
          >
            {addingMedia ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            {addingMedia ? "Uploading..." : "Add"}
          </button>
        </div>

        <input
          ref={addMediaInputRef}
          type="file"
          accept="image/*,video/*,application/pdf"
          className="hidden"
          onChange={(e) => {
            handleAddMediaFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section config + wrapper
// ---------------------------------------------------------------------------

const SECTION_CONFIG = {
  kb_meta: {
    title: "KB Meta",
    icon: Settings2,
    iconColor: "text-purple-400",
    iconBg: "bg-purple-400/10",
  },
  business: {
    title: "Business",
    icon: Building2,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-400/10",
  },
  locations: {
    title: "Locations",
    icon: MapPin,
    iconColor: "text-orange-400",
    iconBg: "bg-orange-400/10",
  },
  location: {
    title: "Location",
    icon: MapPin,
    iconColor: "text-orange-400",
    iconBg: "bg-orange-400/10",
  },
  offerings: {
    title: "Offerings",
    icon: Package,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-400/10",
  },
  policies: {
    title: "Policies",
    icon: ShieldCheck,
    iconColor: "text-sky-400",
    iconBg: "bg-sky-400/10",
  },
  contact: {
    title: "Contact",
    icon: Phone,
    iconColor: "text-pink-400",
    iconBg: "bg-pink-400/10",
  },
  faqs: {
    title: "FAQs",
    icon: HelpCircle,
    iconColor: "text-indigo-400",
    iconBg: "bg-indigo-400/10",
  },
  fields_to_populate: {
    title: "Fields To Populate",
    icon: AlertCircle,
    iconColor: "text-red-400",
    iconBg: "bg-red-400/10",
  },
  data_gaps: {
    title: "Data Gaps",
    icon: AlertCircle,
    iconColor: "text-red-400",
    iconBg: "bg-red-400/10",
  },
  knowledge_base: {
    title: "Knowledge Base",
    icon: Settings2,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-400/10",
  },
};

// Sections rendered as a flagged/alert card instead of a plain one — these
// are gaps or conflicts, not regular content, so they should stand out in
// both the tab bar (badge count) and the content area (amber card).
const ALERT_SECTION_KEYS = new Set(["fields_to_populate", "data_gaps"]);

// Old top-level fields that are now duplicated inside knowledge_base (see
// knowledge_base.faqs, knowledge_base.data_gaps). Hiding them here is
// display-only — the underlying document is untouched — so nothing breaks
// if some other part of the backend still reads them. Worth a real cleanup
// migration later to drop the duplicates at the source.
const TOP_LEVEL_LEGACY_KEYS = new Set([
  "locations",
  "offerings",
  "faqs",
  "fields_to_populate",
]);

// This was referenced by EditableKnowledgeBase but never defined in the
// original file, which crashed the edit screen with a ReferenceError.
// It wraps each top-level KB section (kb_meta, business, locations, ...)
// in a styled SectionCard and hands the section's value off to the
// recursive NestedSection, so any further nesting inside a section also
// gets split into its own sub-tabs instead of scrolling.
function DynamicSection({ sectionKey, value, path, onChange, onDelete }) {
  const config = SECTION_CONFIG[sectionKey] || {
    title: formatLabel(sectionKey),
    icon: Settings2,
    iconColor: "text-gray-400",
    iconBg: "bg-gray-400/10",
  };

  const isAlert = ALERT_SECTION_KEYS.has(sectionKey);

  return (
    <SectionCard
      icon={config.icon}
      title={config.title}
      iconColor={config.iconColor}
      iconBg={config.iconBg}
      tone={isAlert ? "alert" : "default"}
      description={
        isAlert
          ? "Info the generator couldn't confirm, or found conflicting across pages. Review and fill these in."
          : undefined
      }
    >
      <NestedSection
        value={value}
        path={path}
        onChange={onChange}
        onDelete={onDelete}
      />
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
// Tab bar — used both for the top-level document tabs and for every nested
// sub-tab level. `size="sm"` gives nested levels a visually lighter style
// so depth is legible at a glance.
// ---------------------------------------------------------------------------

function TabBar({ sections, activeKey, onSelect, onAddSection, size = "md" }) {
  const [addingSection, setAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const isSmall = size === "sm";

  const submitNewSection = () => {
    const name = newSectionName.trim();
    if (!name) return;
    onAddSection(name);
    setNewSectionName("");
    setAddingSection(false);
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-1 ${
        isSmall ? "mb-4" : "mb-6 border-b border-[#1f242e] pb-1"
      }`}
    >
      {sections.map(({ key, title, gapCount }) => {
        const active = key === activeKey;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className={`flex items-center gap-1.5 rounded-md transition-colors ${
              isSmall ? "px-3 py-1.5 text-xs" : "px-3.5 py-2 text-sm"
            } ${
              active
                ? isSmall
                  ? "border border-blue-600/40 bg-blue-600/15 text-blue-300"
                  : "bg-blue-700 text-white"
                : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
            }`}
          >
            {title}
            {gapCount > 0 && (
              <span
                className={`ml-0.5 rounded-full px-1.5 text-[11px] font-medium ${
                  active
                    ? "bg-white/20 text-white"
                    : "bg-amber-500/15 text-amber-400"
                }`}
              >
                {gapCount}
              </span>
            )}
          </button>
        );
      })}

      {addingSection ? (
        <div className="flex items-center gap-1.5 pl-1">
          <input
            autoFocus
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitNewSection();
              if (e.key === "Escape") {
                setAddingSection(false);
                setNewSectionName("");
              }
            }}
            placeholder="Section name"
            className={`rounded-md border border-[#232836] bg-[#0d1017] text-gray-200 outline-none focus:border-blue-500 ${
              isSmall ? "w-28 px-2 py-1 text-xs" : "w-36 px-2.5 py-1.5 text-sm"
            }`}
          />
          <button
            type="button"
            onClick={submitNewSection}
            disabled={!newSectionName.trim()}
            className="rounded-md bg-blue-700 px-2.5 py-1.5 text-sm text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-[#232836] disabled:text-gray-500"
          >
            <Check size={14} />
          </button>
          <button
            type="button"
            onClick={() => {
              setAddingSection(false);
              setNewSectionName("");
            }}
            className="rounded-md p-1.5 text-gray-500 hover:bg-white/5 hover:text-gray-300"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          title="Add section"
          onClick={() => setAddingSection(true)}
          className="ml-1 flex items-center gap-1 rounded-md px-2.5 py-2 text-sm text-gray-500 hover:bg-white/5 hover:text-blue-400"
        >
          <Plus size={isSmall ? 13 : 15} />
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// NestedSection — the recursive piece. Given any value:
//  - primitive / array          -> render with the normal DynamicJsonEditor
//  - flat object (no groups)    -> also just DynamicJsonEditor, no tabs needed
//  - object with >=1 group key  -> render a sub-tab bar: one tab per group
//    key, plus a "General" tab for any plain fields sitting alongside them,
//    and recurse into whichever tab is active.
// This is what turns "Rooms" into its own Shared Attributes / Inventory
// sub-tabs instead of one long scrolling card, and applies at any depth.
// ---------------------------------------------------------------------------

function NestedSection({ value, path, onChange, onDelete }) {
  const isPlainObject =
    value !== null && typeof value === "object" && !Array.isArray(value);

  const entries = isPlainObject
    ? Object.entries(value).filter(([key]) => !HIDDEN_FIELDS.has(key))
    : [];

  const groupEntries = entries.filter(([, v]) => isGroupValue(v));
  const leafEntries = entries.filter(([, v]) => !isGroupValue(v));
  const hasSubTabs = isPlainObject && groupEntries.length > 0;

  const defaultKey =
    leafEntries.length > 0 ? "__general__" : (groupEntries[0]?.[0] ?? null);

  const [activeKey, setActiveKey] = useState(defaultKey);

  // Keep the active sub-tab valid if fields get added/removed underneath it.
  useEffect(() => {
    if (!hasSubTabs) return;
    const stillValid =
      activeKey === "__general__"
        ? leafEntries.length > 0
        : groupEntries.some(([k]) => k === activeKey);
    if (!stillValid) {
      setActiveKey(
        leafEntries.length > 0 ? "__general__" : (groupEntries[0]?.[0] ?? null),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Nothing to split — arrays, primitives, and flat objects render exactly
  // as they always did.
  if (!hasSubTabs) {
    return (
      <DynamicJsonEditor
        value={value}
        path={path}
        onChange={onChange}
        onDelete={onDelete}
      />
    );
  }

  const tabs = [
    ...(leafEntries.length > 0
      ? [{ key: "__general__", title: "General", gapCount: 0 }]
      : []),
    ...groupEntries.map(([key, v]) => ({
      key,
      title: SECTION_CONFIG[key]?.title || formatLabel(key),
      gapCount: ALERT_SECTION_KEYS.has(key) && Array.isArray(v) ? v.length : 0,
    })),
  ];

  const handleAddSubSection = (name) => {
    const key = slugifyKey(name);
    if (!key) return;
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      alert("A section with that name already exists");
      return;
    }
    onChange([...path, key], {});
    setActiveKey(key);
  };

  return (
    <div>
      <TabBar
        sections={tabs}
        activeKey={activeKey}
        onSelect={setActiveKey}
        onAddSection={handleAddSubSection}
        size="sm"
      />

      {activeKey === "__general__" ? (
        <DynamicJsonEditor
          value={Object.fromEntries(leafEntries)}
          path={path}
          existingKeys={Object.keys(value)}
          onChange={onChange}
          onDelete={onDelete}
        />
      ) : (
        <NestedSection
          value={value[activeKey]}
          path={[...path, activeKey]}
          onChange={onChange}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Editable Knowledge Base
// ---------------------------------------------------------------------------

function EditableKnowledgeBase({
  kb,
  setKb,
  slug,
  updatedAt,
  onPublish,
  onStartOver,
  onBack,
  publishing,
  published,
}) {
  const handleChange = (path, value) => {
    setKb((prev) => setValueAtPath(prev, path, value));
  };

  const handleDelete = (path) => {
    setKb((prev) => deleteValueAtPath(prev, path));
  };

  // Top level should really only ever be "url" and "knowledge_base" — the
  // TOP_LEVEL_LEGACY_KEYS filter hides old duplicate fields that are now
  // properly nested inside knowledge_base instead (see comment above).
  const sectionEntries = Object.entries(kb).filter(
    ([key]) => !HIDDEN_FIELDS.has(key) && !TOP_LEVEL_LEGACY_KEYS.has(key),
  );

  const [activeTab, setActiveTab] = useState(sectionEntries[0]?.[0] ?? null);

  // If the active tab's key disappears (deleted, or a different KB just
  // loaded), fall back to the first available section instead of showing
  // a blank pane.
  useEffect(() => {
    const stillExists = sectionEntries.some(([key]) => key === activeTab);
    if (!stillExists) {
      setActiveTab(sectionEntries[0]?.[0] ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kb]);

  const activeEntry = sectionEntries.find(([key]) => key === activeTab);

  const tabs = sectionEntries.map(([key, value]) => ({
    key,
    title: SECTION_CONFIG[key]?.title || formatLabel(key),
    gapCount:
      ALERT_SECTION_KEYS.has(key) && Array.isArray(value) ? value.length : 0,
  }));

  const handleAddSection = (name) => {
    const key = slugifyKey(name);
    if (!key) return;
    if (Object.prototype.hasOwnProperty.call(kb, key)) {
      alert("A section with that name already exists");
      return;
    }
    handleChange([key], {});
    setActiveTab(key);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Review Knowledge Base
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {slug
              ? "Editing a saved knowledge base. Update anything below, then save your changes."
              : "We generated this from your source. Edit anything below, then publish when it looks right."}
          </p>

          {slug && (
            <div className="mt-2 text-xs text-gray-500">
              Last saved{" "}
              {updatedAt ? new Date(updatedAt).toLocaleString() : "-"}
            </div>
          )}
        </div>

        {slug ? (
          // Once a KB is saved, the account is capped at one — there's no
          // "start over" that wouldn't risk creating a second record.
          // Edit fields in place, or go back and delete it to start fresh.
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 rounded-md border border-[#232836] px-4 py-2 text-sm text-gray-300 hover:border-blue-500 hover:text-blue-400"
          >
            <ArrowLeft size={14} />
            Back to list
          </button>
        ) : (
          <button
            type="button"
            onClick={onStartOver}
            className="flex items-center gap-2 rounded-md border border-[#232836] px-4 py-2 text-sm text-gray-300 hover:border-blue-500 hover:text-blue-400"
          >
            <RefreshCw size={14} />
            Start over
          </button>
        )}
      </div>

      {/* TOP-LEVEL TABS */}
      <TabBar
        sections={tabs}
        activeKey={activeTab}
        onSelect={setActiveTab}
        onAddSection={handleAddSection}
      />

      {/* ACTIVE SECTION ONLY — internally splits into its own sub-tabs
          wherever it has nested groups (see NestedSection). */}
      {activeEntry && (
        <DynamicSection
          key={activeEntry[0]}
          sectionKey={activeEntry[0]}
          value={activeEntry[1]}
          path={[activeEntry[0]]}
          onChange={handleChange}
          onDelete={handleDelete}
        />
      )}

      {/* SAVE */}
      <div className="flex items-center gap-3 border-t border-[#1f242e] pt-6">
        <button
          type="button"
          onClick={onPublish}
          disabled={publishing}
          className="flex items-center gap-2 rounded-md bg-blue-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-600 disabled:bg-[#232836]"
        >
          {publishing ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {publishing
            ? "Saving..."
            : slug
              ? "Save Changes"
              : "Publish Knowledge Base"}
        </button>

        {published && <span className="text-sm text-emerald-400">Saved</span>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Top-level page: list -> intake -> generate -> edit -> publish (create/update)
// ---------------------------------------------------------------------------

export default function KnowledgeBasePage() {
  const [phase, setPhase] = useState("list"); // "list" | "intake" | "edit"

  // --- list state ---
  const [items, setItems] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");

  // --- intake state ---
  const [url, setUrl] = useState("");
  const [clientName, setClientName] = useState("");
  const [file, setFile] = useState(null);
  const [images, setImages] = useState([]); // [{ file, previewUrl }]
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");

  // --- edit state ---
  const [kb, setKb] = useState(emptyKb);
  const [activeSlug, setActiveSlug] = useState(null); // null = unsaved / new
  const [activeUpdatedAt, setActiveUpdatedAt] = useState(null);
  const [activeSourceUrl, setActiveSourceUrl] = useState(null); // the URL this record belongs to
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const loadList = async () => {
    setListLoading(true);
    setListError("");

    try {
      const { hid, ndid } = getTenantContext();

      const res = await axios.get(KB_ENDPOINT, {
        headers: authHeaders(),
        params: { hid, ndid },
      });

      setItems(res.data?.items || []);
    } catch (err) {
      console.error("Error loading knowledge bases:", err);

      setListError(
        err?.response?.data?.error ||
          err?.message ||
          "Could not load saved knowledge bases.",
      );
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (phase === "list") loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const handleGenerate = async () => {
    setGenError("");

    // Safety net for the "one knowledge base per account" rule: the
    // Generate New button is already hidden once a KB exists, but guard
    // here too in case this is reached some other way (e.g. Start Over).
    if (items.length > 0 && !activeSlug) {
      setGenError(
        "You already have a knowledge base. Edit your existing one, or delete it first to generate a new one.",
      );
      return;
    }

    setGenerating(true);
    try {
      // 1) Check the database first — if this URL was already generated
      // and saved before, load that saved record straight into the edit
      // form instead of calling n8n again. Editing it will then use
      // handlePublish's UPDATE path (PUT), not create a duplicate.
      try {
        const lookupRes = await axios.get(`${KB_ENDPOINT}`, {
          params: { url: url.trim() },
          headers: authHeaders(),
        });
        const existing = lookupRes.data?.knowledgeBase;
        if (existing) {
          setKb(normalizeKb(existing));
          // Use _id consistently with handleEditExisting/handlePublish,
          // which both key off the Mongo document's _id.
          setActiveSlug(existing._id);
          setActiveUpdatedAt(existing.updatedAt || null);
          setActiveSourceUrl(existing.source_url || url.trim());
          setPhase("edit");
          setGenerating(false);
          return; // found it — no need to hit n8n at all
        }
      } catch (lookupErr) {
        // 404 just means "nothing saved yet for this URL" — that's the
        // expected case, fall through to generating a fresh one. Any other
        // status is logged but we still try to generate rather than block.
        if (lookupErr?.response?.status !== 404) {
          console.warn(
            "Knowledge base lookup failed, generating fresh instead:",
            lookupErr,
          );
        }
      }

      // 2) Not found -> generate fresh via n8n, same as before.
      let response;
      if (file || images.length > 0) {
        const form = new FormData();
        form.append("website_url", url.trim());
        if (clientName.trim()) form.append("client_name", clientName.trim());
        if (file) form.append("pdf_file", file);
        images.forEach((img) => form.append("images", img.file));
        response = await axios.post(GENERATE_ENDPOINT, form, {
          responseType: "blob",
          headers: { "Content-Type": "multipart/form-data", ...authHeaders() },
        });
      } else {
        response = await axios.post(
          GENERATE_ENDPOINT,
          {
            website_url: url.trim(),
            client_name: clientName.trim() || undefined,
            hid: localStorage.getItem("hid"),
            ndid: localStorage.getItem("ndid"),
          },
          {
            responseType: "blob",
            headers: { "Content-Type": "application/json", ...authHeaders() },
          },
        );
      }

      const text = await response.data.text();
      const data = JSON.parse(text);

      if (data?.success === false || data?.error) {
        const message = data.details
          ? `${data.error}: ${data.details}`
          : data.error ||
            "Could not generate a valid knowledge base from that source.";
        throw new Error(message);
      }

      setKb(normalizeKb(unwrapGeneratedKb(data)));
      setActiveSlug(null); // freshly generated -> not saved yet -> Publish will CREATE
      setActiveUpdatedAt(null);
      setActiveSourceUrl(url.trim());
      setPhase("edit");
      // Intake inputs are no longer needed once we're on the edit screen.
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
      setImages([]);
      setFile(null);
    } catch (err) {
      console.error("Error generating knowledge base:", err);
      let message =
        "Something went wrong while generating the knowledge base. Please try again.";
      try {
        if (err?.response?.data instanceof Blob) {
          const text = await err.response.data.text();
          const parsed = JSON.parse(text);
          message = parsed.details
            ? `${parsed.error}: ${parsed.details}`
            : parsed.error || parsed.message || message;
        } else {
          message =
            err?.response?.data?.error ||
            err?.response?.data?.message ||
            err?.message ||
            message;
        }
      } catch (_) {
        message = err?.message || message;
      }
      setGenError(message);
    } finally {
      setGenerating(false);
    }
  };

  const handleEditExisting = async (id) => {
    try {
      const res = await axios.get(`${KB_ENDPOINT}/${id}`, {
        headers: authHeaders(),
      });

      const doc = res.data?.knowledgeBase;

      if (!doc) return;

      setKb(normalizeKb(doc));
      setActiveSlug(doc._id);
      setActiveUpdatedAt(doc.updatedAt || null);
      setActiveSourceUrl(doc.source_url || null);
      setPhase("edit");
    } catch (err) {
      console.error("Error loading knowledge base:", err);
      setListError(
        err?.response?.data?.error ||
          err?.message ||
          "Could not load that knowledge base.",
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${KB_ENDPOINT}/${id}`, { headers: authHeaders() });
      // Items use Mongo's _id (see SavedListStep / handleEditExisting), not
      // "id" — filtering on the wrong key left the deleted card on screen.
      setItems((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      console.error("Error deleting knowledge base:", err);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);

    try {
      const { hid, ndid } = getTenantContext();

      const payload = {
        ...kb,
        source_url: activeSourceUrl || undefined,
        hid,
        ndid,
      };

      let res;

      if (activeSlug) {
        // EXISTING KB → UPDATE
        console.log("Updating KB:", activeSlug);

        res = await axios.put(`${KB_ENDPOINT}/${activeSlug}`, payload, {
          headers: { "Content-Type": "application/json", ...authHeaders() },
        });
      } else {
        // NEW KB → CREATE
        console.log("Creating new KB");

        res = await axios.post(KB_ENDPOINT, payload, {
          headers: { "Content-Type": "application/json", ...authHeaders() },
        });
      }

      console.log("Save response:", res.data);

      const doc = res.data?.knowledgeBase;

      if (!doc) {
        throw new Error("Backend did not return the saved knowledge base");
      }

      // Update frontend with the actual DB document
      setKb(normalizeKb(doc));
      setActiveSlug(doc._id);
      setActiveUpdatedAt(doc.updatedAt || null);
      setActiveSourceUrl(doc.source_url || activeSourceUrl);
      setPublished(true);

      setTimeout(() => {
        setPublished(false);
      }, 2000);
    } catch (err) {
      console.error("Knowledge base save failed:", err);
      console.error("Response:", err?.response?.data);

      alert(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to save knowledge base",
      );
    } finally {
      setPublishing(false);
    }
  };

  const handleStartOver = () => {
    setPhase("intake");
    setUrl("");
    setClientName("");
    setFile(null);
    setImages((prev) => {
      prev.forEach((img) => URL.revokeObjectURL(img.previewUrl));
      return [];
    });
    setKb(emptyKb);
    setActiveSlug(null);
    setActiveUpdatedAt(null);
    setActiveSourceUrl(null);
    setGenError("");
  };

  const handleBackToList = () => setPhase("list");

  return (
    <div className="min-h-screen bg-[#0a0c10] px-4 py-10 text-gray-200 sm:px-8">
      {phase === "list" && (
        <SavedListStep
          items={items}
          loading={listLoading}
          error={listError}
          onEdit={handleEditExisting}
          onDelete={handleDelete}
          onCreateNew={handleStartOver}
        />
      )}

      {phase === "intake" && (
        <IntakeStep
          url={url}
          setUrl={setUrl}
          clientName={clientName}
          setClientName={setClientName}
          file={file}
          setFile={setFile}
          images={images}
          setImages={setImages}
          onGenerate={handleGenerate}
          generating={generating}
          error={genError}
          onBack={handleBackToList}
        />
      )}

      {phase === "edit" && (
        <EditableKnowledgeBase
          kb={kb}
          setKb={setKb}
          slug={activeSlug}
          updatedAt={activeUpdatedAt}
          onPublish={handlePublish}
          onStartOver={handleStartOver}
          onBack={handleBackToList}
          publishing={publishing}
          published={published}
        />
      )}
    </div>
  );
}

// nishatn code

// import { useState, useRef, useEffect } from "react";
// import axios from "axios";
// import {
//   Pencil,
//   Trash2,
//   Plus,
//   Building2,
//   MapPin,
//   Package,
//   ShieldCheck,
//   Phone,
//   HelpCircle,
//   AlertCircle,
//   Save,
//   Settings2,
//   X,
//   Check,
//   Globe,
//   FileUp,
//   Sparkles,
//   Loader2,
//   RefreshCw,
//   FileText,
//   ArrowLeft,
//   Hash,
//   Clock,
//   Image as ImageIcon,
//   Lock,
// } from "lucide-react";
// import { NEW_BASE_URL } from "../../data/constant";

// // ---------------------------------------------------------------------------
// // Wire these to your real backend. Left as constants so it's a one-line swap.
// // ---------------------------------------------------------------------------
// const SALES_AGENT_BASE_URL = NEW_BASE_URL; // <-- replace with your real base url
// const GENERATE_ENDPOINT = `${SALES_AGENT_BASE_URL}/api/v1/kb-generator/generate`;
// // Same base used for list / get / create / update / delete — the CRUD
// // routes for saved knowledge bases (see knowledgeBase.routes.ts).
// const KB_ENDPOINT = `${SALES_AGENT_BASE_URL}/api/v1/knowledgebase`;

// const authHeaders = () => ({
//   Authorization: `Bearer ${localStorage.getItem("token")}`,
// });

// const getTenantContext = () => {
//   let hid = localStorage.getItem("hid");
//   let ndid = localStorage.getItem("ndid");

//   // Agar localStorage me nahi hai, to create karo
//   if (!hid) {
//     hid = crypto.randomUUID();
//     localStorage.setItem("hid", hid);
//   }

//   if (!ndid) {
//     ndid = crypto.randomUUID();
//     localStorage.setItem("ndid", ndid);
//   }

//   return { hid, ndid };
// };

// const emptyKb = {
//   kb_meta: {
//     kb_name: "",
//     version: "1.0",
//     built_on: "",
//     source_domain: "",
//     default_language: "en",
//     currency: "",
//     timezone: "",
//   },
//   business: { brand: "", category: "", positioning: "", description: "" },
//   locations: [],
//   offerings: [],
//   policies: { cancellation: "", payment: "", other: [] },
//   contact: { phone: "", whatsapp: "", email: "", social: {} },
//   faqs: [],
//   fields_to_populate: [],
// };

// // Fills in any missing keys/arrays on whatever JSON the backend returns, so a
// // partial or slightly-different-shaped response never crashes the form.
// const normalizeKb = (raw = {}) => structuredClone(raw);

// // n8n sometimes wraps the generated KB in an array (multiple items),
// // sometimes returns it as a plain object — handle both shapes safely.
// const unwrapGeneratedKb = (data) => {
//   const payload = data?.knowledgeBase ?? data;
//   return Array.isArray(payload) ? payload[0] : payload;
// };

// // ---------------------------------------------------------------------------
// // Small building blocks
// // ---------------------------------------------------------------------------

// const IconButton = ({ onClick, variant = "edit", title }) => {
//   const styles =
//     variant === "delete"
//       ? "text-red-500 hover:text-red-400 hover:bg-red-500/10"
//       : variant === "confirm"
//         ? "text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
//         : "text-gray-400 hover:text-white hover:bg-white/5";
//   const Icon =
//     variant === "delete" ? Trash2 : variant === "confirm" ? Check : Pencil;
//   return (
//     <button
//       type="button"
//       title={title}
//       onClick={onClick}
//       className={`rounded-md p-1.5 transition-colors ${styles}`}
//     >
//       <Icon size={16} />
//     </button>
//   );
// };

// const AddButton = ({ onClick, label = "Add" }) => (
//   <button
//     type="button"
//     onClick={onClick}
//     className="flex items-center gap-1.5 rounded-md border border-dashed border-[#2a3040] px-4 py-2 text-sm text-gray-300 transition-colors hover:border-blue-500 hover:text-blue-400"
//   >
//     <Plus size={15} />
//     {label}
//   </button>
// );

// const SectionCard = ({
//   icon: Icon,
//   title,
//   subtitle,
//   children,
//   iconColor = "text-orange-400",
//   iconBg = "bg-orange-400/10",
// }) => (
//   <section className="rounded-2xl border border-[#1f242e] bg-[#12151c] p-6">
//     <div className="mb-4 flex items-center gap-2.5">
//       <span
//         className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}
//       >
//         <Icon size={18} />
//       </span>
//       <h2 className="text-lg font-bold text-white">{title}</h2>
//       {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
//     </div>
//     {children}
//   </section>
// );

// // ---------------------------------------------------------------------------
// // STEP 0 — Saved knowledge bases list: every card shows its unique slug
// // (the id used to look it up / edit it) next to an Edit button.
// // ---------------------------------------------------------------------------

// function SavedListStep({
//   items,
//   loading,
//   error,
//   onEdit,
//   onCreateNew,
//   onDelete,
// }) {
//   // A tenant may only have a single knowledge base. Once one exists, hide
//   // the "Generate New" action entirely instead of letting them create a
//   // second one — they edit (or delete) the existing record instead.
//   const hasSavedKb = !loading && items.length > 0;

//   return (
//     <div className="mx-auto max-w-4xl">
//       <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
//         <div>
//           <h1 className="text-2xl font-bold text-white">
//             Saved Knowledge Bases
//           </h1>
//           <p className="mt-1 text-sm text-gray-500">
//             {hasSavedKb
//               ? "You already have a knowledge base. Edit it below."
//               : "Generate your knowledge base to get started."}
//           </p>
//         </div>
//         {!hasSavedKb && !loading && (
//           <button
//             type="button"
//             onClick={onCreateNew}
//             className="flex items-center gap-2 rounded-md bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600"
//           >
//             <Sparkles size={15} /> Generate New
//           </button>
//         )}
//         {hasSavedKb && (
//           <span
//             title="You can only have one knowledge base. Delete the existing one to generate a new one."
//             className="flex items-center gap-1.5 rounded-md border border-[#232836] px-3 py-2 text-xs text-gray-500"
//           >
//             <Lock size={12} /> One knowledge base per account
//           </span>
//         )}
//       </div>

//       {loading && (
//         <div className="flex items-center gap-2 rounded-2xl border border-[#1f242e] bg-[#12151c] p-6 text-sm text-gray-400">
//           <Loader2 size={16} className="animate-spin" /> Loading saved knowledge
//           bases...
//         </div>
//       )}

//       {!loading && error && (
//         <p className="flex items-center gap-1.5 rounded-2xl border border-red-900/40 bg-red-500/5 p-4 text-sm text-red-400">
//           <AlertCircle size={14} /> {error}
//         </p>
//       )}

//       {!loading && !error && items.length === 0 && (
//         <div className="rounded-2xl border border-dashed border-[#2a3040] p-10 text-center text-sm text-gray-500">
//           No knowledge bases saved yet. Generate one to get started.
//         </div>
//       )}

//       {!loading && !error && items.length > 0 && (
//         <div className="space-y-3">
//           {items.map((item) => {
//             const name =
//               item?.kb_meta?.kb_name ||
//               item?.business?.brand ||
//               item.client_name ||
//               "Untitled";
//             const domain = item?.kb_meta?.source_domain;
//             return (
//               <div
//                 key={item._id}
//                 className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#1f242e] bg-[#12151c] p-4"
//               >
//                 <div className="min-w-0">
//                   <p className="truncate font-semibold text-white">{name}</p>
//                   <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
//                     <span className="flex items-center gap-1">
//                       <Hash size={11} /> {item._id}
//                     </span>
//                     {domain && <span className="truncate">{domain}</span>}
//                     {item.updatedAt && (
//                       <span className="flex items-center gap-1">
//                         <Clock size={11} />{" "}
//                         {new Date(item.updatedAt).toLocaleString()}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//                 <div className="flex shrink-0 items-center gap-2">
//                   <button
//                     type="button"
//                     onClick={() => onEdit(item._id)}
//                     className="flex items-center gap-1.5 rounded-md border border-[#232836] px-3 py-1.5 text-sm text-gray-200 hover:border-blue-500 hover:text-blue-400"
//                   >
//                     <Pencil size={14} /> Edit
//                   </button>
//                   <IconButton
//                     variant="delete"
//                     title="Delete"
//                     onClick={() => onDelete(item._id)}
//                   />
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }

// // ---------------------------------------------------------------------------
// // STEP 1 — Intake: client gives a URL and/or a PDF, then generates the KB
// // ---------------------------------------------------------------------------

// const MAX_IMAGES = 8;

// function IntakeStep({
//   url,
//   setUrl,
//   clientName,
//   setClientName,
//   file,
//   setFile,
//   images,
//   setImages,
//   onGenerate,
//   generating,
//   error,
//   onBack,
// }) {
//   const fileInputRef = useRef(null);
//   const imageInputRef = useRef(null);
//   const [dragOver, setDragOver] = useState(false);
//   const [imagesDragOver, setImagesDragOver] = useState(false);

//   const pickFile = (f) => {
//     if (f && f.type === "application/pdf") setFile(f);
//   };

//   const pickImages = (fileList) => {
//     const incoming = Array.from(fileList || []).filter((f) =>
//       f.type.startsWith("image/"),
//     );
//     if (incoming.length === 0) return;

//     setImages((prev) => {
//       const room = Math.max(0, MAX_IMAGES - prev.length);
//       const accepted = incoming.slice(0, room).map((f) => ({
//         file: f,
//         previewUrl: URL.createObjectURL(f),
//       }));
//       return [...prev, ...accepted];
//     });
//   };

//   const removeImage = (index) => {
//     setImages((prev) => {
//       const next = [...prev];
//       const [removed] = next.splice(index, 1);
//       if (removed) URL.revokeObjectURL(removed.previewUrl);
//       return next;
//     });
//   };

//   return (
//     <div className="mx-auto max-w-2xl">
//       <button
//         type="button"
//         onClick={onBack}
//         className="mb-6 flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-400"
//       >
//         <ArrowLeft size={14} /> Back to saved knowledge bases
//       </button>

//       <div className="mb-8 text-center">
//         <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-400/10 text-orange-400">
//           <Sparkles size={22} />
//         </span>
//         <h1 className="text-2xl font-bold text-white">
//           Generate Knowledge Base
//         </h1>
//         <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
//           Give us your website link (required), and optionally a PDF (brochure,
//           tariff sheet, policy doc) — we'll pull everything into a structured
//           knowledge base you can review and edit.
//         </p>
//       </div>

//       <div className="space-y-5 rounded-2xl border border-[#1f242e] bg-[#12151c] p-6">
//         {/* URL input */}
//         <div className="space-y-1.5">
//           <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-blue-400">
//             <Globe size={13} /> Website URL
//           </label>
//           <input
//             type="url"
//             value={url}
//             onChange={(e) => setUrl(e.target.value)}
//             placeholder="https://yourhotel.com"
//             className="w-full rounded-md border border-[#232836] bg-[#0d1017] px-3 py-2.5 text-sm text-gray-200 outline-none placeholder:text-gray-600 focus:ring-2 focus:ring-blue-600"
//           />
//         </div>

//         <div className="space-y-1.5">
//           <label className="text-xs font-medium uppercase tracking-wide text-blue-400">
//             Client Name (optional)
//           </label>
//           <input
//             type="text"
//             value={clientName}
//             onChange={(e) => setClientName(e.target.value)}
//             placeholder="e.g. Test Multi"
//             className="w-full rounded-md border border-[#232836] bg-[#0d1017] px-3 py-2.5 text-sm text-gray-200 outline-none placeholder:text-gray-600 focus:ring-2 focus:ring-blue-600"
//           />
//         </div>

//         <div className="flex items-center gap-3 text-xs text-gray-600">
//           <div className="h-px flex-1 bg-[#1f242e]" />
//           optional
//           <div className="h-px flex-1 bg-[#1f242e]" />
//         </div>

//         {/* PDF upload */}
//         <div className="space-y-1.5">
//           <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-blue-400">
//             <FileUp size={13} /> Upload PDF
//           </label>
//           <div
//             onClick={() => fileInputRef.current?.click()}
//             onDragOver={(e) => {
//               e.preventDefault();
//               setDragOver(true);
//             }}
//             onDragLeave={() => setDragOver(false)}
//             onDrop={(e) => {
//               e.preventDefault();
//               setDragOver(false);
//               pickFile(e.dataTransfer.files?.[0]);
//             }}
//             className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed px-4 py-8 text-center transition-colors ${
//               dragOver
//                 ? "border-blue-500 bg-blue-500/5"
//                 : "border-[#2a3040] hover:border-blue-500/60"
//             }`}
//           >
//             {file ? (
//               <div className="flex items-center gap-2 text-sm text-gray-200">
//                 <FileText size={16} className="text-orange-400" />
//                 {file.name}
//                 <button
//                   type="button"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setFile(null);
//                   }}
//                   className="ml-1 rounded p-0.5 text-gray-500 hover:bg-white/10 hover:text-red-400"
//                 >
//                   <X size={14} />
//                 </button>
//               </div>
//             ) : (
//               <>
//                 <FileUp size={20} className="text-gray-500" />
//                 <p className="text-sm text-gray-400">
//                   Drop a PDF here, or{" "}
//                   <span className="text-blue-400">browse</span>
//                 </p>
//               </>
//             )}
//             <input
//               ref={fileInputRef}
//               type="file"
//               accept="application/pdf"
//               className="hidden"
//               onChange={(e) => pickFile(e.target.files?.[0])}
//             />
//           </div>
//         </div>

//         {/* Image upload */}
//         <div className="space-y-1.5">
//           <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-blue-400">
//             <ImageIcon size={13} /> Upload Images
//             <span className="normal-case tracking-normal text-gray-600">
//               ({images.length}/{MAX_IMAGES})
//             </span>
//           </label>
//           <div
//             onClick={() =>
//               images.length < MAX_IMAGES && imageInputRef.current?.click()
//             }
//             onDragOver={(e) => {
//               e.preventDefault();
//               if (images.length < MAX_IMAGES) setImagesDragOver(true);
//             }}
//             onDragLeave={() => setImagesDragOver(false)}
//             onDrop={(e) => {
//               e.preventDefault();
//               setImagesDragOver(false);
//               pickImages(e.dataTransfer.files);
//             }}
//             className={`flex flex-col items-center justify-center gap-2 rounded-md border border-dashed px-4 py-8 text-center transition-colors ${
//               images.length >= MAX_IMAGES
//                 ? "cursor-not-allowed border-[#1f242e] opacity-50"
//                 : "cursor-pointer"
//             } ${
//               imagesDragOver
//                 ? "border-blue-500 bg-blue-500/5"
//                 : "border-[#2a3040] hover:border-blue-500/60"
//             }`}
//           >
//             <ImageIcon size={20} className="text-gray-500" />
//             <p className="text-sm text-gray-400">
//               {images.length >= MAX_IMAGES ? (
//                 "Maximum images reached"
//               ) : (
//                 <>
//                   Drop images here, or{" "}
//                   <span className="text-blue-400">browse</span>
//                 </>
//               )}
//             </p>
//             <p className="text-xs text-gray-600">
//               Property photos, room shots, menu images, logos — JPG, PNG, or
//               WEBP
//             </p>
//             <input
//               ref={imageInputRef}
//               type="file"
//               accept="image/*"
//               multiple
//               className="hidden"
//               onChange={(e) => {
//                 pickImages(e.target.files);
//                 e.target.value = "";
//               }}
//             />
//           </div>

//           {images.length > 0 && (
//             <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
//               {images.map((img, index) => (
//                 <div
//                   key={img.previewUrl}
//                   className="group relative aspect-square overflow-hidden rounded-md border border-[#232836]"
//                 >
//                   <img
//                     src={img.previewUrl}
//                     alt={img.file.name}
//                     className="h-full w-full object-cover"
//                   />
//                   <button
//                     type="button"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       removeImage(index);
//                     }}
//                     className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-gray-200 opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
//                     title="Remove"
//                   >
//                     <X size={12} />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {error && (
//           <p className="flex items-center gap-1.5 text-sm text-red-400">
//             <AlertCircle size={14} /> {error}
//           </p>
//         )}

//         <button
//           type="button"
//           disabled={!url.trim() || generating}
//           onClick={onGenerate}
//           className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-[#232836] disabled:text-gray-500"
//         >
//           {generating ? (
//             <>
//               <Loader2 size={16} className="animate-spin" /> Generating
//               knowledge base...
//             </>
//           ) : (
//             <>
//               <Sparkles size={16} /> Generate Knowledge Base
//             </>
//           )}
//         </button>
//       </div>
//     </div>
//   );
// }

// // ---------------------------------------------------------------------------
// // Dynamic JSON helpers
// // ---------------------------------------------------------------------------

// const cloneValue = (value) => {
//   if (typeof structuredClone === "function") {
//     return structuredClone(value);
//   }

//   return JSON.parse(JSON.stringify(value));
// };

// const setValueAtPath = (object, path, value) => {
//   const result = cloneValue(object);

//   if (path.length === 0) {
//     return value;
//   }

//   let current = result;

//   for (let i = 0; i < path.length - 1; i++) {
//     const key = path[i];

//     if (
//       current[key] === null ||
//       current[key] === undefined ||
//       typeof current[key] !== "object"
//     ) {
//       current[key] = {};
//     }

//     current = current[key];
//   }

//   current[path[path.length - 1]] = value;

//   return result;
// };

// const deleteValueAtPath = (object, path) => {
//   const result = cloneValue(object);

//   if (!path.length) {
//     return result;
//   }

//   let current = result;

//   for (let i = 0; i < path.length - 1; i++) {
//     if (
//       current === null ||
//       current === undefined ||
//       typeof current !== "object"
//     ) {
//       return result;
//     }

//     current = current[path[i]];
//   }

//   const lastKey = path[path.length - 1];

//   if (Array.isArray(current)) {
//     current.splice(Number(lastKey), 1);
//   } else if (current && typeof current === "object") {
//     delete current[lastKey];
//   }

//   return result;
// };

// // ---------------------------------------------------------------------------
// // Dynamic Field Editor
// // ---------------------------------------------------------------------------

// const HIDDEN_FIELDS = new Set([
//   "_id",
//   "__v",
//   "hid",
//   "ndid",
//   "createdAt",
//   "updatedAt",
//   "normalized_source_url",
// ]);

// const formatLabel = (key) => {
//   return key
//     .replace(/_/g, " ")
//     .replace(/\./g, " ")
//     .replace(/\b\w/g, (char) => char.toUpperCase());
// };

// function DynamicJsonEditor({ value, path = [], onChange, onDelete }) {
//   const [newKey, setNewKey] = useState("");
//   const [newType, setNewType] = useState("text");

//   const isArray = Array.isArray(value);

//   const isObject =
//     value !== null && typeof value === "object" && !Array.isArray(value);

//   const visibleEntries = isObject
//     ? Object.entries(value).filter(([key]) => !HIDDEN_FIELDS.has(key))
//     : [];

//   // --------------------------------------------------
//   // Primitive
//   // --------------------------------------------------

//   if (!isObject && !isArray) {
//     if (typeof value === "boolean") {
//       return (
//         <label className="flex items-center gap-2 text-sm text-gray-300">
//           <input
//             type="checkbox"
//             checked={Boolean(value)}
//             onChange={(e) => onChange(path, e.target.checked)}
//             className="h-4 w-4 rounded border-[#232836] bg-[#0d1017]"
//           />
//           <span>{value ? "Enabled" : "Disabled"}</span>
//         </label>
//       );
//     }

//     return (
//       <input
//         type={typeof value === "number" ? "number" : "text"}
//         value={value ?? ""}
//         onChange={(e) => {
//           let nextValue = e.target.value;

//           if (typeof value === "number") {
//             nextValue = e.target.value === "" ? "" : Number(e.target.value);
//           }

//           onChange(path, nextValue);
//         }}
//         className="w-full rounded-md border border-[#232836] bg-[#0d1017] px-3 py-2 text-sm text-gray-200 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
//       />
//     );
//   }

//   // --------------------------------------------------
//   // ARRAY
//   // --------------------------------------------------

//   if (isArray) {
//     return (
//       <div className="space-y-3">
//         {value.length === 0 && (
//           <div className="rounded-lg border border-dashed border-[#232836] p-5 text-center text-sm text-gray-500">
//             No items added yet.
//           </div>
//         )}

//         {value.map((item, index) => (
//           <div
//             key={index}
//             className="rounded-xl border border-[#1f242e] bg-[#0d1017] p-4"
//           >
//             <div className="mb-3 flex items-center justify-between">
//               <span className="text-sm font-medium text-white">
//                 Item {index + 1}
//               </span>

//               <IconButton
//                 variant="delete"
//                 title="Delete"
//                 onClick={() => onDelete([...path, index])}
//               />
//             </div>

//             <DynamicJsonEditor
//               value={item}
//               path={[...path, index]}
//               onChange={onChange}
//               onDelete={onDelete}
//             />
//           </div>
//         ))}

//         <AddButton
//           label="Add item"
//           onClick={() => onChange(path, [...value, ""])}
//         />
//       </div>
//     );
//   }

//   // --------------------------------------------------
//   // OBJECT
//   // --------------------------------------------------

//   return (
//     <div className="space-y-4">
//       {/* Fields grid */}
//       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//         {visibleEntries.map(([key, childValue]) => {
//           const childIsObject =
//             childValue !== null &&
//             typeof childValue === "object" &&
//             !Array.isArray(childValue);

//           const childIsArray = Array.isArray(childValue);

//           const isLargeField =
//             childIsObject ||
//             childIsArray ||
//             (typeof childValue === "string" && childValue.length > 150);

//           return (
//             <div key={key} className={isLargeField ? "sm:col-span-2" : ""}>
//               <div className="rounded-xl border border-[#1f242e] bg-[#0d1017] p-4">
//                 {/* Field header */}
//                 <div className="mb-2 flex items-center justify-between">
//                   <label className="text-xs font-medium uppercase tracking-wide text-blue-400">
//                     {formatLabel(key)}
//                   </label>

//                   <IconButton
//                     variant="delete"
//                     title="Delete"
//                     onClick={() => onDelete([...path, key])}
//                   />
//                 </div>

//                 {/* Field value */}
//                 <DynamicJsonEditor
//                   value={childValue}
//                   path={[...path, key]}
//                   onChange={onChange}
//                   onDelete={onDelete}
//                 />
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Add field */}
//       <div className="rounded-xl border border-dashed border-[#2a3040] bg-[#0a0c10] p-4">
//         <div className="mb-3 flex items-center gap-2">
//           <Plus size={15} className="text-blue-400" />
//           <span className="text-sm font-medium text-gray-300">Add Field</span>
//         </div>

//         <div className="flex flex-col gap-2 sm:flex-row">
//           <input
//             value={newKey}
//             onChange={(e) => setNewKey(e.target.value)}
//             placeholder="Field name"
//             className="flex-1 rounded-md border border-[#232836] bg-[#0d1017] px-3 py-2 text-sm text-gray-200 outline-none focus:border-blue-500"
//           />

//           <select
//             value={newType}
//             onChange={(e) => setNewType(e.target.value)}
//             className="rounded-md border border-[#232836] bg-[#0d1017] px-3 py-2 text-sm text-gray-200 outline-none"
//           >
//             <option value="text">Text</option>
//             <option value="number">Number</option>
//             <option value="boolean">Boolean</option>
//             <option value="object">Object</option>
//             <option value="array">Array</option>
//           </select>

//           <button
//             type="button"
//             disabled={!newKey.trim()}
//             onClick={() => {
//               const key = newKey.trim();

//               if (!key) return;

//               if (Object.prototype.hasOwnProperty.call(value, key)) {
//                 alert("Field already exists");
//                 return;
//               }

//               let newValue = "";

//               if (newType === "number") newValue = 0;
//               if (newType === "boolean") newValue = false;
//               if (newType === "object") newValue = {};
//               if (newType === "array") newValue = [];

//               onChange([...path, key], newValue);

//               setNewKey("");
//               setNewType("text");
//             }}
//             className="flex items-center justify-center gap-1 rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-[#232836] disabled:text-gray-500"
//           >
//             <Plus size={14} />
//             Add
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ---------------------------------------------------------------------------
// // Section config + wrapper
// // ---------------------------------------------------------------------------

// const SECTION_CONFIG = {
//   kb_meta: {
//     title: "KB Meta",
//     icon: Settings2,
//     iconColor: "text-purple-400",
//     iconBg: "bg-purple-400/10",
//   },
//   business: {
//     title: "Business",
//     icon: Building2,
//     iconColor: "text-amber-400",
//     iconBg: "bg-amber-400/10",
//   },
//   locations: {
//     title: "Locations",
//     icon: MapPin,
//     iconColor: "text-orange-400",
//     iconBg: "bg-orange-400/10",
//   },
//   offerings: {
//     title: "Offerings",
//     icon: Package,
//     iconColor: "text-emerald-400",
//     iconBg: "bg-emerald-400/10",
//   },
//   policies: {
//     title: "Policies",
//     icon: ShieldCheck,
//     iconColor: "text-sky-400",
//     iconBg: "bg-sky-400/10",
//   },
//   contact: {
//     title: "Contact",
//     icon: Phone,
//     iconColor: "text-pink-400",
//     iconBg: "bg-pink-400/10",
//   },
//   faqs: {
//     title: "FAQs",
//     icon: HelpCircle,
//     iconColor: "text-indigo-400",
//     iconBg: "bg-indigo-400/10",
//   },
//   fields_to_populate: {
//     title: "Fields To Populate",
//     icon: AlertCircle,
//     iconColor: "text-red-400",
//     iconBg: "bg-red-400/10",
//   },
// };

// // This was referenced by EditableKnowledgeBase but never defined in the
// // original file, which crashed the edit screen with a ReferenceError.
// // It wraps each top-level KB section (kb_meta, business, locations, ...)
// // in a styled SectionCard and hands the section's value off to the
// // recursive DynamicJsonEditor.
// function DynamicSection({ sectionKey, value, path, onChange, onDelete }) {
//   const config = SECTION_CONFIG[sectionKey] || {
//     title: formatLabel(sectionKey),
//     icon: Settings2,
//     iconColor: "text-gray-400",
//     iconBg: "bg-gray-400/10",
//   };

//   return (
//     <SectionCard
//       icon={config.icon}
//       title={config.title}
//       iconColor={config.iconColor}
//       iconBg={config.iconBg}
//     >
//       <DynamicJsonEditor
//         value={value}
//         path={path}
//         onChange={onChange}
//         onDelete={onDelete}
//       />
//     </SectionCard>
//   );
// }

// // ---------------------------------------------------------------------------
// // Editable Knowledge Base
// // ---------------------------------------------------------------------------

// function EditableKnowledgeBase({
//   kb,
//   setKb,
//   slug,
//   updatedAt,
//   onPublish,
//   onStartOver,
//   onBack,
//   publishing,
//   published,
// }) {
//   const handleChange = (path, value) => {
//     setKb((prev) => setValueAtPath(prev, path, value));
//   };

//   const handleDelete = (path) => {
//     setKb((prev) => deleteValueAtPath(prev, path));
//   };

//   return (
//     <div className="mx-auto max-w-5xl space-y-6">
//       {/* HEADER */}
//       <div className="flex items-start justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-white">
//             Review Knowledge Base
//           </h1>

//           <p className="mt-1 text-sm text-gray-500">
//             {slug
//               ? "Editing a saved knowledge base. Update anything below, then save your changes."
//               : "We generated this from your source. Edit anything below, then publish when it looks right."}
//           </p>

//           {slug && (
//             <div className="mt-2 text-xs text-gray-500">
//               Last saved{" "}
//               {updatedAt ? new Date(updatedAt).toLocaleString() : "-"}
//             </div>
//           )}
//         </div>

//         {slug ? (
//           // Once a KB is saved, the account is capped at one — there's no
//           // "start over" that wouldn't risk creating a second record.
//           // Edit fields in place, or go back and delete it to start fresh.
//           <button
//             type="button"
//             onClick={onBack}
//             className="flex items-center gap-2 rounded-md border border-[#232836] px-4 py-2 text-sm text-gray-300 hover:border-blue-500 hover:text-blue-400"
//           >
//             <ArrowLeft size={14} />
//             Back to list
//           </button>
//         ) : (
//           <button
//             type="button"
//             onClick={onStartOver}
//             className="flex items-center gap-2 rounded-md border border-[#232836] px-4 py-2 text-sm text-gray-300 hover:border-blue-500 hover:text-blue-400"
//           >
//             <RefreshCw size={14} />
//             Start over
//           </button>
//         )}
//       </div>

//       {/* DYNAMIC SECTIONS */}
//       {Object.entries(kb)
//         .filter(([key]) => !HIDDEN_FIELDS.has(key))
//         .map(([key, value]) => (
//           <DynamicSection
//             key={key}
//             sectionKey={key}
//             value={value}
//             path={[key]}
//             onChange={handleChange}
//             onDelete={handleDelete}
//           />
//         ))}

//       {/* SAVE */}
//       <div className="flex items-center gap-3 border-t border-[#1f242e] pt-6">
//         <button
//           type="button"
//           onClick={onPublish}
//           disabled={publishing}
//           className="flex items-center gap-2 rounded-md bg-blue-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-600 disabled:bg-[#232836]"
//         >
//           {publishing ? (
//             <Loader2 size={16} className="animate-spin" />
//           ) : (
//             <Save size={16} />
//           )}
//           {publishing
//             ? "Saving..."
//             : slug
//               ? "Save Changes"
//               : "Publish Knowledge Base"}
//         </button>

//         {published && <span className="text-sm text-emerald-400">Saved</span>}
//       </div>
//     </div>
//   );
// }

// // ---------------------------------------------------------------------------
// // Top-level page: list -> intake -> generate -> edit -> publish (create/update)
// // ---------------------------------------------------------------------------

// export default function KnowledgeBasePage() {
//   const [phase, setPhase] = useState("list"); // "list" | "intake" | "edit"

//   // --- list state ---
//   const [items, setItems] = useState([]);
//   const [listLoading, setListLoading] = useState(true);
//   const [listError, setListError] = useState("");

//   // --- intake state ---
//   const [url, setUrl] = useState("");
//   const [clientName, setClientName] = useState("");
//   const [file, setFile] = useState(null);
//   const [images, setImages] = useState([]); // [{ file, previewUrl }]
//   const [generating, setGenerating] = useState(false);
//   const [genError, setGenError] = useState("");

//   // --- edit state ---
//   const [kb, setKb] = useState(emptyKb);
//   const [activeSlug, setActiveSlug] = useState(null); // null = unsaved / new
//   const [activeUpdatedAt, setActiveUpdatedAt] = useState(null);
//   const [activeSourceUrl, setActiveSourceUrl] = useState(null); // the URL this record belongs to
//   const [publishing, setPublishing] = useState(false);
//   const [published, setPublished] = useState(false);

//   const loadList = async () => {
//     setListLoading(true);
//     setListError("");

//     try {
//       const { hid, ndid } = getTenantContext();

//       const res = await axios.get(KB_ENDPOINT, {
//         headers: authHeaders(),
//         params: { hid, ndid },
//       });

//       setItems(res.data?.items || []);
//     } catch (err) {
//       console.error("Error loading knowledge bases:", err);

//       setListError(
//         err?.response?.data?.error ||
//           err?.message ||
//           "Could not load saved knowledge bases.",
//       );
//     } finally {
//       setListLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (phase === "list") loadList();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [phase]);

//   const handleGenerate = async () => {
//     setGenError("");

//     // Safety net for the "one knowledge base per account" rule: the
//     // Generate New button is already hidden once a KB exists, but guard
//     // here too in case this is reached some other way (e.g. Start Over).
//     if (items.length > 0 && !activeSlug) {
//       setGenError(
//         "You already have a knowledge base. Edit your existing one, or delete it first to generate a new one.",
//       );
//       return;
//     }

//     setGenerating(true);
//     try {
//       // 1) Check the database first — if this URL was already generated
//       // and saved before, load that saved record straight into the edit
//       // form instead of calling n8n again. Editing it will then use
//       // handlePublish's UPDATE path (PUT), not create a duplicate.
//       try {
//         const lookupRes = await axios.get(`${KB_ENDPOINT}`, {
//           params: { url: url.trim() },
//           headers: authHeaders(),
//         });
//         const existing = lookupRes.data?.knowledgeBase;
//         if (existing) {
//           setKb(normalizeKb(existing));
//           // Use _id consistently with handleEditExisting/handlePublish,
//           // which both key off the Mongo document's _id.
//           setActiveSlug(existing._id);
//           setActiveUpdatedAt(existing.updatedAt || null);
//           setActiveSourceUrl(existing.source_url || url.trim());
//           setPhase("edit");
//           setGenerating(false);
//           return; // found it — no need to hit n8n at all
//         }
//       } catch (lookupErr) {
//         // 404 just means "nothing saved yet for this URL" — that's the
//         // expected case, fall through to generating a fresh one. Any other
//         // status is logged but we still try to generate rather than block.
//         if (lookupErr?.response?.status !== 404) {
//           console.warn(
//             "Knowledge base lookup failed, generating fresh instead:",
//             lookupErr,
//           );
//         }
//       }

//       // 2) Not found -> generate fresh via n8n, same as before.
//       let response;
//       if (file || images.length > 0) {
//         const form = new FormData();
//         form.append("website_url", url.trim());
//         if (clientName.trim()) form.append("client_name", clientName.trim());
//         if (file) form.append("pdf_file", file);
//         images.forEach((img) => form.append("images", img.file));
//         response = await axios.post(GENERATE_ENDPOINT, form, {
//           responseType: "blob",
//           headers: { "Content-Type": "multipart/form-data", ...authHeaders() },
//         });
//       } else {
//         response = await axios.post(
//           GENERATE_ENDPOINT,
//           {
//             website_url: url.trim(),
//             client_name: clientName.trim() || undefined,
//             hid: localStorage.getItem("hid"),
//             ndid: localStorage.getItem("ndid"),
//           },
//           {
//             responseType: "blob",
//             headers: { "Content-Type": "application/json", ...authHeaders() },
//           },
//         );
//       }

//       const text = await response.data.text();
//       const data = JSON.parse(text);

//       if (data?.success === false || data?.error) {
//         const message = data.details
//           ? `${data.error}: ${data.details}`
//           : data.error ||
//             "Could not generate a valid knowledge base from that source.";
//         throw new Error(message);
//       }

//       setKb(normalizeKb(unwrapGeneratedKb(data)));
//       setActiveSlug(null); // freshly generated -> not saved yet -> Publish will CREATE
//       setActiveUpdatedAt(null);
//       setActiveSourceUrl(url.trim());
//       setPhase("edit");
//       // Intake inputs are no longer needed once we're on the edit screen.
//       images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
//       setImages([]);
//       setFile(null);
//     } catch (err) {
//       console.error("Error generating knowledge base:", err);
//       let message =
//         "Something went wrong while generating the knowledge base. Please try again.";
//       try {
//         if (err?.response?.data instanceof Blob) {
//           const text = await err.response.data.text();
//           const parsed = JSON.parse(text);
//           message = parsed.details
//             ? `${parsed.error}: ${parsed.details}`
//             : parsed.error || parsed.message || message;
//         } else {
//           message =
//             err?.response?.data?.error ||
//             err?.response?.data?.message ||
//             err?.message ||
//             message;
//         }
//       } catch (_) {
//         message = err?.message || message;
//       }
//       setGenError(message);
//     } finally {
//       setGenerating(false);
//     }
//   };

//   const handleEditExisting = async (id) => {
//     try {
//       const res = await axios.get(`${KB_ENDPOINT}/${id}`, {
//         headers: authHeaders(),
//       });

//       const doc = res.data?.knowledgeBase;

//       if (!doc) return;

//       setKb(normalizeKb(doc));
//       setActiveSlug(doc._id);
//       setActiveUpdatedAt(doc.updatedAt || null);
//       setActiveSourceUrl(doc.source_url || null);
//       setPhase("edit");
//     } catch (err) {
//       console.error("Error loading knowledge base:", err);
//       setListError(
//         err?.response?.data?.error ||
//           err?.message ||
//           "Could not load that knowledge base.",
//       );
//     }
//   };

//   const handleDelete = async (id) => {
//     try {
//       await axios.delete(`${KB_ENDPOINT}/${id}`, { headers: authHeaders() });
//       // Items use Mongo's _id (see SavedListStep / handleEditExisting), not
//       // "id" — filtering on the wrong key left the deleted card on screen.
//       setItems((prev) => prev.filter((i) => i._id !== id));
//     } catch (err) {
//       console.error("Error deleting knowledge base:", err);
//     }
//   };

//   const handlePublish = async () => {
//     setPublishing(true);

//     try {
//       const { hid, ndid } = getTenantContext();

//       const payload = {
//         ...kb,
//         source_url: activeSourceUrl || undefined,
//         hid,
//         ndid,
//       };

//       let res;

//       if (activeSlug) {
//         // EXISTING KB → UPDATE
//         console.log("Updating KB:", activeSlug);

//         res = await axios.put(`${KB_ENDPOINT}/${activeSlug}`, payload, {
//           headers: { "Content-Type": "application/json", ...authHeaders() },
//         });
//       } else {
//         // NEW KB → CREATE
//         console.log("Creating new KB");

//         res = await axios.post(KB_ENDPOINT, payload, {
//           headers: { "Content-Type": "application/json", ...authHeaders() },
//         });
//       }

//       console.log("Save response:", res.data);

//       const doc = res.data?.knowledgeBase;

//       if (!doc) {
//         throw new Error("Backend did not return the saved knowledge base");
//       }

//       // Update frontend with the actual DB document
//       setKb(normalizeKb(doc));
//       setActiveSlug(doc._id);
//       setActiveUpdatedAt(doc.updatedAt || null);
//       setActiveSourceUrl(doc.source_url || activeSourceUrl);
//       setPublished(true);

//       setTimeout(() => {
//         setPublished(false);
//       }, 2000);
//     } catch (err) {
//       console.error("Knowledge base save failed:", err);
//       console.error("Response:", err?.response?.data);

//       alert(
//         err?.response?.data?.error ||
//           err?.response?.data?.message ||
//           err?.message ||
//           "Failed to save knowledge base",
//       );
//     } finally {
//       setPublishing(false);
//     }
//   };

//   const handleStartOver = () => {
//     setPhase("intake");
//     setUrl("");
//     setClientName("");
//     setFile(null);
//     setImages((prev) => {
//       prev.forEach((img) => URL.revokeObjectURL(img.previewUrl));
//       return [];
//     });
//     setKb(emptyKb);
//     setActiveSlug(null);
//     setActiveUpdatedAt(null);
//     setActiveSourceUrl(null);
//     setGenError("");
//   };

//   const handleBackToList = () => setPhase("list");

//   return (
//     <div className="min-h-screen bg-[#0a0c10] px-4 py-10 text-gray-200 sm:px-8">
//       {phase === "list" && (
//         <SavedListStep
//           items={items}
//           loading={listLoading}
//           error={listError}
//           onEdit={handleEditExisting}
//           onDelete={handleDelete}
//           onCreateNew={handleStartOver}
//         />
//       )}

//       {phase === "intake" && (
//         <IntakeStep
//           url={url}
//           setUrl={setUrl}
//           clientName={clientName}
//           setClientName={setClientName}
//           file={file}
//           setFile={setFile}
//           images={images}
//           setImages={setImages}
//           onGenerate={handleGenerate}
//           generating={generating}
//           error={genError}
//           onBack={handleBackToList}
//         />
//       )}

//       {phase === "edit" && (
//         <EditableKnowledgeBase
//           kb={kb}
//           setKb={setKb}
//           slug={activeSlug}
//           updatedAt={activeUpdatedAt}
//           onPublish={handlePublish}
//           onStartOver={handleStartOver}
//           onBack={handleBackToList}
//           publishing={publishing}
//           published={published}
//         />
//       )}
//     </div>
//   );
// }
