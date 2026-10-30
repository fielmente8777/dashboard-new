import { useCallback } from "react";
import { useUpdateLeadMutation } from "../../../redux/api/leadsApi";
import { useLazyGetConversationsQuery } from "../../../redux/api/whatsappApi";
import { samePhone } from "../../ConversationalTool/WhatsApp/chatUtils";
import { getLeadPhone } from "../leadUtils";

// After a lead is assigned, gives the guest's WhatsApp chat the same
// assignee, so the live chat and the leads pages agree.
// A lead that came from WhatsApp carries its `conversationId`, and the
// server already updates its chat; this is for the others (webform, Meta...)
// whose guest also has a chat. Returns sync(lead, fields), which never
// fails loudly: the lead itself is already saved.
export const useAssigneeChatSync = (hid) => {
  const [findConversations] = useLazyGetConversationsQuery();
  const [updateLead] = useUpdateLeadMutation();

  return useCallback(
    async (lead, fields) => {
      const phone = getLeadPhone(lead);
      if (lead.conversationId || !phone) return;

      const leadHid = lead.hId || hid;
      // the cached list is fine: only the conversation's id is needed
      const conversations = await findConversations(leadHid, true)
        .unwrap()
        .catch(() => []);
      const match = conversations.find((item) => samePhone(item.phone, phone));
      if (!match) return;

      // addressed by conversationId, the server updates the chat's assignee
      await updateLead({ hid: leadHid, conversationId: match._id, ...fields })
        .unwrap()
        .catch(() => {});
    },
    [findConversations, hid, updateLead],
  );
};
