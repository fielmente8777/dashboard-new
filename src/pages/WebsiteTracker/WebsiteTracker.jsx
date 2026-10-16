import React from "react";
import { Skeleton } from "../../components/ui/States";
import { useGetVisitorsQuery } from "../../redux/api/websiteTrackerApi";

const WebsiteTracker = () => {
  const { data: visitors = [], isFetching: loading } = useGetVisitorsQuery(
    { skip: 0, limit: 100 },
    { refetchOnMountOrArgChange: true },
  );

  return (
    <div className="p-4">
      <h1 className="text-md font-medium mb-4">Visitors</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse bg-white">
          <thead className="bg-gray-100 font-normal text-gray-400 text-md">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IP
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Visits
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Visited Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                City
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                State
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Country
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-800">
            {loading ? (
              Array.from({ length: 5 }, (_, row) => (
                <tr key={row}>
                  <td colSpan="12" className="px-4 py-3">
                    <Skeleton className="h-5" />
                  </td>
                </tr>
              ))
            ) : visitors && visitors.length > 0 ? (
              visitors.map((visitor) => (
                <tr
                  key={visitor.ndid}
                  className="hover:bg-gray-50 border-b text-sm font-medium transition-colors"
                >
                  <td className="px-6  py-3">{visitor.ip}</td>
                  <td className="px-6 py-3 font-medium">
                    {visitor.total_visits}
                  </td>
                  <td className="px-6 py-3">
                    {new Date(visitor.first_seen).toLocaleString()}
                  </td>

                  <td className="px-6 py-3">{visitor.location?.city}</td>
                  <td className="px-6 py-3">{visitor.location?.region}</td>
                  <td className="px-6 py-3">{visitor.location?.country}</td>

                  <td className="px-6 py-3 flex gap-2">
                    <button
                      onClick={() =>
                        alert(`Viewing details for NDID: ${visitor.ndid}`)
                      }
                      className="px-3 py-1 rounded-lg bg-blue-500 text-white hover:bg-blue-600 text-xs font-semibold"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="12"
                  className="px-4 py-6 text-center text-gray-500"
                >
                  No visitors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WebsiteTracker;
