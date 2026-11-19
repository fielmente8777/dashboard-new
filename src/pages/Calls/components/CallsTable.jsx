import {
  ChevronRight,
  Loader2,
  MessageCircle,
  Phone,
  Play,
} from "lucide-react";
import { useMemo } from "react";
import Badge from "../../../components/ui/Badge";
import CellSelect from "../../../components/ui/CellSelect";
import DataTable from "../../../components/ui/DataTable";
import Icon from "../../../components/ui/Icon";
import IconButton from "../../../components/ui/IconButton";
import {
  GuestType,
  MasterSegregation,
  Priority,
  Property,
} from "../../../data/constant";
import { timeAgo } from "../../../utils/formateDate";
import {
  CALL_STAGES,
  formatCallDuration,
  getCallOutcome,
  getGuestNumber,
  getStaffNumber,
  isOutgoing,
} from "../callUtils";
import { useStaffNames } from "../hooks/useStaffNames";
import CallCardList from "./CallCardList";
import DirectionTile from "./DirectionTile";

// cells with their own controls must not open the row
const stopRowClick = (e) => e.stopPropagation();

// The calls list: a table on a wide screen, cards on phones and tablets.
// Actions are passed in:
//   onOpen(call, position)  onUpdate(call, changes)  onFollowUp(call)
//   onCallBack(call)        onWhatsApp(call)         onPlay(call)
// `whatsAppCheckingId` is the call whose chat is being looked up.
const CallsTable = ({
  calls,
  users,
  loading,
  firstIndex,
  pageSize,
  showProperty,
  whatsAppCheckingId,
  onOpen,
  onUpdate,
  onFollowUp,
  onCallBack,
  onWhatsApp,
  onPlay,
}) => {
  const staffName = useStaffNames(users);

  const columns = useMemo(
    () => [
      {
        key: "index",
        header: "#",
        className: "tabular-nums text-app-text-muted",
        render: (_, index) => String(firstIndex + index + 1).padStart(2, "0"),
      },
      {
        key: "guest",
        header: "Guest",
        className: "whitespace-nowrap",
        render: (call) => {
          const staff = staffName(getStaffNumber(call));
          return (
            <span className="flex items-center gap-3">
              <DirectionTile call={call} />
              <span className="min-w-0 leading-tight">
                <span className="block font-medium tabular-nums text-app-text">
                  {call.callerName || getGuestNumber(call) || "—"}
                </span>
                <span className="text-xs text-app-text-faint">
                  {isOutgoing(call) ? "Called by" : "Answered by"}{" "}
                  {staff || "—"}
                </span>
              </span>
            </span>
          );
        },
      },
      {
        key: "status",
        header: "Outcome",
        render: (call) => {
          const outcome = getCallOutcome(call);
          return <Badge tone={outcome.tone}>{outcome.label}</Badge>;
        },
      },
      {
        key: "startTime",
        header: "Time",
        className: "whitespace-nowrap",
        render: (call) => (
          <span className="block leading-tight">
            <span className="block text-app-text">
              {call.startTime
                ? new Date(call.startTime).toLocaleString(undefined, {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : "—"}
            </span>
            <span className="text-xs text-app-text-faint">
              {timeAgo(call.startTime)}
            </span>
          </span>
        ),
      },
      {
        key: "duration",
        header: "Talk time",
        className: "whitespace-nowrap tabular-nums",
        render: (call) => formatCallDuration(call.duration),
      },
      {
        key: "recording",
        header: "Recording",
        render: (call) =>
          call.recordingUrl ? (
            <button
              type="button"
              onClick={(e) => {
                stopRowClick(e);
                onPlay(call);
              }}
              className="inline-flex h-7 items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 text-xs font-medium text-blue-600 transition hover:bg-blue-500/20 dark:text-blue-300"
            >
              <Icon icon={Play} size="xs" />
              Play
            </button>
          ) : (
            <span className="text-app-text-faint">—</span>
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
            // a follow up also needs a date, which the page asks for; until
            // it is saved the stage stays as it was (false)
            onSelect={(stage) => {
              if (stage === "Follow Up") {
                onFollowUp(call);
                return false;
              }
              onUpdate(call, { stage, followUpDate: null });
            }}
          />
        ),
      },
      {
        key: "actions",
        header: "",
        className: "w-px whitespace-nowrap",
        render: (call) => {
          const checking = whatsAppCheckingId === call.sid;
          return (
            <span
              className="flex items-center justify-end gap-0.5"
              onClick={stopRowClick}
            >
              <IconButton
                icon={checking ? Loader2 : MessageCircle}
                label="WhatsApp"
                tone="success"
                disabled={checking}
                className={checking ? "[&_svg]:animate-spin" : ""}
                onClick={() => onWhatsApp(call)}
              />
              <IconButton
                icon={Phone}
                label="Call back"
                onClick={() => onCallBack(call)}
              />
              <Icon icon={ChevronRight} tone="faint" className="ml-1" />
            </span>
          );
        },
      },
    ],
    [
      staffName,
      firstIndex,
      showProperty,
      whatsAppCheckingId,
      onUpdate,
      onFollowUp,
      onCallBack,
      onWhatsApp,
      onPlay,
    ],
  );

  return (
    <>
      <div className="hidden lg:block">
        <DataTable
          columns={columns}
          rows={calls}
          rowKey={(call, index) => call.sid || call._id || index}
          onRowClick={(call) =>
            onOpen(call, firstIndex + calls.indexOf(call) + 1)
          }
          loading={loading}
          skeletonRows={Math.min(pageSize, 10)}
          emptyMessage="No calls found"
        />
      </div>
      <div className="lg:hidden">
        <CallCardList
          calls={calls}
          loading={loading}
          firstIndex={firstIndex}
          pageSize={pageSize}
          staffName={staffName}
          whatsAppCheckingId={whatsAppCheckingId}
          onOpen={onOpen}
          onUpdate={onUpdate}
          onFollowUp={onFollowUp}
          onCallBack={onCallBack}
          onWhatsApp={onWhatsApp}
          onPlay={onPlay}
        />
      </div>
    </>
  );
};

export default CallsTable;
