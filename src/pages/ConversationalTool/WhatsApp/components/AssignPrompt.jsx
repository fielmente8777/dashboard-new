import { UserPlus, X } from "lucide-react";
import { useState } from "react";
import Button from "../../../../components/ui/Button";
import IconButton from "../../../../components/ui/IconButton";
import { getConversationAssignee } from "../chatUtils";

const dismissKey = (id) => `wa:assign-prompt-dismissed:${id}`;
const wasDismissed = (id) => {
  try {
    return sessionStorage.getItem(dismissKey(id)) === "1";
  } catch {
    return false;
  }
};

// Shown when a team member opens a chat that isn't theirs: "Handling this
// chat? Assign it to yourself", so the team knows who is replying (and the
// follow-up reminders go to the right person). "Not now" hides it for this
// chat until the browser tab is closed.
//   me             the signed-in team member: { userName, emailId, phone }
//   onAssign(me)   saves the assignee (chat and its leads)
const AssignPrompt = ({ conversation, me, onAssign }) => {
  const [hidden, setHidden] = useState(() => wasDismissed(conversation._id));
  const [saving, setSaving] = useState(false);
  const assignee = getConversationAssignee(conversation);
  const mine =
    Boolean(me) &&
    (assignee === me.userName ||
      (conversation.assigneeEmail && conversation.assigneeEmail === me.emailId));

  if (!me?.userName || mine || hidden) return null;

  const dismiss = () => {
    setHidden(true);
    try {
      sessionStorage.setItem(dismissKey(conversation._id), "1");
    } catch {
      // storage blocked: hidden for now only
    }
  };

  const assign = async () => {
    setSaving(true);
    const saved = await onAssign(me);
    setSaving(false);
    if (saved) setHidden(true);
  };

  return (
    <div
      role="status"
      className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-blue-500/20! bg-blue-500/10 px-4 py-2.5 text-sm text-app-text"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400">
        <UserPlus className="size-4" />
      </span>
      <p className="min-w-0 flex-1 basis-48 text-[13px] leading-snug">
        {assignee ? (
          <>
            <b className="font-semibold">{assignee}</b> is assigned to this chat. If you are handling it now, assign it to yourself.
          </>
        ) : (
          <>
            <b className="font-semibold">Handling this chat?</b> Assign it to yourself so the team knows who is replying.
          </>
        )}
      </p>
      <div className="ml-auto flex items-center gap-1.5">
        <Button size="sm" icon={UserPlus} loading={saving} onClick={assign}>
          Assign to me
        </Button>
        <IconButton icon={X} label="Not now" onClick={dismiss} disabled={saving} />
      </div>
    </div>
  );
};

export default AssignPrompt;
