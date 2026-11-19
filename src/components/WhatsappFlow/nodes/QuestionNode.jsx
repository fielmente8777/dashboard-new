import { Handle, Position } from "reactflow";
import NodeShell from "../NodeShell";

export default function QuestionNode({ data, selected }) {
  const question = data?.question || "Ask a question here";
  const variable = data?.variable || "@answer";

  return (
    <NodeShell type="question" selected={selected} hint="Click to edit">
      <p className="whitespace-pre-line px-3 pt-3 text-sm text-app-text">{question}</p>

      <div className="p-3">
        <p className="flex items-center gap-1.5 rounded-lg bg-app-surface-secondary px-3 py-2 text-xs text-app-text-muted">
          Saves the answer in
          <span className="font-semibold text-app-text">{variable}</span>
        </p>
      </div>

      <Handle type="source" position={Position.Right} id="next" className="eaz-handle-out" />
      <Handle type="target" position={Position.Left} className="eaz-handle-in" />
    </NodeShell>
  );
}
