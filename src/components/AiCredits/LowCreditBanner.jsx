import { AlertOctagon, AlertTriangle, CircleCheck, Zap } from "lucide-react";
import Button from "../ui/Button";
import Icon from "../ui/Icon";
import { formatCredits } from "./aiCredits";

const STATES = {
  healthy: {
    icon: CircleCheck,
    title: "Your AI credits are in good shape",
    message: "AI services will keep running without interruption.",
    box: "border-emerald-500/30! bg-emerald-500/5",
    tone: "text-emerald-600 dark:text-emerald-400",
  },
  low: {
    icon: AlertTriangle,
    title: "Your AI credits are running low!",
    message: "Recharge your wallet to continue using AI services.",
    box: "border-amber-500/30! bg-amber-500/5",
    tone: "text-amber-600 dark:text-amber-400",
  },
  critical: {
    icon: AlertOctagon,
    title: "Your AI credits are almost gone",
    message: "AI replies and automations will pause soon. Recharge now to avoid interruptions.",
    box: "border-red-500/30! bg-red-500/5",
    tone: "text-red-600 dark:text-red-400",
  },
  empty: {
    icon: AlertOctagon,
    title: "You're out of AI credits",
    message: "AI services are paused. Recharge your wallet to turn them back on.",
    box: "border-red-500/50! bg-red-500/10",
    tone: "text-red-600 dark:text-red-400",
  },
};

// The wallet's health at a glance. `state` comes from creditState();
// without `onRecharge` there is no Recharge Now button.
const LowCreditBanner = ({ state, balance, onRecharge }) => {
  const { icon, title, message, box, tone } = STATES[state] || STATES.healthy;
  const urgent = state === "critical" || state === "empty";

  return (
    <div
      role={state === "healthy" ? "status" : "alert"}
      className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center ${box}`}
    >
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg bg-app-surface ${tone}`}>
        <Icon icon={icon} size="lg" />
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold ${tone}`}>{title}</p>
        <p className="mt-0.5 text-sm text-app-text">
          Available Balance:{" "}
          <span className="font-semibold tabular-nums">{formatCredits(balance)} Credits</span>
        </p>
        <p className="mt-0.5 text-xs text-app-text-muted">{message}</p>
      </div>
      {state !== "healthy" && onRecharge && (
        <Button
          variant={urgent ? "danger" : "primary"}
          icon={Zap}
          onClick={onRecharge}
          className="w-full sm:w-auto"
        >
          Recharge Now
        </Button>
      )}
    </div>
  );
};

export default LowCreditBanner;
