import { ChevronRight, Loader2, MessageCircle, Phone } from "lucide-react";
import { useMemo } from "react";
import Badge from "../../../components/ui/Badge";
import CellSelect from "../../../components/ui/CellSelect";
import DataTable from "../../../components/ui/DataTable";
import Icon from "../../../components/ui/Icon";
import IconButton from "../../../components/ui/IconButton";
import { Stages, TurnAwayCode } from "../../../data/constant";
import { formatDateTime, timeAgo } from "../../../utils/formateDate";
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
  getStayDetails,
} from "../leadUtils";
import LeadCardList from "./LeadCardList";

// cells with their own controls must not open the row
const stopRowClick = (e) => e.stopPropagation();

// the dot in front of the stage, in the stage's colour
const STAGE_DOTS = {
  blue: "bg-blue-500",
  sky: "bg-sky-500",
  purple: "bg-purple-500",
  amber: "bg-amber-500",
  green: "bg-emerald-500",
  red: "bg-red-500",
  gray: "bg-gray-400",
};

const FOLLOW_UP_BADGES = {
  overdue: { tone: "red", label: "Overdue" },
  today: { tone: "amber", label: "Follow up today" },
};

const LeadAvatar = ({ lead }) => (
  <span
    className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getSourceStyle(lead)}`}
    aria-hidden="true"
  >
    {getLeadInitials(lead) || "?"}
  </span>
);

// The leads list. `columnKeys` picks and orders the columns (see
// leadSources.js). Actions are passed in:
//   onOpen(lead, position)   onStageChange(lead, stage)
//   onTurnAway(lead, code)   onAssign(lead, user)   onToggleSelect(lead)
//   onWhatsApp(lead)         (`whatsAppCheckingId`: the lead being looked up)
const LeadsTable = ({
  leads,
  columnKeys,
  users,
  loading,
  firstIndex,
  pageSize,
  selectedIds,
  onOpen,
  onStageChange,
  onTurnAway,
  onAssign,
  onToggleSelect,
  onWhatsApp,
  whatsAppCheckingId,
}) => {
  const userOptions = useMemo(
    () =>
      users.map((user) => ({ value: user.userName, label: user.userName })),
    [users],
  );

  const columns = useMemo(() => {
    const available = {
      created: {
        header: "Created",
        className: "whitespace-nowrap",
        render: (lead) => (
          <span className="block leading-tight">
            <span className="block text-app-text">
              {formatDateTime(getLeadCreatedAt(lead))}
            </span>
            <span className="text-xs text-app-text-faint">
              {timeAgo(getLeadCreatedAt(lead))}
            </span>
          </span>
        ),
      },
      source: {
        header: "Source",
        render: (lead) => (
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getSourceStyle(lead)}`}
          >
            {getLeadSourceLabel(lead).replace(/_/g, " ")}
          </span>
        ),
      },
      name: {
        header: "Lead",
        className: "whitespace-nowrap",
        render: (lead) => {
          const followUp = FOLLOW_UP_BADGES[getFollowUpState(lead)];
          const stay = getStayDetails(lead);
          return (
            <span className="flex items-center gap-3">
              <LeadAvatar lead={lead} />
              <span className="min-w-0 leading-tight">
                <span className="flex items-center gap-2 font-medium text-app-text">
                  {getLeadName(lead)}
                  {followUp && (
                    <Badge tone={followUp.tone}>{followUp.label}</Badge>
                  )}
                </span>
                {stay.checkIn && (
                  <span className="text-xs text-app-text-faint">
                    Stay {stay.checkIn}
                    {stay.checkOut ? ` – ${stay.checkOut}` : ""}
                  </span>
                )}
              </span>
            </span>
          );
        },
      },
      phone: {
        header: "Phone number",
        className: "whitespace-nowrap tabular-nums",
        render: (lead) => getLeadPhone(lead) || "—",
      },
      email: {
        header: "Email",
        render: (lead) => (
          <span
            className="block max-w-56 truncate text-app-text-muted"
            title={getLeadEmail(lead)}
          >
            {getLeadEmail(lead) || "—"}
          </span>
        ),
      },
      notes: {
        header: "Notes",
        render: (lead) => {
          const note = getLatestNote(lead);
          return (
            <span
              className="block max-w-72 truncate text-app-text-muted"
              title={note}
            >
              {note || "—"}
            </span>
          );
        },
      },
      campaign: {
        header: "Campaign",
        render: (lead) => (
          <span
            className="block max-w-48 truncate text-app-text-muted"
            title={lead.meta?.campaign_name}
          >
            {lead.meta?.campaign_name || "—"}
          </span>
        ),
      },
      assignee: {
        header: "Attempted by",
        render: (lead) => (
          <CellSelect
            id={lead._id}
            value={lead.assignee || "Select"}
            options={userOptions}
            onSelect={(userName) =>
              onAssign(
                lead,
                users.find((user) => user.userName === userName),
              )
            }
          />
        ),
      },
      stage: {
        header: "Stage",
        render: (lead) => (
          <span className="flex items-center gap-2">
            <span
              className={`size-2 shrink-0 rounded-full ${STAGE_DOTS[getStageTone(lead.status)]}`}
              aria-hidden="true"
            />
            <CellSelect
              id={lead._id}
              value={lead.status}
              options={Stages}
              onSelect={(stage) => onStageChange(lead, stage)}
            />
          </span>
        ),
      },
      turnAway: {
        header: "Turn away code",
        render: (lead) => (
          <CellSelect
            id={lead._id}
            value={lead.turnAwayCode || "Select code"}
            options={TurnAwayCode}
            onSelect={(code) => onTurnAway(lead, code)}
          />
        ),
      },
    };

    return [
      {
        key: "select",
        header: "",
        render: (lead) => (
          <input
            type="checkbox"
            aria-label={`Select ${getLeadName(lead)}`}
            className="size-4 cursor-pointer align-middle accent-primary"
            checked={selectedIds.includes(lead._id)}
            onClick={stopRowClick}
            onChange={() => onToggleSelect(lead)}
          />
        ),
      },
      {
        key: "index",
        header: "#",
        className: "tabular-nums text-app-text-muted",
        render: (_, index) => String(firstIndex + index + 1).padStart(2, "0"),
      },
      ...columnKeys.map((key) => ({ key, ...available[key] })),
      {
        key: "actions",
        header: "",
        className: "w-px whitespace-nowrap",
        render: (lead) => {
          const phone = getLeadPhone(lead);
          const checking = whatsAppCheckingId === lead._id;
          return (
            <span
              className="flex items-center justify-end gap-0.5"
              onClick={stopRowClick}
            >
              {phone && (
                <>
                  <IconButton
                    icon={checking ? Loader2 : MessageCircle}
                    label="WhatsApp"
                    tone="success"
                    disabled={checking}
                    className={checking ? "[&_svg]:animate-spin" : ""}
                    onClick={() => onWhatsApp(lead)}
                  />
                  <IconButton
                    icon={Phone}
                    label="Call"
                    onClick={() => window.location.assign(`tel:${phone}`)}
                  />
                </>
              )}
              <Icon icon={ChevronRight} tone="faint" className="ml-1" />
            </span>
          );
        },
      },
    ];
  }, [
    columnKeys,
    users,
    userOptions,
    firstIndex,
    selectedIds,
    onStageChange,
    onTurnAway,
    onAssign,
    onToggleSelect,
    onWhatsApp,
    whatsAppCheckingId,
  ]);

  // a table on a wide screen, cards on phones and tablets
  return (
    <>
      <div className="hidden lg:block">
        <DataTable
          columns={columns}
          rows={leads}
          rowKey={(lead, index) => lead._id || index}
          onRowClick={(lead) =>
            onOpen(lead, firstIndex + leads.indexOf(lead) + 1)
          }
          loading={loading}
          skeletonRows={Math.min(pageSize, 10)}
          emptyMessage="No leads found"
        />
      </div>
      <div className="lg:hidden">
        <LeadCardList
          leads={leads}
          loading={loading}
          firstIndex={firstIndex}
          pageSize={pageSize}
          selectedIds={selectedIds}
          onOpen={onOpen}
          onStageChange={onStageChange}
          onToggleSelect={onToggleSelect}
          onWhatsApp={onWhatsApp}
          whatsAppCheckingId={whatsAppCheckingId}
        />
      </div>
    </>
  );
};

export default LeadsTable;
