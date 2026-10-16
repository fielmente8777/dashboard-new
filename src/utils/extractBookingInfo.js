// parses "check-in: x, check-out: y, number of guest: n" out of an enquiry message
export const extractBookingInfo = (input) => {
  if (!input) return null;
  const parts = input.split(",");
  const booking = {
    checkIn: "",
    checkOut: "",
    guests: 0,
  };

  parts.forEach((part) => {
    const [key, value] = part.split(":").map((s) => s.trim());
    if (key === "check-in") booking.checkIn = value;
    if (key === "check-out") booking.checkOut = value;
    if (key === "number of guest") booking.guests = parseInt(value, 10);
  });

  return booking;
};
