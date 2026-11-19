import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import Dialog from "../../../components/ui/Dialog";
import { Field, Input, Select } from "../../../components/ui/Field";
import { useApiAction } from "../../../hooks/useApiAction";
import { useSaveContactMutation } from "../../../redux/api/contactsApi";
import { CONTACT_SOURCES } from "../constants";

const EMPTY_FORM = { name: "", email: "", phone: "", added_from: "" };

// Add or edit a contact. `contact` is the one being edited, or null for a
// new contact.
const ContactFormDialog = ({ open, contact, onClose }) => {
  const run = useApiAction();
  const [saveContact, { isLoading }] = useSaveContactMutation();
  const [form, setForm] = useState(EMPTY_FORM);
  const isEdit = Boolean(contact);

  // start from the contact's values (or empty) every time the dialog opens
  useEffect(() => {
    if (!open) return;
    setForm({
      name: contact?.name || "",
      email: contact?.email || "",
      phone: contact?.phone || "",
      added_from: contact?.added_from || "",
    });
  }, [open, contact]);

  const setField = (name) => (e) => setForm({ ...form, [name]: e.target.value });

  // a contact saved with a source that is not in the list keeps it
  const sourceOptions = [
    { value: "", label: "Select source" },
    ...CONTACT_SOURCES,
    ...(form.added_from &&
    !CONTACT_SOURCES.some((source) => source.value === form.added_from)
      ? [{ value: form.added_from, label: form.added_from }]
      : []),
  ];

  const canSave =
    form.name.trim() && (form.phone.trim() || form.email.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();

    const saved = await run(
      saveContact({
        id: contact?._id,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        added_from: form.added_from,
      }),
      {
        success: isEdit ? "Contact updated" : "Contact added",
        error: "Could not save the contact.",
      },
    );
    if (saved) onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit contact" : "Add contact"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Name">
          <Input
            autoFocus
            value={form.name}
            onChange={setField("name")}
            placeholder="Enter name"
          />
        </Field>
        <Field label="Phone number">
          <Input
            type="tel"
            value={form.phone}
            onChange={setField("phone")}
            placeholder="Enter phone number"
          />
        </Field>
        <Field label="Email" hint="A phone number or an email is required.">
          <Input
            type="email"
            value={form.email}
            onChange={setField("email")}
            placeholder="Enter email"
          />
        </Field>
        <Field label="Source">
          <Select
            value={form.added_from}
            onChange={setField("added_from")}
            options={sourceOptions}
          />
        </Field>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading} disabled={!canSave}>
            {isEdit ? "Save changes" : "Add contact"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default ContactFormDialog;
