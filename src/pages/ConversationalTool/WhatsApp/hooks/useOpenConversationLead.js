import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useConfirm } from "../../../../context/ConfirmContext";
import { useToast } from "../../../../context/ToastContext";
import { useLazyGetLeadsQuery } from "../../../../redux/api/leadsApi";
import { leadViewPath } from "../../../../routes/paths";
import { samePhone } from "../chatUtils";

const lastDigits = (phone) => String(phone || "").replace(/\D/g, "").slice(-10);

// Opens the lead behind a conversation: the other half of the WhatsApp
// button on a lead, which opens its chat.
// The lead is found by, in order: the lead the chat was opened from
// (`knownLeadId`), the conversation's own `leadId`, then a search of All
// Leads for the same phone number. When there is no lead yet, it offers to
// create one with `saveLead` (see useConversationLead) and then opens it.
// Returns { openLead(), findLead(), finding }. findLead() resolves with
// { _id, hId, conversationId? } or null, without creating anything.
export const useOpenConversationLead = ({
  hid,
  conversation,
  knownLeadId,
  saveLead,
}) => {
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const [findLeads] = useLazyGetLeadsQuery();
  const [finding, setFinding] = useState(false);

  const goTo = useCallback(
    (leadId, leadHid) => {
      const target = leadHid || hid;
      navigate(leadViewPath(leadId, { hid: target, query: { hid: target } }));
    },
    [hid, navigate],
  );

  const searchByPhone = useCallback(async () => {
    const digits = lastDigits(conversation.phone);
    if (!digits) return null;
    const result = await findLeads({ hid, page: 1, limit: 20, search: digits })
      .unwrap()
      .catch(() => null);
    return (
      result?.leads?.find((lead) => samePhone(lead.Contact, conversation.phone)) ||
      null
    );
  }, [conversation.phone, findLeads, hid]);

  const findLead = useCallback(async () => {
    const directId = knownLeadId || conversation.leadId;
    if (directId) return { _id: directId, hId: hid };
    return searchByPhone();
  }, [conversation.leadId, hid, knownLeadId, searchByPhone]);

  const openLead = useCallback(async () => {
    const directId = knownLeadId || conversation.leadId;
    if (directId) {
      goTo(directId);
      return;
    }

    setFinding(true);
    let lead = await searchByPhone();
    setFinding(false);
    if (lead) {
      goTo(lead._id, lead.hId);
      return;
    }

    const create = await confirm(
      `${conversation.name || conversation.phone} is not in your leads yet. Add them as a lead and open it?`,
      { title: "No lead found", confirmText: "Add lead", variant: "primary" },
    );
    if (!create) return;

    setFinding(true);
    const saved = await saveLead({ status: conversation.status || "Open" }, "Lead added");
    lead = saved ? await searchByPhone() : null;
    setFinding(false);
    if (lead) goTo(lead._id, lead.hId);
    else if (saved) {
      showToast({ message: "The lead was added. Find it under All Leads." });
    }
  }, [
    confirm,
    conversation,
    goTo,
    knownLeadId,
    saveLead,
    searchByPhone,
    showToast,
  ]);

  return { openLead, findLead, finding };
};
