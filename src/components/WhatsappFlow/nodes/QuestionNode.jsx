import { Handle, Position } from "reactflow";
import { FiMoreVertical } from "react-icons/fi";

export default function QuestionNode({ data }) {
  const question = data?.question || "Ask a question here";
  const variable = data?.variable || "@answer";

  return (
    <div className="w-64 bg-white rounded-lg shadow border overflow-hidden">
      {/* Header */}
      <div className="bg-orange-500 text-white flex justify-between items-center px-3 py-2 text-sm font-semibold">
        <div className="flex items-center gap-2">
          <span className="text-lg">❓</span>
          Question
        </div>

        <FiMoreVertical className="cursor-pointer" />
      </div>

      {/* Question Text */}
      <div className="px-3 py-3 text-sm text-gray-700 border-b">{question}</div>

      {/* Variable */}
      <div className="px-3 py-2 text-xs text-gray-500">
        Save answer → <span className="font-semibold">{variable}</span>
      </div>

      {/* Output */}
      <Handle
        type="source"
        position={Position.Right}
        id="next"
        className="!bg-green-500 !w-3 !h-3"
      />

      {/* Input */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-gray-400 !w-3 !h-3"
      />
    </div>
  );
}
