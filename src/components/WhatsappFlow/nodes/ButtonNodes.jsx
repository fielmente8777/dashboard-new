import { Handle, Position, useReactFlow } from "reactflow";

export default function ButtonsNode({ id, data }) {
  const { getNodes, setNodes, setEdges, getEdges } = useReactFlow();
  const nodes = getNodes();

  const interactive = data?.interactive;

  const headerText = interactive?.header?.text;
  const bodyText = interactive?.body?.text || "Ask a question here";
  const footerText = interactive?.footer?.text;

  const buttons = interactive?.action?.buttons || [];

  const removeNode = () => {
    const updatedNodes = nodes.filter((node) => node.id !== id);
    const updatedEdges = getEdges().filter(
      (edge) => edge.source !== id && edge.target !== id,
    );

    setNodes(updatedNodes);
    setEdges(updatedEdges);
  };

  return (
    <div className="w-64 bg-white rounded-lg shadow border overflow-hidden">
      {/* Header */}
      <div className="bg-orange-400 text-white flex justify-between items-center px-3 py-2 text-sm font-semibold">
        <div className="flex items-center gap-2">
          <span className="text-lg">⭕</span>
          Buttons
        </div>

        <div
          className="cursor-pointer text-lg"
          onClick={(e) => {
            e.stopPropagation();
            removeNode();
          }}
        >
          X
        </div>
      </div>

      {headerText && (
        <div className="px-3 text-sm text-gray-700 font-medium border-b mb-2 py-1.5">
          {headerText}
        </div>
      )}

      {/* Question */}
      <div className="px-3 text-sm text-gray-700 border-b mb-2 py-1.5">
        {bodyText}
      </div>

      {footerText && (
        <div className="px-3 text-sm text-gray-700 py-1.5">{footerText}</div>
      )}

      <div className="space-y-2 px-3 pb-3">
        {buttons.map((btn) => (
          <div
            key={btn.reply.id}
            className="relative bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-700 flex justify-between items-center"
          >
            {btn.reply.title}

            {/* Output Handle */}
            <Handle
              type="source"
              position={Position.Right}
              id={btn.reply.id}
              className="!bg-green-500 !w-3 !h-3"
            />
          </div>
        ))}

        {/* Default Path */}
        {/* <div className="relative bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-700 flex justify-between items-center">
          Default
          <Handle
            type="source"
            position={Position.Right}
            id="default"
            className="!bg-green-500 !w-3 !h-3"
          />
        </div> */}
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
