import { useState } from "react";
import Timeline from "../../ConversationalTool/WhatsApp/components/Timeline";
import ActivityModal from "../../ConversationalTool/WhatsApp/components/ActivityModal";
import Loader from "../../../components/Loader";
import { FaPlus } from "react-icons/fa";
import { updateLead } from "../../../services/api/leads.api";
import Swal from "sweetalert2";
import { GrNotes } from "react-icons/gr";
import { useToast } from "../../../context/ToastContext";
import { useConfirm } from "../../../context/ConfirmContext";
import { updateCall } from "../../../services/api/call.api";

const NotesCard = ({ lead, setLead, callManagement = false }) => {
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingNote, setEditingNote] = useState(null);

  const buildPayload = (notes) => {
    const baseFields = callManagement
      ? { sid: lead?.sid }
      : {
          leadId: lead._id,
          hid: lead?.hId,
          ...(lead?.conversationId && { conversationId: lead.conversationId }),
        };

    const files = [];
    const cleanNotes = notes.map((note, i) => {
      if (!note?.audio?.blob) return note;
      const { blob, url, ...meta } = note.audio; // drop local blob + object URL
      const field = `voice_${i}`;
      files.push({ field, blob });
      return { ...note, audio: { ...meta, field } };
    });

    if (!files.length) return { ...baseFields, notes: cleanNotes };

    const form = new FormData();
    Object.entries(baseFields).forEach(([k, v]) => form.append(k, v));
    form.append("notes", JSON.stringify(cleanNotes));
    files.forEach(({ field, blob }) => {
      const type = (blob.type || "audio/webm").split(";")[0]; // "audio/webm;codecs=opus" → "audio/webm"
      const ext = type.includes("mp4")
        ? "m4a"
        : type.includes("ogg")
          ? "ogg"
          : "webm";
      form.append(field, new File([blob], `${field}.${ext}`, { type }));
    });

    // updateLead reads leadId/hid to build the URL — expose them on the FormData too
    if (!callManagement) {
      form.leadId = lead._id;
      form.hid = lead?.hId;
    } else {
      form.sid = lead?.sid;
    }
    return form;
  };

  // Returns true/false so the modal knows whether to close
  const persistNotes = async (notes, prevNotes) => {
    setLead((prev) => ({ ...prev, notes })); // optimistic (local audio preview works)
    try {
      const payload = buildPayload(notes);
      const response = callManagement
        ? await updateCall(payload)
        : await updateLead(payload);

      // Controller returns the saved notes (with S3 URLs) as data.notes
      const savedNotes = response?.data?.notes;
      if (Array.isArray(savedNotes)) {
        setLead((prev) => ({ ...prev, notes: savedNotes }));
      }

      const ok =
        response?.success && [200, 201].includes(response?.responseStatusCode);
      if (!ok) throw new Error(response?.responseMessage || "Failed to update");

      showToast({
        message: response?.responseMessage || "Notes updated successfully",
        type: "success",
      });
      return true;
    } catch (error) {
      console.error("Error updating note:", error);
      setLead((prev) => ({ ...prev, notes: prevNotes })); // rollback
      showToast({
        message: error?.message || "Failed to update notes",
        type: "error",
      });
      return false;
    }
  };

  const handleOnAdd = () => {
    setEditingIndex(null);
    setEditingNote(null);
    setIsAddActivityOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddActivityOpen(false);
    setEditingIndex(null);
    setEditingNote(null);
  };

  const handleNotesSave = async (activity) => {
    const prevNotes = lead?.notes || [];
    const notes = [...prevNotes];
    if (editingIndex !== null) notes[editingIndex] = activity;
    else notes.push(activity);
    return persistNotes(notes, prevNotes);
  };

  const handleRemoveNote = async (index) => {
    const isConfirmed = await confirm(
      "Are you sure you want to delete this note?",
    );
    if (!isConfirmed) return;
    const prevNotes = lead?.notes || [];
    const notes = prevNotes.filter((_, i) => i !== index);
    await persistNotes(notes, prevNotes);
  };

  return (
    <div className="bg-app-surface-secondary rounded-lg md:shadow-sm p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 sm:mb-5">
        <div className="flex gap-2 items-center bg-app-surface px-3 sm:px-4 py-1.5 w-fit rounded-full">
          <h3 className="text-sm font-medium text-app-text">Notes</h3>
          {lead?.notes?.length > 0 && (
            <button
              onClick={handleOnAdd}
              aria-label="Add note"
              className="rounded-full size-8 shrink-0 bg-primary hover:bg-primary/90 text-white flex items-center justify-center transition-colors"
            >
              <FaPlus size={10} />
            </button>
          )}
        </div>
      </div>

      {lead?.notes?.length ? (
        <div className="max-h-72 overflow-auto pr-1 sm:pr-2">
          <Timeline
            items={lead.notes}
            onEdit={(item, index) => {
              setEditingIndex(index);
              setEditingNote(item);
              setIsAddActivityOpen(true);
            }}
            onDelete={(item, index) => handleRemoveNote(index)}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center px-2 py-6 sm:py-8">
          <GrNotes
            size={26}
            className="text-gray-300 dark:text-app-text-faint"
          />
          <h3 className="mt-4 text-sm font-semibold text-gray-700 dark:text-app-text">
            No notes yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-app-text-faint mt-1 max-w-xs">
            Keep track of conversations, follow-ups, and important details by
            adding a note or a voice message.
          </p>
          <button
            onClick={handleOnAdd}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary/90 hover:bg-primary text-white transition-colors"
          >
            <FaPlus size={10} />
            Add note
          </button>
        </div>
      )}

      <ActivityModal
        open={isAddActivityOpen}
        initialData={editingNote}
        hid={lead?.hId}
        onClose={handleCloseModal}
        onSave={handleNotesSave}
      />
    </div>
  );
};

