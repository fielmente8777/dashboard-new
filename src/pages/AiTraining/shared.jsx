// Suggested location: src/pages/AiTraining/shared.jsx
import { SALES_AGENT_BASE_URL } from "../../utils/dashboardApi";

export const RULES_ENDPOINT = `${SALES_AGENT_BASE_URL}/api/v1/ai-instructions`;
export const FEEDBACK_ENDPOINT = `${SALES_AGENT_BASE_URL}/api/v1/ai-feedback`;

// Keep this list in sync with whatever STATIC_SYSTEM_PROMPT's comment block
// expects, so a rule's category means the same thing on both ends.
export const CATEGORIES = [
  { value: "tone", label: "Tone" },
  { value: "policy", label: "Policy" },
  { value: "discounts", label: "Discounts" },
  { value: "restricted_topic", label: "Restricted Topic" },
  { value: "escalation", label: "Escalation" },
  { value: "other", label: "Other" },
];

const CATEGORY_STYLE = {
  tone: "bg-sky-400/10 text-sky-300",
  policy: "bg-amber-400/10 text-amber-300",
  discounts: "bg-emerald-400/10 text-emerald-300",
  restricted_topic: "bg-red-400/10 text-red-300",
  escalation: "bg-purple-400/10 text-purple-300",
  other: "bg-gray-400/10 text-gray-300",
};

export const categoryLabel = (value) =>
  CATEGORIES.find((c) => c.value === value)?.label || "Other";

export const CategoryBadge = ({ value }) => (
  <span
    className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${
      CATEGORY_STYLE[value] || CATEGORY_STYLE.other
    }`}
  >
    {categoryLabel(value)}
  </span>
);

export const Toggle = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`relative h-[18px] w-8 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
      checked ? "bg-blue-600" : "bg-[#2a3040]"
    }`}
  >
    <span
      className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white transition-transform ${
        checked ? "translate-x-[18px]" : "translate-x-0.5"
      }`}
    />
  </button>
);
