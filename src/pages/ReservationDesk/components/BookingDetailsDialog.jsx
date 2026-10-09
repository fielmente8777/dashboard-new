import Badge from "../../../components/ui/Badge";
import Dialog from "../../../components/ui/Dialog";
import {
  formatPrice,
  getPaymentTone,
  isCheckedIn,
  isCheckedOut,
} from "../constants";

const Section = ({ title, children }) => (
  <section>
    <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-app-text-muted">
      {title}
    </h3>
    <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
      {children}
    </dl>
  </section>
);

const Detail = ({ label, children }) => (
  <div className="flex gap-2 text-sm">
    <dt className="shrink-0 text-app-text-muted">{label}:</dt>
    <dd className="min-w-0 break-words font-medium text-app-text">
      {children || "—"}
    </dd>
  </div>
);

// Everything about one booking. Closed when `booking` is null.
const BookingDetailsDialog = ({ booking, onClose }) => {
  const guest = booking?.guestInfo;
  const price = booking?.price;
  const status = booking?.payment?.Status;

  return (
    <Dialog
      open={Boolean(booking)}
      onClose={onClose}
      size="lg"
      title={`Booking ${booking?.bookingId || ""}`}
    >
      <div className="space-y-5">
        <Section title="Guest">
          <Detail label="Name">{guest?.guestName}</Detail>
          <Detail label="Email">{guest?.EmailId}</Detail>
          <Detail label="Phone">{guest?.Phone}</Detail>
          <Detail label="City">{guest?.City}</Detail>
          <Detail label="Country">{guest?.Country?.label}</Detail>
          <Detail label="Address">{guest?.address}</Detail>
        </Section>

        <Section title="Stay">
          <Detail label="Check-in">{booking?.checkIn}</Detail>
          <Detail label="Check-out">{booking?.checkOut}</Detail>
          <Detail label="Adults">{booking?.Adults}</Detail>
          <Detail label="Kids">{booking?.Kids}</Detail>
          <Detail label="Checked in">
            {isCheckedIn(booking) ? "Yes" : "No"}
          </Detail>
          <Detail label="Checked out">
            {isCheckedOut(booking) ? "Yes" : "No"}
          </Detail>
        </Section>

        {booking?.Bookings?.length > 0 && (
          <Section title="Rooms">
            {booking.Bookings.map((room, index) => (
              <div
                key={index}
                className="rounded-lg bg-app-surface-secondary px-3 py-2 text-sm text-app-text"
              >
                <span className="font-medium">{room.RoomType}</span>
                <span className="text-app-text-muted"> × {room.Qty}</span>
              </div>
            ))}
          </Section>
        )}

        <Section title="Payment">
          <Detail label="Status">
            {status && <Badge tone={getPaymentTone(status)}>{status}</Badge>}
          </Detail>
          <Detail label="Principal">{formatPrice(price?.Principal)}</Detail>
          <Detail label="Tax">{formatPrice(price?.Tax)}</Detail>
          <Detail label="Total">{formatPrice(price?.Total)}</Detail>
          <Detail label="Amount payable">
            {formatPrice(price?.amountPay)}
          </Detail>
        </Section>
      </div>
    </Dialog>
  );
};

export default BookingDetailsDialog;
