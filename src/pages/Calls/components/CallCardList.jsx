import {
  ChevronRight,
  Clock,
  Loader2,
  MessageCircle,
  Phone,
  PhoneOff,
  Play,
  Timer,
} from "lucide-react";
import Badge from "../../../components/ui/Badge";
import CellSelect from "../../../components/ui/CellSelect";
import Icon from "../../../components/ui/Icon";
import { Skeleton } from "../../../components/ui/States";
import { timeAgo } from "../../../utils/formateDate";
import {
  CALL_STAGES,
  formatCallDuration,
  getCallOutcome,
  getGuestNumber,
  getStaffNumber,
  isOutgoing,
} from "../callUtils";
import DirectionTile from "./DirectionTile";

const stop = (e) => e.stopPropagation();

const ActionButton = ({ icon, label, className = "", ...props }) => (
  <button
    type="button"
    className={`inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg text-xs font-medium transition active:scale-95 disabled:opacity-60 ${className}`}
    {...props}
  >
    <Icon icon={icon} size="sm" />
    {label}
  </button>
);

// The calls list on phones and tablets: one card per call, two side by side
// on a tablet. Takes the same actions as CallsTable.
const CallCardList = ({
  calls,
  loading,
  firstIndex,
  pageSize,
  staffName,
  whatsAppCheckingId,
  onOpen,
  onUpdate,
  onFollowUp,
  onCallBack,
  onWhatsApp,
  onPlay,
}) => {
  if (loading) {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: Math.min(pageSize, 6) }, (_, index) => (
          <Skeleton key={index} className="h-48 rounded-xl" />
        ))}
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-app-border! bg-app-surface px-4 py-12 text-center">
        <Icon icon={PhoneOff} size="2xl" tone="faint" />
        <p className="mt-3 text-sm text-app-text-muted">No calls found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {calls.map((call, index) => {
        const position = firstIndex + index + 1;
        const outcome = getCallOutcome(call);
        const checking = whatsAppCheckingId === call.sid;
        return (
          <article
            key={call.sid || call._id || index}
            onClick={() => onOpen(call, position)}
            className="anim-fade cursor-pointer rounded-xl border border-app-border! bg-app-surface p-4 transition hover:shadow-md active:scale-[0.99]"
          >
            <div className="flex items-start gap-3">
              <DirectionTile call={call} size="size-10" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold tabular-nums text-app-text">
                  {call.callerName || getGuestNumber(call) || "—"}
                </p>
                <p className="truncate text-xs text-app-text-muted">
                  {isOutgoing(call) ? "Called by" : "Answered by"}{" "}
                  {staffName(getStaffNumber(call)) || "—"}
                </p>
              </div>
              <Badge tone={outcome.tone} className="max-w-[45%] truncate">
                {outcome.label}
              </Badge>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-app-text-muted">
              <span className="flex items-center gap-1.5">
                <Icon icon={Clock} size="xs" tone="faint" />
                {timeAgo(call.startTime)}
              </span>
              <span className="flex items-center gap-1.5 tabular-nums">
                <Icon icon={Timer} size="xs" tone="faint" />
                {formatCallDuration(call.duration)}
              </span>
            </div>

            <div
              className="mt-3 flex items-center justify-between gap-2 border-t border-app-border! pt-3"
              onClick={stop}
            >
              <span className="text-xs text-app-text-faint">Stage</span>
              <CellSelect
                id={call.sid}
                value={call.stage}
                options={CALL_STAGES}
                onSelect={(stage) =>
                  stage === "Follow Up"
                    ? onFollowUp(call)
                    : onUpdate(call, { stage })
                }
              />
            </div>

            <div className="mt-3 flex gap-2" onClick={stop}>
              <ActionButton
                icon={checking ? Loader2 : MessageCircle}
                label="WhatsApp"
                disabled={checking}
                className={`bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300 ${checking ? "[&_svg]:animate-spin" : ""}`}
                onClick={() => onWhatsApp(call)}
              />
              <ActionButton
                icon={Phone}
                label="Call"
                className="bg-app-surface-secondary text-app-text hover:bg-app-surface-secondary/70"
                onClick={() => onCallBack(call)}
              />
              {call.recordingUrl && (
                <ActionButton
                  icon={Play}
                  label="Play"
                  className="bg-violet-500/10 text-violet-700 hover:bg-violet-500/20 dark:text-violet-300"
                  onClick={() => onPlay(call)}
                />
              )}
              <ActionButton
                icon={ChevronRight}
                label="Open"
                className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 dark:text-blue-300"
                onClick={() => onOpen(call, position)}
              />
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default CallCardList;
