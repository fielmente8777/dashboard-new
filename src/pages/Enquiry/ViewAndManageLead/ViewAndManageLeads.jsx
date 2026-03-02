import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { useParams, useSearchParams } from "react-router-dom";
import QuickResponsePopup from "../../../components/Popup/QuickResponsePopup";
import { getLeadById } from "../../../services/api/leads.api";
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

const ViewAndManageLeads = () => {
  const { leadId } = useParams();
  const [searchParams] = useSearchParams();
  const hid = searchParams.get("hid");

  const [quickResponseOpen, setQuickResponseOpen] = useState(false);
  const [lead, setLead] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [whatsAppConversation, setWhatsAppConversation] = useState(null);
  const [messageLoading, setMessageLoading] = useState(false);

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
    try {
      const response = await getLeadById(leadId, hid);
      if (response?.success) {
        setLead(response?.result?.docs);

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
  useEffect(() => {
    if (!leadId && !hid) return;
    fetchLead();
    fetchTemplates();
  }, [leadId, hid]);

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <LeadDetailsSkeleton />
      </div>
    );
  }

  if (!lead) {
    return <div className="text-center text-gray-400">No lead found</div>;
  }

  return (
    <div className="p-6 bg-[#f4f6fb] min-h-screen space-y-6">
      <div className="flex items-center gap-2.5 bg-white border shadow-xs border-primary/10! rounded-md p-3">
        <button
          onClick={() => window.history.back()}
          className="flex size-8 justify-center bg-gray-100 rounded-full items-center gap-2 text-primary hover:bg-gray-200 transition-all duration-200"
        >
          <IoArrowBack />
        </button>
        <div className="flex flex-1  justify-between items-start">
          <LeadTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          {lead?.Contact && (
            <div className="flex justify-end">
              <button
                onClick={() => setQuickResponseOpen(true)}
                className="bg-green-600 text-white px-5 py-2 rounded flex items-center gap-2 shadow"
              >
                <FaWhatsapp /> Send Quick Response
              </button>
            </div>
          )}
        </div>
      </div>

      {activeTab === 0 && (
        <>
          <LeadHeader lead={lead} />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6  min-h-28">
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
                conversation={whatsAppConversation}
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
