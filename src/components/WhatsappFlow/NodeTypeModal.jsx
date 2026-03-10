export default function NodeTypeModal({ onSelect, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-[320px]">
        <h2 className="text-lg font-semibold mb-4">Select Node Type</h2>

        <div className="flex flex-col gap-3">
          <button
            className="bg-blue-500 text-white p-2 rounded"
            onClick={() => onSelect("message")}
          >
            Message Node
          </button>

          <button
            className="bg-green-500 text-white p-2 rounded"
            onClick={() => onSelect("cta")}
          >
            CTA Node
          </button>

          <button
            className="bg-purple-500 text-white p-2 rounded"
            onClick={() => onSelect("flow")}
          >
            Flow Node
          </button>
        </div>

        <button className="mt-4 text-sm text-gray-500" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
