import { Info } from "lucide-react";
import { useState } from "react";
import Button from "../../components/ui/Button";
import Chip from "../../components/ui/Chip";
import Dialog from "../../components/ui/Dialog";
import { Field, Input } from "../../components/ui/Field";
import Notice from "../../components/ui/Notice";
import { useToast } from "../../context/ToastContext";
import { tradeError, useEditDirectoryContactMutation } from "../../redux/api/tradeDirectoryApi";
import { useTradeCategories } from "./useTradeCategories";

const split = (v) =>
  String(v || "")
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);

/**
 * A hotel corrects a contact of Eazotel's directory: names, place and category. Its numbers and
 * emails stay protected, so new ones can be added but saved ones are not shown or removed. The
 * change is saved for everyone at once, and Eazotel's team sees who made it and checks it.
 */
const DirectoryEditDialog = ({ partner, onClose }) => {
  const { showToast } = useToast();
  const { categories } = useTradeCategories();
  const [save, { isLoading }] = useEditDirectoryContactMutation();
  const [form, setForm] = useState(() => ({
    company: partner.company || "",
    person: partner.person || "",
    designation: partner.designation || "",
    city: partner.city || "",
    state: partner.state || "",
    niche: partner.niche || "",
    segment: partner.segment || "unsorted",
    addPhones: "",
    addEmails: "",
  }));
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    // only what changed is sent: an untouched field is left as it is
    const body = { id: partner.id };
    for (const key of ["company", "person", "designation", "city", "state", "niche"]) {
      const value = form[key].trim();
      if (value !== (partner[key] || "")) body[key] = value || null;
    }
    if (form.segment !== partner.segment) body.segment = form.segment;
    const addPhones = split(form.addPhones);
    const addEmails = split(form.addEmails);
    if (addPhones.length) body.addPhones = addPhones;
    if (addEmails.length) body.addEmails = addEmails;
    if (Object.keys(body).length === 1) {
      onClose();
      return;
    }
    try {
      await save(body).unwrap();
      showToast({ message: "Saved. Thanks, Eazotel's team will check it.", type: "success" });
      onClose();
    } catch (error) {
      showToast({ message: tradeError(error), type: "error" });
    }
  };

  const fields = [
    ["company", "Agency / company"],
    ["person", "Contact person"],
    ["designation", "Designation"],
    ["niche", "Type / speciality"],
    ["city", "City"],
    ["state", "State"],
  ];

  return (
    <Dialog
      open
      size="lg"
      title="Edit directory contact"
      description={partner.company || partner.person || "Unlisted agency"}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="trade-directory-edit-form" loading={isLoading}>
            Save
          </Button>
        </>
      }
    >
      <form id="trade-directory-edit-form" onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Notice tone="info" icon={Info}>
            Your change is saved in Eazotel&apos;s directory for every hotel. Eazotel&apos;s team sees that your hotel made it and checks it.
          </Notice>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:col-span-2" role="group" aria-label="Category">
          {categories.map((s) => (
            <Chip key={s.value} selected={form.segment === s.value} onClick={() => setForm((f) => ({ ...f, segment: s.value }))}>
              {s.label}
            </Chip>
          ))}
        </div>
        {fields.map(([key, label]) => (
          <Field key={key} label={label}>
            <Input value={form[key]} onChange={set(key)} maxLength={160} />
          </Field>
        ))}
        <Field label="Add a phone number (optional)" hint="Saved numbers stay as they are.">
          <Input value={form.addPhones} onChange={set("addPhones")} placeholder="98100 12345" inputMode="tel" />
        </Field>
        <Field label="Add an email (optional)" hint="Saved emails stay as they are.">
          <Input value={form.addEmails} onChange={set("addEmails")} placeholder="info@agency.com" inputMode="email" />
        </Field>
      </form>
    </Dialog>
  );
};

export default DirectoryEditDialog;
