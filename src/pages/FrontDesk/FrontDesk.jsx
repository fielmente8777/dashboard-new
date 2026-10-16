import { DayPilot, DayPilotScheduler } from "daypilot-pro-react";
import { BedDouble } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Dialog from "../../components/ui/Dialog";
import { Field, Input } from "../../components/ui/Field";
import PageShell from "../../components/ui/PageShell";
import { EmptyState, ErrorState, Skeleton } from "../../components/ui/States";
import Switch from "../../components/ui/Switch";
import Tabs from "../../components/ui/Tabs";
import { useConfirm } from "../../context/ConfirmContext";
import { useToast } from "../../context/ToastContext";
import { useApiAction } from "../../hooks/useApiAction";
import {
  useAddMaintenanceMutation,
  useDeleteMaintenanceMutation,
  useGetBookingsQuery,
  useGetRoomsQuery,
  useMoveBookingMutation,
  useUpdateMaintenanceMutation,
} from "../../redux/api/bookingApi";
import { selectHid } from "../../redux/slice/UserSlice";
import {
  EVENT_KINDS,
  buildEvents,
  buildResources,
  toDateString,
  toNextDayString,
} from "./frontDeskData";

const ZOOM_TABS = [
  { value: "month", label: "Month" },
  { value: "week", label: "Week" },
];

const getZoomRange = (zoom) => {
  const today = DayPilot.Date.today();
  return zoom === "week"
    ? { startDate: today.firstDayOfWeek(), days: 7 }
    : { startDate: today.firstDayOfMonth(), days: today.daysInMonth() };
};

const QUERY_OPTIONS = { refetchOnMountOrArgChange: true };

// kept outside the component so the calendar is not reconfigured on every render
const TIME_HEADERS = [{ groupBy: "Month" }, { groupBy: "Day", format: "d" }];
const ROW_HEADER_COLUMNS = [{ name: "Room" }];
const styleEvent = (args) => {
  args.data.borderColor = "darker";
  args.data.fontColor = "white";
};

