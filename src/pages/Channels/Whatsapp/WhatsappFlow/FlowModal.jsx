import { useState } from "react";
import { FiX } from "react-icons/fi";

const FlowModal = ({ template, onClose, onSave }) => {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) return;

    onSave({
      name,
      category: template?.category, // ✅ fixed
      templateId: template?.id,
    });
  };

  const FIELD =
    "w-full min-w-0 rounded-[var(--r-sm)] border border-app-border bg-app-surface px-[var(--sp-3)] py-[var(--sp-2)] mt-1 text-[length:var(--fs-sm)] text-app-text placeholder:text-app-text-faint outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30";

  const LABEL = "text-[length:var(--fs-sm)] text-gray-600 dark:text-app-text-muted";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-[var(--sp-4)]">
      <div className="bg-app-surface w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-[var(--r-lg)] shadow-lg p-[var(--sp-5)] relative">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 size-8 flex items-center justify-center rounded-[var(--r-sm)] text-app-text hover:bg-app-surface-secondary cursor-pointer transition-colors"
        >
          <FiX />
        </button>

        <h2 className="text-[length:var(--fs-lg)] font-semibold mb-[var(--sp-4)] pr-10 text-app-text">
          Enter flow details
        </h2>

        {/* Flow Name */}
        <div className="mb-[var(--sp-4)]">
          <label className={LABEL}>Flow Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={FIELD}
            placeholder="Enter flow name"
          />
        </div>

        {/* Category (DISABLED) */}
        <div className="mb-[var(--sp-5)]">
          <label className={LABEL}>Category</label>
          <input
            value={template?.title}
            disabled
            className={`${FIELD} bg-app-surface-secondary cursor-not-allowed opacity-70`}
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-[var(--sp-3)] rounded-[var(--r-md)] text-[length:var(--fs-sm)] font-medium transition-colors"
        >
          Save and continue
        </button>
      </div>
    </div>
  );
};

export default FlowModal;