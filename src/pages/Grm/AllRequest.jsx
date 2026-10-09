import { RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";
import { Input } from "../../components/ui/Field";
import PageShell from "../../components/ui/PageShell";
import { ErrorState } from "../../components/ui/States";
import Tabs from "../../components/ui/Tabs";
import { hasTenant, useTenant } from "../../hooks/useTenant";
import { getApiErrorMessage } from "../../redux/api/baseApi";
import { useGetGuestRequestsQuery } from "../../redux/api/grmApi";
import {
  ALL_STATUSES,
  REFRESH_INTERVAL_MS,
  REQUEST_STATUSES,
  getStatus,
} from "./constants";

const COLUMNS = [
  {
    key: "guestName",
    header: "Guest",
    className: "font-medium capitalize",
  },
  {
    key: "guestPhoneNumber",
    header: "Phone",
    render: (request) =>
      request.guestPhoneNumber ? (
        <a
          href={`tel:+${request.guestPhoneNumber}`}
          className="hover:text-blue-500 hover:underline"
        >
          {request.guestPhoneNumber}
        </a>
      ) : (
        "—"
      ),
  },
  { key: "roomNumber", header: "Room", className: "font-medium" },
  {
    key: "requestedItems",
    header: "Requested items",
    render: (request) =>
      request.requestedItems?.length ? (
        <ul className="space-y-0.5">
          {request.requestedItems.map((item, index) => (
            <li key={item._id || index}>
              {item.item}
              <span className="text-app-text-muted"> × {item.quantity}</span>
            </li>
          ))}
        </ul>
      ) : (
        "—"
      ),
  },
  {
    key: "specialRequest",
    header: "Special request",
    render: (request) =>
      request.specialRequest ? (
        <p
          className="line-clamp-2 w-56 whitespace-normal"
          title={request.specialRequest}
        >
          {request.specialRequest}
        </p>
      ) : (
        "—"
      ),
  },
  {
    key: "status",
    header: "Status",
    render: (request) => {
      const status = getStatus(request.status);
      return <Badge tone={status.tone}>{status.label}</Badge>;
    },
  },
  {
    key: "createdAt",
    header: "Requested",
    className: "whitespace-nowrap",
    render: (request) =>
      request.createdAt ? new Date(request.createdAt).toLocaleString() : "—",
  },
];

const AllRequest = () => {
  const tenant = useTenant();
  const [status, setStatus] = useState(ALL_STATUSES);
  const [search, setSearch] = useState("");

  const requests = useGetGuestRequestsQuery(tenant, {
    skip: !hasTenant(tenant),
    refetchOnMountOrArgChange: true,
    pollingInterval: REFRESH_INTERVAL_MS,
  });

  // newest request first
  const all = useMemo(
    () =>
      [...(requests.data || [])].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      ),
    [requests.data],
  );

  const tabs = useMemo(
    () => [
      { value: ALL_STATUSES, label: `All (${all.length})` },
      ...REQUEST_STATUSES.map(({ value, label }) => ({
        value,
        label: `${label} (${all.filter((r) => r.status === value).length})`,
      })),
    ],
    [all],
  );

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();

    return all.filter(
      (request) =>
        (status === ALL_STATUSES || request.status === status) &&
        (!term ||
          [request.guestName, request.guestPhoneNumber, request.roomNumber].some(
            (value) => String(value || "").toLowerCase().includes(term),
          )),
    );
  }, [all, status, search]);

  return (
    <PageShell
      title="Guest Requests"
      description="Requests raised by guests from the GRM site. The list refreshes every minute."
      actions={
        <>
          <div className="w-60">
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, phone or room"
              aria-label="Search requests"
            />
          </div>
          <Button
            variant="secondary"
            icon={RefreshCw}
            loading={requests.isFetching}
            onClick={requests.refetch}
          >
            Refresh
          </Button>
        </>
      }
    >
      <Tabs tabs={tabs} value={status} onChange={setStatus} />

      {requests.isError ? (
        <ErrorState
          message={getApiErrorMessage(
            requests.error,
            "Could not load the guest requests.",
          )}
          onRetry={requests.refetch}
        />
      ) : (
        <DataTable
          columns={COLUMNS}
          rows={rows}
          rowKey={(request, index) => request._id || request.requestId || index}
          loading={requests.isLoading || requests.isUninitialized}
          skeletonRows={7}
          emptyMessage={
            search || status !== ALL_STATUSES
              ? "No request matches this filter."
              : "No guest requests yet."
          }
        />
      )}
    </PageShell>
  );
};

export default AllRequest;
