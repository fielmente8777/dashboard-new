import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Badge from "../../components/ui/Badge";
import DataTable from "../../components/ui/DataTable";
import PageShell from "../../components/ui/PageShell";
import { ErrorState } from "../../components/ui/States";
import { getApiErrorMessage } from "../../redux/api/baseApi";
import { useGetBookingsQuery } from "../../redux/api/bookingApi";
import { selectHid } from "../../redux/slice/UserSlice";
import { formatDateTime } from "../../services/formateDate";
import BookingDetailsDialog from "./components/BookingDetailsDialog";
import BookingFilters from "./components/BookingFilters";
import {
  formatPrice,
  getPaymentTone,
  isCancelled,
  isCheckedIn,
  isCheckedOut,
} from "./constants";

const YesNo = ({ value }) => (
  <Badge tone={value ? "green" : "gray"}>{value ? "Yes" : "No"}</Badge>
);

const COLUMNS = [
  {
    key: "bookingId",
    header: "Booking ID",
    className: "font-mono text-xs font-semibold",
  },
  {
    key: "guest",
    header: "Guest",
    className: "font-medium",
    render: (booking) => booking.guestInfo?.guestName || "—",
  },
  {
    key: "email",
    header: "Email",
    render: (booking) => booking.guestInfo?.EmailId || "—",
  },
  {
    key: "phone",
    header: "Phone",
    render: (booking) => booking.guestInfo?.Phone || "—",
  },
  {
    key: "checkIn",
    header: "Check-in",
    className: "whitespace-nowrap",
    render: (booking) => formatDateTime(booking.checkIn),
  },
  {
    key: "checkOut",
    header: "Check-out",
    className: "whitespace-nowrap",
    render: (booking) => formatDateTime(booking.checkOut),
  },
  {
    key: "total",
    header: "Total",
    className: "whitespace-nowrap text-right tabular-nums",
    render: (booking) => formatPrice(booking.price?.Total),
  },
  {
    key: "payment",
    header: "Payment",
    render: (booking) => {
      const status = booking.payment?.Status;
      return status ? (
        <Badge tone={getPaymentTone(status)}>{status}</Badge>
      ) : (
        "—"
      );
    },
  },
  {
    key: "checkedIn",
    header: "Checked in",
    render: (booking) =>
      isCancelled(booking) ? "—" : <YesNo value={isCheckedIn(booking)} />,
  },
  {
    key: "checkedOut",
    header: "Checked out",
    render: (booking) =>
      isCancelled(booking) || !isCheckedIn(booking) ? (
        "—"
      ) : (
        <YesNo value={isCheckedOut(booking)} />
      ),
  },
];

const ReservationDesk = () => {
  const hid = useSelector(selectHid);
  // null shows every booking; see BookingFilters for the shapes
  const [filter, setFilter] = useState(null);
  const [openBooking, setOpenBooking] = useState(null);

  const bookings = useGetBookingsQuery(
    { hid, filter },
    { skip: !hid, refetchOnMountOrArgChange: true },
  );

  // shown in the reverse of the API's order, as this table always has
  const rows = useMemo(
    () => [...(bookings.data || [])].reverse(),
    [bookings.data],
  );

  return (
    <PageShell
      title="Reservation Desk"
      description={
        bookings.isFetching
          ? "Loading bookings..."
          : `${rows.length} ${filter ? "matching " : ""}booking${rows.length === 1 ? "" : "s"}`
      }
    >
      <BookingFilters filter={filter} onChange={setFilter} />

      {bookings.isError ? (
        <ErrorState
          message={getApiErrorMessage(
            bookings.error,
            "Could not load the bookings.",
          )}
          onRetry={bookings.refetch}
        />
      ) : (
        <DataTable
          columns={COLUMNS}
          rows={rows}
          rowKey={(booking, index) => booking.bookingId || index}
          onRowClick={setOpenBooking}
          loading={bookings.isFetching || bookings.isUninitialized}
          skeletonRows={7}
          emptyMessage={
            filter ? "No booking matches this filter." : "No bookings yet."
          }
        />
      )}

      <BookingDetailsDialog
        booking={openBooking}
        onClose={() => setOpenBooking(null)}
      />
    </PageShell>
  );
};

export default ReservationDesk;
