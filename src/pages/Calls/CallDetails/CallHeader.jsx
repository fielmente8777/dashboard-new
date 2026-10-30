import { Clock, Loader2, MessageCircle, Phone } from "lucide-react";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Icon from "../../../components/ui/Icon";
import { timeAgo } from "../../../utils/formateDate";
import {
  formatDateTime,
  getCallOutcome,
  getGuestNumber,
  isOutgoing,
} from "../callUtils";
import DirectionTile from "../components/DirectionTile";

// The top of a call: who it was with, how it went, and how to reach them.
// Actions are passed in: onWhatsApp()  onCallBack()
const CallHeader = ({ call, checkingWhatsApp, onWhatsApp, onCallBack }) => {
  const outcome = getCallOutcome(call);
  const outgoing = isOutgoing(call);
  const guest = getGuestNumber(call);

  return (
    <section className="relative overflow-hidden rounded-xl border border-app-border! bg-app-surface">
      <div
        className={`absolute inset-x-0 top-0 h-20 bg-gradient-to-r ${
          outcome.tone === "red"
            ? "from-red-500/20 via-rose-500/10 to-transparent"
            : outgoing
              ? "from-blue-500/20 via-indigo-500/10 to-transparent"
              : "from-emerald-500/20 via-teal-500/10 to-transparent"
        }`}
        aria-hidden="true"
      />
      <div className="relative flex flex-wrap items-end justify-between gap-4 p-4 pt-8 sm:p-5 sm:pt-10">
        <div className="flex min-w-0 items-center gap-4">
          <span className="shrink-0 rounded-2xl bg-app-surface p-1 shadow-sm">
            <DirectionTile call={call} size="size-14 rounded-xl!" iconSize="2xl" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tabular-nums text-app-text">
              {call.callerName || guest || "Unknown caller"}
            </h1>
            {call.callerName && guest && (
              <p className="text-sm tabular-nums text-app-text-muted">{guest}</p>
            )}
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <Badge tone={outcome.tone}>{outcome.label}</Badge>
              <Badge tone={outgoing ? "blue" : "purple"}>
                {outgoing ? "Outgoing" : "Incoming"}
              </Badge>
              {call.stage && <Badge tone="amber">{call.stage}</Badge>}
              {call.priority && <Badge tone="gray">{call.priority} priority</Badge>}
            </div>
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-app-text-muted">
              <Icon icon={Clock} size="xs" />
              {formatDateTime(call.startTime)} · {timeAgo(call.startTime)}
            </p>
          </div>
        </div>

        {guest && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              icon={checkingWhatsApp ? Loader2 : MessageCircle}
              disabled={checkingWhatsApp}
              className={`bg-emerald-600! text-white hover:bg-emerald-500! ${checkingWhatsApp ? "[&_svg]:animate-spin" : ""}`}
              onClick={onWhatsApp}
            >
              WhatsApp
            </Button>
            <Button icon={Phone} onClick={onCallBack}>
              Call back
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CallHeader;
