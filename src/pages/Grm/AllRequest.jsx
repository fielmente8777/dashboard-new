import {
  CheckCheck,
  ChevronRight,
  Clock,
  Inbox,
  Loader2,
  MessageSquareQuote,
  RefreshCw,
  Search,
  Timer,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";
import { Input } from "../../components/ui/Field";
import Icon from "../../components/ui/Icon";
import PageShell from "../../components/ui/PageShell";
import { ErrorState } from "../../components/ui/States";
import TablePagination from "../../components/ui/TablePagination";
import { useConfirm } from "../../context/ConfirmContext";
import { useToast } from "../../context/ToastContext";
import { hasTenant, useTenant } from "../../hooks/useTenant";
import { getApiErrorMessage } from "../../redux/api/baseApi";
import {
  useGetGuestRequestsQuery,
  useUpdateRequestStatusMutation,
} from "../../redux/api/grmApi";
import RequestDetailsDrawer from "./components/RequestDetailsDrawer";
import {
  ALL_STATUSES,
  LONG_WAIT_MINUTES,
  NEXT_STEP,
  REFRESH_INTERVAL_MS,
  REQUEST_STATUSES,
  getStatus,
} from "./constants";
import {
  formatDateTime,
  formatDuration,
  isToday,
  minutesSince,
  phoneDigits,
  timeAgo,
} from "./requestFormat";

const requestKey = (request) => request.requestId || request._id;

// the current time, ticking every minute so "12 min ago" stays true
const useNow = () => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);
  return now;
};

const SummaryTile = ({ icon, label, value, caption, tone, loading }) => (
  <div className="rounded-xl border border-app-border! bg-app-surface p-4">
    <div className="flex items-center gap-2.5">
      <span className={`flex size-8 items-center justify-center rounded-lg ${tone}`}>
        <Icon icon={icon} />
      </span>
      <p className="text-xs font-medium text-app-text-muted">{label}</p>
    </div>
    {loading ? (
      <div className="mt-3 h-7 w-12 animate-pulse rounded bg-app-surface-secondary" />
    ) : (
      <p className="mt-3 text-2xl font-semibold tabular-nums text-app-text">
        {value}
      </p>
    )}
    <p className="mt-0.5 truncate text-xs text-app-text-muted">{caption}</p>
  </div>
);

