import { Handle, Position, useReactFlow } from "reactflow";
import NodeShell, { NodeOption } from "../NodeShell";

export default function ListNode({ data, id, selected }) {
  const { getNodes, setNodes, getEdges, setEdges } = useReactFlow();
  const nodes = getNodes();
  const interactive = data?.interactive;

  const headerText = interactive?.header?.text;
  const bodyText = interactive?.body?.text || "Select an option";
  const footerText = interactive?.footer?.text;

  const sections = interactive?.action?.sections || [];

  const removeNode = () => {
    const updatedNodes = nodes.filter((node) => node.id !== id);
    const updatedEdges = getEdges().filter(
      (edge) => edge.source !== id && edge.target !== id,
    );

    setNodes(updatedNodes);
    setEdges(updatedEdges);
  };

  return (
    <NodeShell type="list" selected={selected} onRemove={removeNode} hint="Click to edit">
      <div className="space-y-1 px-3 pt-3 text-sm text-app-text">
        {headerText && <p className="font-semibold">{headerText}</p>}
        <p className="whitespace-pre-line">{bodyText}</p>
        {footerText && <p className="text-xs text-app-text-faint">{footerText}</p>}
      </div>

      <div className="space-y-3 p-3">
        {sections.map((section, sIndex) => (
          <div key={sIndex}>
            {section.title && (
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-app-text-faint">
                {section.title}
              </p>
            )}

            <div className="space-y-1.5">
              {section.rows?.map((row) => (
                <NodeOption
                  key={row.id}
                  handle={
                    <Handle
                      type="source"
                      position={Position.Right}
                      id={row.id}
                      className="eaz-handle-out"
                    />
                  }
                >
                  {row.title}
                </NodeOption>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Handle type="target" position={Position.Left} className="eaz-handle-in" />
    </NodeShell>
  );
}
