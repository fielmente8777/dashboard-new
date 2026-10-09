import { PhoneCall } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "./ui/Button";
import Dialog from "./ui/Dialog";
import { Field, Input, Select } from "./ui/Field";

// Calls a guest through the calling provider: the chosen team member's phone
// rings first and is then connected to the guest. onCall(fromNumber, toNumber).
// `lead` only needs { Contact, assignee?, assigneeNumber? }.
const CallLeadDialog = ({ open, lead, users, calling, onCall, onClose }) => {
  const [fromNumber, setFromNumber] = useState("");
  const [toNumber, setToNumber] = useState("");

  // start from whoever is working the lead
  useEffect(() => {
    if (!open) return;
    setFromNumber(lead?.assigneeNumber || "");
    setToNumber(lead?.Contact || "");
  }, [open, lead]);

  const teamOptions = users
    .filter((user) => user.phone)
    .map((user) => ({ value: user.phone, label: user.userName }));
  const agentOptions = [
    { value: "", label: "Select team member" },
    ...teamOptions,
    // the assignee's number stays selectable even if they left the team
    ...(fromNumber && !teamOptions.some((option) => option.value === fromNumber)
      ? [{ value: fromNumber, label: lead?.assignee || fromNumber }]
      : []),
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Call this guest"
      description="The team member's phone rings first. Once answered, we connect it to the guest."
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onCall(fromNumber, toNumber.trim());
        }}
      >
        <Field label="From">
          <Select
            options={agentOptions}
            value={fromNumber}
            onChange={(e) => setFromNumber(e.target.value)}
          />
        </Field>
        <Field label="To">
          <Input
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

export default CallLeadDialog;
