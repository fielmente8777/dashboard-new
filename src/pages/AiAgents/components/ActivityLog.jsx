import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { formatCredits } from "../../../components/AiCredits/aiCredits";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import { Select } from "../../../components/ui/Field";
import { ErrorState, Skeleton } from "../../../components/ui/States";
import { useGetAiAgentActivityQuery, useGetAiAgentIntentsQuery } from "../../../redux/api/aiAgentsApi";
import { intentLabel, percent, WORKFLOW_TONES } from "../intents/intentModel";
import { PAGES, dashboardPath } from "../../../routes/paths";
import { RUN_STATUS } from "../agentOptions";

const OUTCOMES = [
  { value: "all", label: "All outcomes" },
  ...Object.entries(RUN_STATUS).map(([value, { label }]) => ({ value, label })),
];
const whenFormat = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const formatCount = new Intl.NumberFormat().format;

const ActivityLog = ({ channel, hid }) => {
  const [outcome, setOutcome] = useState("all");
  const [intent, setIntent] = useState("all");
  const activity = useGetAiAgentActivityQuery({ channel, hid, outcome, intent }, { refetchOnMountOrArgChange: true, pollingInterval: 30000 });
  const intents = useGetAiAgentIntentsQuery({ channel, hid });
  const intentOptions = [{ value: "all", label: "All intents" }, ...(intents.currentData?.intents ?? []).map((i) => ({ value: i.key, label: intentLabel(i.key) }))];
  const { runs = [] } = activity.currentData ?? {};
  const { last7Days = {}, summary } = activity.currentData ?? activity.data ?? {};
  const stats = [
    { label: "Conversations", value: summary ? formatCount(summary.conversations) : "—" },
    { label: "AI replies", value: formatCount(last7Days.replied ?? 0) },
    { label: "Handovers", value: formatCount(last7Days.handoff ?? 0) },
    { label: "Failed", value: formatCount(last7Days.failed ?? 0) },
    { label: "Avg. response", value: summary?.averageLatencyMs == null ? "—" : `${(summary.averageLatencyMs / 1000).toFixed(1)} s` },
    { label: summary?.missingCharges ? "Recorded credits" : "Credits used", value: summary?.chargedCredits == null ? "—" : formatCredits(summary.chargedCredits) },
  ];
  const columns = [
    { key: "createdAt", header: "Time", className: "whitespace-nowrap", render: (run) => <time dateTime={run.createdAt}>{whenFormat.format(new Date(run.createdAt))}</time> },
    { key: "guestMessage", header: "Guest message", className: "min-w-56 max-w-96", render: (run) => <p className="line-clamp-2 break-words" title={run.guestMessage}>{run.guestMessage || "—"}</p> },
    { key: "intent", header: "Intent", className: "min-w-40 max-w-60", render: (run) => run.intent ? (
      <>
        <p className="text-sm font-medium text-app-text">{intentLabel(run.intent.primary)}</p>
        <p className="mt-0.5 text-xs text-app-text-muted">{run.intent.source === "llm" ? percent(run.intent.confidence) : run.intent.source === "rules" ? "rules" : run.intent.source}{run.intent.entities?.length ? ` · ${run.intent.entities.join(", ")}` : ""}</p>
        {run.intent.workflow && <Badge tone={WORKFLOW_TONES[run.intent.workflow] || "gray"} className="mt-1">{intentLabel(run.intent.workflow)}{run.intent.continued ? " (cont.)" : ""}</Badge>}
      </>
    ) : <span className="text-app-text-muted">—</span> },
    { key: "status", header: "Outcome", className: "min-w-40 max-w-72", render: (run) => {
      const status = RUN_STATUS[run.status] ?? { label: run.status, tone: "gray" };
      return <><Badge tone={status.tone}>{status.label}</Badge>{run.reason && <p className="mt-1 break-words text-xs text-app-text-muted">{run.reason}</p>}</>;
    } },
    { key: "chargedCredits", header: "Credits", className: "tabular-nums", render: (run) => run.chargedCredits == null ? <span aria-label="Charge unavailable">—</span> : formatCredits(run.chargedCredits) },
    { key: "conversationId", header: "Conversation", className: "whitespace-nowrap", render: (run) => run.conversationId ? (
      <Link to={dashboardPath(PAGES.CHAT_INSTAGRAM, { hid, query: { conversationId: run.conversationId } })} className="text-blue-600 hover:underline dark:text-blue-400">Open chat</Link>
    ) : "—" },
  ];

  if (activity.isError && !activity.currentData) return <ErrorState message="Could not load agent activity." onRetry={activity.refetch} />;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {stats.map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-app-border! bg-app-surface p-3.5">
            <p className="text-xs text-app-text-muted">{label}</p>
            {activity.isLoading ? <Skeleton className="mt-2 h-6 w-14" /> : <p className="mt-1 text-xl font-semibold tabular-nums text-app-text">{value}</p>}
          </div>
        ))}
      </div>
      <Card title="Recent activity" description="Last 7 days" actions={(
        <div className="flex flex-wrap items-center gap-2">
          <Select className="max-w-44" aria-label="Filter activity by intent" options={intentOptions} value={intent} onChange={(event) => setIntent(event.target.value)} />
          <Select className="max-w-40" aria-label="Filter activity by outcome" options={OUTCOMES} value={outcome} onChange={(event) => setOutcome(event.target.value)} />
          <Button variant="secondary" icon={RefreshCw} size="sm" loading={activity.isFetching} onClick={activity.refetch}>Refresh</Button>
        </div>
      )}>
        <DataTable columns={columns} rows={runs} rowKey={(run) => run._id} loading={activity.isFetching && !activity.currentData}
          emptyMessage={outcome === "all" && intent === "all" ? "No Instagram agent activity in the last 7 days." : "No runs match these filters in the last 7 days."} />
        {summary?.missingCharges > 0 && <p className="mt-3 text-xs text-app-text-muted">Some runs have no recorded charge. The total includes runs with a known charge.</p>}
      </Card>
    </div>
  );
};

export default ActivityLog;
