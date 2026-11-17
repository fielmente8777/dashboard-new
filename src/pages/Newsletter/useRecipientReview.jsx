import { useState } from "react";
import { useToast } from "../../context/ToastContext";
import { createManualRecipientBatch } from "../../redux/api/emailMarketingApi";
import ReviewPeopleDialog from "./ReviewPeopleDialog";
import { formatNumber } from "./newsletterUtils";

// Lets the "N selected people" chip of an open email review who it goes to. Removing or adding
// people changes this email only (the group or list it came from stays as it is). On confirm a new
// recipient batch replaces the old one; the compose window stays open with what was typed.
//
// compose: { key, batchId, count, emails?, ... }  (`emails` known = the review is available)
// Returns { canReview, openReview, dialog }.
export function useRecipientReview(compose, setCompose) {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const emails = compose?.emails;

  const confirm = async ({ kept, removed, added }) => {
    if (!removed.length && !added.length) {
      setOpen(false);
      return;
    }
    setSaving(true);
    try {
      const res = await createManualRecipientBatch({ emails: kept });
      const batchId = res?.doc?.recipientBatchId;
      if (!batchId) throw new Error();
      setCompose((c) => ({ ...c, batchId, count: res?.doc?.count ?? kept.length, emails: kept }));
      showToast({ message: `This email now goes to ${formatNumber(kept.length)} ${kept.length === 1 ? "person" : "people"}` });
      setOpen(false);
    } catch {
      showToast({ message: "Could not update the recipients. Please try again.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return {
    canReview: Array.isArray(emails),
    openReview: () => setOpen(true),
    dialog: (
      <ReviewPeopleDialog
        open={open && Array.isArray(emails)}
        onClose={() => setOpen(false)}
        title="Who gets this email"
        description="Remove people or add addresses for this email only. The group or list it came from does not change."
        people={(emails || []).map((email) => ({ email, name: null }))}
        confirming={saving}
        confirmLabel={(n) => `Send to ${formatNumber(n)} ${n === 1 ? "person" : "people"}`}
        onConfirm={confirm}
      />
    ),
  };
}
