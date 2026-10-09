import { ArrowLeft, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import CustomDropdown from "../../../../components/ui/Dropdown";
import { Field } from "../../../../components/ui/Field";
import IconButton from "../../../../components/ui/IconButton";
import { useConfirm } from "../../../../context/ConfirmContext";
import { useToast } from "../../../../context/ToastContext";
import { Stages } from "../../../../data/constant";
import { formatDayLabel, formatTime, getAvatarColor } from "../chatUtils";
import { useConversationLead } from "../hooks/useConversationLead";
import ActivityModal from "./ActivityModal";
import Timeline from "./Timeline";

const formatLastActive = (date) =>
  date && !Number.isNaN(new Date(date).getTime())
    ? `${formatDayLabel(date)}, ${formatTime(date)}`
    : "—";

// The guest behind the open conversation: their lead stage and the team's
// notes on them.
//   lastActive - when the last message was exchanged
//   onBack()   onDelete() - deletes the whole conversation
const ProfilePanel = ({
  conversation,
  hid,
  lastActive,
  deleting,
  onBack,
  onDelete,
}) => {
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const saveLead = useConversationLead(hid, conversation);

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
    <aside className="flex min-h-0 w-full flex-col overflow-y-auto bg-app-surface">
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

      <div className="flex flex-col items-center gap-1 border-b border-app-border! px-4 py-5 text-center">
        <span
          className={`mb-1 flex size-16 items-center justify-center rounded-full text-xl font-semibold text-white ${getAvatarColor(conversation.name)}`}
        >
          {conversation.name?.charAt(0)?.toUpperCase() || "?"}
        </span>
        <p className="max-w-full truncate text-base font-semibold capitalize text-app-text">
          {conversation.name || "Unknown guest"}
        </p>
        <p className="text-sm text-app-text-muted">{conversation.phone}</p>
        {conversation.status && (
          <Badge tone="green" className="mt-1 capitalize">
            {conversation.status}
          </Badge>
        )}
      </div>

      <div className="space-y-4 border-b border-app-border! p-4">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-app-text-muted">Last active</span>
          <span className="text-right text-app-text">
            {formatLastActive(lastActive)}
          </span>
        </div>

        <Field label="Lead stage" as="div">
          <CustomDropdown
            key={`${conversation._id}-${conversation.status}`}
            label={conversation.status || "Open"}
            options={Stages}
            onChange={(status) => saveLead({ status }, "Stage updated")}
          />
        </Field>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-app-text">Notes</h3>
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
    </aside>
  );
};

export default ProfilePanel;
