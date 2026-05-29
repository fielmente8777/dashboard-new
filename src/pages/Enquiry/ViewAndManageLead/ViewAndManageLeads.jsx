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
  const search = searchParams.get("search");
  const source = searchParams.get("source");
  const stage = searchParams.get("stage");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const [showSave, setShowSave] = useState(false);

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
      ...(search && { search: search }),
      ...(source && { source: source }),
      ...(stage && { stage: stage }),
      ...(startDate && { startDate: startDate }),
      ...(endDate && { endDate: endDate }),
    };

    try {
      const response = await getLeads(params);
      // const response = await getLeadById(leadId, hid);
      if (response?.success) {
        setLead(response?.result?.docs?.leads[0]);
        const followDate =
          response?.result?.docs?.leads[0]?.followUpDate ||
          response?.result?.docs?.leads[0]?.folloUp;

        setSelectedDate(followDate ? new Date(followDate) : null);

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
        followUpDate: value,
        status: "Follow Up",
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
    <div className="p-3 md:p-6 bg-[#f4f6fb] min-h-screen space-y-3 md:space-y-6 relative">
      <div className="flex items-center  gap-2.5 bg-white md:border md:shadow-xs border-primary/10! rounded-md p-3">
        <button
          onClick={() => window.history.back()}
          className="flex size-8 justify-center bg-gray-100 rounded-full items-center gap-2 text-primary hover:bg-gray-200 transition-all duration-200"
        >
          <IoArrowBack />
        </button>

        <div className="flex flex-1  justify-between items-center">
          <LeadTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="hidden md:flex  gap-2 ">
            {lead?.Contact && (
              <div className="flex gap-2 py-2 justify-center rounded items-center border px-2 text-primary/90 bg-white font-medium">
                <label htmlFor="" className="">
                  Follow Up
                </label>
                {/* <DatePicker
                  minDate={new Date()}
                  startDate={selectedDate}
                  // onChange={(update) => {
                  //   // setSelectedDate(update);
                  //   // handleFollow(update);
                  // }}
                  shouldCloseOnSelect={false}
                  onChange={(update) => {
                    setSelectedDate(update);
                    setShowSave(true); // show save button
                  }}
                  className="bg-transparent outline-none text-sm w-40 placeholder:text-[#fd5c01]"
                  placeholderText={`${selectedDate ? new Date(selectedDate).toLocaleString() : " Select Date"}`}
                  popperClassName="!z-50"
                  showTimeInput
                  customTimeInput={
                    <CustomTimeInput onChangeCustom={handleChangeTime} />
                  }
                /> */}

                <DatePicker
                  minDate={new Date()}
                  selected={selectedDate}
                  onChange={(date) => {
                    setSelectedDate(date);

                    // ✅ Only call API when time is selected (not just date)
                    // if (date && date.getHours() !== 0) {
                    //   handleFollow(date);
                    //   setShowSave(false);
                    // }
                  }}
                  onCalendarClose={() => {
                    if (selectedDate) {
                      handleFollow(selectedDate); // ✅ runs only once
                    }
                  }}
                  showTimeSelect
                  timeIntervals={5}
                  dateFormat="dd/MM/yyyy h:mm aa"
                  placeholderText="Select Date & Time"
                  className="bg-transparent outline-none text-sm w-44"
                  popperClassName="!z-50"
                />
                {(lead?.followUp || lead?.followUpDate) && (
                  <button
                    onClick={() => {
                      setSelectedDate(null);
                      handleFollow(null);
                    }}
                  >
                    X
                  </button>
                )}

                {showSave && (
                  <button
                    onClick={() => {
                      handleFollow(selectedDate);
                      setShowSave(false);
                    }}
                    className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                  >
                    Save
                  </button>
                )}
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

          <div className="grid md:grid-cols-2 gap-3 md:gap-6 mt-3 md:mt-6  min-h-28">
            <CustomerInfoCard
              lead={lead}
              onClick={() => setQuickResponseOpen(true)}
            />
            {lead?.other_details && (
              <OtherDetailsCard otherDetails={lead?.other_details} />
            )}

            <div className="space-y-2">
              {lead?.Message && (
                <div className="bg-white p-4 rounded-md space-y-2">
                  <h3 className="font-semibold text-gray-800">Message</h3>
                  <p className="text-sm"> {lead?.Message}</p>
                </div>
              )}
              <NotesCard lead={lead} setLead={setLead} />

              {lead?.request_metadata && (
                <div className="bg-white p-4 rounded-md space-y-3">
                  <h3 className="font-semibold text-gray-800">
                    Request Metadata
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {Object.entries(lead.request_metadata).map(
                      ([key, value]) => {
                        // Skip IP field
                        if (key === "ip") return null;

                        // Handle geo object separately
                        if (key === "geo" && typeof value === "object") {
                          return Object.entries(value).map(
                            ([geoKey, geoValue]) => {
                              if (geoKey === "ip") return null;

                              return (
                                <div
                                  key={geoKey}
                                  className="border rounded-md p-2 bg-gray-50"
                                >
                                  <p className="text-gray-500 capitalize">
                                    {geoKey.replace(/_/g, " ")}
                                  </p>

                                  <p className="font-medium break-all">
                                    {String(geoValue || "-")}
                                  </p>
                                </div>
                              );
                            },
                          );
                        }

                        return (
                          <div
                            key={key}
                            className="border rounded-md p-2 bg-gray-50"
                          >
                            <p className="text-gray-500 capitalize">
                              {key.replace(/_/g, " ")}
                            </p>

                            <p className="font-medium break-all">
                              {String(value || "-")}
                            </p>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              )}
            </div>

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
