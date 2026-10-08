import React, { useCallback, useEffect, useState } from "react";
import {
  MdChevronLeft,
  MdChevronRight,
  MdErrorOutline,
  MdRefresh,
} from "react-icons/md";
import { getWhatsAppTransactions } from "../../../../../services/api/whatsApp";
import { formatMoney } from "./utils";

const PAGE_SIZE = 10;

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const STATUS_STYLES = {
  paid: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  failed: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  created:
    "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
      STATUS_STYLES[status] || STATUS_STYLES.created
    }`}
  >
    {status}
  </span>
);

const WhatsAppTransactions = ({ refreshKey = 0, currency = "INR" }) => {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: PAGE_SIZE,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (pageToLoad) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getWhatsAppTransactions({
        page: pageToLoad,
        limit: PAGE_SIZE,
      });
      if (res?.success) {
        setItems(res?.result?.docs?.items || []);
        setPagination(
          res?.result?.docs?.pagination || {
            page: 1,
            totalPages: 1,
            total: 0,
            limit: PAGE_SIZE,
          },
        );
      } else {
        setError(res?.responseMessage || "Couldn't load transactions.");
      }
    } catch (err) {
      setError(err?.message || "Couldn't load transactions.");
    } finally {
      setLoading(false);
    }
  }, []);

  // a new payment means the newest entry is on page 1
  useEffect(() => {
    setPage(1);
  }, [refreshKey]);

  useEffect(() => {
    load(page);
  }, [page, refreshKey, load]);

  const { total, totalPages, limit } = pagination;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <MdErrorOutline className="w-8 h-8 text-red-500" />
        <p className="text-sm text-gray-600 dark:text-app-text-muted">
          {error}
        </p>
        <button
          onClick={() => load(page)}
          className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-app-text-muted hover:bg-primary/10"
        >
          <MdRefresh size={18} /> Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/40 text-xs uppercase text-gray-500 dark:text-app-text-faint">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">Payment ID</th>
              <th className="px-4 py-3 text-left font-medium">Order ID</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 rounded bg-gray-100 dark:bg-gray-800" />
                    </td>
                  ))}
                </tr>
              ))}

            {!loading && items.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-gray-500 dark:text-app-text-faint"
                >
                  No transactions yet. Recharges will appear here.
                </td>
              </tr>
            )}

            {!loading &&
              items.map((t) => (
                <tr key={t._id}>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-app-text-muted">
                    {formatDateTime(t.paidAt || t.createdAt)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-app-text-muted">
                    {t.razorpayPaymentId || "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-app-text-faint">
                    {t.razorpayOrderId}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-green-600 dark:text-green-400 whitespace-nowrap">
                    +{formatMoney(t.amount, t.currency || currency)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500 dark:text-app-text-faint">
          <span>
            Showing {from}–{to} of {total}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1 || loading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MdChevronLeft size={18} /> Prev
            </button>

            <span className="px-1">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages || loading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <MdChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppTransactions;
