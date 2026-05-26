import { Handle, Position, useReactFlow } from "reactflow";

export default function CarouselNode({ id, data }) {
  const { getNodes, setNodes, getEdges, setEdges } = useReactFlow();
  const nodes = getNodes();

  const interactive = data?.interactive;
  const bodyText = interactive?.body?.text || "Carousel";

  const cards = interactive?.action?.cards || [];

  const removeNode = () => {
    const updatedNodes = nodes.filter((node) => node.id !== id);
    const updatedEdges = getEdges().filter(
      (edge) => edge.source !== id && edge.target !== id,
    );

    setNodes(updatedNodes);
    setEdges(updatedEdges);
  };

  return (
    <div className="w-72 bg-white rounded-lg shadow border overflow-hidden">
      {/* Header */}
      <div className="bg-blue-500 text-white flex justify-between items-center px-3 py-2 text-sm font-semibold">
        <div className="flex items-center gap-2">
          <span>🎠</span>
          Carousel
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

      {/* Body */}
      <div className="px-3 text-sm text-gray-700 border-b py-2">{bodyText}</div>

      {/* Cards */}
      <div className="px-3 py-2 space-y-3">
        {cards.map((card, cardIndex) => {
          const header = card.header;
          const description = card.body?.text;
          const buttons = card.action?.buttons || [];

          return (
            <div key={cardIndex} className="border rounded-md p-2 bg-gray-50">
              {/* HEADER */}
              {header?.type === "image" && header?.image?.link && (
                <img
                  src={header.image.link}
                  alt="card"
                  className="w-full h-28 object-cover rounded mb-2"
                />
              )}

              {header?.type === "text" && (
                <div className="text-sm font-semibold mb-1">
                  {header.text || `Card ${cardIndex + 1}`}
                </div>
              )}

              {/* BODY */}
              <div className="text-xs text-gray-600 mb-2">{description}</div>

              {/* BUTTONS */}
              {buttons.map((btn, idx) => (
                <div
                  key={btn.quick_reply?.id || idx}
                  className="relative bg-gray-100 rounded px-2 py-1 text-xs mb-1 flex justify-between items-center"
                >
                  {btn.quick_reply?.title}

                  <Handle
                    type="source"
                    position={Position.Right}
                    id={btn.quick_reply?.id}
                    className="!bg-green-500 !w-2 !h-2"
                  />
                </div>
              ))}
            </div>
          );
        })}

        {/* Default Path */}
        <div className="relative bg-gray-100 rounded px-2 py-1 text-xs flex justify-between items-center">
          Default
          <Handle
            type="source"
            position={Position.Right}
            id="default"
            className="!bg-green-500 !w-3 !h-3"
          />
        </div>
      </div>

      {/* Input */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-gray-400 !w-3 !h-3"
      />
    </div>
  );
}
