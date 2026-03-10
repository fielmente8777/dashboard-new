import { useState } from "react";
import Timeline from "../../ConversationalTool/WhatsApp/components/Timeline";
import ActivityModal from "../../ConversationalTool/WhatsApp/components/ActivityModal";
import Loader from "../../../components/Loader";
import { FaPlus } from "react-icons/fa";
import { updateLead } from "../../../services/api/leads.api";
import Swal from "sweetalert2";
import { GrNotes } from "react-icons/gr";
import { useToast } from "../../../context/ToastContext";

const NotesCard = ({ lead, setLead }) => {
  const { showToast } = useToast();
  const [isEdit, setIsEdit] = useState(false);
  const [isEditingLoading, setIsEditingLoading] = useState(false);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingNote, setEditingNote] = useState(null);

  const handleOnAdd = () => {
    setEditingIndex(null);
    setEditingNote(null);
    setIsAddActivityOpen(true);
  };
  const handleUpdateNote = async () => {
    try {
      setIsEditingLoading(true);
      const payLoad = {
        leadId: lead._id,
        hid: lead?.hId,
        notes: lead.notes,
        ...(lead?.conversationId && { conversationId: lead?.conversationId }),
      };

      const response = await updateLead(payLoad);

      if (
        response?.success &&
        (response?.responseStatusCode === 200 ||
          response?.responseStatusCode === 201)
      ) {
        showToast({
          message: response?.responseMessage || "Lead updated successfully",
          type: "success",
        });
      }
      setIsEdit(false);
    } catch (error) {
      console.error("Error updating note:", error);
      showToast({
        message: error?.message || "Failed to update lead",
        type: "error",
      });
    } finally {
      setIsEditingLoading(false);
    }
  };
  const handleNotesSave = (activity) => {
    setIsEdit(true);
    const notes = [...(lead?.notes || [])];
    editingIndex !== null
      ? (notes[editingIndex] = activity)
      : notes.push(activity);

    setLead({ ...lead, notes });
    setIsAddActivityOpen(false);
    setEditingIndex(null);
    setEditingNote(null);
  };

  const handleRemoveNote = (index) => {
    setIsEdit(true);
    const notes = [...lead.notes];
    notes.splice(index, 1);
    setLead({ ...lead, notes });
  };

  return (
    <div className="bg-white rounded-lg md:shadow-sm p-5 ">
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-2 items-center bg-gray-100 px-4 py-1.5 w-fit rounded-full">
          <h3 className="text-sm font-medium text-[#37322F]">Notes</h3>

          {lead?.notes?.length > 0 && (
            <button
              onClick={handleOnAdd}
              className="rounded-full size-8 border bg-primary text-white border-gray-400 flex items-center justify-center text-lg"
            >
              <FaPlus size={10} />
            </button>
          )}
        </div>

        {isEdit && lead?.notes?.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={handleUpdateNote}
              className="bg-green-600 text-white px-4 py-1 rounded flex items-center gap-2"
            >
              Save {isEditingLoading && <Loader size={12} color={"#fefefe"} />}
            </button>
          </div>
        )}
      </div>

      {lead?.notes?.length ? (
        <div className="max-h-72 overflow-auto pr-2">
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
        <div className="flex flex-col items-center justify-center text-center">
          {/* SVG */}
          <GrNotes size={26} color="#cdcaca" />
          {/* Text */}
          <h3 className="mt-4 text-sm font-semibold text-gray-700">
            No notes yet
          </h3>
          <p className="text-sm text-gray-500 mt-1 max-w-xs">
            Keep track of conversations, follow-ups, and important details by
            adding your first note.
          </p>

          {/* CTA */}
          <button
            onClick={handleOnAdd}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-primary/90 hover:bg-primary text-white transition"
          >
            <span>＋</span>
            Add note
          </button>
        </div>
      )}

      <ActivityModal
        open={isAddActivityOpen}
        initialData={editingNote}
        onClose={() => setIsAddActivityOpen(false)}
        onSave={handleNotesSave}
      />
    </div>
  );
};

export default NotesCard;
