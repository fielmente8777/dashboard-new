import { ExternalLink } from "lucide-react";
import { Handle, Position, useReactFlow } from "reactflow";
import Icon from "../../ui/Icon";
import NodeShell, { NodeOption } from "../NodeShell";

export default function FlowNode({ id, data, selected }) {
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
    <NodeShell type="flow" selected={selected} onRemove={removeNode} hint="Click to edit">
      <div className="space-y-1 px-3 pt-3 text-sm text-app-text">
        {headerText && <p className="font-semibold">{headerText}</p>}
        <p className="whitespace-pre-line">{bodyText}</p>
        {footerText && <p className="text-xs text-app-text-faint">{footerText}</p>}
      </div>

      <div className="p-3">
        <NodeOption
          className="text-sky-600 dark:text-sky-400"
          handle={<Handle type="source" position={Position.Right} className="eaz-handle-out" />}
        >
          <span className="inline-flex items-center gap-1.5">
            <Icon icon={ExternalLink} size="xs" />
            {flowCTA}
          </span>
        </NodeOption>
      </div>

      <Handle type="target" position={Position.Left} className="eaz-handle-in" />
    </NodeShell>
  );
}
