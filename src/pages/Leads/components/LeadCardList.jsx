import {
  ChevronRight,
  Inbox,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  StickyNote,
} from "lucide-react";
import Badge from "../../../components/ui/Badge";
import CellSelect from "../../../components/ui/CellSelect";
import Icon from "../../../components/ui/Icon";
import { Skeleton } from "../../../components/ui/States";
import { Stages } from "../../../data/constant";
import { timeAgo } from "../../../utils/formateDate";
import {
  getFollowUpState,
  getLatestNote,
  getLeadCreatedAt,
  getLeadEmail,
  getLeadInitials,
  getLeadName,
  getLeadPhone,
  getLeadSourceLabel,
  getSourceStyle,
  getStageTone,
} from "../leadUtils";

const FOLLOW_UP_BADGES = {
  overdue: { tone: "red", label: "Overdue" },
  today: { tone: "amber", label: "Today" },
};

// the coloured strip down the left of a card, in the stage's colour
const STAGE_EDGES = {
  blue: "before:bg-blue-500",
  sky: "before:bg-sky-500",
  purple: "before:bg-purple-500",
  amber: "before:bg-amber-500",
  green: "before:bg-emerald-500",
  red: "before:bg-red-500",
  gray: "before:bg-gray-400",
};

const stop = (e) => e.stopPropagation();

const ActionButton = ({ icon, label, className = "", ...props }) => (
  <button
    type="button"
    className={`inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg text-xs font-medium transition active:scale-95 disabled:opacity-60 ${className}`}
    {...props}
  >
    <Icon icon={icon} size="sm" />
    {label}
  </button>
);

const LeadCard = ({
  lead,
  position,
  selected,
  checking,
  onOpen,
  onStageChange,
  onToggleSelect,
  onWhatsApp,
}) => {
  const phone = getLeadPhone(lead);
  const email = getLeadEmail(lead);
  const note = getLatestNote(lead);
  const followUp = FOLLOW_UP_BADGES[getFollowUpState(lead)];

  return (
    <article
      onClick={() => onOpen(lead, position)}
      className={`anim-fade relative cursor-pointer overflow-hidden rounded-xl border border-app-border! bg-app-surface p-4 pl-5 transition before:absolute before:inset-y-0 before:left-0 before:w-1 hover:shadow-md active:scale-[0.99] ${STAGE_EDGES[getStageTone(lead.status)]} ${selected ? "ring-2 ring-blue-500/50" : ""}`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${getSourceStyle(lead)}`}
          aria-hidden="true"
        >
          {getLeadInitials(lead) || "?"}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold text-app-text">
              {getLeadName(lead)}
            </h3>
            {followUp && <Badge tone={followUp.tone}>{followUp.label}</Badge>}
          </div>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-app-text-muted">
            <span
              className={`rounded-full px-2 py-px font-medium capitalize ${getSourceStyle(lead)}`}
            >
              {getLeadSourceLabel(lead).replace(/_/g, " ")}
            </span>
            {timeAgo(getLeadCreatedAt(lead))}
          </p>
        </div>
        <input
          type="checkbox"
          aria-label={`Select ${getLeadName(lead)}`}
          className="mt-1 size-4 cursor-pointer accent-primary"
          checked={selected}
          onClick={stop}
          onChange={() => onToggleSelect(lead)}
        />
      </div>

      <div className="mt-3 space-y-1 text-sm">
        {phone && (
          <p className="flex items-center gap-2 tabular-nums text-app-text">
            <Icon icon={Phone} size="sm" tone="faint" />
            {phone}
          </p>
        )}
        {email && (
          <p className="flex min-w-0 items-center gap-2 text-app-text-muted">
            <Icon icon={Mail} size="sm" tone="faint" />
            <span className="truncate">{email}</span>
          </p>
        )}
        {note && (
          <p className="flex min-w-0 items-center gap-2 text-app-text-muted">
            <Icon icon={StickyNote} size="sm" tone="faint" />
            <span className="truncate">{note}</span>
          </p>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-app-border! pt-3">
        <CellSelect
          id={lead._id}
          value={lead.status}
          options={Stages}
          onSelect={(stage) => onStageChange(lead, stage)}
        />
        {lead.assignee && (
          <span className="truncate text-xs text-app-text-faint">
            {lead.assignee}
          </span>
        )}
      </div>

      <div className="mt-3 flex gap-2" onClick={stop}>
        {phone && (
          <>
            <ActionButton
              icon={checking ? Loader2 : MessageCircle}
              label="WhatsApp"
              disabled={checking}
              className={`bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300 ${checking ? "[&_svg]:animate-spin" : ""}`}
              onClick={() => onWhatsApp(lead)}
            />
            <ActionButton
              icon={Phone}
              label="Call"
              className="bg-app-surface-secondary text-app-text hover:bg-app-surface-secondary/70"
              onClick={() => window.location.assign(`tel:${phone}`)}
            />
          </>
        )}
        <ActionButton
          icon={ChevronRight}
          label="Open"
          className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 dark:text-blue-300"
          onClick={() => onOpen(lead, position)}
        />
      </div>
    </article>
  );
};

// The leads list on phones and tablets: one card per lead, two side by side
// on a tablet. Takes the same props as LeadsTable.
const LeadCardList = ({
  leads,
  loading,
  firstIndex,
  pageSize,
  selectedIds,
  onOpen,
  onStageChange,
  onToggleSelect,
  onWhatsApp,
  whatsAppCheckingId,
}) => {
  if (loading) {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: Math.min(pageSize, 6) }, (_, index) => (
          <Skeleton key={index} className="h-52 rounded-xl" />
        ))}
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-app-border! bg-app-surface px-4 py-12 text-center">
        <Icon icon={Inbox} size="2xl" tone="faint" />
        <p className="mt-3 text-sm text-app-text-muted">No leads found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {leads.map((lead, index) => (
        <LeadCard
          key={lead._id || index}
          lead={lead}
          position={firstIndex + index + 1}
          selected={selectedIds.includes(lead._id)}
          checking={whatsAppCheckingId === lead._id}
          onOpen={onOpen}
          onStageChange={onStageChange}
          onToggleSelect={onToggleSelect}
          onWhatsApp={onWhatsApp}
        />
      ))}
    </div>
  );
};

export default LeadCardList;
