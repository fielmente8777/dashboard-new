import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import Detail from "../../../components/ui/Detail";
import {
  formatCallDuration,
  formatDateTime,
  getCallStatusLabel,
  getCallStatusTone,
  isOutgoing,
} from "../callUtils";
import RecordingPlayer from "../components/RecordingPlayer";

const CallInfoCard = ({ call }) => (
  <div className="space-y-5">
    <Card title="Call information">
      <dl className="grid grid-cols-2 gap-4">
        <Detail label="From">{call.from}</Detail>
        <Detail label="To">{call.to}</Detail>
        <Detail label="Direction">
          {isOutgoing(call) ? "Outgoing" : "Incoming"}
        </Detail>
        <Detail label="Status">
          <Badge tone={getCallStatusTone(call.status)}>
            {getCallStatusLabel(call.status, call.direction)}
          </Badge>
        </Detail>
        <Detail label="Duration">{formatCallDuration(call.duration)}</Detail>
        <Detail label="Stage">{call.stage}</Detail>
        <Detail label="Lead status">{call.leadStatus}</Detail>
        <Detail label="Answered by">{call.answeredBy}</Detail>
        <Detail label="Caller name">{call.callerName}</Detail>
        <Detail label="Price">
          {call.price !== undefined && call.price !== null && `₹${call.price}`}
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

export default CallInfoCard;
