// src/components/Notes/ActivityModal.jsx
import { useEffect, useState } from "react";
import VoiceRecorder from "../../../../components/VoiceRecorder";
import Loader from "../../../../components/Loader";

/* <option> is drawn by the OS, so it needs its own explicit colors.
   Chrome/Edge/Firefox honour these; Safari falls back to color-scheme. */
const OPTION = "bg-white dark:bg-[#1e293b] text-gray-800 dark:text-gray-100";

const activityOptions = [
  { value: "phone_call", label: "Phone Call", emoji: "📞" },
  { value: "message", label: "Message", emoji: "💬" },
  { value: "note", label: "Note", emoji: "📝" },
  { value: "email", label: "Email", emoji: "✉️" },
  { value: "whatsapp", label: "Whatsapp", emoji: "🟢" },
];

export default function ActivityModal({ open, onClose, onSave, initialData }) {
  const [activitySource, setActivitySource] = useState("phone_call");
  const [message, setMessage] = useState("");
  // audio = { blob, duration, mimeType }  (new, not uploaded yet)
  //      or { url, key, duration, mimeType } (already saved on backend)
  const [audio, setAudio] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setActivitySource(initialData?.activitySource || "phone_call");
      setMessage(initialData?.message || "");
      setAudio(
        initialData?.audio?.blob || initialData?.audio?.url
          ? initialData.audio
          : null,
      );
      setIsRecording(false);
      setSaving(false);
      setError("");
    }
  }, [open, initialData]);

  if (!open) return null;

  const hasText = message.trim().length > 0;
  const canSave = (hasText || !!audio) && !isRecording && !saving;

  const handleSave = async () => {
    if (!hasText && !audio) {
      setError("Add a note or record a voice message.");
      return;
    }
    if (isRecording) return;

    setSaving(true);
    setError("");
    try {
      let audioPayload = null;

      if (audio?.blob) {
        // New recording -> keep the blob; NotesCard sends it with the notes
        // in the same update API call. The local URL is only for instant preview.
        audioPayload = {
          blob: audio.blob,
          duration: audio.duration,
          mimeType: audio.mimeType,
          url: URL.createObjectURL(audio.blob),
        };
      } else if (audio?.url) {
        audioPayload = audio; // unchanged existing voice note ({ url, key, ... })
      }

      const now = new Date().toISOString();
      const ok = await onSave({
        activitySource,
        message: message.trim(),
        ...(audioPayload && { audio: audioPayload }),
        createdAt: initialData?.createdAt || now,
        ...(initialData && { updatedAt: now }),
      });

      if (ok !== false) onClose();
    } catch (err) {
      setError(err?.message || "Couldn't save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const selected = activityOptions.find((a) => a.value === activitySource);

  return (
    <div className="bg-app-surface scheme:light dark:scheme-dark bg-transparent">
      <div className="space-y-4">
        {/* Activity type */}
        <div className="flex items-center gap-3 border border-app-border rounded-lg px-3 py-2 bg-app-surface focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-colors">
          <div className="w-9 h-9 shrink-0 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center text-base">
            {selected?.emoji}
          </div>
          <select
            className="flex-1 min-w-0 outline-none text-sm sm:text-base text-app-text bg-app-surface cursor-pointer"
            value={activitySource}
            onChange={(e) => setActivitySource(e.target.value)}
          >
            {activityOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className={OPTION}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Textarea + voice bar in bottom-left */}
        <div className="relative border border-app-border rounded-lg bg-app-surface focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-colors">
          <textarea
            rows={5}
            placeholder="Add details... or tap the mic to record"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (error) setError("");
            }}
            className="w-full rounded-lg p-3 pb-14 text-sm outline-none resize-none bg-transparent text-app-text placeholder:text-app-text-faint"
          />
          <div className="absolute left-2 right-2 bottom-2 flex items-center">
            <VoiceRecorder
              existingAudio={audio?.url ? audio : null}
              onChange={(rec) => {
                setAudio(rec);
                if (error) setError("");
              }}
              onRecordingChange={setIsRecording}
              disabled={saving}
            />
          </div>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      {/* Footer */}
      <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {initialData && (
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving
            ? "Saving"
            : isRecording
              ? "Stop recording to save"
              : initialData
                ? "Update"
                : "Save"}
          {saving && <Loader size={12} color="#fefefe" />}
        </button>
      </div>
    </div>
  );
}

// src/components/Notes/ActivityModal.jsx
// import { useEffect, useState } from "react";
// // import { uploadVoiceNote } from "../../services/voiceNoteService";
// // import Loader from "../Loader"; // adjust to wherever your Loader lives
// import VoiceRecorder from "../../../../components/VoiceRecorder";
// import Loader from "../../../../components/Loader";

// /* <option> is drawn by the OS, so it needs its own explicit colors.
//    Chrome/Edge/Firefox honour these; Safari falls back to color-scheme. */
// const OPTION = "bg-white dark:bg-[#1e293b] text-gray-800 dark:text-gray-100";

// const activityOptions = [
//   { value: "phone_call", label: "Phone Call", emoji: "📞" },
//   { value: "message", label: "Message", emoji: "💬" },
//   { value: "note", label: "Note", emoji: "📝" },
//   { value: "email", label: "Email", emoji: "✉️" },
//   { value: "whatsapp", label: "Whatsapp", emoji: "🟢" },
// ];

// export default function ActivityModal({
//   open,
//   onClose,
//   onSave,
//   initialData,
//   hid,
// }) {
//   const [activitySource, setActivitySource] = useState("phone_call");
//   const [message, setMessage] = useState("");
//   // audio = { blob, duration, mimeType }  (new, not uploaded yet)
//   //      or { url, key, duration, mimeType } (already saved on backend)
//   const [audio, setAudio] = useState(null);
//   const [isRecording, setIsRecording] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (open) {
//       setActivitySource(initialData?.activitySource || "phone_call");
//       setMessage(initialData?.message || "");
//       setAudio(initialData?.audio?.url ? initialData.audio : null);
//       setIsRecording(false);
//       setSaving(false);
//       setError("");
//     }
//   }, [open, initialData]);

//   if (!open) return null;

//   const hasText = message.trim().length > 0;
//   const canSave = (hasText || !!audio) && !isRecording && !saving;

//   const handleSave = async () => {
//     if (!hasText && !audio) {
//       setError("Add a note or record a voice message.");
//       return;
//     }

//     if (isRecording) return;

//     setSaving(true);
//     setError("");
//     try {
//       let audioPayload = null;

//       if (audio?.blob) {
//         // New recording -> upload first, store only the URL in the note
//         const uploaded = await uploadVoiceNote(audio.blob, { hid });
//         audioPayload = {
//           url: uploaded.url,
//           key: uploaded.key,
//           duration: audio.duration,
//           mimeType: audio.mimeType,
//         };
//       } else if (audio?.url) {
//         audioPayload = audio; // unchanged existing voice note
//       }

//       const now = new Date().toISOString();
//       const ok = await onSave({
//         activitySource,
//         message: message.trim(),
//         ...(audioPayload && { audio: audioPayload }),
//         createdAt: initialData?.createdAt || now,
//         ...(initialData && { updatedAt: now }),
//       });

//       if (ok !== false) onClose();
//     } catch (err) {
//       setError(err?.message || "Couldn't save. Please try again.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const selected = activityOptions.find((a) => a.value === activitySource);

//   return (
//     <div className="bg-app-surface scheme:light dark:scheme-dark bg-transparent">
//       <div className="space-y-4">
//         {/* Activity type */}
//         <div className="flex items-center gap-3 border border-app-border rounded-lg px-3 py-2 bg-app-surface focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-colors">
//           <div className="w-9 h-9 shrink-0 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center text-base">
//             {selected?.emoji}
//           </div>
//           <select
//             className="flex-1 min-w-0 outline-none text-sm sm:text-base text-app-text bg-app-surface cursor-pointer"
//             value={activitySource}
//             onChange={(e) => setActivitySource(e.target.value)}
//           >
//             {activityOptions.map((opt) => (
//               <option key={opt.value} value={opt.value} className={OPTION}>
//                 {opt.label}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Textarea + voice bar in bottom-left */}
//         <div className="relative border border-app-border rounded-lg bg-app-surface focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-colors">
//           <textarea
//             rows={5}
//             placeholder="Add details... or tap the mic to record"
//             value={message}
//             onChange={(e) => {
//               setMessage(e.target.value);
//               if (error) setError("");
//             }}
//             className="w-full rounded-lg p-3 pb-14 text-sm outline-none resize-none bg-transparent text-app-text placeholder:text-app-text-faint"
//           />
//           <div className="absolute left-2 right-2 bottom-2 flex items-center">
//             <VoiceRecorder
//               existingAudio={audio?.url && !audio?.blob ? audio : null}
//               onChange={(rec) => {
//                 setAudio(rec);
//                 if (error) setError("");
//               }}
//               onRecordingChange={setIsRecording}
//               disabled={saving}
//             />
//           </div>
//         </div>

//         {error && <p className="text-xs text-red-500">{error}</p>}
//       </div>

//       {/* Footer */}
//       <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
//         {initialData && (
//           <button
//             type="button"
//             onClick={onClose}
//             disabled={saving}
//             className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
//           >
//             Cancel
//           </button>
//         )}
//         <button
//           type="button"
//           onClick={handleSave}
//           disabled={!canSave}
//           className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//         >
//           {saving
//             ? "Saving"
//             : isRecording
//               ? "Stop recording to save"
//               : initialData
//                 ? "Update"
//                 : "Save"}
//           {saving && <Loader size={12} color="#fefefe" />}
//         </button>
//       </div>
//     </div>
//   );
// }

// import { useEffect, useState } from "react";

// /* <option> is drawn by the OS, so it needs its own explicit colors.
//    Chrome/Edge/Firefox honour these; Safari falls back to color-scheme. */
// const OPTION = "bg-white dark:bg-[#1e293b] text-gray-800 dark:text-gray-100";

// export default function ActivityModal({ open, onClose, onSave, initialData }) {
//   const [activitySource, setActivitySource] = useState("phone_call");
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     if (open) {
//       setActivitySource(initialData?.activitySource || "phone_call");
//       setMessage(initialData?.message || "");
//     }
//   }, [open, initialData]);

//   if (!open) return null;

//   const handleSave = () => {
//     if (!message.trim()) return;

//     onSave({
//       activitySource,
//       message,
//       createdAt: initialData?.createdAt || new Date().toISOString(),
//     });

//     onClose();
//   };

//   const activityOptions = [
//     { value: "phone_call", label: "Phone Call", emoji: "📞" },
//     { value: "message", label: "Message", emoji: "💬" },
//     { value: "note", label: "Note", emoji: "📝" },
//     { value: "email", label: "Email", emoji: "✉️" },
//     { value: "whatsapp", label: "Whatsapp", emoji: "🟢" },
//   ];

//   const selected = activityOptions.find((a) => a.value === activitySource);

//   return (
//     <div className="">
//       {open && (
//         <div className="bg-app-surface scheme:light dark:scheme-dark bg-transparent">
//           {/* Header */}
//           {/* <div className="flex justify-between items-center px-5 py-4 border-b">
//           <h2 className="font-semibold text-lg">
//             {initialData ? "Edit Activity" : "Add Activity"}
//           </h2>
//           <button onClick={onClose} className="text-gray-500">
//             ✕
//           </button>
//         </div> */}

//           {/* Body */}
//           <div className="space-y-4">
//             <div className="flex items-center gap-3 border border-app-border rounded-lg px-3 py-2 bg-app-surface focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-colors">
//               <div className="w-9 h-9 shrink-0 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center text-base">
//                 {selected?.emoji}
//               </div>

//               <select
//                 className="flex-1 min-w-0 outline-none text-sm sm:text-base text-app-text bg-app-surface cursor-pointer"
//                 value={activitySource}
//                 onChange={(e) => setActivitySource(e.target.value)}
//               >
//                 {activityOptions.map((opt) => (
//                   <option key={opt.value} value={opt.value} className={OPTION}>
//                     {opt.label}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <textarea
//               rows={5}
//               placeholder="Add details..."
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               className="w-full border border-app-border rounded-lg p-3 text-sm outline-none resize-none bg-app-surface text-app-text placeholder:text-app-text-faint focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
//             />
//           </div>

//           {/* Footer */}
//           <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
//             {initialData && (
//               <button
//                 onClick={() => {
//                   setMessage("");
//                   onClose();
//                 }}
//                 className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
//               >
//                 Cancel
//               </button>
//             )}
//             <button
//               onClick={handleSave}
//               className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
//             >
//               Save
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
