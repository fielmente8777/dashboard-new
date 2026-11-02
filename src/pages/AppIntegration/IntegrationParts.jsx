import { AlertTriangle, CheckCircle2, Info, Lock, XCircle } from "lucide-react";
import Icon from "../../components/ui/Icon";

const PILLS = {
  connected: { label: "Connected", dot: "bg-emerald-500", tone: "text-emerald-700 bg-emerald-500/10 dark:text-emerald-400" },
  warn: { label: "Needs attention", dot: "bg-amber-500", tone: "text-amber-700 bg-amber-500/10 dark:text-amber-400" },
  error: { label: "Action needed", dot: "bg-red-500", tone: "text-red-700 bg-red-500/10 dark:text-red-400" },
  available: { label: "Not connected", dot: "bg-gray-400", tone: "text-app-text-muted bg-app-surface-secondary" },
  locked: { label: "Upgrade", dot: "bg-amber-500", tone: "text-amber-700 bg-amber-500/10 dark:text-amber-400" },
  soon: { label: "Coming soon", dot: "bg-gray-400", tone: "text-app-text-muted bg-app-surface-secondary" },
};

export const StatusPill = ({ state, className = "" }) => {
  const pill = PILLS[state] || PILLS.available;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${pill.tone} ${className}`}
    >
      {state === "locked" ? (
        <Lock className="size-3" />
      ) : (
        <span className={`size-1.5 rounded-full ${pill.dot} ${state === "connected" ? "animate-pulse" : ""}`} />
      )}
      {pill.label}
    </span>
  );
};

export const AppLogo = ({ app, size = "md" }) => (
  <span
    className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-app-border! bg-white shadow-sm ${
      size === "lg" ? "size-14 [&_svg]:size-8" : "size-11"
    }`}
  >
    {app.img ? <img src={app.img} alt="" className="size-full object-contain p-1" /> : app.icon}
  </span>
);

const CHECK_ICONS = {
  ok: { icon: CheckCircle2, className: "text-emerald-500" },
  info: { icon: Info, className: "text-sky-500" },
  warn: { icon: AlertTriangle, className: "text-amber-500" },
  error: { icon: XCircle, className: "text-red-500" },
};

// One health check row: icon, what was checked and what we found.
export const CheckRow = ({ check, action }) => {
  const { icon, className } = CHECK_ICONS[check.status] || CHECK_ICONS.info;
  return (
    <li className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <Icon icon={icon} className={`mt-0.5 shrink-0 ${className}`} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-app-text">{check.label}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-app-text-muted">{check.detail}</p>
      </div>
      {action}
    </li>
  );
};
