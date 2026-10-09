import { Stages } from "../../data/constant";

// the stages a call can be moved to from the calls table
export const CALL_STAGES = Stages.filter(
  (stage) => stage.value === "Closure" || stage.value === "Follow Up",
);

const OUTGOING = ["outbound-dial", "outbound-api"];
const INCOMING = ["inbound", "incoming"];

export const isOutgoing = (call) => OUTGOING.includes(call?.direction);

// the guest's number: who called us, or who we called
export const getGuestNumber = (call) =>
  isOutgoing(call) ? call?.to : call?.from;

// the provider's status in plain words; depends on who made the call
export const getCallStatusLabel = (status, direction) => {
  const outgoing = OUTGOING.includes(direction);
  const incoming = INCOMING.includes(direction);

  if (status === "completed" && (incoming || outgoing))
    return "Call was successful";
  if (outgoing) {
    if (status === "no-answer") return "Client unanswered";
    if (status === "busy") return "Client busy";
    if (status === "") return "Client hung up before connecting to any user";
  }
  if (incoming) {
    if (["no-answer", "incomplete", "", "failed"].includes(status)) {
      return "No user answered";
    }
    if (status === "call-attempt") {
      return "Client hung up before connecting to any user";
    }
    if (status === "client-hangup" || status === "canceled") {
      return "Client hung up during the call";
    }
  }
  return status || "—";
};

// Badge tone for a call's status
export const getCallStatusTone = (status) => {
  if (status === "completed") return "green";
  if (status === "busy" || status === "call-attempt") return "amber";
  return "red";
};

// 95 -> "1m 35s"
export const formatCallDuration = (seconds) =>
  seconds ? `${Math.floor(seconds / 60)}m ${seconds % 60}s` : "—";

export const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString() : "—";
