// // Suggested location: src/pages/AiTraining/shared.jsx
// import { SALES_AGENT_BASE_URL } from "../../utils/dashboardApi";

// export const RULES_ENDPOINT = `${SALES_AGENT_BASE_URL}/api/v1/ai-instructions`;
// export const FEEDBACK_ENDPOINT = `${SALES_AGENT_BASE_URL}/api/v1/ai-feedback`;

// // Keep this list in sync with whatever STATIC_SYSTEM_PROMPT's comment block
// // expects, so a rule's category means the same thing on both ends.
// export const CATEGORIES = [
//   { value: "tone", label: "Tone" },
//   { value: "policy", label: "Policy" },
//   { value: "discounts", label: "Discounts" },
//   { value: "restricted_topic", label: "Restricted Topic" },
//   { value: "escalation", label: "Escalation" },
//   { value: "other", label: "Other" },
// ];

// const CATEGORY_STYLE = {
//   tone: "bg-sky-400/10 text-sky-300",
//   policy: "bg-amber-400/10 text-amber-300",
//   discounts: "bg-emerald-400/10 text-emerald-300",
//   restricted_topic: "bg-red-400/10 text-red-300",
//   escalation: "bg-purple-400/10 text-purple-300",
//   other: "bg-gray-400/10 text-gray-300",
// };

// export const categoryLabel = (value) =>
//   CATEGORIES.find((c) => c.value === value)?.label || "Other";

// export const CategoryBadge = ({ value }) => (
//   <span
//     className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${
//       CATEGORY_STYLE[value] || CATEGORY_STYLE.other
//     }`}
//   >
//     {categoryLabel(value)}
//   </span>
// );

// export const Toggle = ({ checked, onChange, disabled }) => (
//   <button
//     type="button"
//     role="switch"
//     aria-checked={checked}
//     disabled={disabled}
//     onClick={() => onChange(!checked)}
//     className={`relative h-[18px] w-8 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
//       checked ? "bg-blue-600" : "bg-[#2a3040]"
//     }`}
//   >
//     <span
//       className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white transition-transform ${
//         checked ? "translate-x-[18px]" : "translate-x-0.5"
//       }`}
//     />
//   </button>
// );



import { SALES_AGENT_BASE_URL } from "../../utils/dashboardApi";

export const RULES_ENDPOINT =
  `${SALES_AGENT_BASE_URL}/api/v1/ai-instructions`;

export const FEEDBACK_ENDPOINT =
  `${SALES_AGENT_BASE_URL}/api/v1/ai-feedback`;

export const VOICE_INSTRUCTIONS_ENDPOINT =
  `${SALES_AGENT_BASE_URL}/api/v1/voice-instructions`;

export const VOICE_SETTINGS_ENDPOINT =
  `${VOICE_INSTRUCTIONS_ENDPOINT}/settings`;

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
  CATEGORIES.find((category) => category.value === value)?.label ||
  "Other";

export const CategoryBadge = ({ value }) => (
  <span
    className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${
      CATEGORY_STYLE[value] || CATEGORY_STYLE.other
    }`}
  >
    {categoryLabel(value)}
  </span>
);

/**
 * Controlled toggle component.
 *
 * checked: current boolean state
 * onChange: callback receiving the next boolean value
 * disabled: prevents interaction
 * label: accessible switch name
 */
export const Toggle = ({
  checked = false,
  onChange,
  disabled = false,
  label = "Toggle setting",
}) => {
  const isOn = Boolean(checked);

  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={isOn}
      disabled={disabled}
      onClick={() => onChange?.(!isOn)}
      className={`
        relative inline-flex h-6 w-11 shrink-0
        items-center rounded-full
        transition-colors duration-200 ease-in-out
        focus:outline-none focus-visible:ring-2
        focus-visible:ring-blue-500
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${
          isOn
            ? "bg-blue-600"
            : "bg-[#343b4d]"
        }
      `}
    >
      <span
        aria-hidden="true"
        className={`
          pointer-events-none inline-block
          h-4 w-4 rounded-full
          bg-white shadow-sm
          transition-transform duration-200 ease-in-out
          ${
            isOn
              ? "translate-x-6"
              : "translate-x-1"
          }
        `}
      />
    </button>
  );
};