// Room calendar: bookings and maintenance blocks per room. Drag across empty
// days to block a room, drag a bar to move it, click a block to delete it.
const FrontDesk = () => {
  const schedulerRef = useRef(null);
  const hid = useSelector(selectHid);
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const run = useApiAction();

  const rooms = useGetRoomsQuery(hid, { skip: !hid, ...QUERY_OPTIONS });
  const bookings = useGetBookingsQuery({ hid }, { skip: !hid, ...QUERY_OPTIONS });
  const [addMaintenance, { isLoading: isAdding }] = useAddMaintenanceMutation();
  const [updateMaintenance] = useUpdateMaintenanceMutation();
  const [deleteMaintenance] = useDeleteMaintenanceMutation();
  const [moveBooking] = useMoveBookingMutation();

  const [zoom, setZoom] = useState("month");
  const [autoWidth, setAutoWidth] = useState(true);
  // { start, end, resource, message } while the "block room" dialog is open
  const [newBlock, setNewBlock] = useState(null);

  const zoomRange = useMemo(() => getZoomRange(zoom), [zoom]);
  const resources = useMemo(() => buildResources(rooms.data || []), [rooms.data]);
  const events = useMemo(
    () => buildEvents(rooms.data || [], bookings.data || []),
    [rooms.data, bookings.data],
  );

  const closeNewBlock = useCallback(() => {
    schedulerRef.current?.control.clearSelection();
    setNewBlock(null);
  }, []);

  const handleRangeSelected = useCallback((args) => {
    setNewBlock({
      start: toDateString(args.start),
      end: toDateString(args.end),
      resource: args.resource,
      message: "",
    });
  }, []);

  const handleAddBlock = async (e) => {
    e.preventDefault();

    const added = await run(
      addMaintenance({
        hid,
        roomNumber: newBlock.resource,
        Message: newBlock.message.trim(),
        start: newBlock.start,
        end: newBlock.end,
      }),
      { success: "Room blocked", error: "Could not block the room." },
    );
    if (added) closeNewBlock();
  };

  const handleEventMoved = useCallback(
    async (args) => {
      const { cache, data } = args.e;
      const move = {
        hid,
        oldroomNumber: cache.resource,
        oldstart: toDateString(cache.start),
        oldend: toNextDayString(cache.end),
        newroomNumber: args.newResource,
        newstart: toDateString(args.newStart),
        newend: toNextDayString(args.newEnd),
      };

      const moved = await run(
        cache.type === "rooms"
          ? updateMaintenance({ ...move, Message: cache.text })
          : moveBooking({ ...move, bookingId: data.nodeid }),
        { success: `Moved: ${data.text}`, error: "Could not move it." },
      );

      // the calendar already shows the bar in its new place: put it back
      if (!moved) schedulerRef.current?.control.update({ events });
    },
    [hid, events, run, updateMaintenance, moveBooking],
  );

  const handleEventClick = useCallback(
    async (args) => {
      const event = args.e.data;

      if (event.type !== "rooms") {
        showToast({
          message: `Booking ${event.nodeid} · ${event.text}`,
          type: "info",
        });
        return;
      }

      const confirmed = await confirm(
        `Remove the block "${event.text}" from room ${event.resource}?`,
        { title: "Remove maintenance block", confirmText: "Remove" },
      );
      if (!confirmed) return;

      await run(
        deleteMaintenance({
          hid,
          roomNumber: event.resource,
          Message: event.text,
          start: toDateString(event.start),
          end: toDateString(event.end),
        }),
        { success: "Block removed", error: "Could not remove the block." },
      );
    },
    [hid, confirm, run, showToast, deleteMaintenance],
  );

  const isLoading = rooms.isLoading || rooms.isUninitialized;

  return (
    <PageShell
      title="Front Desk"
      description="Bookings and maintenance blocks per room. Drag across empty days to block a room, drag a bar to move it."
      actions={
        <>
          <label className="flex items-center gap-2 text-sm text-app-text-muted">
            <Switch
              checked={autoWidth}
              onChange={setAutoWidth}
              label="Fit days to the screen"
            />
            Fit to screen
          </label>
          <Tabs tabs={ZOOM_TABS} value={zoom} onChange={setZoom} />
        </>
      }
    >
      {isLoading && <Skeleton className="h-96" />}

      {rooms.isError && (
        <ErrorState message="Could not load the rooms." onRetry={rooms.refetch} />
      )}

      {!isLoading && !rooms.isError && resources.length === 0 && (
        <EmptyState
          icon={BedDouble}
          title="No rooms yet"
          description="Add rooms in Booking Engine to see them on the calendar."
        />
      )}

      {!isLoading && resources.length > 0 && (
        <Card>
          <ul className="mb-4 flex flex-wrap gap-x-5 gap-y-2">
            {Object.values(EVENT_KINDS).map((kind) => (
              <li
                key={kind.label}
                className="flex items-center gap-2 text-xs text-app-text-muted"
              >
                <span
                  className="size-2.5 rounded-sm"
                  style={{ backgroundColor: kind.color }}
                />
                {kind.label}
              </li>
            ))}
          </ul>

          <DayPilotScheduler
            ref={schedulerRef}
            {...zoomRange}
            scale="Day"
            timeHeaders={TIME_HEADERS}
            cellWidthSpec={autoWidth ? "Auto" : "Fixed"}
            cellWidth={50}
            durationBarVisible={false}
            treeEnabled
            rowHeaderColumns={ROW_HEADER_COLUMNS}
            resources={resources}
            events={events}
            onTimeRangeSelected={handleRangeSelected}
            onEventMoved={handleEventMoved}
            onEventClick={handleEventClick}
            onBeforeEventRender={styleEvent}
          />
        </Card>
      )}

      <Dialog
        open={Boolean(newBlock)}
        onClose={closeNewBlock}
        title={`Block room ${newBlock?.resource || ""}`}
        description={
          newBlock ? `From ${newBlock.start} to ${newBlock.end}` : ""
        }
      >
        <form onSubmit={handleAddBlock} className="space-y-4">
          <Field label="Reason">
            <Input
              autoFocus
              value={newBlock?.message || ""}
              onChange={(e) =>
                setNewBlock({ ...newBlock, message: e.target.value })
              }
              placeholder="e.g. AC repair"
            />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={closeNewBlock}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isAdding}
              disabled={!newBlock?.message.trim()}
            >
              Block room
            </Button>
          </div>
        </form>
      </Dialog>
    </PageShell>
  );
};

export default FrontDesk;
