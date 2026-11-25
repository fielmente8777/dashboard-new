import { AlertTriangle, Info, Sparkles } from "lucide-react";
import Icon from "./Icon";

// An inline message inside a card or page: a note, a warning, an AI hint.
// tone: info | warning | accent. `actions` sit at the right (wrap on phones).
const TONES = {
  info: { box: "border-app-border! bg-app-surface-secondary", icon: Info, iconClass: "text-app-text-muted" },
  warning: { box: "border-app-warning/40! bg-app-warning-soft", icon: AlertTriangle, iconClass: "text-app-warning" },
  accent: { box: "border-app-accent/30! bg-app-accent-soft", icon: Sparkles, iconClass: "text-app-accent-text" },
};

const Notice = ({ tone = "info", icon, title, role = "note", actions, className = "", children }) => {
  const style = TONES[tone] || TONES.info;
  return (
    <div role={role} className={`flex flex-wrap items-start gap-3 rounded-lg border p-3 ${style.box} ${className}`}>
      <Icon icon={icon || style.icon} className={`mt-0.5 ${style.iconClass}`} />
      <div className="min-w-0 flex-1 basis-48 text-sm text-app-text">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? "mt-0.5 text-app-text-muted" : ""}>{children}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
};

export default Notice;
