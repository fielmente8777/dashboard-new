// What each bar colour on the calendar means. Also drawn as the legend.
export const EVENT_KINDS = {
  maintenance: { label: "Maintenance", color: "#d03b3b" },
  paid: { label: "Paid booking", color: "#146618" },
  refund: { label: "Refunded booking", color: "#0e7490" },
  booking: { label: "Other booking", color: "#3263b3" },
};

const getBookingKind = (booking) => {
  const status = booking.payment?.Status;
  if (status === "SUCCESS") return "paid";
  if (status === "REFUND") return "refund";
  return "booking";
};

// Calendar rows: a header row per room type, then one row per room number.
// Room types in `collapsed` show their header only. Header rows hold no
// bookings; isGroupRow() tells them apart.
const GROUP_PREFIX = "room-type-";
export const isGroupRow = (resourceId) => String(resourceId).startsWith(GROUP_PREFIX);

export const buildResources = (rooms, collapsed = new Set()) =>
  rooms.flatMap((room, index) => {
    const id = `${GROUP_PREFIX}${index}`;
    const isCollapsed = collapsed.has(id);
    const header = {
      id,
      name: `${isCollapsed ? "▸" : "▾"} ${room.roomName}`,
      cssClass: "fd-group-row",
    };
    if (isCollapsed) return [header];
    return [
      header,
      ...(room.roomNumbers || []).map((number) => ({
        id: String(number),
        name: String(number),
      })),
    ];
  });

// Maintenance blocks (type "rooms") and bookings (type "bookings") as
// calendar events. `resource` is the room number the bar sits on.
export const buildEvents = (rooms, bookings) => {
  const maintenance = rooms.flatMap((room) =>
    (room.inMaintanance || []).map((block) => ({
      type: "rooms",
      text: String(block.Message),
      start: String(block.start),
      end: String(block.end),
      resource: String(block.roomNumber),
      backColor: EVENT_KINDS.maintenance.color,
    })),
  );

  const stays = bookings.flatMap((booking) =>
    (booking.roomNumbers || []).map((number) => ({
      type: "bookings",
      nodeid: String(booking.bookingId),
      text: String(booking.guestInfo?.guestName || booking.bookingId),
      start: String(booking.checkIn),
      end: String(booking.checkOut),
      resource: String(number),
      backColor: EVENT_KINDS[getBookingKind(booking)].color,
    })),
  );

  return [...maintenance, ...stays].map((event, index) => ({
    ...event,
    id: index + 1,
  }));
};

// The date formats the front desk endpoints expect ("YYYY-MM-DD"). These
// conversions are unchanged from the original calendar code: the end of a
// moved event is sent one day later than the calendar reports it.
export const toDateString = (value) =>
  new Date(value).toISOString().split("T")[0];

export const toNextDayString = (value) => {
  const date = new Date(value);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split("T")[0];
};
