import { formatCredits } from "../../../components/AiCredits/aiCredits";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import { intentLabel, percent, SOURCE_LABELS, WORKFLOW_TONES } from "../intents/intentModel";

const ACTIONS = {
  check_room_availability: { label: "Check room availability", mode: "Live lookup" },
  create_booking: { label: "Create booking", mode: "Simulated" },
  save_lead_details: { label: "Save lead details", mode: "Simulated" },
  handoff_to_human: { label: "Hand over to team", mode: "Simulated" },
  send_media: { label: "Send photos, videos & documents", mode: "Preview only" },
};

const TestReplyDetails = ({ reply, loading }) => {
  const actions = [...new Set(reply?.toolsUsed ?? [])];

  return (
    <Card title="Last reply">
      {!reply ? <p className="text-sm text-app-text-muted">{loading ? "Waiting for the test reply…" : "Send a test message to see reply details."}</p> : (
        <dl className="space-y-4 text-sm">
          {reply.intent && (
            <div>
              <dt className="mb-1 text-xs font-medium text-app-text-muted">Detected intent</dt>
              <dd className="space-y-1 text-app-text">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{intentLabel(reply.intent.primary)}</span>
                  <span className="text-xs text-app-text-muted">{reply.intent.source === "llm" ? percent(reply.intent.confidence) : SOURCE_LABELS[reply.intent.source] || reply.intent.source}</span>
                  {reply.workflow && <Badge tone={WORKFLOW_TONES[reply.workflow.name] || "gray"}>{reply.workflow.label}</Badge>}
                </p>
                {reply.intent.intents?.length > 1 && <p className="text-xs text-app-text-muted">Also: {reply.intent.intents.filter((i) => i !== reply.intent.primary).map(intentLabel).join(", ")}</p>}
                {Object.keys(reply.intent.entities || {}).length > 0 && (
                  <p className="text-xs text-app-text-muted">Details: {Object.entries(reply.intent.entities).map(([k, v]) => `${intentLabel(k)}: ${v}`).join(" · ")}</p>
                )}
                {reply.intent.missing?.length > 0 && <p className="text-xs text-app-warning">Still needed: {reply.intent.missing.map(intentLabel).join(", ")}</p>}
                <p className="text-xs text-app-text-muted">{reply.intent.language} · {reply.intent.sentiment} · urgency {reply.intent.urgency}{reply.workflow?.reason ? ` · ${reply.workflow.reason}` : ""}</p>
                {reply.intent.error && <p className="text-xs text-app-warning">{reply.intent.error}</p>}
              </dd>
            </div>
          )}
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
          {reply.media?.length > 0 && (
            <div>
              <dt className="mb-1 text-xs font-medium text-app-text-muted">Files it would send ({reply.media.length})</dt>
              <dd>
                <ul className="space-y-1.5">
                  {reply.media.map((m) => (
                    <li key={m.url} className="flex flex-wrap items-center gap-2 text-app-text">
                      <Badge tone={m.kind === "image" ? "sky" : m.kind === "video" ? "purple" : "blue"}>{m.kind}</Badge>
                      <a href={m.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">{m.title}</a>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
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