export default NotesCard;

// import { useState } from "react";
// import Timeline from "../../ConversationalTool/WhatsApp/components/Timeline";
// import ActivityModal from "../../ConversationalTool/WhatsApp/components/ActivityModal";
// import Loader from "../../../components/Loader";
// import { FaPlus } from "react-icons/fa";
// import { updateLead } from "../../../services/api/leads.api";
// import Swal from "sweetalert2";
// import { GrNotes } from "react-icons/gr";
// import { useToast } from "../../../context/ToastContext";
// import { useConfirm } from "../../../context/ConfirmContext";
// import { updateCall } from "../../../services/api/call.api";

// const NotesCard = ({ lead, setLead, callManagement = false }) => {
//   const { showToast } = useToast();
//   const { confirm } = useConfirm();

//   const [isEdit, setIsEdit] = useState(false);
//   const [isEditingLoading, setIsEditingLoading] = useState(false);
//   const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
//   const [editingIndex, setEditingIndex] = useState(null);
//   const [editingNote, setEditingNote] = useState(null);

//   const handleOnAdd = () => {
//     setEditingIndex(null);
//     setEditingNote(null);
//     setIsAddActivityOpen(true);
//   };
//   const handleUpdateNote = async (payload) => {
//     const callUpdatePayload = {
//       notes: payload?.notes,
//       sid: payload?.sid,
//     };

//     try {
//       const response = callManagement
//         ? await updateCall(callUpdatePayload)
//         : await updateLead(payload);

//       if (
//         response?.success &&
//         (response?.responseStatusCode === 200 ||
//           response?.responseStatusCode === 201)
//       ) {
//         showToast({
//           message: response?.responseMessage || "Lead updated successfully",
//           type: "success",
//         });
//       }
//       setIsEdit(false);
//     } catch (error) {
//       console.error("Error updating note:", error);
//       showToast({
//         message: error?.message || "Failed to update lead",
//         type: "error",
//       });
//     }
//   };
//   const handleNotesSave = (activity) => {
//     const notes = [...(lead?.notes || [])];

//     if (activity) {
//       editingIndex !== null
//         ? (notes[editingIndex] = activity)
//         : notes.push(activity);
//     }

//     let payload = {};

