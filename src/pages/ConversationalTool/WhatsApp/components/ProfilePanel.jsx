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

const ProfilePanel = ({ selectedContact, fetchConversations }) => {
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const {
    selectedConversation,
    setSelectedConversation,
    setConversations,
    setMobileActive,
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
    <div className="w-full md:w-80 h-full overflow-y-auto bg-white border-l border-gray-200 flex flex-col">
      <div className="flex justify-end p-2">
        
      </div>
      {/* Profile Header */}
      <div className="px-3 md:px-6 md:py-0 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
         
          <div className="flex items-center">
              <div className="mr-2 md:hidden">
            <IoArrowBack
              size={22}
              onClick={() => setMobileActive("chatarea")}
            />
          </div>
            <div className="w-10 h-10 md:w-12 md:h-12 border text-gray-600 border-gray-900 bg-ternary/20 rounded-full flex items-center justify-center  font-bold text-md md:text-lg mr-2 md:mr-4">
              {selectedContact?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h3 className="text-md md:text-lg font-semibold text-gray-900">
                {selectedContact?.name}
              </h3>
              <p className="text-sm text-gray-600 font-medium ">
                +{selectedContact?.phone}
              </p>
            </div>

          </div>
          <button
            disabled={isDeleteLoading}
            className="bg-red-200 text-red-600 p-2 font-medium text-sm rounded-sm flex items-center gap-1.5"
            onClick={handleDeleteConversation}
          >
            <RiDeleteBin6Line />{" "}
            {isDeleteLoading && <Loader color="#fefefe" />}
          </button>
        </div>

        {/* Status Information */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Status</span>
            <span className="text-gray-600 bg-green-200 px-4 rounded-2xl font-medium text-sm">
              {/* {selectedContact?.status === "ACTIVE" ? "Active" : "Inactive"} */}

              {selectedContact?.status}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Last Active</span>
            <span className="text-gray-900">{`${formatDateByOnlyDay(selectedContact?.last_message?.created_at)} ${formateDateInTimeIS(selectedContact?.last_message?.created_at)} `}</span>
          </div>
          {/* <div className="flex justify-between text-sm">
            <span className="text-gray-600">Template Messages</span>
            <span className="text-gray-900">0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Session Messages</span>
            <span className="text-gray-900">1</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Unresolved Queries</span>
            <span className="text-gray-900">0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Source</span>
            <span className="text-gray-900">AD</span>
          </div> */}
          {/* <div className="flex justify-between text-sm">
            <span className="text-gray-600">Last Message</span>
            <span className="text-gray-900">
              {selectedContact?.last_message?.text}
            </span>
          </div> */}
          {/* <div className="flex justify-between text-sm">
            <span className="text-gray-600">WA Conversation</span>
            <span className="text-gray-900">{selectedContact?.status==="ACTIVE"?"Active":"Inactive"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">MAU Status</span>
            <span className="text-gray-900">{selectedContact?.status==="ACTIVE"?"Active":"Inactive"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Incoming</span>
            <span className="text-gray-900">{selectedContact?.status==="ACTIVE"?"Allowed":"Not Allowed"}</span>
          </div> */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Opted In</span>

            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" class="sr-only peer" checked={true} />
              <div
                class="w-11 h-6 bg-gray-300 rounded-full peer 
                            peer-checked:bg-teal-500 
                            transition-colors duration-300"
              ></div>
              <div
                class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full 
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
            {/* <select
              name="stage"
              id=""
              className="border border-gray-50 outline-none py-1 rounded-md w-full"
              onChange={handleInputChange}
            >
              <option value="">Select</option>
              {header?.map((item) => {
                return <option value={item.value}>{item.label}</option>;
              })}
            </select> */}
          </div>

          <div className="">
            <h3 className="text-sm font-medium text-[#37322F] mb-4">Notes</h3>

            {/* Add Activity */}
            <div
              onClick={() => {
                setIsAddActivityOpen(!isAddActivityOpen);
                setEditingNote(null);
                setEditingIndex(null);
              }}
              className=" cursor-pointer flex items-center gap-3.5 mb-4"
            >
              <button className="rounded-full w-10 h-10 border border-gray-400 flex items-center justify-center text-lg">
                +
              </button>

              <p className="text-teal-600 font-medium flex items-center gap-2">
                Add Activity{" "}
                <span>
                  {isAddActivityOpen ? (
                    <span>
                      <IoMdArrowDropdown className="rotate-180" size={20} />
                    </span>
                  ) : (
                    <span>
                      <IoMdArrowDropdown size={20} />
                    </span>
                  )}
                </span>
              </p>
            </div>

            {/* Timeline */}
            <div className="max-h-72 overflow-auto pr-2">
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
              // setNotes((prev) => [...prev, activity]);
              // setSelectedConversation((prev) => ({
              //   ...prev,
              //   notes: [...(prev.notes || []), activity],
              // }));
            }}
          />
        </div>
      </div>

      {/* Expandable Sections */}
      <div className="flex-1 overflow-y-auto">
        {/* Payments Section */}
        {/* <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection("payments")}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50"
          >
            <span className="text-sm font-medium text-gray-700">Payments</span>
            {expandedSections?.payments ? (
              <BsChevronUp className="text-gray-400" />
            ) : (
              <BsChevronDown className="text-gray-400" />
            )}
          </button>
          {expandedSections?.payments && (
            <div className="px-4 pb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Order Id</span>
                  <span className="text-gray-600">Amount</span>
                  <span className="text-gray-600">Status</span>
                </div>
                <p className="text-xs text-gray-400 text-center py-4">
                  No payment records
                </p>
              </div>
            </div>
          )}
        </div> */}

        {/* Campaigns Section */}
        {/* <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection("campaigns")}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50"
          >
            <span className="text-sm font-medium text-gray-700">Campaigns</span>
            {expandedSections?.campaigns ? (
              <BsChevronUp className="text-gray-400" />
            ) : (
              <BsChevronDown className="text-gray-400" />
            )}
          </button>
          {expandedSections?.campaigns && (
            <div className="px-4 pb-4">
              <p className="text-xs text-gray-400 text-center py-4">
                No campaigns
              </p>
            </div>
          )}
        </div> */}

        {/* Attributes Section */}
        {/* <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection("attributes")}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50"
          >
            <span className="text-sm font-medium text-gray-700">
              Attributes
            </span>
            {expandedSections.attributes ? (
              <BsChevronUp className="text-gray-400" />
            ) : (
              <BsChevronDown className="text-gray-400" />
            )}
          </button>
          {expandedSections.attributes && (
            <div className="px-4 pb-4">
              <p className="text-xs text-gray-400 text-center py-4">
                No attributes
              </p>
            </div>
          )}
        </div> */}

        {/* Tags Section */}
        {/* <div>
          <button
            onClick={() => toggleSection("tags")}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50"
          >
            <span className="text-sm font-medium text-gray-700">Tags</span>
            {expandedSections.tags ? (
              <BsChevronUp className="text-gray-400" />
            ) : (
              <BsChevronDown className="text-gray-400" />
            )}
          </button>
          {expandedSections.tags && (
            <div className="px-4 pb-4">
              <p className="text-xs text-gray-400 text-center py-4">No tags</p>
            </div>
          )}
        </div> */}
      </div>
    </div>
  );
};

export default ProfilePanel;
