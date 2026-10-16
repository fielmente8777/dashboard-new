import { useEffect, useMemo, useState } from "react";
import Button from "./ui/Button";
import DatePicker from "./ui/DatePicker";
import Dialog from "./ui/Dialog";

// "YYYY-MM-DDTHH:mm" of right now, in local time
const getNow = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
};

// Asks when to follow up (on a call, a lead, ...). onSave gets a Date.
const FollowUpDialog = ({
  open,
  onSave,
  onClose,
  description = "Pick the date and time to follow up.",
}) => {
  const [value, setValue] = useState("");
  // fixed while the dialog is open, so the allowed times do not shift under the user
  const now = useMemo(getNow, [open]);

  useEffect(() => {
    if (open) setValue("");
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Follow up"
      description={description}
    >
      <div className="flex justify-center">
        <DatePicker
          inline
          mode="datetime"
          timeStep={5}
          min={now}
          value={value}
          onChange={setValue}
        />
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button disabled={!value} onClick={() => onSave(new Date(value))}>
          Save follow-up
        </Button>
      </div>
    </Dialog>
  );
};

export default FollowUpDialog;
