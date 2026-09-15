import { useEffect, useState, useCallback } from "react";
import {
  FiX,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import {
  getEmailCampaign,
  getCampaignRecipients,
} from "../../services/api/emailCampaign.js";

const STATUS_TABS = [
  { key: "", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "sent", label: "Sent" },
  { key: "failed", label: "Failed" },
  { key: "opened", label: "Opened" },
  { key: "clicked", label: "Clicked" },
];

const STATUS_COLORS = {
  pending: "bg-gray-100 text-gray-600",
  sending: "bg-blue-100 text-blue-700",
  sent: "bg-green-100 text-green-700",
  delivered: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  opened: "bg-purple-100 text-purple-700",
  clicked: "bg-indigo-100 text-indigo-700",
  unsubscribed: "bg-yellow-100 text-yellow-700",
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

const StatCard = ({ label, value, accent }) => (
  <div className="flex-1 rounded-xl border border-gray-200 bg-white p-3">
    <p className="text-xs font-medium text-gray-500">{label}</p>
    <p className={`mt-1 text-xl font-semibold ${accent || "text-gray-900"}`}>
      {value ?? 0}
    </p>
  </div>
);

const PAGE_SIZE = 50;

export default function CampaignDetail({ campaignId, onClose }) {
  const [campaign, setCampaign] = useState(null);
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(true);

  const [recipients, setRecipients] = useState([]);
  const [recipientsTotal, setRecipientsTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(false);

  const totalPages = Math.max(1, Math.ceil(recipientsTotal / PAGE_SIZE));

  const loadCampaign = useCallback(async () => {
    try {
      setIsLoadingCampaign(true);
      const res = await getEmailCampaign({ campaignId });
      setCampaign(res?.doc || null);
    } catch (error) {
      console.error("Error loading campaign:", error);
    } finally {
      setIsLoadingCampaign(false);
    }
  }, [campaignId]);

  const loadRecipients = useCallback(async () => {
    try {
      setIsLoadingRecipients(true);
      const res = await getCampaignRecipients({
        campaignId,
        status: statusFilter,
        page,
        limit: PAGE_SIZE,
      });
      setRecipients(res?.doc || []);
      setRecipientsTotal(res?.pagination?.total || 0);
    } catch (error) {
      console.error("Error loading campaign recipients:", error);
    } finally {
      setIsLoadingRecipients(false);
    }
  }, [campaignId, statusFilter, page]);

  useEffect(() => {
    loadCampaign();
  }, [loadCampaign]);

  useEffect(() => {
    loadRecipients();
  }, [loadRecipients]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const refreshAll = () => {
    loadCampaign();
    loadRecipients();
  };

  const stats = campaign?.stats || {};

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/40 p-3 sm:p-5">
      <div className="flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* HEADER */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-gray-900">
              {isLoadingCampaign
                ? "Loading..."
                : campaign?.subject || "Campaign"}
            </h2>
            <p className="mt-1 flex items-center gap-2 text-xs text-gray-500">
              {campaign && <StatusBadge status={campaign.status} />}
              <span>{campaign?.recipientCount ?? 0} recipients</span>
              {campaign?.createdAt && (
                <span>· {new Date(campaign.createdAt).toLocaleString()}</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={refreshAll}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
              aria-label="Refresh"
            >
              <FiRefreshCw size={16} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
              aria-label="Close"
            >
              <FiX size={19} />
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid shrink-0 grid-cols-3 gap-2 border-b border-gray-200 p-3 sm:grid-cols-6 sm:p-4">
          <StatCard label="Sent" value={stats.sent} accent="text-green-600" />
          <StatCard
            label="Delivered"
            value={stats.delivered}
            accent="text-green-600"
          />
          <StatCard label="Failed" value={stats.failed} accent="text-red-600" />
          <StatCard
            label="Opened"
            value={stats.opened}
            accent="text-purple-600"
          />
          <StatCard
            label="Clicked"
            value={stats.clicked}
            accent="text-indigo-600"
          />
          <StatCard
            label="Unsubscribed"
            value={stats.unsubscribed}
            accent="text-yellow-600"
          />
        </div>

        {/* STATUS TABS */}
        <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-gray-200 px-3 py-2 sm:px-5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key || "all"}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                statusFilter === tab.key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* RECIPIENT TABLE */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoadingRecipients ? (
            <div className="flex h-40 items-center justify-center text-sm text-gray-400">
              Loading recipients...
            </div>
          ) : recipients.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-gray-400">
              No recipients
              {statusFilter ? ` with status "${statusFilter}"` : ""}.
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-gray-50 text-xs font-medium text-gray-500">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Sent at</th>
                  <th className="px-4 py-2">Error</th>
                </tr>
              </thead>
              <tbody>
                {recipients.map((r) => (
                  <tr key={r._id} className="border-t border-gray-100">
                    <td className="px-4 py-2 text-gray-800">{r.name || "—"}</td>
                    <td className="px-4 py-2 text-gray-600">{r.email}</td>
                    <td className="px-4 py-2">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-2 text-gray-500">
                      {r.sentAt ? new Date(r.sentAt).toLocaleString() : "—"}
                    </td>
                    <td className="max-w-[220px] truncate px-4 py-2 text-red-500">
                      {r.error || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINATION */}
        <div className="flex shrink-0 items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-5">
          <span className="text-xs text-gray-500">
            {recipientsTotal === 0
              ? "0–0 of 0"
              : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(
                  page * PAGE_SIZE,
                  recipientsTotal,
                )} of ${recipientsTotal}`}
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <FiChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
