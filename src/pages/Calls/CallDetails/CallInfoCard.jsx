import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import Detail from "../../../components/ui/Detail";
import {
  formatCallDuration,
  formatDateTime,
  getCallOutcome,
  getLegLabel,
  isOutgoing,
} from "../callUtils";
import RecordingPlayer from "../components/RecordingPlayer";

// tone for one leg's result in the "What happened" list
const legTone = (status) =>
  status === "completed" ? "green" : status === "busy" ? "amber" : "red";

const Step = ({ number, title, phone, status, result }) => (
  <li className="flex items-start gap-3">
    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-app-border text-xs font-medium text-app-text">
      {number}
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-app-text">{title}</p>
      {phone && <p className="text-xs text-app-text-muted">{phone}</p>}
    </div>
    {result ?? <Badge tone={legTone(status)}>{getLegLabel(status)}</Badge>}
  </li>
);

// Each call rings two phones in turn; showing both results tells the user
// which side the call failed on, which a single status can't.
const CallSteps = ({ call }) =>
  isOutgoing(call) ? (
    <ol className="space-y-3">
      <Step
        number={1}
        title="Rang your staff"
        phone={call.from}
        status={call.fromLegStatus}
      />
      <Step
        number={2}
        title="Rang the guest"
        phone={call.to}
        status={call.toLegStatus}
      />
    </ol>
  ) : (
    <ol className="space-y-3">
      <Step
        number={1}
        title="Guest called your number"
        phone={`${call.from} → ${call.phoneNumberSid || call.to}`}
        result={<Badge tone="green">Connected</Badge>}
      />
      <Step
        number={2}
        title="Rang the hotel team"
        phone={call.dialWhomNumber}
        status={call.toLegStatus}
      />
    </ol>
  );

const CallInfoCard = ({ call }) => {
  const outcome = getCallOutcome(call);
  const outgoing = isOutgoing(call);
  const hasLegs = call.fromLegStatus != null || call.toLegStatus != null;

  return (
    <div className="space-y-5">
      <Card title="Call information">
        <dl className="grid grid-cols-2 gap-4">
          <Detail label={outgoing ? "From (your staff)" : "From (guest)"}>
            {call.from}
          </Detail>
          <Detail label={outgoing ? "To (guest)" : "To (your number)"}>
            {call.to}
          </Detail>
          <Detail label="Direction">{outgoing ? "Outgoing" : "Incoming"}</Detail>
          <Detail label="Outcome">
            <Badge tone={outcome.tone}>{outcome.label}</Badge>
          </Detail>
          <Detail label="Talk time">{formatCallDuration(call.duration)}</Detail>
          <Detail label="Stage">{call.stage}</Detail>
          <Detail label="Lead status">{call.leadStatus}</Detail>
          {/* the provider fills this in even when nobody picked up */}
          {call.duration > 0 && (
            <Detail label="Answered by">{call.answeredBy}</Detail>
          )}
          <Detail label="Caller name">{call.callerName}</Detail>
          <Detail label="Price">
            {call.price !== undefined && call.price !== null && `₹${call.price}`}
          </Detail>
        </dl>
      </Card>

      <Card
        title="What happened"
        description={
          hasLegs
            ? undefined
            : "Step-by-step details aren't saved for this call yet. Refresh the calls list to load them."
        }
      >
        {hasLegs && <CallSteps call={call} />}
        <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-app-border! pt-4">
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

      <Card title="Time">
        <dl className="grid grid-cols-2 gap-4">
          <Detail label="Started">{formatDateTime(call.startTime)}</Detail>
          <Detail label="Ended">{formatDateTime(call.endTime)}</Detail>
          <Detail label="Logged">{formatDateTime(call.createdAt)}</Detail>
        </dl>
      </Card>

      {call.recordingUrl && (
        <Card title="Recording">
          {/* a new player per call, so Prev / Next never plays the wrong one */}
          <RecordingPlayer key={call.sid} callSid={call.sid} />
        </Card>
      )}
    </div>
  );
};

export default CallInfoCard;
