import { useEffect, useState } from "react";
import Button from "../../../../components/ui/Button";
import Dialog from "../../../../components/ui/Dialog";
import { Field, Input } from "../../../../components/ui/Field";

// Names a new flow before the builder opens.
const FlowModal = ({ template, onClose, onSave }) => {
  const [name, setName] = useState("");

  useEffect(() => {
    if (template) setName("");
  }, [template]);

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), category: template?.category, template });
  };

  return (
    <Dialog
      open={Boolean(template)}
      onClose={onClose}
      title="Name your flow"
      description={`Starting from the “${template?.title}” template.`}
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Flow name" hint="Only your team sees this.">
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Room enquiry form"
          />
        </Field>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!name.trim()}>
            Continue
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default FlowModal;