//     if (callManagement) {
//       payload = {
//         sid: lead?.sid,
//         notes,
//       };
//     } else {
//       payload = {
//         leadId: lead._id,
//         hid: lead?.hId,
//         notes,
//         ...(lead?.conversationId && { conversationId: lead?.conversationId }),
//       };
//     }

//     setLead((prev) => ({
//       ...prev,
//       notes,
//     }));

//     handleUpdateNote(payload);

//     // setIsEdit(true);
//     // const notes = [...(lead?.notes || [])];
//     // editingIndex !== null
//     //   ? (notes[editingIndex] = activity)
//     //   : notes.push(activity);

//     // setLead({ ...lead, notes });
//     // setIsAddActivityOpen(false);
//     // setEditingIndex(null);
//     // setEditingNote(null);
//   };

//   const handleRemoveNote = async (index) => {
//     const isConfirmed = await confirm(
//       "Are you sure you want to delete this lead?",
//     );

//     if (!isConfirmed) return;

//     setIsEdit(true);
//     const notes = [...lead.notes];
//     notes.splice(index, 1);
//     let payload = {};
//     if (callManagement) {
//       payload = {
//         sid: lead?.sid,
//         notes,
//       };
//     } else {
//       payload = {
//         leadId: lead._id,
//         hid: lead?.hId,
//         notes,
//         ...(lead?.conversationId && { conversationId: lead?.conversationId }),
//       };
//     }
//     setLead({ ...lead, notes });
//     handleUpdateNote(payload);
//   };

//   return (
//     <div className="bg-app-surface-secondary rounded-lg md:shadow-sm p-4 sm:p-5">
//       <div className="flex flex-wrap items-center justify-between gap-2 mb-4 sm:mb-5">
//         <div className="flex gap-2 items-center bg-app-surface px-3 sm:px-4 py-1.5 w-fit rounded-full">
//           <h3 className="text-sm font-medium text-app-text">Notes</h3>

//           {lead?.notes?.length > 0 && (
//             <button
//               onClick={handleOnAdd}
//               aria-label="Add note"
//               className="rounded-full size-8 shrink-0 bg-primary hover:bg-primary/90 text-white flex items-center justify-center transition-colors"
//             >
//               <FaPlus size={10} />
//             </button>
//           )}
//         </div>

//         {isEdit && lead?.notes?.length > 0 && (
//           <div className="flex justify-end">
//             <button
//               onClick={handleUpdateNote}
//               className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
//             >
//               Save {isEditingLoading && <Loader size={12} color={"#fefefe"} />}
//             </button>
//           </div>
//         )}
//       </div>

//       {lead?.notes?.length ? (
//         <div className="max-h-72 overflow-auto pr-1 sm:pr-2">
//           <Timeline
//             items={lead.notes}
//             onEdit={(item, index) => {
//               setEditingIndex(index);
//               setEditingNote(item);
//               setIsAddActivityOpen(true);
//             }}
//             onDelete={(item, index) => handleRemoveNote(index)}
//           />
//         </div>
//       ) : (
//         <div className="flex flex-col items-center justify-center text-center px-2 py-6 sm:py-8">
//           {/* SVG */}
//           <GrNotes
//             size={26}
//             className="text-gray-300 dark:text-app-text-faint"
//           />
//           {/* Text */}
//           <h3 className="mt-4 text-sm font-semibold text-gray-700 dark:text-app-text">
//             No notes yet
//           </h3>
//           <p className="text-sm text-gray-500 dark:text-app-text-faint mt-1 max-w-xs">
//             Keep track of conversations, follow-ups, and important details by
//             adding your first note.
//           </p>

//           {/* CTA */}
//           <button
//             onClick={handleOnAdd}
//             className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary/90 hover:bg-primary text-white transition-colors"
//           >
//             <FaPlus size={10} />
//             Add note
//           </button>
//         </div>
//       )}

//       <div className="mt-4">
//         <ActivityModal
//           open={isAddActivityOpen}
//           initialData={editingNote}
//           onClose={() => setIsAddActivityOpen(false)}
//           onSave={handleNotesSave}
//         />
//       </div>
//     </div>
//   );
// };

// export default NotesCard;
