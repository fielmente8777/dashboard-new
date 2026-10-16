import { CalendarDays, Megaphone, NotebookPen, Plus, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Button from "../../../components/ui/Button";
import DatePicker from "../../../components/ui/DatePicker";
import Dialog from "../../../components/ui/Dialog";
import { Field, Input, Select } from "../../../components/ui/Field";
import { Sources, Stages } from "../../../data/constant";
import { useApiAction } from "../../../hooks/useApiAction";
import { useTenant } from "../../../hooks/useTenant";
import { useCreateLeadMutation } from "../../../redux/api/leadsApi";
import ActivityModal from "../../ConversationalTool/WhatsApp/components/ActivityModal";
import Timeline from "../../ConversationalTool/WhatsApp/components/Timeline";
import { Counter, Section } from "./formParts";

const DAY = 24 * 60 * 60 * 1000;

const EMPTY_FORM = {
  name: "",
  phone: "",
  email: "",
  source: Sources[0].value,
  campaign: "",
  stage: Stages[0].value,
  checkIn: "",
  checkOut: "",
  guests: 1,
  notes: [],
};

// "YYYY-MM-DD" of today, in local time
const getToday = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10);
};

// "2026-10-12" -> "Mon, 12 Oct"
const formatDay = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

const isEmail = (text) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
// at least 7 digits, allowing +, spaces, dashes and brackets around them
const isPhone = (text) => /^\+?[\d\s()-]+$/.test(text) && text.replace(/\D/g, "").length >= 7;

