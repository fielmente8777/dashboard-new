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

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-app-surface w-[400px] rounded-xl shadow-lg p-5 relative">
        <FiX
          className="absolute right-4 top-4 cursor-pointer"
          onClick={onClose}
        />

        <h2 className="text-lg font-semibold mb-4">Enter flow details</h2>

        {/* Flow Name */}
        <div className="mb-4">
          <label className="text-sm text-gray-600">Flow Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded w-full p-2 mt-1"
            placeholder="Enter flow name"
          />
        </div>

        {/* Category (DISABLED) */}
        <div className="mb-5">
          <label className="text-sm text-gray-600">Category</label>
          <input
            value={template?.title}
            disabled
            className="border rounded w-full p-2 mt-1 bg-app-surface-secondary cursor-not-allowed"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-green-500 text-white py-2 rounded-md"
        >
          Save and continue
        </button>
      </div>
    </div>
  );
};

export default FlowModal;
