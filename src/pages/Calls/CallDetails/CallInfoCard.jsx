import Card from "../../../components/ui/Card";
import Detail from "../../../components/ui/Detail";
import { formatDateTime, isOutgoing } from "../callUtils";

// The facts about a call that are only looked up now and then: the numbers,
// who answered, the cost and the times.
const CallInfoCard = ({ call }) => {
  const outgoing = isOutgoing(call);

  return (
    <Card title="Call details">
      <dl className="grid grid-cols-2 gap-4">
        <Detail label={outgoing ? "From (your staff)" : "From (guest)"}>
          {call.from}
        </Detail>
        <Detail label={outgoing ? "To (guest)" : "To (your number)"}>
          {call.to}
        </Detail>
        <Detail label="Business line">{call.phoneNumberSid}</Detail>
        {/* the provider fills this in even when nobody picked up */}
        <Detail label="Answered by">
          {call.duration > 0 ? call.answeredBy : ""}
        </Detail>
        <Detail label="Caller name">{call.callerName}</Detail>
        <Detail label="Lead status">{call.leadStatus}</Detail>
        <Detail label="Price">
          {call.price !== undefined && call.price !== null && `₹${call.price}`}
        </Detail>
        <Detail label="Started">{formatDateTime(call.startTime)}</Detail>
        <Detail label="Ended">{formatDateTime(call.endTime)}</Detail>
        <Detail label="Logged">{formatDateTime(call.createdAt)}</Detail>
      </dl>
    </Card>
  );
};

export default CallInfoCard;
