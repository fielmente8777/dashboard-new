import { useEffect, useState } from "react";
import { getFollowUpError, splitFollowUp, toFollowUpValue } from "./followUp";
import FollowUpFields from "./FollowUpFields";
import Button from "./ui/Button";
import Dialog from "./ui/Dialog";

// Asks when to follow up (on a call, a lead, ...). onSave gets a Date.
// The stage only becomes "Follow Up" through onSave, so it can't be set
// without a date; the time is optional.
const FollowUpDialog = ({
  open,
  onSave,
  onClose,
  description = "Pick the day to follow up. Add a time if you need one.",
}) => {
  const [value, setValue] = useState(splitFollowUp(""));

  useEffect(() => {
    if (open) setValue(splitFollowUp(""));
  }, [open]);

  const canSave = !getFollowUpError(value);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Follow up"
      description={description}
    >
      <FollowUpFields inline value={value} onChange={setValue} />

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          disabled={!canSave}
          onClick={() => onSave(new Date(toFollowUpValue(value)))}
        >
          Save follow-up
        </Button>
      </div>
    </Dialog>
  );
};

export default FollowUpDialog;
