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
//   send({ batchIds, toEmails, subject, html, text, from, attachments, name })
// batchIds: recipient batches already made; toEmails: addresses typed into "To" (sent as
// their own batch). Resolves with the new campaign's id; throws with a message to show.
export function useCampaignSender() {
  const hotel = useSelector((state) => state.userProfile.user);
  const [sending, setSending] = useState(false);

  const send = async ({ batchIds = [], toEmails = [], subject, html, text, from, attachments, name }) => {
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
        recipientBatchIds: ids,
        attachments,
      });
      const campaignId = campaignRes?.doc?.campaign?._id;
      if (!campaignId) throw new Error("Could not create the campaign.");

      await sendEmailCampaign({ campaignId });
      return campaignId;
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
