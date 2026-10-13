import { AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import Icon from "../../../../components/ui/Icon";
import IconButton from "../../../../components/ui/IconButton";

const STATES = {
  done: { title: "Scan complete", icon: CheckCircle2, color: "text-emerald-500", bar: "bg-emerald-500" },
  failed: { title: "Scan failed", icon: AlertCircle, color: "text-red-500", bar: "bg-red-500" },
  running: { title: "Scanning your area", icon: Loader2, color: "text-blue-500", bar: "bg-blue-500" },
};

// Live progress of a geo-grid scan, in the bottom-right corner.
const ScanProgressToast = ({ progress, onDismiss }) => {
  const state = STATES[progress.status] || STATES.running;
  const running = state === STATES.running;

  return (
    <div
      role="status"
      className="anim-enter fixed bottom-6 right-6 z-50 w-80 rounded-xl border border-app-border! bg-app-surface p-4 shadow-xl"
    >
      <div className="flex items-start gap-2.5">
        <Icon
          icon={state.icon}
          size="lg"
          className={`mt-0.5 ${state.color} ${running ? "animate-spin" : ""}`}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-app-text">{state.title}</p>
          <p className="mt-0.5 text-xs text-app-text-muted">
            {progress.step}
            {progress.detail && <span className="block text-app-text-faint">{progress.detail}</span>}
          </p>
        </div>
        <IconButton icon={X} label="Hide" size="sm" onClick={onDismiss} className="-mr-1.5 -mt-1.5" />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-app-surface-secondary">
          <div
            className={`h-full rounded-full transition-[width] duration-700 ${state.bar}`}
            style={{ width: `${progress.status === "done" ? 100 : progress.percent || 0}%` }}
          />
        </div>
        <span className="w-9 text-right text-xs tabular-nums text-app-text-muted">
          {progress.status === "done" ? 100 : progress.percent || 0}%
        </span>
      </div>
      {progress.status === "failed" && (
        <p className="mt-2 text-xs text-app-text-muted">
          It will retry automatically on the next run.
        </p>
      )}
    </div>
  );
};

export default ScanProgressToast;
