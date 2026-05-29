import { useEffect, useState } from "react";

export default function ActivityModal({ open, onClose, onSave, initialData }) {
  const [activitySource, setActivitySource] = useState("phone_call");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (open) {
      setActivitySource(initialData?.activitySource || "phone_call");
      setMessage(initialData?.message || "");
    }
  }, [open, initialData]);

  if (!open) return null;

  const handleSave = () => {
    if (!message.trim()) return;

    onSave({
      activitySource,
      message,
      createdAt: initialData?.createdAt || new Date().toISOString(),
    });

    onClose();
  };

  const activityOptions = [
    { value: "phone_call", label: "Phone Call", emoji: "📞" },
    { value: "message", label: "Message", emoji: "💬" },
    { value: "note", label: "Note", emoji: "📝" },
    { value: "email", label: "Email", emoji: "✉️" },
    { value: "whatsapp", label: "Whatsapp", emoji: "🟢" },
  ];

  const selected = activityOptions.find((a) => a.value === activitySource);

  return (
    <div className="">
      {open&&<div className="bg-app">
        {/* Header */}
        {/* <div className="flex justify-between items-center px-5 py-4 border-b">
          <h2 className="font-semibold text-lg">
            {initialData ? "Edit Activity" : "Add Activity"}
          </h2>
          <button onClick={onClose} className="text-gray-500">
            ✕
          </button>
        </div> */}

        {/* Body */}
        <div className=" space-y-4">
          <div className="flex items-center gap-3 border rounded-lg px-3 py-2">
            <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center">
              {selected.emoji}
            </div>

            <select
              className="flex-1 outline-none bg-transparent text-app-text dark:text-app-text-faint"
              value={activitySource}
              onChange={(e) => setActivitySource(e.target.value)}
            >
              {activityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <textarea
            rows={5}
            placeholder="Add details..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>

        {/* Footer */}
        <div className="py-5 pt-0 flex items-center gap-2">
          {initialData &&<button
            onClick={()=>{setMessage(""); onClose()}}
            className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700"
          >
            Cancle
          </button>}
          <button
            onClick={handleSave}
            className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700"
          >
            Save
          </button>
        </div>
      </div>}
    </div>
  );
}
