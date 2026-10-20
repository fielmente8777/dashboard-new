import { Handle, Position, useReactFlow } from "reactflow";
import NodeShell, { NodeOption } from "../NodeShell";

export default function CarouselNode({ id, data, selected }) {
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
    <NodeShell type="carousel" width="w-72" selected={selected} onRemove={removeNode} hint="Click to edit">
      <p className="whitespace-pre-line px-3 pt-3 text-sm text-app-text">{bodyText}</p>

      <div className="space-y-2.5 p-3">
        {cards.map((card, cardIndex) => {
          const header = card.header;
          const description = card.body?.text;
          const buttons = card.action?.buttons || [];

          return (
            <div
              key={cardIndex}
              className="rounded-lg border border-app-border! bg-app-surface-secondary p-2"
            >
              {header?.type === "image" && header?.image?.link && (
                <img
                  src={header.image.link}
                  alt=""
                  className="mb-2 h-28 w-full rounded-md object-cover"
                />
              )}

              {header?.type === "text" && (
                <p className="mb-1 text-sm font-semibold text-app-text">
                  {header.text || `Card ${cardIndex + 1}`}
                </p>
              )}

              {description && <p className="mb-2 text-xs text-app-text-muted">{description}</p>}

              <div className="space-y-1">
                {buttons.map((btn, idx) => (
                  <NodeOption
                    key={btn.quick_reply?.id || idx}
                    className="bg-app-surface! px-2! py-1! text-xs!"
                    handle={
                      <Handle
                        type="source"
                        position={Position.Right}
                        id={btn.quick_reply?.id}
                        className="eaz-handle-out"
                      />
                    }
                  >
                    {btn.quick_reply?.title}
                  </NodeOption>
                ))}
              </div>
            </div>
          );
        })}

        <NodeOption
          className="text-xs! text-app-text-muted!"
          handle={<Handle type="source" position={Position.Right} id="default" className="eaz-handle-out" />}
        >
          Default
        </NodeOption>
      </div>

      <Handle type="target" position={Position.Left} className="eaz-handle-in" />
    </NodeShell>
  );
}
