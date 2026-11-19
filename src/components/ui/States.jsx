import { AlertCircle, Loader2 } from "lucide-react";
import Button from "./Button";
import Icon from "./Icon";

export const Skeleton = ({ className = "h-10" }) => (
  <div
    className={`anim-shimmer rounded-lg bg-app-surface-secondary ${className}`}
  />
);

export const LoadingState = ({ label = "Loading..." }) => (
  <div className="flex items-center gap-2 rounded-xl border border-app-border! bg-app-surface p-5 text-sm text-app-text-muted">
    <Icon icon={Loader2} className="animate-spin" /> {label}
  </div>
);

export const ErrorState = ({ message, onRetry }) => (
  <div className="flex flex-wrap items-center gap-3 rounded-xl border border-red-500/30! bg-red-500/5 p-4 text-sm text-red-500">
    <Icon icon={AlertCircle} />
    <span className="min-w-0 flex-1">{message}</span>
    {onRetry && (
      <Button variant="secondary" size="sm" onClick={onRetry}>
        Try again
      </Button>
    )}
  </div>
);

export const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-app-border! px-4 py-10 text-center">
    {icon && <Icon icon={icon} size="2xl" tone="faint" />}
    <p className="text-sm font-medium text-app-text">{title}</p>
    {description && (
      <p className="max-w-sm text-xs text-app-text-muted">{description}</p>
    )}
    {action && <div className="mt-2">{action}</div>}
  </div>
);
