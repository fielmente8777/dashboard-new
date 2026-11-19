import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import Dialog from "../../../components/ui/Dialog";
import { Field, Input } from "../../../components/ui/Field";

const FIELDS = [
  { name: "city", label: "City", placeholder: "e.g. Udaipur", autoComplete: "address-level2" },
  { name: "state", label: "State", placeholder: "e.g. Rajasthan", autoComplete: "address-level1" },
  { name: "country", label: "Country", placeholder: "e.g. India", autoComplete: "country-name" },
  { name: "pinCode", label: "PIN code", placeholder: "e.g. 313001", autoComplete: "postal-code" },
];

// Add or edit one hotel location.
const HotelModal = ({ open, adding, initial, saving, onClose, onSave }) => {
  const [form, setForm] = useState(initial);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(initial);
    setSubmitted(false);
  }, [open, initial]);

  const set = (name) => (e) => setForm({ ...form, [name]: e.target.value });
  const nameError = submitted && !form.local.trim() ? "Enter the property name." : undefined;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!form.local.trim()) return;
    onSave(form);
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? () => {} : onClose}
      title={adding ? "Add location" : "Edit location"}
      description={
        adding
          ? "A new property under this account. It appears in the location switcher once added."
          : "Changes apply everywhere this location is shown."
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Field
          label="Property name *"
          error={nameError}
          hint="The name of this hotel or property. Shown in the location switcher."
        >
          <Input
            autoFocus
            value={form.local}
            onChange={set("local")}
            placeholder="e.g. Sea View Resort, Goa"
            aria-invalid={Boolean(nameError)}
          />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {FIELDS.map(({ name, label, placeholder, autoComplete }) => (
            <Field key={name} label={label}>
              <Input
                value={form[name]}
                onChange={set(name)}
                placeholder={placeholder}
                autoComplete={autoComplete}
                inputMode={name === "pinCode" ? "numeric" : undefined}
              />
            </Field>
          ))}
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {adding ? "Add location" : "Save changes"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default HotelModal;
