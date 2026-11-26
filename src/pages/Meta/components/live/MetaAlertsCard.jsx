import { AlertOctagon, AlertTriangle, CheckCircle2, ExternalLink, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Card from "../../../../components/ui/Card";
import Icon from "../../../../components/ui/Icon";
import { dashboardPath, integrationPath, PAGES } from "../../../../routes/paths";

const LEVEL = {
  critical: { icon: AlertOctagon, tone: "danger", box: "border-red-500/30! bg-red-500/5" },
  warning: { icon: AlertTriangle, tone: "warning", box: "border-amber-500/30! bg-amber-500/5" },
  info: { icon: Info, tone: "primary", box: "border-app-border! bg-app-surface-secondary/40" },
};

// What needs attention, worst first (gian: services/metaReport/metaAlerts.ts).
// `onShowUtm` opens the UTM check on the Ads tab.
const MetaAlertsCard = ({ alerts = [], onShowUtm }) => {
  const navigate = useNavigate();

  const openPage = (page) => {
    if (page === "utm") onShowUtm?.();
    if (page === "leads") navigate(dashboardPath(PAGES.LEADS_META));
    if (page === "integrations") navigate(integrationPath("meta-lead-ads"));
  };

  return (
    <Card
      title="Needs attention"
      description={alerts.length ? `${alerts.length} thing${alerts.length === 1 ? "" : "s"} to look at` : "Checked: ad accounts, ads, budgets, UTM tags and leads"}
    >
      {alerts.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-app-text-muted">
          <Icon icon={CheckCircle2} tone="success" /> All good. Nothing needs your attention right now.
        </p>
      ) : (
        <ul className="anim-stagger space-y-2">
          {alerts.map((alert) => {
            const level = LEVEL[alert.level] || LEVEL.info;
            return (
              <li key={alert.key} className={`flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-start ${level.box}`}>
                <Icon icon={level.icon} tone={level.tone} className="mt-0.5 hidden sm:block" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-medium text-app-text">
                    <Icon icon={level.icon} tone={level.tone} size="sm" className="sm:hidden" />
                    {alert.title}
                  </p>
                  <p className="mt-0.5 text-sm text-app-text-muted">{alert.text}</p>
                </div>
                {alert.action && alert.link && (
                  <a
                    href={alert.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-1 self-start text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {alert.action} <Icon icon={ExternalLink} size="sm" />
                  </a>
                )}
                {alert.action && !alert.link && alert.page && (
                  <button
                    type="button"
                    onClick={() => openPage(alert.page)}
                    className="shrink-0 self-start text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {alert.action}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};

export default MetaAlertsCard;
