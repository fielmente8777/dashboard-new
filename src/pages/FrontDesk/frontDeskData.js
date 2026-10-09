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

// Room types become collapsible groups, with one row per room number.
export const buildResources = (rooms) =>
  rooms.map((room, index) => ({
    id: `room-type-${index}`,
    name: room.roomName,
    expanded: true,
    children: (room.roomNumbers || []).map((number) => ({
      id: String(number),
      name: String(number),
    })),
  }));

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
