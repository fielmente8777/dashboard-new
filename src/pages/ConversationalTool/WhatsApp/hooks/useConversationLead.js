import { useCallback } from "react";
import { useApiAction } from "../../../../hooks/useApiAction";
import { useUpdateLeadMutation } from "../../../../redux/api/leadsApi";
import { useCreateWhatsAppLeadMutation } from "../../../../redux/api/whatsappApi";
import { useChatCache } from "./useChatCache";

// Saves the lead side of a conversation: its stage, notes and who is
// working it. The first save creates the lead; later ones update it.
// Returns save(changes, successMessage) -> true when saved. `changes` may
// hold status, notes, assignee, assigneeNumber, assigneeEmail.
export const useConversationLead = (hid, conversation) => {
  const run = useApiAction();
  const cache = useChatCache(hid);
  const [createLead] = useCreateWhatsAppLeadMutation();
  const [updateLead] = useUpdateLeadMutation();

  return useCallback(
    async (changes, success = "Saved") => {
      const lead = {
        Contact: conversation.phone,
        Name: conversation.name,
        ndid: conversation.ndid,
        notes: conversation.notes,
        status: conversation.status,
        conversationId: conversation._id,
        hId: conversation.hid || hid,
        ...changes,
      };

      const saved = await run(
        conversation.markAsLead
          ? updateLead({ hid: lead.hId, ...lead })
          : createLead({ hid, ...lead }),
        { success, error: "Could not save. Please try again." },
      );
      if (!saved) return false;

      cache.patchConversation(conversation._id, {
        ...changes,
        markAsLead: true,
      });
      return true;
    },
    [cache, conversation, createLead, hid, run, updateLead],
  );
};
