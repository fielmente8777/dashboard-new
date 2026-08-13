import { useContext, useState } from "react";

import { IoMdArrowDropdown } from "react-icons/io";
import { IoArrowBack } from "react-icons/io5";
import Loader from "../../../../components/Loader";
import CustomDropdown from "../../../../components/ui/Dropdown";
import { useConfirm } from "../../../../context/ConfirmContext";
import DataContext from "../../../../context/DataContext";
import { useToast } from "../../../../context/ToastContext";
import { Stages } from "../../../../data/constant";
import { updateLead } from "../../../../services/api/leads.api";
import {
  addWhatsAppLead,
  deleteConversation,
} from "../../../../services/api/whatsApp";
import {
  formatDateByOnlyDay,
  formateDateInTimeIS,
} from "../../../../utils/formateDate";
import ActivityModal from "./ActivityModal";
import Timeline from "./Timeline";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FiPlus } from "react-icons/fi";

/* ── shared presentation tokens ─────────────────────────────── */
const ROW_LABEL = "text-gray-600 dark:text-app-text-faint shrink-0";
const ROW_VALUE = "text-gray-900 dark:text-app-text-muted text-right";

const ProfilePanel = ({ selectedContact, fetchConversations }) => {
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const {
    selectedConversation,
    setSelectedConversation,
    setConversations,
    setMobileActive,
    lastMessage,
  } = useContext(DataContext);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);

  const [editingIndex, setEditingIndex] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const handleAddLead = async ({ stage, activity }) => {
    const isEdit = selectedConversation?.markAsLead;
    const notes = [...(selectedConversation?.notes || [])];

    if (activity) {
      editingIndex !== null
        ? (notes[editingIndex] = activity)
        : notes.push(activity);
    }

    try {
      const payload = {
        Contact: selectedConversation.phone,
        Name: selectedConversation.name,
        ndid: selectedConversation.ndid,
        notes,
        status: stage,
        conversationId: selectedConversation._id,
        hId: selectedConversation?.hid || localStorage.getItem("hid"),
      };
      const response = isEdit
        ? await updateLead(payload)
        : await addWhatsAppLead(payload);
      if (response.success && response.responseStatusCode === 200) {
        setSelectedConversation({
          ...selectedConversation,
          ...(stage && { status: stage }),
          ...(notes && { notes }),
        });

        showToast({
          message: response.responseMessage || "Lead added successfully",
          type: "success",
          position: "bottom-right",
        });

        fetchConversations(false);
      }
    } catch (error) {
      console.log("Error", error);
    }
  };

  const handleRemoveNote = async (index) => {
    try {
      const isConfirmed = await confirm(
        "Are you sure you want to delete this lead?",
      );

      if (!isConfirmed) return;

      const notes = [...selectedConversation.notes];
      notes.splice(index, 1);

      const payload = {
        ndid: selectedConversation.ndid,
        conversationId: selectedConversation._id,
        hid: selectedConversation?.hid,
        notes,
      };

      setSelectedConversation({
        ...selectedConversation,
        notes,
      });

      const response = await updateLead(payload);

      if (response?.success && response?.responseStatusCode === 200) {
        showToast({
          message: response.responseMessage || "Lead added successfully",
          type: "success",
          position: "bottom-right",
        });
        fetchConversations(false);
      }
    } catch (error) {
      showToast({
        message: error?.message || "Failed to update lead",
        type: "error",
        position: "bottom-right",
      });
    }
  };

  const handleDeleteConversation = async () => {
    setIsDeleteLoading(true);
    try {
      const isConfirmed = await confirm(
        "Are you sure you want to delete this conversation?",
      );

      if (!isConfirmed) return;

      const response = await deleteConversation({
        conversationId: selectedConversation._id,
        phone: selectedConversation.phone,
      });

      setConversations((prevConversations) =>
        prevConversations.filter(
          (conv) => conv._id !== selectedConversation._id,
        ),
      );

      setSelectedConversation(null);

      if (response?.success) {
        showToast({
          message:
            response?.responseMessage || "Conversation deleted successfully",
          type: "success",
          position: "bottom-right",
        });
      }
    } catch (error) {
      showToast({
        message: error?.message || "Failed to delete conversation",
        type: "error",
        position: "bottom-right",
      });
    } finally {
      setIsDeleteLoading(false);
    }
  };

  return (
    <div className="w-full lg:w-72 xl:w-80 shrink-0 h-full min-h-0 overflow-y-auto bg-app-surface border-l border-app-border flex flex-col [color-scheme:light] dark:[color-scheme:dark]">
      {/* Profile Header */}
      <div className="px-3 md:px-6 py-4 border-b border-app-border">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center min-w-0">
            <button
              type="button"
              aria-label="Back to chat"
              onClick={() => setMobileActive("chatarea")}
              className="mr-1 lg:hidden shrink-0 size-9 flex items-center justify-center rounded-full text-app-text hover:bg-app-surface-secondary transition-colors"
            >
              <IoArrowBack size={22} />
            </button>

            <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 border border-ternary/40 text-gray-700 dark:text-app-text bg-ternary/20 rounded-full flex items-center justify-center font-bold text-base md:text-lg mr-2 md:mr-4">
              {selectedContact?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-app-text truncate">
                {selectedContact?.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-app-text-faint font-medium truncate">
                {selectedContact?.phone}
              </p>
            </div>
          </div>
          <button
            disabled={isDeleteLoading}
            aria-label="Delete conversation"
            className="shrink-0 bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/25 size-9 font-medium text-sm rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
            onClick={handleDeleteConversation}
          >
            <RiDeleteBin6Line />{" "}
            {isDeleteLoading && <Loader color="#dc2626" size={12} />}
          </button>
        </div>

        {/* Status Information */}
        <div className="space-y-3">
          <div className="flex justify-between items-center gap-2 text-sm">
            <span className={ROW_LABEL}>Status</span>
            <span className="text-green-800 dark:text-green-300 bg-green-100 dark:bg-green-500/15 px-3 py-0.5 rounded-2xl font-medium text-sm capitalize truncate">
              {/* {selectedContact?.status === "ACTIVE" ? "Active" : "Inactive"} */}

              {selectedContact?.status}
            </span>
          </div>

          <div className="flex justify-between items-start gap-2 text-sm">
            <span className={ROW_LABEL}>Last Active</span>
            <span className={ROW_VALUE}>{`${formatDateByOnlyDay(
              selectedContact?.last_message?.created_at ||
                lastMessage?.createdAt,
            )} ${formateDateInTimeIS(selectedContact?.last_message?.created_at || lastMessage?.createdAt)} `}</span>
          </div>

          <div className="flex justify-between items-center gap-2 text-sm">
            <span className={ROW_LABEL}>Opted In</span>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={true}
                readOnly
              />
              <div
                className="w-11 h-6 bg-gray-300 dark:bg-app-surface-secondary rounded-full peer
                            peer-checked:bg-teal-500
                            transition-colors duration-300"
              ></div>
              <div
                className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow
                            transition-transform duration-300
                            peer-checked:translate-x-5"
              ></div>
            </label>
          </div>

          <div className="w-full">
            <CustomDropdown
              options={Stages}
              label={selectedContact.status || "Open"}
              onChange={(value) => {
                handleAddLead({
                  stage: value,
                });
              }}
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-800 dark:text-app-text mb-3">
              Notes
            </h3>

            {/* Add Activity */}
            <div
              onClick={() => {
                setIsAddActivityOpen(!isAddActivityOpen);
                setEditingNote(null);
                setEditingIndex(null);
              }}
              className="cursor-pointer flex items-center gap-3 mb-4"
            >
              <button className="rounded-full w-8 aspect-square border border-app-border text-app-text hover:border-teal-500 hover:text-teal-600 flex items-center justify-center text-lg transition-colors">
               <FiPlus />
              </button>

              <p className="text-teal-600 dark:text-teal-400 font-medium flex items-center gap-1">
                Add Activity{" "}
                <span>
                  {isAddActivityOpen ? (
                    <IoMdArrowDropdown className="rotate-180" size={20} />
                  ) : (
                    <IoMdArrowDropdown size={20} />
                  )}
                </span>
              </p>
            </div>

            {/* Timeline */}
            <div className="max-h-72 overflow-auto pr-1 sm:pr-2">
              <Timeline
                items={selectedConversation?.notes || []}
                onEdit={(item, index) => {
                  setEditingIndex(index);
                  setEditingNote(item);
                  setIsAddActivityOpen(true);
                }}
                onDelete={(item, index) => handleRemoveNote(index)}
              />
            </div>
          </div>

          {/* Modal */}
          <ActivityModal
            open={isAddActivityOpen}
            onClose={() => setIsAddActivityOpen(false)}
            initialData={editingNote}
            onSave={(activity) => {
              handleAddLead({
                activity,
              });
            }}
          />
        </div>
      </div>

      {/* Expandable Sections */}
      <div className="flex-1"></div>
    </div>
  );
};

export default ProfilePanel;
