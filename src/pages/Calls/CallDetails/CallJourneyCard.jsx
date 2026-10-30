import { Building2, PhoneIncoming, PhoneOutgoing, UserRound } from "lucide-react";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import Detail from "../../../components/ui/Detail";
import Icon from "../../../components/ui/Icon";
import { formatCallDuration, getLegLabel, isOutgoing } from "../callUtils";

// tone for one leg's result
const legTone = (status) =>
  status === "completed" ? "green" : status === "busy" ? "amber" : "red";

const STEP_TONES = {
  green: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  amber: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
  red: "bg-red-500/15 text-red-600 dark:text-red-300",
};

const Step = ({ icon, title, phone, tone, result, last }) => (
  <li className="relative flex gap-3 pb-5 last:pb-0">
    {!last && (
      <span
        className="absolute bottom-0 left-4 top-9 w-px bg-app-text-faint/25"
        aria-hidden="true"
      />
    )}
    <span
      className={`flex size-8 shrink-0 items-center justify-center rounded-full ${STEP_TONES[tone] || STEP_TONES.red}`}
    >
      <Icon icon={icon} size="sm" />
    </span>
    <div className="flex min-w-0 flex-1 flex-wrap items-start justify-between gap-2 pt-1">
      <div className="min-w-0">
        <p className="text-sm font-medium text-app-text">{title}</p>
        {phone && (
          <p className="text-xs tabular-nums text-app-text-muted">{phone}</p>
        )}
      </div>
      {result}
    </div>
  </li>
);

// Each call rings two phones in turn; showing both results tells the user
// which side the call failed on, which a single status can't.
const CallJourneyCard = ({ call }) => {
  const outgoing = isOutgoing(call);
  const hasLegs = call.fromLegStatus != null || call.toLegStatus != null;

  const leg = (status) => (
    <Badge tone={legTone(status)}>{getLegLabel(status)}</Badge>
  );

  const steps = outgoing
    ? [
        {
          icon: Building2,
          title: "Rang your staff",
          phone: call.from,
          tone: legTone(call.fromLegStatus),
          result: leg(call.fromLegStatus),
        },
        {
          icon: PhoneOutgoing,
          title: "Rang the guest",
          phone: call.to,
          tone: legTone(call.toLegStatus),
          result: leg(call.toLegStatus),
        },
      ]
    : [
        {
          icon: PhoneIncoming,
          title: "Guest called your number",
          phone: `${call.from} → ${call.phoneNumberSid || call.to}`,
          tone: "green",
          result: <Badge tone="green">Connected</Badge>,
        },
        {
          icon: UserRound,
          title: "Rang the hotel team",
          phone: call.dialWhomNumber,
          tone: legTone(call.toLegStatus),
          result: leg(call.toLegStatus),
        },
      ];

  return (
    <Card
      title="What happened"
      description={
        hasLegs
          ? "Each call rings two phones in turn"
          : "Step-by-step details aren't saved for this call yet. Refresh the calls list to load them."
      }
    >
      {hasLegs && (
        <ol>
          {steps.map((step, index) => (
            <Step key={step.title} {...step} last={index === steps.length - 1} />
          ))}
        </ol>
      )}
      <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-app-border! pt-4 sm:grid-cols-3">
        <Detail label="Ringing + talk time">
          {formatCallDuration(call.ringDuration)}
        </Detail>
        <Detail label="Hung up by">{call.disconnectedBy}</Detail>
        {/* the provider's own wording, for matching against its dashboard */}
        <Detail label="Provider status">
          {[call.status, call.callType].filter(Boolean).join(" · ")}
        </Detail>
      </dl>
    </Card>
  );
};

export default CallJourneyCard;
