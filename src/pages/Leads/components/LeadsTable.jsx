import { useMemo } from "react";
import Badge from "../../../components/ui/Badge";
import CellSelect from "../../../components/ui/CellSelect";
import DataTable from "../../../components/ui/DataTable";
import { Stages, TurnAwayCode } from "../../../data/constant";
import { formatDateTime } from "../../../utils/formateDate";
import {
  getLatestNote,
  getLeadCreatedAt,
  getLeadName,
  getLeadSourceLabel,
  isFollowUpToday,
} from "../leadUtils";

// cells with their own controls must not open the row
const stopRowClick = (e) => e.stopPropagation();

// The leads list. `columnKeys` picks and orders the columns (see
// leadSources.js). Actions are passed in:
//   onOpen(lead, position)   onStageChange(lead, stage)
//   onTurnAway(lead, code)   onAssign(lead, user)   onToggleSelect(lead)
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
        render: (lead) => formatDateTime(getLeadCreatedAt(lead)),
      },
      source: {
        header: "Source",
        className: "capitalize",
        render: getLeadSourceLabel,
      },
      name: {
        header: "Full name",
        className: "whitespace-nowrap font-medium",
        render: (lead) => (
          <span className="flex items-center gap-2">
            {getLeadName(lead)}
            {isFollowUpToday(lead) && <Badge tone="amber">Follow up</Badge>}
          </span>
        ),
      },
      phone: {
        header: "Phone number",
        className: "whitespace-nowrap",
        render: (lead) =>
          lead.Contact && lead.Contact !== "undefined" ? lead.Contact : "—",
      },
      email: { header: "Email", render: (lead) => lead.Email || "—" },
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
        render: (lead) => lead.meta?.campaign_name || "—",
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
          <CellSelect
            id={lead._id}
            value={lead.status}
            options={Stages}
            onSelect={(stage) => onStageChange(lead, stage)}
          />
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
  ]);

  return (
    <DataTable
      columns={columns}
      rows={leads}
      rowKey={(lead, index) => lead._id || index}
      onRowClick={(lead) => onOpen(lead, firstIndex + leads.indexOf(lead) + 1)}
      loading={loading}
      skeletonRows={Math.min(pageSize, 10)}
      emptyMessage="No leads found"
    />
  );
};

export default LeadsTable;
