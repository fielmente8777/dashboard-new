import { useEffect, useState, useCallback } from "react";
import {
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiInbox,
} from "react-icons/fi";

import { getEmailCampaigns } from "../../services/api/emailCampaign.js";
import CampaignDetail from "./CampaignDetail";

const STATUS_COLORS = {
  draft: "bg-gray-100 text-gray-600",
  scheduled: "bg-blue-100 text-blue-700",
  sending: "bg-yellow-100 text-yellow-700",
  sent: "bg-green-100 text-green-700",
  paused: "bg-gray-100 text-gray-600",
  failed: "bg-red-100 text-red-700",
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
      STATUS_COLORS[status] || "bg-gray-100 text-gray-600"
    }`}
  >
    {status}
  </span>
);

const PAGE_SIZE = 20;

export default function CampaignsList() {
  const [campaigns, setCampaigns] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const loadCampaigns = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getEmailCampaigns({ page, limit: PAGE_SIZE });
      console.log(res);
      setCampaigns(res?.doc || []);
      setTotal(res?.pagination?.total || 0);
    } catch (error) {
      console.error("Error loading campaigns:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 px-3 sm:px-4 md:h-14 md:px-5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadCampaigns}
            disabled={isLoading}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Refresh campaigns"
          >
            <FiRefreshCw
              size={17}
              className={isLoading ? "animate-spin" : ""}
            />
          </button>
          <span className="text-sm font-medium text-gray-700">Campaigns</span>
        </div>

        <div className="flex items-center gap-0.5">
          <span className="mr-1 whitespace-nowrap text-xs text-gray-600 sm:mr-2 sm:text-sm">
            {total === 0
              ? "0–0 of 0"
              : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total}`}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <FiChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <FiChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex h-52 items-center justify-center text-sm text-gray-400">
            Loading campaigns...
          </div>
        ) : campaigns.length === 0 ? (
          <div className="flex h-52 flex-col items-center justify-center px-5 text-center">
            <FiInbox size={38} className="mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-700">
              No campaigns yet
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Campaigns you send will show up here.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-gray-50 text-xs font-medium text-gray-500">
              <tr>
                <th className="px-4 py-2 sm:px-5">Subject</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Recipients</th>
                <th className="px-4 py-2">Sent</th>
                <th className="px-4 py-2">Failed</th>
                <th className="px-4 py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr
                  key={c._id}
                  onClick={() => setSelectedCampaignId(c._id)}
                  className="cursor-pointer border-t border-gray-100 transition hover:bg-gray-50"
                >
                  <td className="max-w-[280px] truncate px-4 py-3 font-medium text-gray-900 sm:px-5">
                    {c.subject}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.recipientCount}
                  </td>
                  <td className="px-4 py-3 text-green-600">
                    {c.stats?.sent ?? 0}
                  </td>
                  <td className="px-4 py-3 text-red-600">
                    {c.stats?.failed ?? 0}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {c.createdAt
                      ? new Date(c.createdAt).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedCampaignId && (
        <CampaignDetail
          campaignId={selectedCampaignId}
          onClose={() => setSelectedCampaignId(null)}
        />
      )}
    </div>
  );
}
