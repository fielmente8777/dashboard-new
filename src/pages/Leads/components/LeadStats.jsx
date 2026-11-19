import {
  BellRing,
  CircleCheckBig,
  Inbox,
  PhoneCall,
  Users,
} from "lucide-react";
import Icon from "../../../components/ui/Icon";
import { Skeleton } from "../../../components/ui/States";
import { useGetLeadsQuery } from "../../../redux/api/leadsApi";

// One card per stage worth watching. `stage` "" is every lead.
const CARDS = [
  {
    stage: "",
    label: "Total leads",
    icon: Users,
    tone: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    ring: "ring-indigo-500/50",
  },
  {
    stage: "Open",
    label: "Open",
    icon: Inbox,
    tone: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    ring: "ring-blue-500/50",
  },
  {
    stage: "Contacted",
    label: "Contacted",
    icon: PhoneCall,
    tone: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    ring: "ring-sky-500/50",
  },
  {
    stage: "Follow Up",
    label: "Follow up",
    icon: BellRing,
    tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    ring: "ring-amber-500/50",
  },
  {
    stage: "Converted",
    label: "Converted",
    icon: CircleCheckBig,
    tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    ring: "ring-emerald-500/50",
  },
];

// How many leads match the list's filters with one stage. Only the total is
// read (one lead per request), so this stays cheap.
const useStageCount = (filters, stage) => {
  const result = useGetLeadsQuery(
    { ...filters, stage, page: 1, limit: 1 },
    { skip: !filters.hid },
  );
  return { count: result.data?.total, loading: !result.data };
};

const StatButton = ({
  card,
  count,
  loading,
  active,
  caption,
  className = "",
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`group flex min-w-0 items-center gap-3 rounded-xl border border-app-border! bg-app-surface p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${active ? `ring-2 ${card.ring}` : ""} ${className}`}
  >
    <span
      className={`flex size-10 shrink-0 items-center justify-center rounded-lg transition group-hover:scale-105 ${card.tone}`}
    >
      <Icon icon={card.icon} size="lg" />
    </span>
    <span className="min-w-0">
      <span className="block truncate text-xs font-medium uppercase tracking-wide text-app-text-muted">
        {card.label}
      </span>
      {loading ? (
        <Skeleton className="mt-1.5 h-6 w-12" />
      ) : (
        <span className="mt-0.5 block text-xl font-semibold tabular-nums text-app-text">
          {(count || 0).toLocaleString()}
        </span>
      )}
      {caption && !loading && (
        <span className="block truncate text-xs text-app-text-faint">
          {caption}
        </span>
      )}
    </span>
  </button>
);

// The headline numbers above a leads list. `filters` are the list's own
// (without the stage); clicking a card filters the list by that stage.
const LeadStats = ({ filters, stage, onStageChange }) => {
  // one hook per card, always in the same order
  const counts = [
    useStageCount(filters, ""),
    useStageCount(filters, "Open"),
    useStageCount(filters, "Contacted"),
    useStageCount(filters, "Follow Up"),
    useStageCount(filters, "Converted"),
  ];
  const total = counts[0].count || 0;
  const converted = counts[4].count || 0;

  const captionFor = (card) => {
    if (card.stage === "Converted" && total > 0) {
      return `${((converted / total) * 100).toFixed(1)}% conversion`;
    }
    if (card.stage === "") return stage ? "Show all stages" : "All stages";
    return "";
  };

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {CARDS.map((card, index) => (
        <StatButton
          key={card.label}
          card={card}
          count={counts[index].count}
          loading={counts[index].loading}
          active={stage === card.stage}
          caption={captionFor(card)}
          className={index === 0 ? "col-span-2 md:col-span-1" : ""}
          onClick={() =>
            onStageChange(stage === card.stage ? "" : card.stage)
          }
        />
      ))}
    </div>
  );
};

export default LeadStats;
