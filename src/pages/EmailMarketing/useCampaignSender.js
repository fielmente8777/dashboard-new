import { useState } from "react";
import { useSelector } from "react-redux";
import {
  createEmailCampaign,
  createManualRecipientBatch,
  sendEmailCampaign,
} from "../../redux/api/emailMarketingApi";

// Makes a campaign out of what the compose window gives and sends it (gian's email marketing),
// so every email - offers, newsletters - shows on Email marketing → Campaigns with its opens
// and clicks. Used by Email marketing and Newsletter.
//
//   send({ batchIds, toEmails, subject, html, text, from, attachments, name, restore })
// batchIds: recipient batches already made; toEmails: addresses typed into "To" (sent as
// their own batch); restore: the compose window's content, kept by the server so Undo can
// open it again. Resolves with { campaignId, scheduledAt }: scheduledAt is when it starts
// (a new campaign waits a few minutes so it can be undone; null = it started at once).
// Throws with a message to show.
export function useCampaignSender() {
  const hotel = useSelector((state) => state.userProfile.user);
  const [sending, setSending] = useState(false);

  const send = async ({ batchIds = [], toEmails = [], subject, html, text, from, attachments, name, audienceLabel, restore }) => {
    setSending(true);
    try {
      const ids = [...batchIds];
      if (toEmails.length) {
        const res = await createManualRecipientBatch({ emails: toEmails });
        const batchId = res?.doc?.recipientBatchId;
        if (!batchId) throw new Error("Could not prepare the recipients.");
        ids.push(batchId);
      }

      const campaignRes = await createEmailCampaign({
        name: name || subject,
        subject,
        html,
        text,
        fromName: hotel?.Profile?.hotelName,
        fromEmail: from,
        audienceLabel,
        recipientBatchIds: ids,
        attachments,
        restore,
      });
      const campaignId = campaignRes?.doc?.campaign?._id;
      if (!campaignId) throw new Error("Could not create the campaign.");

      const started = await sendEmailCampaign({ campaignId });
      return { campaignId, scheduledAt: started?.doc?.scheduledAt || null };
    } finally {
      setSending(false);
    }
  };

  return {
    send,
    sending,
    // the marketing email (Settings → Profile) when set, else the hotel email
    defaultFrom: hotel?.Profile?.marketingEmail || hotel?.Profile?.hotelEmail,
  };
}
