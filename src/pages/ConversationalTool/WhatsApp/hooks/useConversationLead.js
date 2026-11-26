import { useCallback } from "react";
import { buildNotesBody, savedNotesOf } from "../../../../components/notes/notesForm";
import { useApiAction } from "../../../../hooks/useApiAction";
import { useUpdateLeadMutation } from "../../../../redux/api/leadsApi";
import { useChatCache } from "./useChatCache";

// Saves the lead side of a conversation: its stage, notes (voice notes too),
// follow-up, turn-away code and who is working it.
// Returns save(changes, successMessage) -> true when saved. `changes` may hold
// status, notes, assignee, assigneeNumber, assigneeEmail, followUpDate,
// turnAwayCode.
//
// One call does it all, addressed by the conversation: gian
// (services/whatsappLeads/whatsappLeadSync.ts) saves the chat, finds the
// guest's lead (the chat's own, else one from Meta / a web form with the same
// number) or creates it, and gives every lead of that number the same
// assignee, so All Leads shows what the chat shows.
export const useConversationLead = (hid, conversation) => {
  const run = useApiAction();
  const cache = useChatCache(hid);
  const [updateLead] = useUpdateLeadMutation();

  return useCallback(
    async (changes, success = "Saved") => {
      const ids = { hid: conversation.hid || hid, conversationId: conversation._id };
      const { notes, ...fields } = changes;
      const body = notes ? buildNotesBody(ids, fields, notes) : { ...ids, ...fields };

      const saved = await run(updateLead(body), {
        success,
        error: "Could not save. Please try again.",
      });
      if (!saved) return false;

      const lead = saved?.result?.docs;
      const savedNotes = savedNotesOf(saved);
      cache.patchConversation(conversation._id, {
        ...fields,
        ...(notes && { notes: savedNotes || notes }),
        ...("assignee" in fields && { assignedTo: fields.assignee }),
        ...(lead?._id && { leadId: lead._id }),
        markAsLead: true,
      });
      return true;
    },
    [cache, conversation._id, conversation.hid, hid, run, updateLead],
  );
};
