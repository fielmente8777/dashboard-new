import { Activity, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import { EmptyState, ErrorState, Skeleton } from "../../../components/ui/States";
import { useGetAiAgentActivityQuery } from "../../../redux/api/aiAgentsApi";
import { PAGES, dashboardPath } from "../../../routes/paths";
import { RUN_STATUS } from "../agentOptions";

const formatWhen = (date) =>
  new Date(date).toLocaleString([], {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const Stat = ({ label, value, tone }) => (
  <div className="rounded-xl border border-app-border! bg-app-surface p-3">
    <p className="text-xs text-app-text-muted">{label}</p>
    <p className={`mt-1 text-2xl font-semibold tabular-nums ${tone}`}>{value || 0}</p>
  </div>
);

// What the agent did with each guest message, and why it stayed quiet when it
// did ("Outside the AI working hours", "Your team is handling this chat", ...).
const ActivityLog = ({ channel, hid }) => {
  const activity = useGetAiAgentActivityQuery(
    { channel, hid },
    { skip: !hid, refetchOnMountOrArgChange: true, pollingInterval: 30000 },
  );
  const { runs = [], last7Days = {} } = activity.data || {};

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Replied (7 days)" value={last7Days.replied} tone="text-emerald-600 dark:text-emerald-400" />
        <Stat label="Handed over" value={last7Days.handoff} tone="text-amber-600 dark:text-amber-400" />
        <Stat label="Skipped" value={last7Days.skipped} tone="text-app-text" />
        <Stat label="Failed" value={last7Days.failed} tone="text-red-600 dark:text-red-400" />
      </div>

      <Card
        title={
          <span className="flex items-center gap-2">
            <Activity className="size-4 text-app-text-muted" /> Recent activity
          </span>
        }
        description="Every guest message the agent looked at, what it did and why."
        actions={
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            loading={activity.isFetching}
            onClick={activity.refetch}
          >
            Refresh
          </Button>
        }
      >
        {activity.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </div>
        ) : activity.isError ? (
          <ErrorState message="Could not load the activity." onRetry={activity.refetch} />
        ) : runs.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No activity yet"
            description="Turn the agent on and send your Instagram account a DM from a test account."
          />
        ) : (
          <ul className="divide-y divide-app-border">
            {runs.map((run) => {
              const status = RUN_STATUS[run.status] || RUN_STATUS.skipped;
              return (
                <li key={run._id} className="flex flex-wrap items-start gap-3 py-3">
                  <Badge tone={status.tone} className="mt-0.5 w-24 justify-center">
                    {status.label}
                  </Badge>
                  <div className="min-w-0 flex-1 space-y-1 text-sm">
                    {run.guestMessage && (
                      <p className="truncate text-app-text">
                        <span className="text-app-text-faint">Guest: </span>
                        {run.guestMessage}
                      </p>
                    )}
                    {run.reply && (
                      <p className="line-clamp-2 text-app-text-muted">
                        <span className="text-app-text-faint">AI: </span>
                        {run.reply}
                      </p>
                    )}
                    {run.reason && <p className="text-xs text-app-text-muted">{run.reason}</p>}
                    {run.toolsUsed?.length > 0 && (
                      <p className="text-xs text-app-text-faint">Actions: {run.toolsUsed.join(", ")}</p>
                    )}
                  </div>
                  <div className="text-right text-xs text-app-text-faint">
                    <p>{formatWhen(run.createdAt)}</p>
                    {run.latencyMs != null && <p>{(run.latencyMs / 1000).toFixed(1)}s</p>}
                    {run.conversationId && (
                      <Link
                        to={dashboardPath(PAGES.CHAT_INSTAGRAM, {
                          query: { conversationId: run.conversationId },
                        })}
                        className="text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Open chat
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default ActivityLog;
