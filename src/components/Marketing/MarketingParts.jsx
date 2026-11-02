import { ChevronRight, Trophy } from "lucide-react";
import Icon from "../ui/Icon";

// Big, plain buttons for the first steps on a marketing page.
//   actions: [{ icon, title, description, onClick, primary? }]
export const QuickActions = ({ actions }) => (
  <div className="grid gap-3 sm:grid-cols-3">
    {actions.map((action) => (
      <button
        key={action.title}
        type="button"
        onClick={action.onClick}
        className={`group flex items-start gap-3 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
          action.primary
            ? "border-transparent! bg-gradient-to-br from-primary to-blue-600 text-white dark:from-blue-600 dark:to-indigo-500"
            : "border-app-border! bg-app-surface text-app-text"
        }`}
      >
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
            action.primary ? "bg-white/15" : "bg-app-surface-secondary text-app-text-muted"
          }`}
        >
          <Icon icon={action.icon} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1 text-sm font-semibold">
            {action.title}
            <ChevronRight className="size-4 opacity-60 transition group-hover:translate-x-0.5" />
          </span>
          <span className={`mt-0.5 block text-xs leading-snug ${action.primary ? "text-white/80" : "text-app-text-muted"}`}>
            {action.description}
          </span>
        </span>
      </button>
    ))}
  </div>
);

// The campaign that did best, so it is easy to repeat what worked.
//   metric: e.g. "68% read"   detail: e.g. "1,240 sent · 12 Oct"
export const TopCampaign = ({ name, metric, detail, onOpen }) => (
  <button
    type="button"
    onClick={onOpen}
    className="flex w-full items-center gap-3 rounded-2xl border border-amber-500/30! bg-amber-500/[0.06] p-4 text-left transition hover:bg-amber-500/10"
  >
    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
      <Icon icon={Trophy} />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
        Best campaign
      </span>
      <span className="block truncate text-sm font-semibold text-app-text">{name}</span>
      {detail && <span className="block truncate text-xs text-app-text-muted">{detail}</span>}
    </span>
    <span className="shrink-0 text-right">
      <span className="block text-lg font-semibold tabular-nums text-app-text">{metric}</span>
    </span>
  </button>
);

// One campaign as a card, for phones (the table is too wide there).
//   stats: [{ label, value }]  status: { tone, label } from the page's utils
export const CampaignCard = ({ title, subtitle, status, stats, date, onOpen, statusBadge }) => (
  <button
    type="button"
    onClick={onOpen}
    className="w-full rounded-xl border border-app-border! bg-app-surface p-4 text-left transition hover:bg-app-surface-secondary"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-app-text">{title || "Untitled"}</p>
        {subtitle && <p className="truncate text-xs text-app-text-muted">{subtitle}</p>}
      </div>
      {statusBadge || (status && <span className="shrink-0 text-xs text-app-text-muted">{status}</span>)}
    </div>
    <div className="mt-3 grid grid-cols-4 gap-2">
      {stats.map((stat) => (
        <div key={stat.label} className="min-w-0">
          <p className="truncate text-[10px] font-medium uppercase tracking-wide text-app-text-faint">{stat.label}</p>
          <p className={`text-sm font-semibold tabular-nums ${stat.className || "text-app-text"}`}>{stat.value}</p>
        </div>
      ))}
    </div>
    {date && <p className="mt-2 text-[11px] text-app-text-faint">{date}</p>}
  </button>
);
