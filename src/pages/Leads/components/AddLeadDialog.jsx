import { Plus, X } from "lucide-react";
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

// Adds a lead by hand.
const AddLeadDialog = ({ open, onClose }) => {
  const run = useApiAction();
  const { hid, ndid } = useTenant();
  const domain = useSelector((state) => state.userProfile.user?.Profile?.domain);
  const [createLead, { isLoading }] = useCreateLeadMutation();

  const [form, setForm] = useState(EMPTY_FORM);
  // the note being written: null = closed, { index: null } = a new one
  const [noteEditor, setNoteEditor] = useState(null);

  useEffect(() => {
    if (!open) return;
    setForm(EMPTY_FORM);
    setNoteEditor(null);
  }, [open]);

  const setField = (name) => (e) => setForm({ ...form, [name]: e.target.value });
  const setValue = (name) => (value) => setForm({ ...form, [name]: value });

  const saveNote = (note) => {
    const notes = [...form.notes];
    if (noteEditor.index === null) notes.push(note);
    else notes[noteEditor.index] = note;

    setForm({ ...form, notes });
    setNoteEditor(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const created = await run(
      createLead({
        Domain: domain,
        hId: hid,
        ndid,
        Name: form.name.trim(),
        Contact: form.phone.trim(),
        Email: form.email.trim(),
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

  return (
    <Dialog open={open} onClose={onClose} title="Add lead" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full name">
            <Input
              required
              value={form.name}
              onChange={setField("name")}
              placeholder="Enter full name"
            />
          </Field>
          <Field label="Phone number">
            <Input
              required
              type="tel"
              value={form.phone}
              onChange={setField("phone")}
              placeholder="Enter phone number"
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={form.email}
              onChange={setField("email")}
              placeholder="Enter email"
            />
          </Field>
          <Field label="Source">
            <Select
              options={Sources}
              value={form.source}
              onChange={setField("source")}
            />
          </Field>
          <Field label="Campaign name">
            <Input
              value={form.campaign}
              onChange={setField("campaign")}
              placeholder="Campaign name"
            />
          </Field>
          <Field label="Stage">
            <Select
              options={Stages}
              value={form.stage}
              onChange={setField("stage")}
            />
          </Field>
          <Field label="Check in" as="div">
            <DatePicker
              value={form.checkIn}
              min={getToday()}
              placeholder="Select check in"
              aria-label="Check in"
              onChange={setValue("checkIn")}
            />
          </Field>
          <Field label="Check out" as="div">
            <DatePicker
              value={form.checkOut}
              min={form.checkIn || getToday()}
              placeholder="Select check out"
              aria-label="Check out"
              onChange={setValue("checkOut")}
            />
          </Field>
          <Field label="Number of guests">
            <Input
              type="number"
              min={1}
              value={form.guests}
              onChange={setField("guests")}
            />
          </Field>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-medium text-app-text">Notes</h3>
            <Button
              variant="secondary"
              size="sm"
              icon={noteEditor ? X : Plus}
              onClick={() => setNoteEditor(noteEditor ? null : { index: null })}
            >
              {noteEditor ? "Cancel" : "Add note"}
            </Button>
          </div>
          {/* the editor is drawn in place, not as a popup */}
          <ActivityModal
            open={Boolean(noteEditor)}
            initialData={
              noteEditor?.index != null ? form.notes[noteEditor.index] : null
            }
            onClose={() => setNoteEditor(null)}
            onSave={saveNote}
          />
          <Timeline
            items={form.notes}
            onEdit={(_, index) => setNoteEditor({ index })}
            onDelete={(_, index) =>
              setForm({
                ...form,
                notes: form.notes.filter((__, i) => i !== index),
              })
            }
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            Add lead
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default AddLeadDialog;
