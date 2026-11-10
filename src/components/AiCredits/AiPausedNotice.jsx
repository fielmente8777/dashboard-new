import { Ban, PauseCircle, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { PAGES, dashboardPath } from "../../routes/paths";
import Icon from "../ui/Icon";
import { formatCredits } from "./aiCredits";

// Shown on an AI feature while the account's AI is paused (no AI credits, or
// the wallet is suspended). Renders nothing otherwise.
// access: useAiAccess(); feature: what is paused, e.g. "AI replies";
// compact: one line, for tight spots like the chat box.
const AiPausedNotice = ({ access, feature = "AI features", compact = false, className = "" }) => {
  if (!access?.paused) return null;
  const suspended = access.reason === "wallet_suspended";

  const message = suspended
    ? "Your AI wallet is suspended. Contact Eazotel support to turn AI back on."
    : `Your AI wallet has no credits left. ${feature} start again as soon as you recharge.`;

  return (
    <div
      role="status"
      className={`flex flex-wrap items-center gap-3 rounded-xl border border-red-500/30! bg-red-500/5 ${compact ? "px-3 py-2" : "p-4"} ${className}`}
    >
      <Icon icon={suspended ? Ban : PauseCircle} className="shrink-0 text-red-600 dark:text-red-400" />
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-semibold text-red-600 dark:text-red-400">
          {feature} {feature.endsWith("s") ? "are" : "is"} paused
          {!suspended && (
            <span className="font-normal text-app-text">
              {" "}
              · Available balance: <span className="font-semibold tabular-nums">{formatCredits(access.availableCredits)} credits</span>
            </span>
          )}
        </p>
        {!compact && <p className="mt-0.5 text-app-text-muted">{message}</p>}
      </div>
      {!suspended && (
        <Link
          to={dashboardPath(PAGES.AI_WALLET)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
        >
          <Icon icon={Zap} size="sm" />
          Recharge AI wallet
        </Link>
      )}
    </div>
  );
};

export default AiPausedNotice;
