import { useState } from "react";
import { Select } from "../ui/Field";

export default function QuestionSettings({ data, onSave, onCancel }) {
  const [question, setQuestion] = useState(data?.question || "");
  const [variable, setVariable] = useState(data?.variable || "");
  const [type, setType] = useState(data?.type || "text");
  const [required, setRequired] = useState(data?.required || false);

  const handleSave = () => {
    onSave({
      question,
      variable,
      type,
      required,
    });
  };

  return (
    <div className="bg-app-surface border rounded-xl shadow p-4 space-y-4 mt-4">
      <h3 className="text-sm font-semibold text-app-text">Question Settings</h3>

      {/* Question */}
      <div>
        <label className="text-xs text-app-text-muted">Question</label>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask something..."
          className="w-full border rounded-md p-2 text-sm"
        />
      </div>

      {/* Variable */}
      <div>
        <label className="text-xs text-app-text-muted">Save Answer To Variable</label>
        <input
          value={variable}
          onChange={(e) => setVariable(e.target.value)}
          placeholder="example: user_name"
          className="w-full border rounded-md p-2 text-sm"
        />
      </div>

      {/* Input Type */}
      <div>
        <label className="text-xs text-app-text-muted">Answer Type</label>
        <Select
          aria-label="Answer type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          options={[
            { value: "text", label: "Text" },
            { value: "number", label: "Number" },
            { value: "email", label: "Email" },
            { value: "phone", label: "Phone" },
          ]}
        />
      </div>

      {/* Required */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-app-text-muted">Required</span>

        <input
          type="checkbox"
          checked={required}
          onChange={(e) => setRequired(e.target.checked)}
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          onClick={onCancel}
          className="text-sm px-3 py-1 border rounded-md"
        >
          Cancel
        </button>

        <button
          onClick={handleSave}
          className="text-sm px-3 py-1 bg-green-500 text-white rounded-md"
        >
          Save
        </button>
      </div>
    </div>
  );
}
