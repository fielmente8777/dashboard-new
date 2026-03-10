import React from "react";
import MessageNode from "./nodes/MessageNode";
import CTANode from "./nodes/CTANode";
import FlowBuilderForm from "./nodes/FlowBuilderForm";

// const NodeCard = () => {
//   return <div>NodeCard</div>;
// };

// export default NodeCard;

// import MessageNode from "./nodes.jsx";
// import CTANode from "./nodes/CTANode.jsx";
// // import FlowBuilderForm from "./nodes/FlowBuilderForm";

const NodeCard = ({ node, nodes, updateNode }) => {
  const renderNode = () => {
    if (node.type === "message")
      return <MessageNode node={node} nodes={nodes} updateNode={updateNode} />;

    if (node.type === "cta")
      return <CTANode node={node} nodes={nodes} updateNode={updateNode} />;

    if (node.type === "flow")
      return (
        <FlowBuilderForm node={node} nodes={nodes} updateNode={updateNode} />
      );
  };

  return (
    <div className="w-[450px] bg-white rounded-xl shadow-md border">
      <div className="px-4 py-3 border-b font-semibold text-gray-700 uppercase text-sm">
        {node.type} Node
      </div>

      <div className="p-4">{renderNode()}</div>
    </div>
  );
};

export default NodeCard;
