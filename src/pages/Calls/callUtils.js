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
    if (status === "busy") return "User busy";
    if (status === "call-attempt") {
      return "Client hung up before connecting to any user";
    }
    if (status === "client-hangup" || status === "canceled") {
      return "Client hung up during the call";
    }
  }
  return status || "—";
};

// one leg's result in plain words; '' means that leg was never dialled
const LEG_LABELS = {
  completed: "Answered",
  "no-answer": "No answer",
  busy: "Busy",
  failed: "Could not connect",
  canceled: "Stopped ringing before anyone answered",
  "": "Not dialled",
};
export const getLegLabel = (status) =>
  status === null || status === undefined
    ? "—"
    : LEG_LABELS[status] || status;

const hasLegs = (call) =>
  (call?.fromLegStatus ?? null) !== null || (call?.toLegStatus ?? null) !== null;

// What happened on the call, from the hotel's point of view: { label, tone }.
// Outgoing calls ring our staff (`from`) first, then the guest (`to`); the
// provider's single status can't say which side failed, the legs can.
// Calls saved before the legs were stored fall back to the status label.
export const getCallOutcome = (call) => {
  const status = call?.status;
  const answered = call?.duration > 0;

  if (isOutgoing(call) && hasLegs(call)) {
    const staff = call.fromLegStatus;
    const guest = call.toLegStatus;
    if (guest === "completed" && answered)
      return { label: "Call was successful", tone: "green" };
    if (staff !== "completed") {
      return staff === "busy"
        ? { label: "Your staff's line was busy", tone: "amber" }
        : { label: "Your staff didn't answer", tone: "red" };
    }
    if (guest === "busy") return { label: "Guest was busy", tone: "amber" };
    if (guest === "failed")
      return { label: "Couldn't reach the guest", tone: "red" };
    if (guest === "canceled")
      return { label: "Staff hung up before the guest answered", tone: "red" };
    if (!guest)
      return { label: "Staff hung up before the guest was dialled", tone: "red" };
    return { label: "Guest didn't answer", tone: "red" };
  }

  if (!isOutgoing(call)) {
    if (status === "completed" && answered)
      return { label: "Call was successful", tone: "green" };
    if (status === "canceled")
      return { label: "Guest hung up while it was ringing", tone: "red" };
    if (status === "no-answer" || status === "incomplete")
      return { label: "No one at the hotel answered", tone: "red" };
    if (status === "busy")
      return { label: "Hotel line was busy", tone: "amber" };
    if (status === "failed")
      return { label: "Couldn't connect to the hotel team", tone: "red" };
    if (status === "client-hangup" || status === "call-attempt")
      return { label: "Guest hung up before reaching the team", tone: "red" };
  }

  return {
    label: getCallStatusLabel(status, call?.direction),
    tone: getCallStatusTone(status),
  };
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
