import {
  ArrowLeft,
  AtSign,
  Clock,
  ExternalLink,
  Plus,
  Timer,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useCallback, useState } from "react";
import { FaInstagram } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import CustomDropdown from "../../../../components/ui/Dropdown";
import { Field } from "../../../../components/ui/Field";
import Icon from "../../../../components/ui/Icon";
import IconButton from "../../../../components/ui/IconButton";
import { useConfirm } from "../../../../context/ConfirmContext";
import { useToast } from "../../../../context/ToastContext";
import { Stages } from "../../../../data/constant";
import { useApiAction } from "../../../../hooks/useApiAction";
import { useGetTeamUsersQuery } from "../../../../redux/api/callsApi";
import {
  useCreateInstagramLeadMutation,
  useUpdateInstagramLeadMutation,
} from "../../../../redux/api/instagramApi";
import { leadViewPath } from "../../../../routes/paths";
import { getStageTone } from "../../../Leads/leadUtils";
import ActivityModal from "../../WhatsApp/components/ActivityModal";
import Timeline from "../../WhatsApp/components/Timeline";
import { useInstagramCache } from "../hooks/useInstagramCache";
import {
  canReply,
  formatDayLabel,
  formatTime,
  getDisplayName,
  getLastActivity,
} from "../igUtils";
import IgAvatar from "./IgAvatar";

const formatLastActive = (date) =>
  date && !Number.isNaN(new Date(date).getTime())
    ? `${formatDayLabel(date)}, ${formatTime(date)}`
    : "—";

// The guest behind the open Instagram conversation: their profile, the lead's
// stage, who works it and the team's notes. Same as the WhatsApp side panel.
//   onBack()  onDelete() - deletes the whole conversation (messages and lead too)
const IgProfilePanel = ({ conversation, hid, deleting, onBack, onDelete }) => {
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const run = useApiAction();
  const cache = useInstagramCache(hid);
  const users = useGetTeamUsersQuery();
  const [createLead, { isLoading: creatingLead }] = useCreateInstagramLeadMutation();
  const [updateLead] = useUpdateInstagramLeadMutation();

  // the note being written: null = closed, { index: null } = a new one
  const [noteEditor, setNoteEditor] = useState(null);
  const notes = conversation.notes || [];
  const windowOpen = canReply(conversation);

  // saves stage / notes / assignee on the lead and the conversation
  const saveLead = useCallback(
    async (changes, success = "Saved") => {
      const saved = await run(
        updateLead({ conversationId: conversation._id, ...changes }),
        { success, error: "Could not save. Please try again." },
      );
      if (!saved) return false;
      cache.patchConversation(conversation._id, {
        ...changes,
        leadId: saved.leadId || conversation.leadId,
        markAsLead: true,
      });
      return true;
    },
    [cache, conversation._id, conversation.leadId, run, updateLead],
  );

  const openLead = async () => {
    let leadId = conversation.leadId;
    if (!leadId) {
      const create = await confirm(
        `${getDisplayName(conversation)} is not in your leads yet. Add them as a lead and open it?`,
        { title: "No lead found", confirmText: "Add lead", variant: "primary" },
      );
      if (!create) return;
      const updated = await run(createLead(conversation._id), {
        success: "Lead added",
        error: "Could not add the lead.",
      });
      leadId = updated?.leadId;
      if (!leadId) return;
      cache.patchConversation(conversation._id, { leadId, markAsLead: true });
    }
    navigate(leadViewPath(leadId, { hid, query: { hid } }));
  };

  const saveNote = async (note) => {
    if (note.audio?.blob) {
      showToast({
        message: "Voice notes cannot be saved from the chat yet. Add them from the lead's page.",
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
    const confirmed = await confirm("Delete this note?", { title: "Delete note" });
    if (!confirmed) return;
    saveLead({ notes: notes.filter((_, i) => i !== index) }, "Note deleted");
  };

  const handleAssign = (userName) => {
    const user = (users.data || []).find((item) => item.userName === userName);
    if (!user) return;
    saveLead(
      {
        assignee: user.userName,
        assigneeNumber: user.phone || null,
        assigneeEmail: user.emailId || null,
      },
      `Assigned to ${user.userName}`,
    );
  };

  return (
    <aside className="flex min-h-0 w-full flex-col overflow-hidden bg-app-surface">
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-app-border! px-3">
        <IconButton icon={ArrowLeft} label="Back to chat" className="xl:hidden" onClick={onBack} />
        <p className="flex-1 text-sm font-semibold text-app-text">Guest details</p>
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
        <div className="flex flex-col items-center gap-1 border-b border-app-border! bg-gradient-to-b from-pink-500/10 to-transparent px-4 pb-5 pt-6 text-center">
          <button
            type="button"
            onClick={openLead}
            disabled={creatingLead}
            title="Open this guest's lead"
            className="mb-1 rounded-full ring-4 ring-app-surface transition hover:ring-pink-500/40"
          >
            <IgAvatar conversation={conversation} size="lg" />
          </button>
          <p className="max-w-full truncate text-base font-semibold text-app-text">
            {getDisplayName(conversation)}
          </p>
          {conversation.username && (
            <p className="text-sm text-app-text-muted">@{conversation.username}</p>
          )}
          {conversation.status && (
            <Badge tone={getStageTone(conversation.status)} className="mt-1 capitalize">
              {conversation.status}
            </Badge>
          )}
          <div className="mt-3 flex w-full gap-2">
            <Button
              size="sm"
              variant="secondary"
              icon={ExternalLink}
              loading={creatingLead}
              className="flex-1"
              onClick={openLead}
            >
              {conversation.leadId ? "Open lead" : "Add as lead"}
            </Button>
            {conversation.username && (
              <a
                href={`https://www.instagram.com/${conversation.username}/`}
                target="_blank"
                rel="noreferrer"
                title="Open profile on Instagram"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-app-border! px-3 text-sm font-medium text-app-text transition hover:bg-app-surface-secondary"
              >
                <Icon icon={FaInstagram} size="sm" /> Profile
              </a>
            )}
          </div>
        </div>

        <dl className="space-y-3 border-b border-app-border! p-4 text-sm">
          {[
            {
              icon: Clock,
              label: "Last active",
              value: formatLastActive(getLastActivity(conversation)),
            },
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
                  {windowOpen ? "Open" : "Closed · 24h passed"}
                </span>
              ),
            },
            {
              icon: AtSign,
              label: "Messaged",
              value: conversation.igUsername ? `@${conversation.igUsername}` : "—",
            },
            { icon: UserRound, label: "Assigned to", value: conversation.assignee || "No one" },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-app-text-muted">
                <Icon icon={row.icon} size="sm" tone="faint" />
                {row.label}
              </dt>
              <dd className="truncate text-right font-medium text-app-text">{row.value}</dd>
            </div>
          ))}

          <Field label="Assign to" as="div" className="pt-1">
            <CustomDropdown
              key={`${conversation._id}-${conversation.assignee}`}
              label={conversation.assignee || "Assign to"}
              options={(users.data || []).map((user) => ({
                value: user.userName,
                label: user.userName,
              }))}
              onChange={handleAssign}
            />
          </Field>

          <Field label="Lead stage" as="div">
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

export default IgProfilePanel;
