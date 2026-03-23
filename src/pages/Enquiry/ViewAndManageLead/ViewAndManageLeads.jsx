import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { useParams, useSearchParams } from "react-router-dom";
import QuickResponsePopup from "../../../components/Popup/QuickResponsePopup";
import {
  getLeadById,
  getLeads,
  updateLead,
} from "../../../services/api/leads.api";
import {
  getWhatsappConversationMessages,
  getWhatsAppMessageTemplates,
} from "../../../services/api/whatsApp";
import CallDetails from "../../AiSalesAgents/CallDetails";
import ConversationsCard from "./ConversationCard";
import CustomerInfoCard from "./CustomerInfoCard";
import LeadHeader from "./LeadHeader";
import LeadTabs from "./LeadTabs";
import NotesCard from "./NotesCard";
import { LeadDetailsSkeleton } from "../../../components/Skeltons/LeadDetailsSkelton";
import { IoArrowBack } from "react-icons/io5";
import OtherDetailsCard from "./OtherDetailsCard";
import WhatsAppConverstionCard from "./WhatsAppConverstionCard";
import DatePicker from "react-datepicker";
import { useToast } from "../../../context/ToastContext";

const ViewAndManageLeads = () => {
  const { showToast } = useToast();
  const { leadId } = useParams();
  const [searchParams] = useSearchParams();
  const hid = searchParams.get("hid");
  const leadPageNumber = searchParams.get("lead");
  const created_from = searchParams.get("created_from");

  const [leadPageNumberState, setLeadPageNumberState] =
    useState(leadPageNumber);

  const [quickResponseOpen, setQuickResponseOpen] = useState(false);
  const [lead, setLead] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [whatsAppConversation, setWhatsAppConversation] = useState(null);
  const [messageLoading, setMessageLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState();

  const fetchConversation = async (conversationId) => {
    setMessageLoading(true);
    try {
      const response = await getWhatsappConversationMessages(conversationId);

      if (response?.success && response?.responseStatusCode === 200) {
        setWhatsAppConversation(response?.result?.messages);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setMessageLoading(false);
    }
  };

  const fetchLead = async () => {
    setLoading(true);
    const params = {
      page: leadPageNumberState,
      limit: 1,
      ...(created_from && { created_from: created_from }),
      // stage: stage,
    };

    try {
      const response = await getLeads(params);
      // const response = await getLeadById(leadId, hid);
      if (response?.success) {
        setLead(response?.result?.docs?.leads[0]);
        setSelectedDate(response?.result?.docs?.leads[0]?.followUp);

        const conversationId = response?.result?.docs?.conversationId;

        if (conversationId) {
          fetchConversation(conversationId);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    const response = await getWhatsAppMessageTemplates();
    if (response.success) {
      setTemplates(response?.result?.docs?.data || []);
    }
  };

  const handleFollow = async (value) => {
    try {
      const payload = {
        leadId: lead._id,
        hid: lead?.hId,
        conversationId: lead?.conversationId,
        followUp: value,
      };

      const response = await updateLead(payload);

      if (response?.success && response?.responseStatusCode === 200) {
        showToast({
          message:
            response?.responseMessage || "Lead stage updated successfully",
          type: "success",
        });
      }
    } catch (error) {
      showToast({
        message: error?.message || "Failed to update lead stage",
        type: "error",
      });
    }
  };

  const handleNextPage = () => {
    setLeadPageNumberState((prev) => Number(prev) + 1);
  };

  const handlePrevPage = () => {
    if (Number(leadPageNumberState) === 1) return;
    setLeadPageNumberState((prev) => Number(prev) - 1);
  };

  useEffect(() => {
    if (!leadId && !hid) return;
    fetchLead();
    fetchTemplates();
  }, [leadId, hid, leadPageNumberState]);

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <LeadDetailsSkeleton />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-3 p-3 border-b bg-white">
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 
                 hover:bg-gray-200 text-gray-700 transition-all duration-200"
          >
            <IoArrowBack size={18} />
          </button>

          <span className="text-sm font-medium text-gray-700">Leads</span>
        </div>

        {/* Empty State */}
        <div className="flex flex-1 flex-col items-center justify-center text-center px-4">
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-100 mb-4 text-2xl">
            📭
          </div>

          <h3 className="text-lg font-semibold text-gray-800">
            No Leads Found
          </h3>

          <p className="text-sm text-gray-500 mt-2 mb-4 max-w-xs">
            You don’t have any leads yet. Start by adding your first lead.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 bg-[#f4f6fb] min-h-screen space-y-3 md:space-y-6">
      <div className="flex items-center  gap-2.5 bg-white md:border md:shadow-xs border-primary/10! rounded-md p-3">
        <button
          onClick={() => window.history.back()}
          className="flex size-8 justify-center bg-gray-100 rounded-full items-center gap-2 text-primary hover:bg-gray-200 transition-all duration-200"
        >
          <IoArrowBack />
        </button>
        <div className="flex flex-1  justify-between items-center">
          <LeadTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="flex  gap-2 ">
            {lead?.Contact && (
              <div className="flex gap-2 justify-center rounded items-center border px-2 text-[#fd5c01]/90 bg-white font-medium">
                <label htmlFor="" className="">
                  Follow Up
                </label>
                <DatePicker
                  // selectsRange
                  startDate={selectedDate}
                  // endDate={endDate}
                  onChange={(update) => {
                    setSelectedDate(update);
                    handleFollow(update);
                  }}
                  className="bg-transparent outline-none text-sm w-40 placeholder:text-[#fd5c01]"
                  placeholderText={`${selectedDate ? new Date(selectedDate).toLocaleString() : " Select Date"}`}
                  popperClassName="!z-50"
                />
              </div>
            )}
            {lead?.Contact && (
              <div className="flex justify-end">
                <button
                  onClick={() => setQuickResponseOpen(true)}
                  className="bg-primary text-white px-2 md:px-5 py-2 rounded flex items-center gap-2 shadow"
                >
                  <FaWhatsapp />{" "}
                  <span className="hidden md:block">Send Quick Response</span>
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end items-center gap-3">
        {/* Prev Button */}
        <button
          onClick={handlePrevPage}
          className="font-medium flex items-center gap-2 px-4 py-2 rounded border border-gray-300 bg-white text-gray-700 
               hover:bg-gray-100 hover:shadow-sm transition-all duration-200
               disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Prev
        </button>

        {/* Next Button */}
        <button
          onClick={handleNextPage}
          className="font-medium flex items-center gap-2 px-4 py-2 rounded border border-gray-300 bg-white text-gray-700 
               hover:bg-gray-100 hover:shadow-sm transition-all duration-200
               disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>
      </div>

      

      {activeTab === 0 && (
        <>
          <LeadHeader lead={lead} />

          <div className="grid grid-cols-2 gap-3 md:gap-6 mt-3 md:mt-6  min-h-28">
            <CustomerInfoCard lead={lead} />
            {lead?.other_details && (
              <OtherDetailsCard otherDetails={lead?.other_details} />
            )}
            <NotesCard lead={lead} setLead={setLead} />

            {lead?.chats?.length > 0 && (
              <ConversationsCard chats={lead?.chats} />
            )}

            {whatsAppConversation && (
              <WhatsAppConverstionCard
                messageList={whatsAppConversation}
                messageLoading={messageLoading}
              />
            )}
          </div>

          {/* <LeadFooter lead={lead} /> */}
        </>
      )}

      {activeTab === 1 && <CallDetails call={lead?.call} />}

      <QuickResponsePopup
        setOpen={() => setQuickResponseOpen(false)}
        open={quickResponseOpen}
        lead={lead}
        templates={templates || []}
      />
    </div>
  );
};

export default ViewAndManageLeads;
