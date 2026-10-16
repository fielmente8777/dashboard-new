import { Handle, Position, useReactFlow } from "reactflow";

export default function FlowNode({ id, data }) {
  const { getNodes, setNodes } = useReactFlow();
  const nodes = getNodes();

  const interactive = data?.interactive;

  const headerText = interactive?.header?.text;
  const bodyText = interactive?.body?.text || "Fill the form";
  const footerText = interactive?.footer?.text;

  const flowCTA = interactive?.action?.parameters?.flow_cta || "Open Flow";

  const removeNode = () => {
    const updatedNodes = nodes.filter((node) => node.id !== id);
    setNodes(updatedNodes);
  };

  return (
    <div className="w-64 bg-app-surface rounded-lg shadow border overflow-hidden">
      {/* Header */}
      <div className="bg-purple-500 text-white flex justify-between items-center px-3 py-2 text-sm font-semibold">
        <div className="flex items-center gap-2">
          <span>⚡</span>
          Flow
        </div>

        <div
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            removeNode();
          }}
        >
          X
        </div>
      </div>

      {/* Header Text */}
      {headerText && (
        <div className="px-3 text-sm text-app-text font-medium border-b py-1.5">
          {headerText}
        </div>
      )}

      {/* Body */}
      <div className="px-3 text-sm text-app-text border-b py-1.5">
        {bodyText}
      </div>

      {/* Footer */}
      {footerText && (
        <div className="px-3 text-sm text-app-text py-1.5">{footerText}</div>
      )}

      {/* CTA */}
      <div className="px-3 py-3">
        <div className="relative bg-app-surface-secondary rounded-md px-3 py-2 text-sm flex justify-between items-center">
          {flowCTA}

          <Handle
            type="source"
            position={Position.Right}
            className="!bg-green-500 !w-3 !h-3"
          />
        </div>
      </div>

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-gray-400 !w-3 !h-3"
      />
    </div>
  );
}
