import { useMemo } from "react";
import DataCard from "../../components/Card/DataCard";
import { hasTenant, useTenant } from "../../hooks/useTenant";
import { useGetGuestRequestsQuery } from "../../redux/api/grmApi";

const countByStatus = (requests, status) =>
  requests.filter((request) => request.status === status).length;

const Analytics = () => {
  const tenant = useTenant();
  const { data: requests = [] } = useGetGuestRequestsQuery(tenant, {
    skip: !hasTenant(tenant),
  });

  const counts = useMemo(
    () => ({
      total: requests.length,
      pending: countByStatus(requests, "Pending"),
      inProgress: countByStatus(requests, "In Progress"),
      completed: countByStatus(requests, "Completed"),
      cancelled: countByStatus(requests, "Cancelled"),
    }),
    [requests],
  );

  return (
    <div className="bg-app-surface p-4 mb-10 cardShadow">
      <h2 className="text-sm font-semibold text-[#575757]">Request Analytics</h2>

      <div className="grid grid-cols-2 gap-4 mt-4 sm:grid-cols-3 lg:grid-cols-5">
        <DataCard count={String(counts.total)} heading={"Total Requests"} />
        <DataCard count={String(counts.pending)} heading={"Pending"} />
        <DataCard count={String(counts.inProgress)} heading={"In Progress"} />
        <DataCard count={String(counts.completed)} heading={"Completed"} />
        <DataCard count={String(counts.cancelled)} heading={"Cancelled"} />
      </div>
    </div>
  );
};

export default Analytics;
