import { ArrowRight, BedDouble, Check, Copy, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa6";
import Badge from "../../../components/ui/Badge";
import Drawer from "../../../components/ui/Drawer";
import Icon from "../../../components/ui/Icon";
import {
  formatDay,
  formatPaymentStatus,
  formatPrice,
  getPaymentTone,
  getStayStatus,
  nightsBetween,
} from "../constants";

const sectionClassName = "rounded-xl border border-app-border! bg-app-surface p-4";
const sectionTitleClassName =
  "mb-3 text-[11px] font-semibold uppercase tracking-wider text-app-text-faint";
const contactClassName =
  "inline-flex h-8 items-center gap-1.5 rounded-lg border border-app-border! px-3 text-xs font-medium text-app-text transition-colors hover:bg-app-surface-secondary";

const plural = (count, word) => `${count} ${word}${Number(count) === 1 ? "" : "s"}`;

const StayDate = ({ label, value, align = "left" }) => (
  <div className={`min-w-0 ${align === "right" ? "text-right" : ""}`}>
    <p className="text-[11px] font-medium uppercase tracking-wide text-app-text-faint">
      {label}
    </p>
    <p className="mt-1 text-base font-semibold text-app-text">
      {formatDay(value, { weekday: true })}
    </p>
  </div>
);

const ReceiptRow = ({ label, value, strong = false }) => (
  <div
    className={`flex items-center justify-between gap-3 text-sm ${strong ? "font-semibold text-app-text" : "text-app-text-muted"}`}
  >
    <span>{label}</span>
    <span className="tabular-nums text-app-text">{value}</span>
  </div>
);

// Everything about one booking, in a panel over the page. Closed when `booking` is null.
const BookingDetailsDrawer = ({ booking, onClose }) => {
  const [copied, setCopied] = useState(false);
  if (!booking) return null;

  const guest = booking.guestInfo || {};
  const price = booking.price || {};
  const paymentStatus = booking.payment?.Status;
  const stay = getStayStatus(booking);
  const nights = nightsBetween(booking.checkIn, booking.checkOut);
  const phone = String(guest.Phone || "").replace(/\D/g, "");
  const location = [guest.City, guest.Country?.label].filter(Boolean).join(", ");
  const showPayable =
    price.amountPay !== undefined &&
    price.amountPay !== null &&
    Number(price.amountPay) !== Number(price.Total);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(String(booking.bookingId));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked: nothing to do
    }
  };

  return (
    <Drawer
      open
      title={guest.guestName || "Booking"}
      onClose={onClose}
      header={
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={copyId}
            title="Copy booking ID"
            className="inline-flex items-center gap-1.5 rounded-md border border-app-border! bg-app-bg px-2 py-0.5 font-mono text-xs text-app-text-muted transition-colors hover:text-app-text"
          >
            {booking.bookingId}
            <Icon icon={copied ? Check : Copy} size="xs" className={copied ? "text-emerald-500" : ""} />
          </button>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-app-border! px-2.5 py-0.5 text-xs font-medium text-app-text">
            <span className={`size-1.5 rounded-full ${stay.dot}`} />
            {stay.label}
          </span>
          {paymentStatus && (
            <Badge tone={getPaymentTone(paymentStatus)}>
              {formatPaymentStatus(paymentStatus)}
            </Badge>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        <section className={sectionClassName}>
          <h3 className={sectionTitleClassName}>Stay</h3>
          <div className="flex items-center gap-3">
            <StayDate label="Check-in" value={booking.checkIn} />
            <div className="flex flex-1 flex-col items-center gap-1 px-1">
              <span className="text-[11px] font-medium text-app-text-muted">
                {nights === null ? "" : plural(nights, "night")}
              </span>
              <div className="flex w-full items-center gap-1 text-app-text-faint">
                <span className="h-px flex-1 bg-app-border" />
                <Icon icon={ArrowRight} size="xs" />
              </div>
            </div>
            <StayDate label="Check-out" value={booking.checkOut} align="right" />
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-app-border! pt-4 text-sm">
            <div>
              <dt className="text-xs text-app-text-muted">Adults</dt>
              <dd className="mt-0.5 font-medium text-app-text">{booking.Adults ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-app-text-muted">Kids</dt>
              <dd className="mt-0.5 font-medium text-app-text">{booking.Kids ?? "—"}</dd>
            </div>
          </dl>
        </section>

        {booking.Bookings?.length > 0 && (
          <section className={sectionClassName}>
            <h3 className={sectionTitleClassName}>Rooms</h3>
            <ul className="space-y-2">
              {booking.Bookings.map((room, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 rounded-lg bg-app-bg px-3 py-2.5"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-app-surface text-app-text-muted">
                    <Icon icon={BedDouble} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-app-text">
                    {room.RoomType}
                  </span>
                  <span className="rounded-md bg-app-surface px-2 py-0.5 text-xs font-semibold tabular-nums text-app-text-muted">
                    × {room.Qty}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className={sectionClassName}>
          <h3 className={sectionTitleClassName}>Guest</h3>
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold uppercase text-primary dark:bg-white/10 dark:text-white">
              {String(guest.guestName || "?").charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold capitalize text-app-text">
                {guest.guestName || "—"}
              </p>
              {location && (
                <p className="flex items-center gap-1 text-xs text-app-text-muted">
                  <Icon icon={MapPin} size="xs" /> {location}
                </p>
              )}
            </div>
          </div>

          <dl className="mt-4 space-y-2.5 border-t border-app-border! pt-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-app-text-muted">Email</dt>
              <dd className="min-w-0 truncate font-medium text-app-text">{guest.EmailId || "—"}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-app-text-muted">Phone</dt>
              <dd className="font-medium tabular-nums text-app-text">{guest.Phone || "—"}</dd>
            </div>
            {guest.address && (
              <div className="flex items-start justify-between gap-3">
                <dt className="text-app-text-muted">Address</dt>
                <dd className="min-w-0 text-right font-medium text-app-text">{guest.address}</dd>
              </div>
            )}
          </dl>

          {(phone || guest.EmailId) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {phone && (
                <a href={`tel:+${phone}`} className={contactClassName}>
                  <Icon icon={Phone} size="sm" /> Call
                </a>
              )}
              {phone && (
                <a
                  href={`https://wa.me/${phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={contactClassName}
                >
                  <Icon icon={FaWhatsapp} size="sm" className="text-emerald-500" /> WhatsApp
                </a>
              )}
              {guest.EmailId && (
                <a href={`mailto:${guest.EmailId}`} className={contactClassName}>
                  <Icon icon={Mail} size="sm" /> Email
                </a>
              )}
            </div>
          )}
        </section>

        <section className={sectionClassName}>
          <h3 className={sectionTitleClassName}>Payment</h3>
          <div className="space-y-2">
            <ReceiptRow label="Room charges" value={formatPrice(price.Principal)} />
            <ReceiptRow label="Tax" value={formatPrice(price.Tax)} />
            <div className="my-1 border-t border-dashed border-app-border!" />
            <ReceiptRow label="Total" value={formatPrice(price.Total)} strong />
            {showPayable && (
              <ReceiptRow label="Amount payable" value={formatPrice(price.amountPay)} />
            )}
          </div>
        </section>
      </div>
    </Drawer>
  );
};

export default BookingDetailsDrawer;
