import { Handle, Position, useReactFlow } from "reactflow";

export default function ListNode({ data, id }) {
  const { getNodes, setNodes } = useReactFlow();
  const nodes = getNodes();
  const interactive = data?.interactive;

  const headerText = interactive?.header?.text;
  const bodyText = interactive?.body?.text || "Select an option";
  const footerText = interactive?.footer?.text;

  const sections = interactive?.action?.sections || [];

  const removeNode = () => {
    const updatedNodes = nodes.filter((node) => node.id !== id);
    setNodes(updatedNodes);
  };

  return (
    <div className="w-64 bg-white rounded-lg shadow border overflow-hidden">
      {/* Header */}
      <div className="bg-purple-500 text-white flex justify-between items-center px-3 py-2 text-sm font-semibold">
        <div className="flex items-center gap-2">
          <span className="text-lg">📋</span>
          List
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

      {/* Header Text */}
      {headerText && (
        <div className="px-3 text-sm text-gray-700 font-medium border-b mb-2 py-1.5">
          {headerText}
        </div>
      )}

      {/* Body */}
      <div className="px-3 text-sm text-gray-700 border-b mb-2 py-1.5">
        {bodyText}
      </div>

      {/* Footer */}
      {footerText && (
        <div className="px-3 text-sm text-gray-700 border-b py-1.5">
          {footerText}
        </div>
      )}

      {/* Sections */}
      <div className="px-3 pb-3 space-y-3 mt-2">
        {sections.map((section, sIndex) => (
          <div key={sIndex}>
            {/* Section Title */}
            {section.title && (
              <div className="text-xs text-gray-500 mb-1 font-semibold">
                {section.title}
              </div>
            )}

            {/* Rows */}
            <div className="space-y-2">
              {section.rows?.map((row) => (
                <div
                  key={row.id}
                  className="relative bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-700 flex justify-between items-center"
                >
                  {row.title}

                  {/* Output Handle */}
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={row.id}
                    className="!bg-green-500 !w-3 !h-3"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Default Path */}
        <div className="relative bg-gray-100 rounded-md px-3 py-2 text-sm text-gray-700 flex justify-between items-center">
          Default
          <Handle
            type="source"
            position={Position.Right}
            id="default"
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
