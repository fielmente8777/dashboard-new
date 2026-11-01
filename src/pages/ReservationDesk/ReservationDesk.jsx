import {
  CalendarCheck,
  ChevronRight,
  IndianRupee,
  LogIn,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";
import Icon from "../../components/ui/Icon";
import PageShell from "../../components/ui/PageShell";
import { ErrorState } from "../../components/ui/States";
import TablePagination from "../../components/ui/TablePagination";
import { getApiErrorMessage } from "../../redux/api/baseApi";
import { useGetBookingsQuery } from "../../redux/api/bookingApi";
import { selectHid } from "../../redux/slice/UserSlice";
import BookingDetailsDrawer from "./components/BookingDetailsDrawer";
import BookingFilters from "./components/BookingFilters";
import {
  formatDay,
  formatPaymentStatus,
  formatPrice,
  getPaymentTone,
  getStayStatus,
  isCancelled,
  isCheckedIn,
  isCheckedOut,
  isSameDay,
  nightsBetween,
} from "./constants";

const plural = (count, word) => `${count} ${word}${Number(count) === 1 ? "" : "s"}`;

// "12 Nov" for the table, where the year is usually obvious
const shortDay = (value) => formatDay(value).replace(/ \d{4}$/, "");

const SummaryTile = ({ icon, label, value, caption, tone, loading }) => (
  <div className="rounded-xl border border-app-border! bg-app-surface p-4">
    <div className="flex items-center gap-2.5">
      <span className={`flex size-8 items-center justify-center rounded-lg ${tone}`}>
        <Icon icon={icon} />
      </span>
      <p className="text-xs font-medium text-app-text-muted">{label}</p>
    </div>
    {loading ? (
      <div className="mt-3 h-7 w-16 animate-pulse rounded bg-app-surface-secondary" />
    ) : (
      <p className="mt-3 truncate text-2xl font-semibold tabular-nums text-app-text">
        {value}
      </p>
    )}
    <p className="mt-0.5 truncate text-xs text-app-text-muted">{caption}</p>
  </div>
);

const COLUMNS = [
  {
    key: "guest",
    header: "Guest",
    render: (booking) => {
      const guest = booking.guestInfo || {};
      return (
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold uppercase text-primary dark:bg-white/10 dark:text-white">
            {String(guest.guestName || "?").charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="max-w-48 truncate font-medium capitalize">
              {guest.guestName || "—"}
            </p>
            <p className="max-w-48 truncate text-xs text-app-text-muted">
              {guest.Phone || guest.EmailId || "No contact"}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    key: "bookingId",
    header: "Booking",
    render: (booking) => {
      const rooms = booking.Bookings || [];
      return (
        <div>
          <p className="font-mono text-xs font-semibold text-app-text">
            {booking.bookingId || "—"}
          </p>
          {rooms.length > 0 && (
            <p className="max-w-44 truncate text-xs text-app-text-muted">
              {rooms.map((room) => `${room.RoomType} ×${room.Qty}`).join(", ")}
            </p>
          )}
        </div>
      );
    },
  },
  {
    key: "stay",
    header: "Stay",
    className: "whitespace-nowrap",
    render: (booking) => {
      const nights = nightsBetween(booking.checkIn, booking.checkOut);
      const guests = [
        booking.Adults && plural(booking.Adults, "adult"),
        Number(booking.Kids) > 0 && plural(booking.Kids, "kid"),
      ].filter(Boolean);
      return (
        <div>
          <p className="font-medium text-app-text">
            {shortDay(booking.checkIn)}
            <span className="mx-1.5 text-app-text-faint">→</span>
            {shortDay(booking.checkOut)}
          </p>
          <p className="text-xs text-app-text-muted">
            {[nights !== null && plural(nights, "night"), ...guests]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      );
    },
  },
  {
    key: "status",
    header: "Status",
    render: (booking) => {
      const stay = getStayStatus(booking);
      return (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-app-border! py-0.5 pl-2 pr-2.5 text-xs font-medium text-app-text">
          <span className={`size-1.5 rounded-full ${stay.dot}`} />
          {stay.label}
        </span>
      );
    },
  },
  {
    key: "payment",
    header: "Payment",
    render: (booking) => {
      const status = booking.payment?.Status;
      return status ? (
        <Badge tone={getPaymentTone(status)}>{formatPaymentStatus(status)}</Badge>
      ) : (
        "—"
      );
    },
  },
  {
    key: "total",
    header: <span className="block text-right">Amount</span>,
    className: "whitespace-nowrap text-right",
    render: (booking) => (
      <span
        className={`font-semibold tabular-nums ${isCancelled(booking) ? "text-app-text-faint line-through" : "text-app-text"}`}
      >
        {formatPrice(booking.price?.Total)}
      </span>
    ),
  },
  {
    key: "open",
    header: <span className="sr-only">Open</span>,
    className: "w-px",
    render: () => <Icon icon={ChevronRight} className="text-app-text-faint" />,
  },
];

const ReservationDesk = () => {
  const hid = useSelector(selectHid);
  // null shows every booking; see BookingFilters for the shapes
  const [filter, setFilter] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [openBooking, setOpenBooking] = useState(null);

  const bookings = useGetBookingsQuery(
    { hid, filter },
    { skip: !hid, refetchOnMountOrArgChange: true },
  );
  const loading = bookings.isFetching || bookings.isUninitialized;

  // shown in the reverse of the API's order, as this table always has
  const all = useMemo(
    () => [...(bookings.data || [])].reverse(),
    [bookings.data],
  );

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return all;
    return all.filter((booking) =>
      [
        booking.bookingId,
        booking.guestInfo?.guestName,
        booking.guestInfo?.Phone,
        booking.guestInfo?.EmailId,
      ].some((value) => String(value || "").toLowerCase().includes(term)),
    );
  }, [all, search]);

  // back to the first page whenever the list changes
  useEffect(() => setPage(1), [filter, search]);

  const summary = useMemo(() => {
    const active = all.filter((booking) => !isCancelled(booking));
    return {
      arrivals: active.filter(
        (b) => isSameDay(b.checkIn) && !isCheckedOut(b),
      ).length,
      departures: active.filter(
        (b) => isSameDay(b.checkOut) && !isCheckedOut(b),
      ).length,
      inHouse: active.filter((b) => isCheckedIn(b) && !isCheckedOut(b)).length,
      revenue: active.reduce((sum, b) => sum + (Number(b.price?.Total) || 0), 0),
      cancelled: all.length - active.length,
    };
  }, [all]);

  const pageRows = rows.slice((page - 1) * limit, page * limit);
  const scope = filter || search ? "in this view" : "across all bookings";

  return (
    <PageShell
      title="Reservation Desk"
      description="Every booking from your booking engine, with today's arrivals and departures."
      actions={
        <Button
          variant="secondary"
          icon={RefreshCw}
          loading={bookings.isFetching && !bookings.isUninitialized}
          onClick={bookings.refetch}
        >
          Refresh
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryTile
          icon={LogIn}
          label="Arrivals today"
          value={summary.arrivals}
          loading={loading}
          tone="bg-amber-500/12 text-amber-600 dark:text-amber-400"
          caption="Checking in today"
        />
        <SummaryTile
          icon={LogOut}
          label="Departures today"
          value={summary.departures}
          loading={loading}
          tone="bg-blue-500/12 text-blue-600 dark:text-blue-400"
          caption="Checking out today"
        />
        <SummaryTile
          icon={CalendarCheck}
          label="In house"
          value={summary.inHouse}
          loading={loading}
          tone="bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
          caption="Guests staying now"
        />
        <SummaryTile
          icon={IndianRupee}
          label="Booking value"
          value={formatPrice(summary.revenue)}
          loading={loading}
          tone="bg-app-surface-secondary text-app-text-muted"
          caption={`${plural(all.length - summary.cancelled, "booking")} ${scope}`}
        />
      </div>

      <div className="space-y-3">
        <BookingFilters
          search={search}
          onSearchChange={setSearch}
          filter={filter}
          onChange={setFilter}
        />

        {bookings.isError ? (
          <ErrorState
            message={getApiErrorMessage(
              bookings.error,
              "Could not load the bookings.",
            )}
            onRetry={bookings.refetch}
          />
        ) : (
          <>
            {!loading && (
              <p className="text-xs text-app-text-muted">
                {rows.length === all.length
                  ? plural(rows.length, "booking")
                  : `${rows.length} of ${plural(all.length, "booking")}`}
                {filter && " matching the filter"}
              </p>
            )}

            <DataTable
              columns={COLUMNS}
              rows={pageRows}
              rowKey={(booking, index) => booking.bookingId || index}
              onRowClick={setOpenBooking}
              loading={loading}
              skeletonRows={7}
              emptyMessage={
                filter || search ? (
                  "No booking matches this search or filter."
                ) : (
                  <span className="flex flex-col items-center gap-2">
                    <Icon icon={CalendarCheck} size={28} className="text-app-text-faint" />
                    <span className="font-medium text-app-text">No bookings yet</span>
                    <span className="text-xs">
                      Bookings made on your booking engine will appear here.
                    </span>
                  </span>
                )
              }
            />

            {rows.length > limit && (
              <TablePagination
                page={page}
                limit={limit}
                total={rows.length}
                itemLabel="bookings"
                onPageChange={setPage}
                onLimitChange={(value) => {
                  setLimit(value);
                  setPage(1);
                }}
              />
            )}
          </>
        )}
      </div>

      {/* room under the last row for the floating assistant button */}
      <div className="h-14" aria-hidden="true" />

      <BookingDetailsDrawer
        booking={openBooking}
        onClose={() => setOpenBooking(null)}
      />
    </PageShell>
  );
};

export default ReservationDesk;
