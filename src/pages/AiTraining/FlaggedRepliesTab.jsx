// Suggested location: src/pages/AiTraining/FlaggedRepliesTab.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Check,
  Loader2,
  AlertCircle,
  MessageSquareWarning,
  ThumbsDown,
} from "lucide-react";
import { authHeaders, getTenantContext } from "../../utils/dashboardApi";
import { FEEDBACK_ENDPOINT, CATEGORIES } from "./shared";

function FeedbackCard({ item, onApprove, onDismiss }) {
  const [suggestedRule, setSuggestedRule] = useState(item.suggestedRule || "");
  const [category, setCategory] = useState(item.category || "other");
  const [busy, setBusy] = useState(false);

  const handleApprove = async () => {
    if (!suggestedRule.trim()) return;
    setBusy(true);
    try {
      await onApprove(item._id, { ruleText: suggestedRule.trim(), category });
    } finally {
      setBusy(false);
    }
  };

  const handleDismiss = async () => {
    setBusy(true);
    try {
      await onDismiss(item._id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/15 text-amber-400">
          <MessageSquareWarning size={15} />
        </span>
        <span className="text-xs text-amber-200/70">
          Flagged{" "}
          {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
        </span>
      </div>

      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-amber-200/60">
        AI said
      </p>
      <p className="mb-3 text-sm text-amber-50/80">{item.aiReply}</p>

      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-amber-200/60">
        Correction
      </p>
      <p className="mb-3 text-sm text-amber-50/80">{item.clientCorrection}</p>

      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-amber-200/60">
        Suggested rule
      </p>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border border-amber-500/30 bg-[#0d1017] px-3 py-2 text-sm text-gray-200 outline-none sm:w-48"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <textarea
          value={suggestedRule}
          onChange={(e) => setSuggestedRule(e.target.value)}
          rows={2}
          className="flex-1 resize-none rounded-md border border-amber-500/30 bg-[#0d1017] px-3 py-2 text-sm text-gray-200 outline-none focus:border-amber-400"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy || !suggestedRule.trim()}
          onClick={handleApprove}
          className="flex items-center gap-1.5 rounded-md bg-blue-700 px-3 py-1.5 text-sm text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-[#232836] disabled:text-gray-500"
        >
          {busy ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Check size={14} />
          )}
          Approve rule
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={handleDismiss}
          className="rounded-md border border-[#232836] px-3 py-1.5 text-sm text-gray-300 hover:border-red-500/50 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

export default function FlaggedRepliesTab({ onQueueChange }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFeedback = async () => {
    setLoading(true);
    setError("");
    try {
      const { hid, ndid } = getTenantContext();
      const res = await axios.get(FEEDBACK_ENDPOINT, {
        headers: authHeaders(),
        params: { hid, ndid, status: "pending" },
      });
      const pending = res.data?.items || [];
      setItems(pending);
      onQueueChange?.(pending.length);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.message ||
          "Could not load flagged replies.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApprove = async (id, { ruleText, category }) => {
    const { hid, ndid } = getTenantContext();
    await axios.post(
      `${FEEDBACK_ENDPOINT}/${id}/approve`,
      { ruleText, category, hid, ndid },
      { headers: { "Content-Type": "application/json", ...authHeaders() } },
    );
    setItems((prev) => {
      const next = prev.filter((i) => i._id !== id);
      onQueueChange?.(next.length);
      return next;
    });
  };

  const handleDismiss = async (id) => {
    const { hid, ndid } = getTenantContext();
    await axios.post(
      `${FEEDBACK_ENDPOINT}/${id}/reject`,
      { hid, ndid },
      { headers: { "Content-Type": "application/json", ...authHeaders() } },
    );
    setItems((prev) => {
      const next = prev.filter((i) => i._id !== id);
      onQueueChange?.(next.length);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-[#1f242e] bg-[#12151c] p-6 text-sm text-gray-400">
        <Loader2 size={16} className="animate-spin" /> Loading flagged
        replies...
      </div>
    );
  }

  if (error) {
    return (
      <p className="flex items-center gap-1.5 rounded-2xl border border-red-900/40 bg-red-500/5 p-4 text-sm text-red-400">
        <AlertCircle size={14} /> {error}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Corrections flagged from real conversations. Approving one adds it
        straight to Custom Rules — nothing here goes live until you approve it.
      </p>

      {items.length === 0 && (
        <div className="flex items-center gap-2 rounded-2xl border border-dashed border-[#2a3040] p-8 text-center text-sm text-gray-500">
          <ThumbsDown size={16} className="shrink-0" />
          Nothing flagged right now.
        </div>
      )}

      {items.map((item) => (
        <FeedbackCard
          key={item._id}
          item={item}
          onApprove={handleApprove}
          onDismiss={handleDismiss}
        />
      ))}
    </div>
  );
}
