import { useState } from "react";
import NodeCard from "./NodeCard";

export default function FlowBuilder() {
  const [nodes, setNodes] = useState([]);

  const addNode = (type) => {
    const newNode = {
      id: "node_" + Date.now(),
      type,
      data: {
        title: "",
        message: "",
        nextNode: "",
        buttons: [],
      },
    };

    setNodes([...nodes, newNode]);
  };

  const updateNode = (id, data) => {
    setNodes(nodes.map((n) => (n.id === id ? { ...n, data } : n)));
  };

  console.log(nodes);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex gap-3 mb-6">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => addNode("message")}
        >
          Add Message
        </button>

        <button
          className="bg-purple-500 text-white px-4 py-2 rounded"
          onClick={() => addNode("cta")}
        >
          Add CTA
        </button>

        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={() => addNode("flow")}
        >
          Add Flow
        </button>
      </div>

      <div className="flex gap-2 flex-wrap items-center ">
        {nodes.map((node) => (
          <NodeCard
            key={node.id}
            node={node}
            nodes={nodes}
            updateNode={updateNode}
          />
        ))}
      </div>
    </div>
  );
}
