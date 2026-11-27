import { useState } from "react";
import Button from "../../components/ui/Button";
import Chip from "../../components/ui/Chip";
import Dialog from "../../components/ui/Dialog";
import { Field, Input, Textarea } from "../../components/ui/Field";
import { useToast } from "../../context/ToastContext";
import { tradeError, useAddTradeContactMutation, useEditTradeContactMutation } from "../../redux/api/tradeDirectoryApi";
import { useTradeCategories } from "./useTradeCategories";

const split = (v) =>
  String(v || "")
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

/** Add one of the hotel's own contacts by hand, or edit one. Duplicates are merged by the server. */
const ContactDialog = ({ contact, onClose }) => {
  const { showToast } = useToast();
  const { categories } = useTradeCategories();
  const [form, setForm] = useState(() => ({
    company: contact?.company || "",
    person: contact?.person || "",
    designation: contact?.designation || "",
    phones: (contact?.phones || []).join(", "),
    emails: (contact?.emails || []).join(", "),
    city: contact?.city || "",
    state: contact?.state || "",
    website: contact?.website || "",
    instagram: contact?.instagram || "",
    notes: contact?.notes || "",
    segment: contact?.segment || "travel_agent",
  }));
  const [add, addState] = useAddTradeContactMutation();
  const [edit, editState] = useEditTradeContactMutation();
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    const body = {
      ...Object.fromEntries(Object.entries(form).map(([k, v]) => [k, typeof v === "string" ? v.trim() || null : v])),
      phones: split(form.phones),
      emails: split(form.emails),
      segment: form.segment,
    };
    try {
      if (contact) {
        await edit({ id: contact.id, ...body }).unwrap();
        showToast({ message: "Contact saved", type: "success" });
      } else {
        const { result } = await add(body).unwrap();
        showToast({
          message:
            result === "inserted" ? "Contact added" : result === "merged" ? "Already in your list: the new details were added to it" : "Already in your list",
          type: "success",
        });
      }
      onClose();
    } catch (error) {
      showToast({ message: tradeError(error), type: "error" });
    }
  };

  const fields = [
    ["company", "Agency / company", "Sarva Tours & Travels"],
    ["person", "Contact person", "Ravi Sharma"],
    ["designation", "Designation", ""],
    ["phones", "Phones (comma between)", "98100 12345, 011 2345 6789"],
    ["emails", "Emails (comma between)", "info@agency.com"],
    ["city", "City", ""],
    ["state", "State", ""],
    ["website", "Website", ""],
    ["instagram", "Instagram", "@agency"],
  ];

  return (
    <Dialog
      open
      size="lg"
      title={contact ? "Edit contact" : "Add a contact"}
      description={contact ? "Only you can see your own contacts." : "If it's already in your list (same email, phone, or agency and city), the new details are added to it."}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="trade-contact-form" loading={addState.isLoading || editState.isLoading}>
            {contact ? "Save" : "Add contact"}
          </Button>
        </>
      }
    >
      <form id="trade-contact-form" onSubmit={save} className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-wrap gap-1.5 sm:col-span-2" role="group" aria-label="Category">
          {categories.map((s) => (
            <Chip key={s.value} selected={form.segment === s.value} onClick={() => setForm((f) => ({ ...f, segment: s.value }))}>
              {s.label}
            </Chip>
          ))}
        </div>
        {fields.map(([key, label, placeholder]) => (
          <Field key={key} label={label}>
            <Input value={form[key]} onChange={set(key)} placeholder={placeholder} />
          </Field>
        ))}
        <Field label="Notes" className="sm:col-span-2">
          <Textarea rows={3} value={form.notes} onChange={set("notes")} />
        </Field>
      </form>
    </Dialog>
  );
};

export default ContactDialog;
