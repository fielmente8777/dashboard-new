import {
  ArrowLeft,
  BellRing,
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
import {
  getFollowUpError,
  splitFollowUp,
  toFollowUpValue,
} from "../../../../components/followUp";
import FollowUpFields from "../../../../components/FollowUpFields";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import CustomDropdown from "../../../../components/ui/Dropdown";
import { Field } from "../../../../components/ui/Field";
import Icon from "../../../../components/ui/Icon";
import IconButton from "../../../../components/ui/IconButton";
import { useConfirm } from "../../../../context/ConfirmContext";
import {
  followUpStageFor,
  isFollowUpStage,
  Stages,
  stageLabel,
  TurnAwayCode,
} from "../../../../data/constant";
import { useGetTeamUsersQuery } from "../../../../redux/api/callsApi";
import { toInputValue } from "../../../Leads/LeadDetails/leadDetailsUtils";
import { getStageTone } from "../../../Leads/leadUtils";
import {
  formatDayLabel,
  formatTime,
  getConversationAssignee,
  CLOSING_SOON_MS,
  describeWindow,
  formatTimeLeft,
  getWindowLeft,
} from "../chatUtils";
import { useOpenConversationLead } from "../hooks/useOpenConversationLead";
import ContactAvatar from "./ContactAvatar";
import { useConversationLead } from "../hooks/useConversationLead";
import { useNow } from "../hooks/useNow";
import ActivityModal from "./ActivityModal";
import GuestCalls from "./GuestCalls";
import Timeline from "./Timeline";

const WINDOW_TONES = {
  green: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  amber: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  red: "bg-red-500/10 text-red-600 dark:text-red-400",
  gray: "bg-app-surface-secondary text-app-text-muted",
};

const formatLastActive = (date) =>
  date && !Number.isNaN(new Date(date).getTime())
    ? `${formatDayLabel(date)}, ${formatTime(date)}`
    : "—";

// The guest behind the open conversation: their lead stage and the team's
// notes on them.
//   lastActive  - when the last message was exchanged
//   knownLeadId - the lead the chat was opened from, if any
//   canCall     - Exotel is connected: the guest's calls and recordings show
//   onBack()   onDelete() - deletes the whole conversation
// What is saved here (owner, stage, follow-up, turn-away code, notes) goes to
// the guest's lead in All Leads too (see useConversationLead).
const ProfilePanel = ({
  conversation,
  hid,
  canCall = false,
  knownLeadId,
  lastActive,
  deleting,
  onBack,
  onDelete,
}) => {
  const { confirm } = useConfirm();
  const saveLead = useConversationLead(hid, conversation);
  const lead = useOpenConversationLead({
    hid,
    conversation,
    knownLeadId,
    saveLead,
  });
  const now = useNow();
  const windowLeft = getWindowLeft(conversation, now);
  const windowOpen = windowLeft !== null && windowLeft > 0;
  const window24 = describeWindow(windowLeft);
  const assignee = getConversationAssignee(conversation);
  const byAi = !conversation.handling || conversation.handling.mode === "AI";
  const users = useGetTeamUsersQuery();
  const savedFollowUp = toInputValue(conversation.followUpDate);
  const [followUp, setFollowUp] = useState(() => splitFollowUp(savedFollowUp));
  const [followUpOpen, setFollowUpOpen] = useState(false);
  // the follow-up round picked in the stage list, waiting for its date
  const [pendingFollowUp, setPendingFollowUp] = useState(null);

  const assign = (userName) => {
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

  // "Follow Up" needs a date first; any other stage clears the follow-up
  const changeStage = (status) => {
    if (isFollowUpStage(status)) {
      setPendingFollowUp(status);
      setFollowUpOpen(true);
      return false;
    }
    saveLead({ status, followUpDate: null }, "Stage updated");
  };

  const saveFollowUp = async (value) => {
    const saved = await saveLead(
      value
        ? {
            status: pendingFollowUp || followUpStageFor(conversation.status),
            followUpDate: new Date(value).toISOString(),
          }
        : { followUpDate: null },
      value ? "Follow-up saved" : "Follow-up removed",
    );
    if (saved) {
      setFollowUpOpen(false);
      if (!value) setFollowUp({ date: "", time: "" });
    }
  };

  // the note being written: null = closed, { index: null } = a new one
  const [noteEditor, setNoteEditor] = useState(null);
  const notes = conversation.notes || [];

  // voice notes go up with the notes (see useConversationLead)
  const saveNote = async (note) => {
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
        {/* WhatsApp's 24-hour reply window, counting down (in the browser) */}
        <span
          className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${WINDOW_TONES[window24.tone]}`}
          title="WhatsApp allows free replies for 24 hours after the guest's last message; after that only an approved template."
        >
          <Icon icon={Timer} size="xs" />
          {windowOpen ? `Chat window ${window24.label.toLowerCase()}` : window24.label}
        </span>
        {windowOpen && windowLeft <= CLOSING_SOON_MS && (
          <span className="text-xs text-amber-700 dark:text-amber-300">
            Reply or follow up before it goes inactive.
          </span>
        )}
        {!windowOpen && windowLeft !== null && (
          <span className="text-xs text-app-text-muted">
            Inactive: only a template message can be sent now.
          </span>
        )}
        {conversation.status && (
          <Badge tone={getStageTone(conversation.status)} className="mt-1 capitalize">
            {stageLabel(conversation.status)}
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
                  !windowOpen
                    ? "text-red-600 dark:text-red-400"
                    : windowLeft <= CLOSING_SOON_MS
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-emerald-600 dark:text-emerald-400"
                }
              >
                {windowOpen
                  ? `Open · ${formatTimeLeft(windowLeft)} left`
                  : "Closed · template only"}
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

      </dl>

      <section className="space-y-3 border-b border-app-border! p-4">
        <h3 className="text-sm font-semibold text-app-text">Manage lead</h3>
        <Field label="Assigned to" as="div">
          <CustomDropdown
            key={`assignee-${conversation._id}-${assignee}`}
            label={assignee || "Select user"}
            options={(users.data || []).map((user) => ({
              value: user.userName,
              label: user.userName,
            }))}
            onChange={assign}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Lead stage" as="div">
            <CustomDropdown
              key={`stage-${conversation._id}-${conversation.status}`}
              label={conversation.status || "Open"}
              options={Stages}
              onChange={changeStage}
            />
          </Field>
          <Field label="Turn away code" as="div">
            <CustomDropdown
              key={`code-${conversation._id}-${conversation.turnAwayCode}`}
              label={conversation.turnAwayCode || "Select code"}
              options={TurnAwayCode}
              onChange={(turnAwayCode) =>
                saveLead(
                  { status: "Turn Away", followUpDate: null, turnAwayCode },
                  "Turn away code saved",
                )
              }
            />
          </Field>
        </div>

        <div className="rounded-lg border border-dashed border-app-border! bg-app-surface-secondary/50 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-app-text-muted">Follow up on</p>
            {!followUpOpen && (
              <button
                type="button"
                onClick={() => setFollowUpOpen(true)}
                className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                {savedFollowUp ? "Change" : "Set a date"}
              </button>
            )}
          </div>
          {!followUpOpen ? (
            <p className="mt-1 text-sm font-medium text-app-text">
              {savedFollowUp
                ? formatLastActive(conversation.followUpDate)
                : "No follow-up"}
            </p>
          ) : (
            <>
              <div className="mt-2">
                <FollowUpFields value={followUp} onChange={setFollowUp} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  icon={BellRing}
                  disabled={
                    Boolean(getFollowUpError(followUp)) ||
                    toFollowUpValue(followUp) === savedFollowUp
                  }
                  onClick={() => saveFollowUp(toFollowUpValue(followUp))}
                >
                  Save
                </Button>
                {savedFollowUp && !isFollowUpStage(conversation.status) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={X}
                    onClick={() => saveFollowUp(null)}
                  >
                    Remove
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setFollowUpOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {canCall && (
        <GuestCalls hid={conversation.hid || hid} phone={conversation.phone} />
      )}

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
