import { Handle, Position, useReactFlow } from "reactflow";
import NodeShell, { NodeOption } from "../NodeShell";

export default function ButtonsNode({ id, data, selected }) {
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
    <NodeShell type="button" selected={selected} onRemove={removeNode} hint="Click to edit">
      <div className="space-y-1 px-3 pt-3 text-sm text-app-text">
        {headerText && <p className="font-semibold">{headerText}</p>}
        <p className="whitespace-pre-line">{bodyText}</p>
        {footerText && <p className="text-xs text-app-text-faint">{footerText}</p>}
      </div>

      <div className="space-y-1.5 p-3">
        {buttons.map((btn) => (
          <NodeOption
            key={btn.reply.id}
            handle={
              <Handle
                type="source"
                position={Position.Right}
                id={btn.reply.id}
                className="eaz-handle-out"
              />
            }
          >
            {btn.reply.title}
          </NodeOption>
        ))}
      </div>

      <Handle type="target" position={Position.Left} className="eaz-handle-in" />
    </NodeShell>
  );
}
