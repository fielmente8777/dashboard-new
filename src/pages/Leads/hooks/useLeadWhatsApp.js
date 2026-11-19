import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../context/ToastContext";
import { useGetWhatsAppTemplatesQuery } from "../../../redux/api/callsApi";
import { useLazyGetConversationsQuery } from "../../../redux/api/whatsappApi";
import { PAGES, dashboardPath } from "../../../routes/paths";
import { samePhone } from "../../ConversationalTool/WhatsApp/chatUtils";
import { getLeadPhone } from "../leadUtils";

// The WhatsApp button of a lead.
// When the guest already has a conversation in the live chat, it opens that
// chat. Otherwise there is nothing to reply to yet, so it offers to start
// one with an approved template (the only thing WhatsApp allows there).
// Returns { openWhatsApp(lead, options?), checkingId, popupProps }:
// `checkingId` is the lead being looked up, `popupProps` go on a
// QuickResponsePopup. Pass { linkLead: false } when `lead` is not a real lead
// (a call), so the chat does not try to link back to it.
export const useLeadWhatsApp = (hid) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [findConversations] = useLazyGetConversationsQuery();
  const [checkingId, setCheckingId] = useState(null);
  const [target, setTarget] = useState(null);

  // only needed once the template popup has been opened
  const templates = useGetWhatsAppTemplatesQuery(hid, {
    skip: !hid || !target,
  });

  const openWhatsApp = useCallback(
    async (lead, { linkLead = true } = {}) => {
      const phone = getLeadPhone(lead);
      if (!phone) {
        showToast({ message: "This lead has no phone number.", type: "error" });
        return;
      }

      const leadHid = lead.hId || hid;
      setCheckingId(lead._id);
      // always a fresh list: a template sent a moment ago starts a conversation.
      // Not connected (or any failure) means no conversation to open.
      const conversations = await findConversations(leadHid)
        .unwrap()
        .catch(() => []);
      setCheckingId(null);

      const match =
        (lead.conversationId &&
          conversations.find(
            (item) => String(item._id) === String(lead.conversationId),
          )) ||
        conversations.find((item) => samePhone(item.phone, phone));

      if (match) {
        navigate(
          dashboardPath(PAGES.CHAT_WHATSAPP, {
            hid: leadHid,
            // leadId lets the chat link straight back to this lead
            query: {
              conversationId: match._id,
              phone: match.phone,
              leadId: linkLead ? lead._id : undefined,
            },
          }),
        );
      } else {
        setTarget(lead);
      }
    },
    [findConversations, hid, navigate, showToast],
  );

  return {
    openWhatsApp,
    checkingId,
    popupProps: {
      open: Boolean(target),
      setOpen: () => setTarget(null),
      lead: target,
      templates: templates.data || [],
      templateOnly: true,
    },
  };
};
