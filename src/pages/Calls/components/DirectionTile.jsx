import { PhoneIncoming, PhoneOutgoing } from "lucide-react";
import Icon from "../../../components/ui/Icon";
import { getCallOutcome, isOutgoing } from "../callUtils";

// The direction icon in a tinted tile: green in, blue out, red when the
// call did not connect.
const DirectionTile = ({ call, size = "size-9", iconSize = "sm" }) => {
  const failed = getCallOutcome(call).tone === "red";
  const outgoing = isOutgoing(call);
  const tone = failed
    ? "bg-red-500/10 text-red-600 dark:text-red-300"
    : outgoing
      ? "bg-blue-500/10 text-blue-600 dark:text-blue-300"
      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300";
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full ${size} ${tone}`}
      title={outgoing ? "Outgoing call" : "Incoming call"}
    >
      <Icon icon={outgoing ? PhoneOutgoing : PhoneIncoming} size={iconSize} />
    </span>
  );
};

export default DirectionTile;