// Adds a lead by hand.
const AddLeadDialog = ({ open, onClose }) => {
  const run = useApiAction();
  const { hid, ndid } = useTenant();
  const domain = useSelector((state) => state.userProfile.user?.Profile?.domain);
  const [createLead, { isLoading }] = useCreateLeadMutation();

  const [form, setForm] = useState(EMPTY_FORM);
  // the note being written: null = closed, { index: null } = a new one
  const [noteEditor, setNoteEditor] = useState(null);
  // show field errors only once the person has tried to submit
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(EMPTY_FORM);
    setNoteEditor(null);
    setSubmitted(false);
  }, [open]);

  const setField = (name) => (e) => setForm({ ...form, [name]: e.target.value });
  const setValue = (name) => (value) => setForm({ ...form, [name]: value });

  const name = form.name.trim();
  const phone = form.phone.trim();
  const email = form.email.trim();

  const errors = {
    name: !name && "Enter the guest's name.",
    phone: !phone ? "Enter a phone number." : !isPhone(phone) && "Enter a valid phone number.",
    email: email && !isEmail(email) && "Enter a valid email, or leave it empty.",
  };

  // what is still missing, so a disabled button is never a mystery
  const missing = [
    errors.name && "name",
    errors.phone && (phone ? "a valid phone number" : "phone number"),
    errors.email && "a valid email",
  ].filter(Boolean);

  const nights =
    form.checkIn && form.checkOut
      ? Math.max(0, Math.round((new Date(form.checkOut) - new Date(form.checkIn)) / DAY))
      : 0;

  const saveNote = (note) => {
    const notes = [...form.notes];
    if (noteEditor.index === null) notes.push(note);
    else notes[noteEditor.index] = note;

    setForm({ ...form, notes });
    setNoteEditor(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (missing.length) return;

    const created = await run(
      createLead({
        Domain: domain,
        hId: hid,
        ndid,
        Name: name,
        Contact: phone,
        Email: email,
        campaign_name: form.campaign.trim(),
        // a recording is a file, which this endpoint cannot take
        notes: form.notes.map((note) => ({ ...note, audio: undefined })),
        status: form.stage,
        created_from: form.source,
        check_in: form.checkIn || null,
        check_out: form.checkOut || null,
        numberOfGuest: form.guests,
      }),
      { success: "Lead added", error: "Could not add the lead." },
    );
    if (created) onClose();
  };

  const showError = (field) => (submitted ? errors[field] || undefined : undefined);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Add lead"
      description="Only the name and phone number are needed; the rest can be filled in later."
      size="lg"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <Section icon={User} title="Contact">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Full name *" error={showError("name")}>
              <Input
                autoFocus
                autoComplete="off"
                value={form.name}
                onChange={setField("name")}
                placeholder="e.g. Priya Sharma"
                aria-invalid={Boolean(showError("name"))}
              />
            </Field>
            <Field label="Phone number *" error={showError("phone")}>
              <Input
                type="tel"
                inputMode="tel"
                autoComplete="off"
                value={form.phone}
                onChange={setField("phone")}
                placeholder="e.g. +91 98765 43210"
                aria-invalid={Boolean(showError("phone"))}
              />
            </Field>
            <Field label="Email" error={showError("email")} className="sm:col-span-2">
              <Input
                type="email"
                autoComplete="off"
                value={form.email}
                onChange={setField("email")}
                placeholder="name@example.com"
                aria-invalid={Boolean(showError("email"))}
              />
            </Field>
          </div>
        </Section>

        <Section icon={Megaphone} title="Lead">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Source">
              <Select options={Sources} value={form.source} onChange={setField("source")} />
            </Field>
            <Field label="Stage">
              <Select options={Stages} value={form.stage} onChange={setField("stage")} />
            </Field>
            <Field label="Campaign">
              <Input
                value={form.campaign}
                onChange={setField("campaign")}
                placeholder="Optional"
              />
            </Field>
          </div>
        </Section>

        <Section icon={CalendarDays} title="Stay" hint="· optional">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_10rem]">
            <Field
              label="Check-in → check-out"
              as="div"
              hint={
                nights > 0
                  ? `${formatDay(form.checkIn)} → ${formatDay(form.checkOut)} · ${nights} ${nights === 1 ? "night" : "nights"}`
                  : form.checkIn
                    ? "Now pick the check-out day."
                    : "Pick the check-in day, then the check-out day."
              }
            >
              <DatePicker
                mode="range"
                aria-label="Stay dates"
                placeholder="Select check-in and check-out"
                min={getToday()}
                value={{ start: form.checkIn, end: form.checkOut }}
                onChange={({ start, end }) =>
                  setForm({
                    ...form,
                    checkIn: start,
                    // the same day twice is not a stay
                    checkOut: end && end !== start ? end : "",
                  })
                }
              />
            </Field>
            <Counter label="Guests" value={form.guests} onChange={setValue("guests")} />
          </div>
        </Section>

        <Section
          icon={NotebookPen}
          title="Notes"
          hint={form.notes.length > 0 ? `· ${form.notes.length}` : undefined}
          action={
            <Button
              variant="secondary"
              size="sm"
              icon={noteEditor ? X : Plus}
              onClick={() => setNoteEditor(noteEditor ? null : { index: null })}
            >
              {noteEditor ? "Cancel" : "Add note"}
            </Button>
          }
        >
          {/* the editor is drawn in place, not as a popup */}
          <ActivityModal
            open={Boolean(noteEditor)}
            initialData={noteEditor?.index != null ? form.notes[noteEditor.index] : null}
            onClose={() => setNoteEditor(null)}
            onSave={saveNote}
          />
          {form.notes.length === 0 && !noteEditor ? (
            <p className="rounded-lg border border-dashed border-app-border! p-4 text-center text-sm text-app-text-muted">
              No notes yet. Add what the guest asked for, or a follow-up reminder.
            </p>
          ) : (
            <Timeline
              items={form.notes}
              onEdit={(_, index) => setNoteEditor({ index })}
              onDelete={(_, index) =>
                setForm({ ...form, notes: form.notes.filter((__, i) => i !== index) })
              }
            />
          )}
        </Section>

        <div className="flex flex-col-reverse gap-3 border-t border-app-border! pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-app-text-muted">
            {submitted && missing.length > 0 ? `Still needed: ${missing.join(", ")}` : "* required"}
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" icon={Plus} loading={isLoading}>
              Add lead
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export default AddLeadDialog;