const AllRequest = () => {
  const tenant = useTenant();
  const now = useNow();
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const [status, setStatus] = useState(ALL_STATUSES);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedKey, setSelectedKey] = useState(null);
  const [updatingKey, setUpdatingKey] = useState(null);

  const requests = useGetGuestRequestsQuery(tenant, {
    skip: !hasTenant(tenant),
    refetchOnMountOrArgChange: true,
    pollingInterval: REFRESH_INTERVAL_MS,
  });
  const [updateRequestStatus] = useUpdateRequestStatusMutation();
  const loading = requests.isLoading || requests.isUninitialized;

  // newest request first
  const all = useMemo(
    () =>
      [...(requests.data || [])].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      ),
    [requests.data],
  );

  const counts = useMemo(() => {
    const byStatus = Object.fromEntries(REQUEST_STATUSES.map((s) => [s.value, 0]));
    all.forEach((request) => {
      if (request.status in byStatus) byStatus[request.status] += 1;
    });
    return byStatus;
  }, [all]);

  const summary = useMemo(() => {
    const pending = all.filter((r) => r.status === "Pending");
    const oldestPending = pending.reduce(
      (oldest, r) => Math.max(oldest, minutesSince(r.createdAt, now)),
      0,
    );
    return {
      oldestPending: pending.length ? oldestPending : null,
      completedToday: all.filter(
        (r) => r.status === "Completed" && isToday(r.updatedAt || r.createdAt),
      ).length,
      today: all.filter((r) => isToday(r.createdAt)).length,
    };
  }, [all, now]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return all.filter(
      (request) =>
        (status === ALL_STATUSES || request.status === status) &&
        (!term ||
          [
            request.guestName,
            request.guestPhoneNumber,
            request.roomNumber,
            ...(request.requestedItems || []).map((item) => item.item),
          ].some((value) => String(value || "").toLowerCase().includes(term))),
    );
  }, [all, status, search]);

  // back to the first page whenever the filter changes
  useEffect(() => setPage(1), [status, search]);

  const rows = filtered.slice((page - 1) * limit, page * limit);
  const selected = all.find((request) => requestKey(request) === selectedKey);

  const changeStatus = async (request, nextStatus) => {
    if (nextStatus === "Cancelled") {
      const confirmed = await confirm(
        `Cancel the request from room ${request.roomNumber}? The guest's request will be closed without being done.`,
        { title: "Cancel request", confirmText: "Cancel request", cancelText: "Keep it" },
      );
      if (!confirmed) return;
    }

    const key = requestKey(request);
    setUpdatingKey(key);
    try {
      await updateRequestStatus({ requestId: request.requestId, status: nextStatus }).unwrap();
      await requests.refetch();
      showToast({
        type: "success",
        message: `Room ${request.roomNumber}: marked ${getStatus(nextStatus).label}`,
      });
    } catch (error) {
      showToast({
        type: "error",
        message: getApiErrorMessage(error, "Could not update the request."),
      });
    } finally {
      setUpdatingKey(null);
    }
  };

  const columns = [
    {
      key: "guest",
      header: "Guest",
      render: (request) => {
        const phone = phoneDigits(request.guestPhoneNumber);
        return (
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold uppercase text-primary dark:bg-white/10 dark:text-white">
              {String(request.guestName || "?").charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="max-w-44 truncate font-medium capitalize">
                {request.guestName || "Guest"}
              </p>
              {phone && (
                <a
                  href={`tel:+${phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs text-app-text-muted hover:text-blue-500 hover:underline"
                >
                  +{phone}
                </a>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "room",
      header: "Room",
      render: (request) => (
        <div>
          <p className="font-semibold tabular-nums">{request.roomNumber || "—"}</p>
          {request.roomType && (
            <p className="max-w-32 truncate text-xs capitalize text-app-text-muted">
              {request.roomType}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "request",
      header: "Request",
      render: (request) => {
        const items = request.requestedItems || [];
        const shown = items.slice(0, 3);
        return (
          <div className="w-72 max-w-72 whitespace-normal">
            {items.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {shown.map((item, index) => (
                  <span
                    key={item._id || index}
                    className="inline-flex items-center gap-1 rounded-md border border-app-border! bg-app-bg px-1.5 py-0.5 text-xs text-app-text"
                  >
                    {item.item}
                    <span className="font-semibold text-app-text-muted">
                      ×{item.quantity}
                    </span>
                  </span>
                ))}
                {items.length > shown.length && (
                  <span className="rounded-md px-1.5 py-0.5 text-xs font-medium text-app-text-muted">
                    +{items.length - shown.length} more
                  </span>
                )}
              </div>
            )}
            {request.specialRequest && (
              <p
                title={request.specialRequest}
                className={`flex gap-1.5 text-xs italic text-app-text-muted ${items.length ? "mt-1.5" : ""}`}
              >
                <Icon icon={MessageSquareQuote} size="xs" className="mt-0.5 not-italic" />
                <span className="line-clamp-1">{request.specialRequest}</span>
              </p>
            )}
            {!items.length && !request.specialRequest && "—"}
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (request) => {
        const current = getStatus(request.status);
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-app-border! py-0.5 pl-2 pr-2.5 text-xs font-medium text-app-text">
            <span className={`size-1.5 rounded-full ${current.dot}`} />
            {current.label}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      header: "Requested",
      className: "whitespace-nowrap",
      render: (request) => {
        const waited = minutesSince(request.createdAt, now);
        const waitingLong =
          request.status === "Pending" && waited >= LONG_WAIT_MINUTES;
        return (
          <div title={formatDateTime(request.createdAt)}>
            <p className="text-app-text">{timeAgo(request.createdAt, now)}</p>
            {waitingLong ? (
              <p className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                <Icon icon={Clock} size="xs" />
                Waiting {formatDuration(waited)}
              </p>
            ) : (
              <p className="text-xs text-app-text-muted">
                {formatDateTime(request.createdAt)}
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      className: "w-px text-right",
      render: (request) => {
        const next = NEXT_STEP[request.status];
        const updating = updatingKey === requestKey(request);
        return (
          <div className="flex items-center justify-end gap-1">
            {next && (
              <Button
                size="sm"
                variant={request.status === "Pending" ? "primary" : "secondary"}
                icon={next.icon}
                loading={updating}
                disabled={Boolean(updatingKey) && !updating}
                onClick={(e) => {
                  e.stopPropagation();
                  changeStatus(request, next.status);
                }}
              >
                {next.label}
              </Button>
            )}
            <Icon icon={ChevronRight} className="text-app-text-faint" />
          </div>
        );
      },
    },
  ];

  const filters = [
    { value: ALL_STATUSES, label: "All", count: all.length },
    ...REQUEST_STATUSES.map((s) => ({ ...s, count: counts[s.value] })),
  ];

  return (
    <PageShell
      title="Guest Requests"
      description="Requests guests raise by scanning your QR code. The list updates every minute."
      actions={
        <Button
          variant="secondary"
          icon={RefreshCw}
          loading={requests.isFetching && !loading}
          onClick={requests.refetch}
        >
          Refresh
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryTile
          icon={Clock}
          label="Pending"
          value={counts.Pending}
          loading={loading}
          tone="bg-amber-500/12 text-amber-600 dark:text-amber-400"
          caption={
            summary.oldestPending === null
              ? "Nothing waiting"
              : `Oldest waiting ${formatDuration(summary.oldestPending)}`
          }
        />
        <SummaryTile
          icon={Timer}
          label="In progress"
          value={counts["In Progress"]}
          loading={loading}
          tone="bg-blue-500/12 text-blue-600 dark:text-blue-400"
          caption="Being handled by your team"
        />
        <SummaryTile
          icon={CheckCheck}
          label="Completed today"
          value={summary.completedToday}
          loading={loading}
          tone="bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
          caption={`${counts.Completed} completed in total`}
        />
        <SummaryTile
          icon={Inbox}
          label="Requests today"
          value={summary.today}
          loading={loading}
          tone="bg-app-surface-secondary text-app-text-muted"
          caption={`${all.length} in total`}
        />
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div role="tablist" aria-label="Filter by status" className="flex flex-wrap gap-1.5">
            {filters.map((filter) => {
              const active = filter.value === status;
              return (
                <button
                  key={filter.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setStatus(filter.value)}
                  className={`inline-flex h-8 items-center gap-2 rounded-full border px-3 text-xs font-medium transition-colors ${
                    active
                      ? "border-primary! bg-primary text-white dark:border-blue-600! dark:bg-blue-600"
                      : "border-app-border! bg-app-surface text-app-text-muted hover:text-app-text"
                  }`}
                >
                  {filter.dot && (
                    <span
                      className={`size-1.5 rounded-full ${active ? "bg-white" : filter.dot}`}
                    />
                  )}
                  {filter.label}
                  <span
                    className={`tabular-nums ${active ? "text-white/75" : "text-app-text-faint"}`}
                  >
                    {filter.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-72">
            <Icon
              icon={Search}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-app-text-faint"
            />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guest, phone, room or item"
              aria-label="Search requests"
              className="pl-9"
            />
          </div>
        </div>

        {requests.isError ? (
          <ErrorState
            message={getApiErrorMessage(
              requests.error,
              "Could not load the guest requests.",
            )}
            onRetry={requests.refetch}
          />
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={rows}
              rowKey={requestKey}
              onRowClick={(request) => setSelectedKey(requestKey(request))}
              loading={loading}
              skeletonRows={7}
              emptyMessage={
                search || status !== ALL_STATUSES ? (
                  "No request matches this filter."
                ) : (
                  <span className="flex flex-col items-center gap-2">
                    <Icon icon={Inbox} size={28} className="text-app-text-faint" />
                    <span className="font-medium text-app-text">No guest requests yet</span>
                    <span className="text-xs">
                      Requests appear here as soon as guests raise them from the QR code.
                    </span>
                  </span>
                )
              }
            />

            {filtered.length > limit && (
              <TablePagination
                page={page}
                limit={limit}
                total={filtered.length}
                itemLabel="requests"
                onPageChange={setPage}
                onLimitChange={(value) => {
                  setLimit(value);
                  setPage(1);
                }}
              />
            )}
          </>
        )}

        {requests.isFetching && !loading && (
          <p className="flex items-center gap-1.5 text-xs text-app-text-faint">
            <Icon icon={Loader2} size="xs" className="animate-spin" /> Checking for new requests…
          </p>
        )}
      </div>

      {/* room under the last row for the floating assistant button */}
      <div className="h-14" aria-hidden="true" />

      <RequestDetailsDrawer
        request={selected}
        updating={updatingKey === (selected && requestKey(selected))}
        onClose={() => setSelectedKey(null)}
        onChangeStatus={changeStatus}
      />
    </PageShell>
  );
};

export default AllRequest;
