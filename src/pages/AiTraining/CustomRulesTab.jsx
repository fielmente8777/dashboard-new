// Suggested location: src/pages/AiTraining/CustomRulesTab.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { authHeaders, getTenantContext } from "../../utils/dashboardApi";
import { RULES_ENDPOINT, CATEGORIES, CategoryBadge, Toggle } from "./shared";

function RuleRow({ rule, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [ruleText, setRuleText] = useState(rule.ruleText);
  const [category, setCategory] = useState(rule.category || "other");
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);

  const handleToggle = async (nextEnabled) => {
    setToggling(true);
    try {
      await onSave(rule._id, { enabled: nextEnabled });
    } finally {
      setToggling(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!ruleText.trim()) return;
    setSaving(true);
    try {
      await onSave(rule._id, { ruleText: ruleText.trim(), category });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div className="rounded-xl border border-blue-600/40 bg-[#0d1017] p-4">
        <div className="mb-2 flex flex-col gap-2 sm:flex-row">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-md border border-[#232836] bg-[#0d1017] px-3 py-2 text-sm text-gray-200 outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <textarea
          value={ruleText}
          onChange={(e) => setRuleText(e.target.value)}
          rows={2}
          className="w-full resize-none rounded-md border border-[#232836] bg-[#0d1017] px-3 py-2 text-sm text-gray-200 outline-none focus:border-blue-500"
        />
        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setRuleText(rule.ruleText);
              setCategory(rule.category || "other");
              setEditing(false);
            }}
            className="rounded-md p-1.5 text-gray-400 hover:bg-white/5 hover:text-gray-200"
          >
            <X size={16} />
          </button>
          <button
            type="button"
            disabled={saving || !ruleText.trim()}
            onClick={handleSaveEdit}
            className="flex items-center gap-1.5 rounded-md bg-blue-700 px-3 py-1.5 text-sm text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-[#232836] disabled:text-gray-500"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Check size={14} />
            )}
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border border-[#1f242e] bg-[#0d1017] p-4 ${
        !rule.enabled ? "opacity-50" : ""
      }`}
    >
      <div className="pt-0.5">
        <Toggle
          checked={rule.enabled}
          onChange={handleToggle}
          disabled={toggling}
        />
      </div>
      <CategoryBadge value={rule.category} />
      <p className="flex-1 text-sm text-gray-200">{rule.ruleText}</p>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="rounded-md p-1.5 text-gray-400 hover:bg-white/5 hover:text-white"
        title="Edit"
      >
        <Pencil size={15} />
      </button>
      <button
        type="button"
        onClick={() => onDelete(rule._id)}
        className="rounded-md p-1.5 text-red-500 hover:bg-red-500/10 hover:text-red-400"
        title="Delete"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

function AddRuleForm({ onAdd }) {
  const [ruleText, setRuleText] = useState("");
  const [category, setCategory] = useState("other");
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    const text = ruleText.trim();
    if (!text) return;
    setAdding(true);
    try {
      await onAdd({ ruleText: text, category, enabled: true });
      setRuleText("");
      setCategory("other");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="rounded-xl border border-dashed border-[#2a3040] bg-[#0a0c10] p-4">
      <div className="mb-3 flex items-center gap-2">
        <Plus size={15} className="text-blue-400" />
        <span className="text-sm font-medium text-gray-300">Add Rule</span>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-md border border-[#232836] bg-[#0d1017] px-3 py-2 text-sm text-gray-200 outline-none sm:w-48"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <input
            value={ruleText}
            onChange={(e) => setRuleText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
            placeholder='e.g. "Always mention Mandrem alongside Serenity and Paradiso"'
            className="flex-1 rounded-md border border-[#232836] bg-[#0d1017] px-3 py-2 text-sm text-gray-200 outline-none focus:border-blue-500"
          />
        </div>
        <button
          type="button"
          disabled={adding || !ruleText.trim()}
          onClick={handleAdd}
          className="flex w-full items-center justify-center gap-1.5 rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-[#232836] disabled:text-gray-500 sm:w-auto"
        >
          {adding ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Plus size={14} />
          )}
          Add
        </button>
      </div>
    </div>
  );
}

export default function CustomRulesTab() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRules = async () => {
    setLoading(true);
    setError("");
    try {
      const { hid, ndid } = getTenantContext();
      const res = await axios.get(RULES_ENDPOINT, {
        headers: authHeaders(),
        params: { hid, ndid },
      });
      setRules(res.data?.items || []);
    } catch (err) {
      setError(
        err?.response?.data?.error || err?.message || "Could not load rules.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = async (payload) => {
    const { hid, ndid } = getTenantContext();
    const res = await axios.post(
      RULES_ENDPOINT,
      { ...payload, hid, ndid },
      { headers: { "Content-Type": "application/json", ...authHeaders() } },
    );
    const created = res.data?.rule;
    if (created) setRules((prev) => [created, ...prev]);
  };

  const handleSave = async (id, patch) => {
    const { hid, ndid } = getTenantContext();
    const res = await axios.put(
      `${RULES_ENDPOINT}/${id}`,
      { ...patch, hid, ndid },
      { headers: { "Content-Type": "application/json", ...authHeaders() } },
    );
    const updated = res.data?.rule;
    setRules((prev) =>
      prev.map((r) => (r._id === id ? { ...r, ...(updated || patch) } : r)),
    );
  };

  const handleDelete = async (id) => {
    const { hid, ndid } = getTenantContext();
    await axios.delete(`${RULES_ENDPOINT}/${id}`, {
      headers: authHeaders(),
      params: { hid, ndid },
    });
    setRules((prev) => prev.filter((r) => r._id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-[#1f242e] bg-[#12151c] p-6 text-sm text-gray-400">
        <Loader2 size={16} className="animate-spin" /> Loading rules...
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
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        Rules that shape how your AI replies on WhatsApp — tone, policy, what
        not to say. Turned off rules stay saved but don't apply.
      </p>

      {rules.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#2a3040] p-8 text-center text-sm text-gray-500">
          No custom rules yet.
        </div>
      )}

      {rules.map((rule) => (
        <RuleRow
          key={rule._id}
          rule={rule}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      ))}

      <AddRuleForm onAdd={handleAdd} />
    </div>
  );
}
