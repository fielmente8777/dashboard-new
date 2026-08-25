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
} from "lucide-react";

// ---------------------------------------------------------------------------
// Wire these to your real backend. Left as constants so it's a one-line swap.
// ---------------------------------------------------------------------------
const SALES_AGENT_BASE_URL = "http://localhost:8000"; // <-- replace with your real base url
const GENERATE_ENDPOINT = `${SALES_AGENT_BASE_URL}/api/v1/kb-generator/generate`;
// Same base used for list / get / create / update / delete — the CRUD
// routes for saved knowledge bases (see knowledgeBase.routes.ts).
const KB_ENDPOINT = `${SALES_AGENT_BASE_URL}/api/v1/knowledgebase`;

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
  locations: [],
  offerings: [],
  policies: { cancellation: "", payment: "", other: [] },
  contact: { phone: "", whatsapp: "", email: "", social: {} },
  faqs: [],
  fields_to_populate: [],
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

const SectionCard = ({
  icon: Icon,
  title,
  subtitle,
  children,
  iconColor = "text-orange-400",
  iconBg = "bg-orange-400/10",
}) => (
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
              item?.kb_meta?.kb_name ||
              item?.business?.brand ||
              item.client_name ||
              "Untitled";
            const domain = item?.kb_meta?.source_domain;
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

function DynamicJsonEditor({ value, path = [], onChange, onDelete }) {
  const [newKey, setNewKey] = useState("");
  const [newType, setNewType] = useState("text");

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
    return (
      <div className="space-y-3">
        {value.length === 0 && (
          <div className="rounded-lg border border-dashed border-[#232836] p-5 text-center text-sm text-gray-500">
            No items added yet.
          </div>
        )}

        {value.map((item, index) => (
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
                onClick={() => onDelete([...path, index])}
              />
            </div>

            <DynamicJsonEditor
              value={item}
              path={[...path, index]}
              onChange={onChange}
              onDelete={onDelete}
            />
          </div>
        ))}

        <AddButton
          label="Add item"
          onClick={() => onChange(path, [...value, ""])}
        />
      </div>
    );
  }

  // --------------------------------------------------
  // OBJECT
  // --------------------------------------------------

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
            <option value="object">Object</option>
            <option value="array">Array</option>
          </select>

          <button
            type="button"
            disabled={!newKey.trim()}
            onClick={() => {
              const key = newKey.trim();

              if (!key) return;

              if (Object.prototype.hasOwnProperty.call(value, key)) {
                alert("Field already exists");
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
            }}
            className="flex items-center justify-center gap-1 rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-[#232836] disabled:text-gray-500"
          >
            <Plus size={14} />
            Add
          </button>
        </div>
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
};

// This was referenced by EditableKnowledgeBase but never defined in the
// original file, which crashed the edit screen with a ReferenceError.
// It wraps each top-level KB section (kb_meta, business, locations, ...)
// in a styled SectionCard and hands the section's value off to the
// recursive DynamicJsonEditor.
function DynamicSection({ sectionKey, value, path, onChange, onDelete }) {
  const config = SECTION_CONFIG[sectionKey] || {
    title: formatLabel(sectionKey),
    icon: Settings2,
    iconColor: "text-gray-400",
    iconBg: "bg-gray-400/10",
  };

  return (
    <SectionCard
      icon={config.icon}
      title={config.title}
      iconColor={config.iconColor}
      iconBg={config.iconBg}
    >
      <DynamicJsonEditor
        value={value}
        path={path}
        onChange={onChange}
        onDelete={onDelete}
      />
    </SectionCard>
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
              Last saved {updatedAt ? new Date(updatedAt).toLocaleString() : "-"}
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

      {/* DYNAMIC SECTIONS */}
      {Object.entries(kb)
        .filter(([key]) => !HIDDEN_FIELDS.has(key))
        .map(([key, value]) => (
          <DynamicSection
            key={key}
            sectionKey={key}
            value={value}
            path={[key]}
            onChange={handleChange}
            onDelete={handleDelete}
          />
        ))}

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
          {publishing ? "Saving..." : slug ? "Save Changes" : "Publish Knowledge Base"}
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