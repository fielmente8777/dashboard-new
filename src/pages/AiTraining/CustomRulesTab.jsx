// // Suggested location: src/pages/AiTraining/CustomRulesTab.jsx
// import { useState, useEffect } from "react";
// import axios from "axios";
// import {
//   Plus,
//   Trash2,
//   Pencil,
//   Check,
//   X,
//   Loader2,
//   AlertCircle,
// } from "lucide-react";
// import { authHeaders, getTenantContext } from "../../utils/dashboardApi";
// import { RULES_ENDPOINT, CATEGORIES, CategoryBadge, Toggle } from "./shared";

// function RuleRow({ rule, onSave, onDelete }) {
//   const [editing, setEditing] = useState(false);
//   const [ruleText, setRuleText] = useState(rule.ruleText);
//   const [category, setCategory] = useState(rule.category || "other");
//   const [saving, setSaving] = useState(false);
//   const [toggling, setToggling] = useState(false);

//   const handleToggle = async (nextEnabled) => {
//     setToggling(true);
//     try {
//       await onSave(rule._id, { enabled: nextEnabled });
//     } finally {
//       setToggling(false);
//     }
//   };

//   const handleSaveEdit = async () => {
//     if (!ruleText.trim()) return;
//     setSaving(true);
//     try {
//       await onSave(rule._id, { ruleText: ruleText.trim(), category });
//       setEditing(false);
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (editing) {
//     return (
//       <div className="rounded-xl border border-blue-600/40 bg-[#0d1017] p-4">
//         <div className="mb-2 flex flex-col gap-2 sm:flex-row">
//           <select
//             value={category}
//             onChange={(e) => setCategory(e.target.value)}
//             className="rounded-md border border-[#232836] bg-[#0d1017] px-3 py-2 text-sm text-gray-200 outline-none"
//           >
//             {CATEGORIES.map((c) => (
//               <option key={c.value} value={c.value}>
//                 {c.label}
//               </option>
//             ))}
//           </select>
//         </div>
//         <textarea
//           value={ruleText}
//           onChange={(e) => setRuleText(e.target.value)}
//           rows={2}
//           className="w-full resize-none rounded-md border border-[#232836] bg-[#0d1017] px-3 py-2 text-sm text-gray-200 outline-none focus:border-blue-500"
//         />
//         <div className="mt-2 flex justify-end gap-2">
//           <button
//             type="button"
//             onClick={() => {
//               setRuleText(rule.ruleText);
//               setCategory(rule.category || "other");
//               setEditing(false);
//             }}
//             className="rounded-md p-1.5 text-gray-400 hover:bg-white/5 hover:text-gray-200"
//           >
//             <X size={16} />
//           </button>
//           <button
//             type="button"
//             disabled={saving || !ruleText.trim()}
//             onClick={handleSaveEdit}
//             className="flex items-center gap-1.5 rounded-md bg-blue-700 px-3 py-1.5 text-sm text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-[#232836] disabled:text-gray-500"
//           >
//             {saving ? (
//               <Loader2 size={14} className="animate-spin" />
//             ) : (
//               <Check size={14} />
//             )}
//             Save
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div
//       className={`flex items-start gap-3 rounded-xl border border-[#1f242e] bg-[#0d1017] p-4 ${
//         !rule.enabled ? "opacity-50" : ""
//       }`}
//     >
//       <div className="pt-0.5">
//         <Toggle
//           checked={rule.enabled}
//           onChange={handleToggle}
//           disabled={toggling}
//         />
//       </div>
//       <CategoryBadge value={rule.category} />
//       <p className="flex-1 text-sm text-gray-200">{rule.ruleText}</p>
//       <button
//         type="button"
//         onClick={() => setEditing(true)}
//         className="rounded-md p-1.5 text-gray-400 hover:bg-white/5 hover:text-white"
//         title="Edit"
//       >
//         <Pencil size={15} />
//       </button>
//       <button
//         type="button"
//         onClick={() => onDelete(rule._id)}
//         className="rounded-md p-1.5 text-red-500 hover:bg-red-500/10 hover:text-red-400"
//         title="Delete"
//       >
//         <Trash2 size={15} />
//       </button>
//     </div>
//   );
// }

// function AddRuleForm({ onAdd }) {
//   const [ruleText, setRuleText] = useState("");
//   const [category, setCategory] = useState("other");
//   const [adding, setAdding] = useState(false);

//   const handleAdd = async () => {
//     const text = ruleText.trim();
//     if (!text) return;
//     setAdding(true);
//     try {
//       await onAdd({ ruleText: text, category, enabled: true });
//       setRuleText("");
//       setCategory("other");
//     } finally {
//       setAdding(false);
//     }
//   };

//   return (
//     <div className="rounded-xl border border-dashed border-[#2a3040] bg-[#0a0c10] p-4">
//       <div className="mb-3 flex items-center gap-2">
//         <Plus size={15} className="text-blue-400" />
//         <span className="text-sm font-medium text-gray-300">Add Rule</span>
//       </div>
//       <div className="flex flex-col gap-2">
//         <div className="flex flex-col gap-2 sm:flex-row">
//           <select
//             value={category}
//             onChange={(e) => setCategory(e.target.value)}
//             className="rounded-md border border-[#232836] bg-[#0d1017] px-3 py-2 text-sm text-gray-200 outline-none sm:w-48"
//           >
//             {CATEGORIES.map((c) => (
//               <option key={c.value} value={c.value}>
//                 {c.label}
//               </option>
//             ))}
//           </select>
//           <input
//             value={ruleText}
//             onChange={(e) => setRuleText(e.target.value)}
//             onKeyDown={(e) => {
//               if (e.key === "Enter") handleAdd();
//             }}
//             placeholder='e.g. "Always mention Mandrem alongside Serenity and Paradiso"'
//             className="flex-1 rounded-md border border-[#232836] bg-[#0d1017] px-3 py-2 text-sm text-gray-200 outline-none focus:border-blue-500"
//           />
//         </div>
//         <button
//           type="button"
//           disabled={adding || !ruleText.trim()}
//           onClick={handleAdd}
//           className="flex w-full items-center justify-center gap-1.5 rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-[#232836] disabled:text-gray-500 sm:w-auto"
//         >
//           {adding ? (
//             <Loader2 size={14} className="animate-spin" />
//           ) : (
//             <Plus size={14} />
//           )}
//           Add
//         </button>
//       </div>
//     </div>
//   );
// }

// export default function CustomRulesTab() {
//   const [rules, setRules] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const loadRules = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const { hid, ndid } = getTenantContext();
//       const res = await axios.get(RULES_ENDPOINT, {
//         headers: authHeaders(),
//         params: { hid, ndid },
//       });
//       setRules(res.data?.items || []);
//     } catch (err) {
//       setError(
//         err?.response?.data?.error || err?.message || "Could not load rules.",
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadRules();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const handleAdd = async (payload) => {
//     const { hid, ndid } = getTenantContext();
//     const res = await axios.post(
//       RULES_ENDPOINT,
//       { ...payload, hid, ndid },
//       { headers: { "Content-Type": "application/json", ...authHeaders() } },
//     );
//     const created = res.data?.rule;
//     if (created) setRules((prev) => [created, ...prev]);
//   };

//   const handleSave = async (id, patch) => {
//     const { hid, ndid } = getTenantContext();
//     const res = await axios.put(
//       `${RULES_ENDPOINT}/${id}`,
//       { ...patch, hid, ndid },
//       { headers: { "Content-Type": "application/json", ...authHeaders() } },
//     );
//     const updated = res.data?.rule;
//     setRules((prev) =>
//       prev.map((r) => (r._id === id ? { ...r, ...(updated || patch) } : r)),
//     );
//   };

//   const handleDelete = async (id) => {
//     const { hid, ndid } = getTenantContext();
//     await axios.delete(`${RULES_ENDPOINT}/${id}`, {
//       headers: authHeaders(),
//       params: { hid, ndid },
//     });
//     setRules((prev) => prev.filter((r) => r._id !== id));
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center gap-2 rounded-2xl border border-[#1f242e] bg-[#12151c] p-6 text-sm text-gray-400">
//         <Loader2 size={16} className="animate-spin" /> Loading rules...
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <p className="flex items-center gap-1.5 rounded-2xl border border-red-900/40 bg-red-500/5 p-4 text-sm text-red-400">
//         <AlertCircle size={14} /> {error}
//       </p>
//     );
//   }

//   return (
//     <div className="space-y-3">
//       <p className="text-sm text-gray-500">
//         Rules that shape how your AI replies on WhatsApp — tone, policy, what
//         not to say. Turned off rules stay saved but don't apply.
//       </p>

//       {rules.length === 0 && (
//         <div className="rounded-2xl border border-dashed border-[#2a3040] p-8 text-center text-sm text-gray-500">
//           No custom rules yet.
//         </div>
//       )}

//       {rules.map((rule) => (
//         <RuleRow
//           key={rule._id}
//           rule={rule}
//           onSave={handleSave}
//           onDelete={handleDelete}
//         />
//       ))}

//       <AddRuleForm onAdd={handleAdd} />
//     </div>
//   );
// }


import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import axios from "axios";
import {
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Loader2,
  AlertCircle,
  Mic,
  MicOff,
  AudioLines,
  MessageCircle,
  Save,
  Settings2,
} from "lucide-react";

import useVoiceRecorder from "../../hooks/useVoiceRecorder";
import { transcribeAudio } from "../../services/chatbot.service";
import {
  authHeaders,
  getTenantContext,
} from "../../utils/dashboardApi";

import {
  RULES_ENDPOINT,
  VOICE_INSTRUCTIONS_ENDPOINT,
  VOICE_SETTINGS_ENDPOINT,
  CATEGORIES,
  CategoryBadge,
  Toggle,
} from "./shared";
import RuleFileManager from "./RuleFileManager";

const DEFAULT_VOICE_MESSAGE =
  "Our assistant is currently unavailable. Please contact us later.";

/* -------------------------------------------------------
   RULE ROW
------------------------------------------------------- */

function RuleRow({ rule, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [ruleText, setRuleText] = useState(rule.ruleText || "");
  const [category, setCategory] = useState(rule.category || "other");
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleToggle = async (enabled) => {
    setToggling(true);
    setError("");

    try {
      await onSave(rule._id, { enabled });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err.message ||
          "Could not update rule."
      );
    } finally {
      setToggling(false);
    }
  };

  const handleSave = async () => {
    if (!ruleText.trim()) return;

    setSaving(true);
    setError("");

    try {
      await onSave(rule._id, {
        ruleText: ruleText.trim(),
        category,
      });
      setEditing(false);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err.message ||
          "Could not save rule."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError("");

    try {
      await onDelete(rule._id);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err.message ||
          "Could not delete rule."
      );
    } finally {
      setDeleting(false);
    }
  };

  if (editing) {
    return (
      <div className="rounded-xl border border-blue-600/40 bg-[#0d1017] p-4">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mb-3 rounded-md border border-[#232836] bg-[#0d1017] px-3 py-2 text-sm text-gray-200"
        >
          {CATEGORIES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        <textarea
          value={ruleText}
          onChange={(e) => setRuleText(e.target.value)}
          rows={3}
          className="w-full resize-y rounded-md border border-[#232836] bg-[#0d1017] px-3 py-2 text-sm text-gray-200 outline-none focus:border-blue-500"
        />

        {error && (
          <p className="mt-2 text-xs text-red-400">{error}</p>
        )}

        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setRuleText(rule.ruleText || "");
              setCategory(rule.category || "other");
              setError("");
              setEditing(false);
            }}
            className="rounded-md p-2 text-gray-400 hover:bg-white/5"
            aria-label="Cancel editing"
          >
            <X size={16} />
          </button>

          <button
            type="button"
            disabled={saving || !ruleText.trim()}
            onClick={handleSave}
            className="flex items-center gap-2 rounded-md bg-blue-700 px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Check size={14} />
            )}
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#1f242e] bg-[#0d1017] p-4">
      <div className="flex items-start gap-3">
        <div className="pt-0.5">
          <Toggle
            checked={Boolean(rule.enabled)}
            onChange={handleToggle}
            disabled={toggling}
            label={`Enable rule: ${rule.ruleText}`}
          />
        </div>

        <CategoryBadge value={rule.category} />

        <p className="min-w-0 flex-1 break-words text-sm text-gray-200">
          {rule.ruleText}
        </p>

        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-md p-1.5 text-gray-400 hover:bg-white/5 hover:text-white"
          title="Edit rule"
          aria-label="Edit rule"
        >
          <Pencil size={15} />
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-md p-1.5 text-red-500 hover:bg-red-500/10 disabled:opacity-50"
          title="Delete rule"
          aria-label="Delete rule"
        >
          {deleting ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Trash2 size={15} />
          )}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------
   ADD RULE FORM WITH VOICE-TO-TEXT
------------------------------------------------------- */

function AddRuleForm({ onAdd, channel }) {
  const [ruleText, setRuleText] = useState("");
  const [category, setCategory] = useState("other");
  const [adding, setAdding] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [speechError, setSpeechError] = useState("");

  const controllerRef = useRef(null);
  const lastBlobRef = useRef(null);
  const voice = useVoiceRecorder({ maxSeconds: 29 });

  useEffect(() => {
    if (
      voice.status !== "stopped" ||
      !voice.blob ||
      lastBlobRef.current === voice.blob
    ) {
      return;
    }

    const blob = voice.blob;
    lastBlobRef.current = blob;

    if (blob.size < 1024) {
      setSpeechError(
        "Recording is too short. Please speak for a little longer."
      );
      voice.reset();
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    setTranscribing(true);
    setSpeechError("");

    const runTranscription = async () => {
      try {
        const response = await transcribeAudio(blob, {
          signal: controller.signal,
        });

        const transcript = String(
          response?.text ?? response?.data?.text ?? ""
        ).trim();

        if (!transcript) {
          setSpeechError("No speech was detected. Please try again.");
          return;
        }

        setRuleText((previous) =>
          `${previous}${previous ? " " : ""}${transcript}`.trim()
        );
      } catch (err) {
        if (
          err?.name !== "AbortError" &&
          err?.code !== "ERR_CANCELED"
        ) {
          setSpeechError(
            err?.response?.data?.message ||
              err?.message ||
              "Could not transcribe audio."
          );
        }
      } finally {
        if (controllerRef.current === controller) {
          controllerRef.current = null;
          setTranscribing(false);
        }
        voice.reset();
      }
    };

    runTranscription();

    return () => controller.abort();
  }, [voice.status, voice.blob]);

  useEffect(() => {
    return () => controllerRef.current?.abort();
  }, []);

  const handleMicClick = async () => {
    setSpeechError("");

    if (voice.status === "recording") {
      voice.stop();
      return;
    }

    if (!voice.isSupported) {
      setSpeechError(
        "Audio recording is not supported in this browser."
      );
      return;
    }

    lastBlobRef.current = null;

    try {
      await voice.start();
    } catch (err) {
      setSpeechError(
        err?.message ||
          "Could not access the microphone. Check browser permissions."
      );
    }
  };

  const handleAdd = async () => {
    const text = ruleText.trim();

    if (
      !text ||
      adding ||
      transcribing ||
      voice.status === "recording"
    ) {
      return;
    }

    setAdding(true);
    setSpeechError("");

    try {
      await onAdd({
        ruleText: text,
        category,
        enabled: true,
      });

      setRuleText("");
      setCategory("other");
    } catch (err) {
      setSpeechError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Could not add this rule."
      );
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="rounded-xl border border-dashed border-[#2a3040] bg-[#0a0c10] p-4">
      <div className="mb-3 flex items-center gap-2">
        <Plus size={15} className="text-blue-400" />
        <span className="text-sm font-medium text-gray-300">
          Add {channel === "voice" ? "Voice AI" : "WhatsApp"} Rule
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-md border border-[#232836] bg-[#0d1017] px-3 py-2 text-sm text-gray-200 sm:w-48"
          >
            {CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <input
            value={ruleText}
            onChange={(e) => setRuleText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
            placeholder={
              transcribing
                ? "Transcribing your speech..."
                : "Enter a rule or use the microphone..."
            }
            className="min-w-0 flex-1 rounded-md border border-[#232836] bg-[#0d1017] px-3 py-2 text-sm text-gray-200 outline-none focus:border-blue-500"
          />
        </div>

        <div className="rounded-lg border border-[#232836] bg-[#0d1017] p-3">
          <p className="mb-2 text-xs text-gray-400">
            Speak your rule and the transcription service will convert
            your speech to text.
          </p>

          <button
            type="button"
            onClick={handleMicClick}
            disabled={transcribing || adding}
            className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm disabled:opacity-50 ${
              voice.status === "recording"
                ? "border-red-500/40 text-red-400"
                : "border-blue-500/40 text-blue-400"
            }`}
          >
            {transcribing ? (
              <Loader2 size={15} className="animate-spin" />
            ) : voice.status === "recording" ? (
              <MicOff size={15} />
            ) : (
              <Mic size={15} />
            )}

            {transcribing
              ? "Transcribing..."
              : voice.status === "recording"
                ? `Stop recording${voice.seconds ? ` (${voice.seconds}s)` : ""}`
                : "Speak rule"}
          </button>

          {voice.status === "recording" && (
            <p className="mt-2 text-xs text-red-400">
              Recording in progress…
            </p>
          )}

          {(speechError || voice.error) && (
            <p className="mt-2 text-xs text-red-400" role="alert">
              {speechError || voice.error}
            </p>
          )}
        </div>

        <button
          type="button"
          disabled={
            adding ||
            transcribing ||
            voice.status === "recording" ||
            !ruleText.trim()
          }
          onClick={handleAdd}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {adding ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Plus size={14} />
          )}
          Add Rule
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   VOICE AI SETTINGS
------------------------------------------------------- */

function VoiceSettingsPanel({
  settings,
  loading,
  saving,
  error,
  message,
  onToggleVoice,
  onToggleWhatsApp,
  onMessageChange,
  onSaveMessage,
}) {
  if (loading) {
    return (
      <section className="rounded-2xl border border-[#30343d] bg-[#11141b] p-5">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 size={16} className="animate-spin" />
          Loading Voice AI settings...
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[#30343d] bg-[#11141b] p-4 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          <Settings2 size={21} />
        </div>
        <div>
          <h3 className="font-semibold text-white">Voice AI Settings</h3>
          <p className="text-sm text-gray-400">
            Configure Voice AI and its WhatsApp integration.
          </p>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-[#30343d] bg-[#0d1017] p-4">
        <div className="flex items-center gap-3">
          <AudioLines size={20} className="text-blue-400" />
          <div>
            <p className="font-medium text-gray-100">Voice AI</p>
            <p className="text-sm text-gray-400">
              {settings.voiceEnabled ? "Enabled" : "Disabled"}
            </p>
          </div>
        </div>
        <Toggle
          checked={Boolean(settings.voiceEnabled)}
          onChange={onToggleVoice}
          disabled={saving}
          label="Enable Voice AI"
        />
      </div>

      <div className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-[#30343d] bg-[#0d1017] p-4">
        <div className="flex items-center gap-3">
          <MessageCircle size={20} className="text-emerald-400" />
          <div>
            <p className="font-medium text-gray-100">
              WhatsApp Integration with Voice AI
            </p>
            <p className="text-sm text-gray-400">
              {settings.whatsappIntegrationEnabled
                ? "Integration is enabled."
                : "Integration is disabled."}
            </p>
          </div>
        </div>
        <Toggle
          checked={Boolean(settings.whatsappIntegrationEnabled)}
          onChange={onToggleWhatsApp}
          disabled={saving}
          label="Enable WhatsApp integration with Voice AI"
        />
      </div>

      {!settings.whatsappIntegrationEnabled && (
        <div className="rounded-xl border border-[#30343d] bg-[#0d1017] p-4">
          <h4 className="font-medium text-gray-100">
            Default WhatsApp Message
          </h4>
          <p className="mb-3 mt-1 text-sm text-gray-400">
            Message sent when WhatsApp integration with Voice AI is disabled.
          </p>

          <textarea
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            maxLength={2000}
            rows={3}
            placeholder="Enter the default WhatsApp message..."
            className="w-full resize-y rounded-lg border border-[#30343d] bg-[#090b10] px-4 py-3 text-sm text-gray-100 outline-none focus:border-blue-500"
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-gray-500">
              {message.length}/2000 characters
            </span>
            <button
              type="button"
              onClick={onSaveMessage}
              disabled={saving || !message.trim()}
              className="flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Save size={15} />
              )}
              Save Message
            </button>
          </div>
        </div>
      )}

      {saving && (
        <p className="mt-3 text-xs text-gray-500">Saving settings...</p>
      )}
    </section>
  );
}


/* -------------------------------------------------------
   MAIN COMPONENT
------------------------------------------------------- */

export default function CustomRulesTab({ channel = "whatsapp" }) {
  const isVoice = channel === "voice";

  // Critical: choose the endpoint based on the selected channel.
  const instructionsEndpoint = isVoice
    ? VOICE_INSTRUCTIONS_ENDPOINT
    : RULES_ENDPOINT;

  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [voiceSettings, setVoiceSettings] = useState({
    voiceEnabled: true,
    whatsappIntegrationEnabled: false,
  });
  const [defaultMessage, setDefaultMessage] = useState(
    DEFAULT_VOICE_MESSAGE
  );
  const [voiceSettingsLoading, setVoiceSettingsLoading] = useState(false);
  const [voiceSettingsSaving, setVoiceSettingsSaving] = useState(false);
  const [voiceSettingsError, setVoiceSettingsError] = useState("");

  const loadRules = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { hid, ndid } = getTenantContext();

      const response = await axios.get(instructionsEndpoint, {
        headers: authHeaders(),
        params: { hid, ndid },
      });

      setRules(response.data?.items || []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Could not load rules."
      );
    } finally {
      setLoading(false);
    }
  }, [instructionsEndpoint]);

  const loadVoiceSettings = useCallback(async () => {
    setVoiceSettingsLoading(true);
    setVoiceSettingsError("");

    try {
      const { hid, ndid } = getTenantContext();

      const response = await axios.get(VOICE_SETTINGS_ENDPOINT, {
        headers: authHeaders(),
        params: { hid, ndid },
      });

      const data = response.data?.settings ?? response.data ?? {};

      setVoiceSettings({
        voiceEnabled: data.voiceEnabled ?? true,
        whatsappIntegrationEnabled:
          data.whatsappIntegrationEnabled ?? false,
      });

      setDefaultMessage(
        data.defaultMessage || DEFAULT_VOICE_MESSAGE
      );
    } catch (err) {
      setVoiceSettingsError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Could not load Voice AI settings."
      );
    } finally {
      setVoiceSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  useEffect(() => {
    if (isVoice) {
      loadVoiceSettings();
    }
  }, [isVoice, loadVoiceSettings]);

  const handleAdd = async (payload) => {
    const { hid, ndid } = getTenantContext();

    const response = await axios.post(
      instructionsEndpoint,
      { ...payload, hid, ndid },
      {
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
      }
    );

    const created = response.data?.rule ?? response.data?.item;

    if (created) {
      setRules((previous) => [created, ...previous]);
    } else {
      await loadRules();
    }
  };

  const handleSave = async (id, patch) => {
    const { hid, ndid } = getTenantContext();

    const response = await axios.put(
      `${instructionsEndpoint}/${id}`,
      { ...patch, hid, ndid },
      {
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
      }
    );

    const updated = response.data?.rule ?? response.data?.item;

    setRules((previous) =>
      previous.map((rule) =>
        rule._id === id
          ? { ...rule, ...(updated || patch) }
          : rule
      )
    );
  };

  const handleDelete = async (id) => {
    const { hid, ndid } = getTenantContext();

    await axios.delete(`${instructionsEndpoint}/${id}`, {
      headers: authHeaders(),
      params: { hid, ndid },
    });

    setRules((previous) =>
      previous.filter((rule) => rule._id !== id)
    );
  };

  const saveVoiceSettings = async (patch) => {
    const previousSettings = { ...voiceSettings };
    const previousMessage = defaultMessage;

    const nextSettings = {
      ...voiceSettings,
      ...(typeof patch.voiceEnabled === "boolean"
        ? { voiceEnabled: patch.voiceEnabled }
        : {}),
      ...(typeof patch.whatsappIntegrationEnabled === "boolean"
        ? {
            whatsappIntegrationEnabled:
              patch.whatsappIntegrationEnabled,
          }
        : {}),
    };

    const nextMessage =
      typeof patch.defaultMessage === "string"
        ? patch.defaultMessage
        : defaultMessage;

    setVoiceSettings(nextSettings);
    setDefaultMessage(nextMessage);
    setVoiceSettingsSaving(true);
    setVoiceSettingsError("");

    try {
      const { hid, ndid } = getTenantContext();

      const response = await axios.patch(
        VOICE_SETTINGS_ENDPOINT,
        { hid, ndid, ...patch },
        {
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
        }
      );

      const data = response.data?.settings ?? response.data;

      if (data && typeof data === "object") {
        setVoiceSettings((current) => ({
          ...current,
          ...(typeof data.voiceEnabled === "boolean"
            ? { voiceEnabled: data.voiceEnabled }
            : {}),
          ...(typeof data.whatsappIntegrationEnabled === "boolean"
            ? {
                whatsappIntegrationEnabled:
                  data.whatsappIntegrationEnabled,
              }
            : {}),
        }));

        if (typeof data.defaultMessage === "string") {
          setDefaultMessage(data.defaultMessage);
        }
      }
    } catch (err) {
      setVoiceSettings(previousSettings);
      setDefaultMessage(previousMessage);

      setVoiceSettingsError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Could not save Voice AI settings."
      );

      throw err;
    } finally {
      setVoiceSettingsSaving(false);
    }
  };

  const handleToggleVoice = async (enabled) => {
    try {
      await saveVoiceSettings({ voiceEnabled: enabled });
    } catch {
      // Error is shown in the settings panel.
    }
  };

  const handleToggleWhatsApp = async (enabled) => {
    try {
      await saveVoiceSettings({
        whatsappIntegrationEnabled: enabled,
      });
    } catch {
      // Error is shown in the settings panel.
    }
  };

  const handleSaveDefaultMessage = async () => {
    if (!defaultMessage.trim()) {
      setVoiceSettingsError("Default message cannot be empty.");
      return;
    }

    try {
      await saveVoiceSettings({
        defaultMessage: defaultMessage.trim(),
      });
    } catch {
      // Error is shown in the settings panel.
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-[#1f242e] bg-[#12151c] p-6 text-sm text-gray-400">
        <Loader2 size={16} className="animate-spin" />
        Loading {isVoice ? "Voice AI" : "WhatsApp"} rules...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-900/40 bg-red-500/5 p-4">
        <p className="flex items-center gap-2 text-sm text-red-400">
          <AlertCircle size={15} />
          {error}
        </p>
        <button
          type="button"
          onClick={loadRules}
          className="mt-3 text-sm text-blue-400 hover:text-blue-300"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {isVoice && (
        <VoiceSettingsPanel
          settings={voiceSettings}
          loading={voiceSettingsLoading}
          saving={voiceSettingsSaving}
          error={voiceSettingsError}
          message={defaultMessage}
          onToggleVoice={handleToggleVoice}
          onToggleWhatsApp={handleToggleWhatsApp}
          onMessageChange={setDefaultMessage}
          onSaveMessage={handleSaveDefaultMessage}
        />
      )}
       <RuleFileManager
  rules={rules}
  channel={channel}
  onImport={handleAdd}
/>

      <section className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-100">
            {isVoice ? "Voice AI Rules" : "WhatsApp Rules"}
          </h3>

          <p className="mt-1 text-sm leading-6 text-gray-500">
            Rules that shape how your AI responds on{" "}
            <span className="font-medium text-gray-300">
              {isVoice ? "Voice AI" : "WhatsApp"}
            </span>
            {" "}— tone, policy, language, and what not to say.
            Disabled rules remain saved but do not apply.
          </p>
        </div>

        {rules.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#2a3040] p-8 text-center text-sm text-gray-500">
            No custom rules for {isVoice ? "Voice AI" : "WhatsApp"} yet.
          </div>
        )}

        {rules.map((rule) => (
          <RuleRow
            key={rule._id}
            rule={rule}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        ))}

        <AddRuleForm
          key={channel}
          channel={channel}
          onAdd={handleAdd}
        />
      </section>
    </div>
  );
}
