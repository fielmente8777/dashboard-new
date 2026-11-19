import {
  ArrowLeft,
  Bot,
  Clock,
  ExternalLink,
  Plus,
  Timer,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import CustomDropdown from "../../../../components/ui/Dropdown";
import { Field } from "../../../../components/ui/Field";
import Icon from "../../../../components/ui/Icon";
import IconButton from "../../../../components/ui/IconButton";
import { useConfirm } from "../../../../context/ConfirmContext";
import { useToast } from "../../../../context/ToastContext";
import { Stages } from "../../../../data/constant";
import { getStageTone } from "../../../Leads/leadUtils";
import {
  formatDayLabel,
  formatTime,
  getConversationAssignee,
  getLastActivity,
  isWindowClosed,
} from "../chatUtils";
import { useOpenConversationLead } from "../hooks/useOpenConversationLead";
import ContactAvatar from "./ContactAvatar";
import { useConversationLead } from "../hooks/useConversationLead";
import ActivityModal from "./ActivityModal";
import Timeline from "./Timeline";

const formatLastActive = (date) =>
  date && !Number.isNaN(new Date(date).getTime())
    ? `${formatDayLabel(date)}, ${formatTime(date)}`
    : "—";

// The guest behind the open conversation: their lead stage and the team's
// notes on them.
//   lastActive  - when the last message was exchanged
//   knownLeadId - the lead the chat was opened from, if any
//   onBack()   onDelete() - deletes the whole conversation
const ProfilePanel = ({
  conversation,
  hid,
  knownLeadId,
  lastActive,
  deleting,
  onBack,
  onDelete,
}) => {
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const saveLead = useConversationLead(hid, conversation);
  const lead = useOpenConversationLead({
    hid,
    conversation,
    knownLeadId,
    saveLead,
  });
  const windowOpen = !isWindowClosed(getLastActivity(conversation));
  const assignee = getConversationAssignee(conversation);
  const byAi = !conversation.handling || conversation.handling.mode === "AI";

  // the note being written: null = closed, { index: null } = a new one
  const [noteEditor, setNoteEditor] = useState(null);
  const notes = conversation.notes || [];

  const saveNote = async (note) => {
    if (note.audio?.blob) {
      showToast({
        message:
          "Voice notes cannot be saved from the chat yet. Add them from the lead's page.",
        type: "error",
      });
      return false;
    }

    const next = [...notes];
    if (noteEditor.index === null) next.push(note);
    else next[noteEditor.index] = note;

    const saved = await saveLead({ notes: next }, "Note saved");
    if (saved) setNoteEditor(null);
    return saved;
  };

  const removeNote = async (index) => {
    const confirmed = await confirm("Delete this note?", {
      title: "Delete note",
    });
    if (!confirmed) return;

    saveLead({ notes: notes.filter((_, i) => i !== index) }, "Note deleted");
  };

  return (
    <aside className="flex min-h-0 w-full flex-col overflow-hidden bg-app-surface">
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-app-border! px-3">
        <IconButton
          icon={ArrowLeft}
          label="Back to chat"
          className="xl:hidden"
          onClick={onBack}
        />
        <p className="flex-1 text-sm font-semibold text-app-text">
          Guest details
        </p>
        <IconButton
          icon={Trash2}
          label="Delete conversation"
          tone="danger"
          disabled={deleting}
          onClick={onDelete}
        />
      </div>

      {/* only this part scrolls; the header above stays put */}
      <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="flex flex-col items-center gap-1 border-b border-app-border! bg-gradient-to-b from-emerald-500/10 to-transparent px-4 pb-5 pt-6 text-center">
        <button
          type="button"
          onClick={lead.openLead}
          disabled={lead.finding}
          title="Open this guest's lead"
          className="mb-1 rounded-full ring-4 ring-app-surface transition hover:ring-blue-500/40"
        >
          <ContactAvatar name={conversation.name} size="lg" />
        </button>
        <p className="max-w-full truncate text-base font-semibold capitalize text-app-text">
          {conversation.name || "Unknown guest"}
        </p>
        <p className="text-sm tabular-nums text-app-text-muted">
          {conversation.phone}
        </p>
        {conversation.status && (
          <Badge tone={getStageTone(conversation.status)} className="mt-1 capitalize">
            {conversation.status}
          </Badge>
        )}
        <Button
          size="sm"
          variant="secondary"
          icon={ExternalLink}
          loading={lead.finding}
          className="mt-3 w-full"
          onClick={lead.openLead}
        >
          Open lead
        </Button>
      </div>

      <dl className="space-y-3 border-b border-app-border! p-4 text-sm">
        {[
          { icon: Clock, label: "Last active", value: formatLastActive(lastActive) },
          {
            icon: Timer,
            label: "Reply window",
            value: (
              <span
                className={
                  windowOpen
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-amber-600 dark:text-amber-400"
                }
              >
                {windowOpen ? "Open" : "Closed · template only"}
              </span>
            ),
          },
          { icon: UserRound, label: "Assigned to", value: assignee || "No one" },
          { icon: Bot, label: "Replying", value: byAi ? "AI" : "Team member" },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-2 text-app-text-muted">
              <Icon icon={row.icon} size="sm" tone="faint" />
              {row.label}
            </dt>
            <dd className="truncate text-right font-medium text-app-text">
              {row.value}
            </dd>
          </div>
        ))}

        <Field label="Lead stage" as="div" className="pt-1">
          <CustomDropdown
            key={`${conversation._id}-${conversation.status}`}
            label={conversation.status || "Open"}
            options={Stages}
            onChange={(status) => saveLead({ status }, "Stage updated")}
          />
        </Field>
      </dl>

      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-app-text">
            Notes
            {notes.length > 0 && (
              <span className="ml-2 rounded-full bg-app-surface-secondary px-2 py-0.5 text-xs font-medium text-app-text-muted">
                {notes.length}
              </span>
            )}
          </h3>
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
          initialData={noteEditor?.index != null ? notes[noteEditor.index] : null}
          onClose={() => setNoteEditor(null)}
          onSave={saveNote}
        />

        <Timeline
          items={notes}
          onEdit={(_, index) => setNoteEditor({ index })}
          onDelete={(_, index) => removeNote(index)}
        />
      </div>
      </div>
    </aside>
  );
};

export default ProfilePanel;
