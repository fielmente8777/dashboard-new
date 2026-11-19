import { PhoneCall } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import Dialog from "../../../components/ui/Dialog";
import { Field, Input } from "../../../components/ui/Field";

// Asks for the number to call. The call is placed from the signed-in user's
// own phone (`fromNumber`), which rings first.
const MakeCallDialog = ({
  open,
  fromName,
  fromNumber,
  calling,
  onCall,
  onClose,
}) => {
  const [toNumber, setToNumber] = useState("");

  useEffect(() => {
    if (open) setToNumber("");
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Make a call"
      description="Your phone rings first. Answer it and we connect you to the guest."
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onCall(fromNumber, toNumber.trim());
        }}
      >
        <Field
          label={fromName ? `From (${fromName})` : "From"}
          error={
            fromNumber ? "" : "Your profile has no phone number to call from."
          }
        >
          <Input readOnly value={fromNumber || ""} placeholder="No number" />
        </Field>
        <Field label="To">
          <Input
            autoFocus
            type="tel"
            value={toNumber}
            onChange={(e) => setToNumber(e.target.value)}
            placeholder="Guest number"
          />
        </Field>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            icon={PhoneCall}
            loading={calling}
            disabled={!fromNumber || !toNumber.trim()}
          >
            Call now
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default MakeCallDialog;
