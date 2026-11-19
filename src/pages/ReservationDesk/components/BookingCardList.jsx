import { ChevronRight } from "lucide-react";
import Badge from "../../../components/ui/Badge";
import Icon from "../../../components/ui/Icon";
import { Skeleton } from "../../../components/ui/States";
import {
  formatPaymentStatus,
  formatPrice,
  getPaymentTone,
  getStayStatus,
  isCancelled,
  nightsBetween,
  plural,
  shortDay,
} from "../constants";

// The bookings list on phones and tablets: one card per booking, two side by
// side on a tablet. Shows the same facts as the table on desktops.
const BookingCardList = ({ bookings, loading, emptyMessage, onOpen }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-44 rounded-xl" />
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="rounded-xl border border-app-border! bg-app-surface px-4 py-10 text-center text-sm text-app-text-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {bookings.map((booking, index) => {
        const guest = booking.guestInfo || {};
        const stay = getStayStatus(booking);
        const paymentStatus = booking.payment?.Status;
        const nights = nightsBetween(booking.checkIn, booking.checkOut);
        const details = [
          nights !== null && plural(nights, "night"),
          booking.Adults && plural(booking.Adults, "adult"),
          Number(booking.Kids) > 0 && plural(booking.Kids, "kid"),
          ...(booking.Bookings || []).map((room) => `${room.RoomType} ×${room.Qty}`),
        ].filter(Boolean);

        return (
          <article
            key={booking.bookingId || index}
            onClick={() => onOpen(booking)}
            className="anim-fade min-w-0 cursor-pointer rounded-xl border border-app-border! bg-app-surface p-4 transition hover:shadow-md active:scale-[0.99]"
          >
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold uppercase text-primary dark:bg-white/10 dark:text-white">
                {String(guest.guestName || "?").charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold capitalize text-app-text">
                  {guest.guestName || "—"}
                </p>
                <p className="truncate text-xs text-app-text-muted">
                  {guest.Phone || guest.EmailId || "No contact"}
                </p>
              </div>
              <span
                className={`shrink-0 text-sm font-semibold tabular-nums ${isCancelled(booking) ? "text-app-text-faint line-through" : "text-app-text"}`}
              >
                {formatPrice(booking.price?.Total)}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 rounded-lg bg-app-surface-secondary/50 px-3 py-2.5">
              <div className="min-w-0">
                <p className="text-[11px] text-app-text-muted">Check-in</p>
                <p className="truncate text-sm font-medium text-app-text">
                  {shortDay(booking.checkIn)}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-app-text-muted">Check-out</p>
                <p className="truncate text-sm font-medium text-app-text">
                  {shortDay(booking.checkOut)}
                </p>
              </div>
            </div>

            {details.length > 0 && (
              <p className="mt-2 truncate text-xs text-app-text-muted">{details.join(" · ")}</p>
            )}

            <div className="mt-3 flex min-w-0 flex-wrap items-center gap-1.5 border-t border-app-border! pt-3">
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-app-border! py-0.5 pl-2 pr-2.5 text-xs font-medium text-app-text">
                <span className={`size-1.5 rounded-full ${stay.dot}`} />
                {stay.label}
              </span>
              {paymentStatus && (
                <Badge tone={getPaymentTone(paymentStatus)}>
                  {formatPaymentStatus(paymentStatus)}
                </Badge>
              )}
              <span className="ml-auto flex min-w-0 items-center gap-1 text-app-text-faint">
                <span className="truncate font-mono text-[11px]">{booking.bookingId}</span>
                <Icon icon={ChevronRight} size="sm" />
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default BookingCardList;
