// Suggested location: src/pages/AiTraining/AiTrainingPage.jsx
import { useState } from "react";
import CustomRulesTab from "./CustomRulesTab";
import FlaggedRepliesTab from "./FlaggedRepliesTab";

function TopTabs({ active, onChange, pendingCount }) {
  return (
    <div className="mb-6 flex items-center gap-1 border-b border-[#1f242e] pb-1">
      <button
        type="button"
        onClick={() => onChange("rules")}
        className={`rounded-md px-3.5 py-2 text-sm transition-colors ${
          active === "rules"
            ? "bg-blue-700 text-white"
            : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
        }`}
      >
        Custom Rules
      </button>
      <button
        type="button"
        onClick={() => onChange("feedback")}
        className={`flex items-center gap-1.5 rounded-md px-3.5 py-2 text-sm transition-colors ${
          active === "feedback"
            ? "bg-blue-700 text-white"
            : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
        }`}
      >
        Flagged Replies
        {pendingCount > 0 && (
          <span
            className={`rounded-full px-1.5 text-[11px] font-medium ${
              active === "feedback"
                ? "bg-white/20 text-white"
                : "bg-amber-500/15 text-amber-400"
            }`}
          >
            {pendingCount}
          </span>
        )}
      </button>
    </div>
  );
}

export default function AiTrainingPage() {
  const [tab, setTab] = useState("rules");
  const [pendingCount, setPendingCount] = useState(0);

  return (
    <div className="min-h-screen bg-[#0a0c10] px-4 py-10 text-gray-200 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Train Your AI</h1>
          <p className="mt-1 text-sm text-gray-500">
            Set rules for how your AI should behave, or review corrections
            flagged from real conversations.
          </p>
        </div>

        <TopTabs active={tab} onChange={setTab} pendingCount={pendingCount} />

        {tab === "rules" ? (
          <CustomRulesTab />
        ) : (
          <FlaggedRepliesTab onQueueChange={setPendingCount} />
        )}
      </div>
    </div>
  );
}
