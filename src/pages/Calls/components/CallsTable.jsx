import { MessageCircle, Phone, Play } from "lucide-react";
import { useMemo } from "react";
import Badge from "../../../components/ui/Badge";
import DataTable from "../../../components/ui/DataTable";
import CellSelect from "../../../components/ui/CellSelect";
import IconButton from "../../../components/ui/IconButton";
import {
  GuestType,
  MasterSegregation,
  Priority,
  Property,
} from "../../../data/constant";
import { timeAgo } from "../../../utils/formateDate";
import { normalizePhoneWithSameFormat } from "../../../utils/normalizePhoneNumber";
import {
  CALL_STAGES,
  formatCallDuration,
  getCallStatusLabel,
  getCallStatusTone,
  isOutgoing,
} from "../callUtils";

// cells with their own controls must not open the row
const stopRowClick = (e) => e.stopPropagation();

// The calls list. Actions are passed in:
//   onOpen(call, position)  onUpdate(call, changes)  onFollowUp(call)
//   onCallBack(call)        onWhatsApp(call)         onPlay(call)
const CallsTable = ({
  calls,
  users,
  loading,
  firstIndex,
  pageSize,
  showProperty,
  onOpen,
  onUpdate,
  onFollowUp,
  onCallBack,
  onWhatsApp,
  onPlay,
}) => {
  // team members by phone number, to show a name instead of their number
  const userNames = useMemo(
    () =>
      new Map(
        users.map((user) => [
          normalizePhoneWithSameFormat(user.phone),
          user.userName,
        ]),
      ),
    [users],
  );

  const columns = useMemo(() => {
    const nameOrNumber = (number) =>
      userNames.get(normalizePhoneWithSameFormat(number)) || number || "—";

    return [
      {
        key: "index",
        header: "#",
        render: (_, index) => String(firstIndex + index + 1).padStart(2, "0"),
      },
      {
        key: "from",
        header: "From",
        render: (call) => nameOrNumber(call.from),
      },
      { key: "to", header: "To", render: (call) => nameOrNumber(call.to) },
      { key: "phoneNumberSid", header: "Phone number" },
      {
        key: "actions",
        header: "Contact",
        render: (call) => (
          <div className="flex gap-1" onClick={stopRowClick}>
            <IconButton
              icon={MessageCircle}
              label="Send a WhatsApp message"
              tone="success"
              onClick={() => onWhatsApp(call)}
            />
            <IconButton
              icon={Phone}
              label="Call back"
              onClick={() => onCallBack(call)}
            />
          </div>
        ),
      },
      {
        key: "direction",
        header: "Direction",
        render: (call) =>
          isOutgoing(call) ? (
            <Badge tone="blue">Outgoing</Badge>
          ) : (
            <Badge tone="purple">Incoming</Badge>
          ),
      },
      {
        key: "status",
        header: "Status",
        render: (call) => (
          <Badge tone={getCallStatusTone(call.status)}>
            {getCallStatusLabel(call.status, call.direction)}
          </Badge>
        ),
      },
      {
        key: "startTime",
        header: "Time",
        className: "whitespace-nowrap",
        render: (call) => (
          <span
            title={
              call.startTime ? new Date(call.startTime).toLocaleString() : ""
            }
          >
            {timeAgo(call.startTime)}
          </span>
        ),
      },
      {
        key: "duration",
        header: "Duration",
        className: "whitespace-nowrap tabular-nums",
        render: (call) => formatCallDuration(call.duration),
      },
      {
        key: "recording",
        header: "Recording",
        render: (call) =>
          call.recordingUrl ? (
            <div onClick={stopRowClick}>
              <IconButton
                icon={Play}
                label="Play recording"
                onClick={() => onPlay(call)}
              />
            </div>
          ) : (
            "—"
          ),
      },
      ...(showProperty
        ? [
            {
              key: "property",
              header: "Property",
              render: (call) => (
                <CellSelect
                  id={call.sid}
                  value={call.property || "Select"}
                  options={Property}
                  onSelect={(property) => onUpdate(call, { property })}
                />
              ),
            },
          ]
        : []),
      {
        key: "segregation",
        header: "Segregation",
        render: (call) => (
          <CellSelect
            id={call.sid}
            value={call.segregation?.value}
            options={MasterSegregation}
            onSelect={(value) =>
              onUpdate(call, { segregation: { label: value, value } })
            }
          />
        ),
      },
      {
        key: "guestType",
        header: "Guest type",
        render: (call) => (
          <CellSelect
            id={call.sid}
            value={call.guestType}
            options={GuestType}
            onSelect={(guestType) => onUpdate(call, { guestType })}
          />
        ),
      },
      {
        key: "priority",
        header: "Priority",
        render: (call) => (
          <CellSelect
            id={call.sid}
            value={call.priority}
            options={Priority}
            onSelect={(priority) => onUpdate(call, { priority })}
          />
        ),
      },
      {
        key: "stage",
        header: "Stage",
        render: (call) => (
          <CellSelect
            id={call.sid}
            value={call.stage}
            options={CALL_STAGES}
            // a follow up also needs a date, which the page asks for
            onSelect={(stage) =>
              stage === "Follow Up"
                ? onFollowUp(call)
                : onUpdate(call, { stage })
            }
          />
        ),
      },
    ];
  }, [
    userNames,
    firstIndex,
    showProperty,
    onUpdate,
    onFollowUp,
    onCallBack,
    onWhatsApp,
    onPlay,
  ]);

  return (
    <DataTable
      columns={columns}
      rows={calls}
      rowKey={(call, index) => call.sid || call._id || index}
      onRowClick={(call) => onOpen(call, firstIndex + calls.indexOf(call) + 1)}
      loading={loading}
      skeletonRows={Math.min(pageSize, 10)}
      emptyMessage="No calls found"
    />
  );
};

export default CallsTable;
