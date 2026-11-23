import { formatCredits } from "../../../components/AiCredits/aiCredits";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";

const ACTIONS = {
  check_room_availability: { label: "Check room availability", mode: "Live lookup" },
  create_booking: { label: "Create booking", mode: "Simulated" },
  save_lead_details: { label: "Save lead details", mode: "Simulated" },
  handoff_to_human: { label: "Hand over to team", mode: "Simulated" },
};

const TestReplyDetails = ({ reply, loading }) => {
  const actions = [...new Set(reply?.toolsUsed ?? [])];

  return (
    <Card title="Last reply">
      {!reply ? <p className="text-sm text-app-text-muted">{loading ? "Waiting for the test reply…" : "Send a test message to see reply details."}</p> : (
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="mb-1 text-xs font-medium text-app-text-muted">Actions attempted</dt>
            <dd className="text-app-text">
              {actions.length ? <ul className="space-y-1.5">{actions.map((key) => (
                <li key={key} className="flex flex-wrap items-center gap-2">
                  {ACTIONS[key]?.label ?? key}
                  {ACTIONS[key]?.mode && <Badge tone="purple">{ACTIONS[key].mode}</Badge>}
                </li>
              ))}</ul> : "None"}
            </dd>
          </div>
          <div>
            <dt className="mb-1 text-xs font-medium text-app-text-muted">Handover</dt>
            <dd className="text-app-text">{reply.handoff ? reply.handoffReason || "Requested during test" : "None"}</dd>
          </div>
          <div>
            <dt className="mb-1 text-xs font-medium text-app-text-muted">Knowledge provided</dt>
            <dd className="text-app-text">{reply.sources == null ? "Unavailable" : reply.sources.join(", ") || "None"}</dd>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-app-border! pt-3">
            <div>
              <dt className="text-xs font-medium text-app-text-muted">Response time</dt>
              <dd className="mt-1 font-semibold text-app-text">{reply.latencyMs == null ? "—" : `${(reply.latencyMs / 1000).toFixed(1)} s`}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-app-text-muted">Credits charged</dt>
              <dd className="mt-1 font-semibold text-app-text">{reply.chargedCredits == null ? "Unavailable" : formatCredits(reply.chargedCredits)}</dd>
            </div>
          </div>
        </dl>
      )}
    </Card>
  );
};

export default TestReplyDetails;
