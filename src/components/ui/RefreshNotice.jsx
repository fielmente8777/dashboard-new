import { RefreshCw } from "lucide-react";

const clock = (time) => new Date(time).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });

// A slim line that says the numbers may have changed and offers a Refresh.
// Used in place of auto-refresh: nothing is loaded until the user clicks.
// Pair it with useStaleAfter():
//
//   <RefreshNotice show={stale} loadedAt={loadedAt} onRefresh={reload} refreshing={busy}>
//     Sending in progress.
//   </RefreshNotice>
//   timeLabel / actionLabel  change the wording ("Last checked at" / "Check now")
export default function RefreshNotice({
  show,
  loadedAt,
  onRefresh,
  refreshing = false,
  children,
  timeLabel = "Last updated at",
  actionLabel = "Refresh",
  className = "",
}) {
  if (!show) return null;
  return (
    <div
      role="status"
      className={`flex items-center gap-2 rounded-lg border border-blue-200! bg-blue-50 px-3 py-2 text-sm text-blue-800 dark:border-blue-500/30! dark:bg-blue-500/10 dark:text-blue-300 ${className}`}
    >
      <span className="min-w-0 flex-1">
        {children ? <>{children} </> : null}
        {loadedAt ? `${timeLabel} ${clock(loadedAt)}.` : null}
      </span>
      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 font-medium hover:bg-blue-100 disabled:opacity-60 dark:hover:bg-blue-500/20"
      >
        <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />
        {actionLabel}
      </button>
    </div>
  );
}
