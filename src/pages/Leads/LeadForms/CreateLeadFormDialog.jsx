import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import Dialog from "../../../components/ui/Dialog";
import { Field, Input } from "../../../components/ui/Field";
import { useApiAction } from "../../../hooks/useApiAction";
import { useTenant } from "../../../hooks/useTenant";
import { useCreateLeadFormMutation } from "../../../redux/api/leadFormsApi";

const MAX_TITLE_LENGTH = 60;

// Creates a form from its name; fields are added afterwards in the editor.
const CreateLeadFormDialog = ({ open, onClose }) => {
  const run = useApiAction();
  const { hid } = useTenant();
  const [createForm, { isLoading }] = useCreateLeadFormMutation();
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (open) setTitle("");
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const created = await run(createForm({ hid, title: title.trim() }), {
      success: "Form created",
      error: "Could not create the form.",
    });
    if (created) onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title="New lead form">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Form name"
          hint={`${title.length}/${MAX_TITLE_LENGTH}`}
        >
          <Input
            autoFocus
            maxLength={MAX_TITLE_LENGTH}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Wedding enquiry"
          />
        </Field>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!title.trim()} loading={isLoading}>
            Create form
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default CreateLeadFormDialog;
