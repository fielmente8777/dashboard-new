import { useState } from "react";

export default function CTANode({ node, nodes, updateNode }) {
  const [title, setTitle] = useState(node.data.title || "");
  const [buttons, setButtons] = useState(node.data.buttons || []);

  const save = (newButtons = buttons, newTitle = title) => {
    updateNode(node.id, {
      ...node.data,
      title: newTitle,
      buttons: newButtons,
    });
  };

  const addButton = () => {
    const updated = [...buttons, { label: "", targetNodeId: "" }];
    setButtons(updated);
    save(updated);
  };

  const removeButton = (index) => {
    const updated = buttons.filter((_, i) => i !== index);
    setButtons(updated);
    save(updated);
  };

  const updateButton = (index, key, value) => {
    const updated = [...buttons];
    updated[index][key] = value;
    setButtons(updated);
    save(updated);
  };

  return (
    <div className="flex flex-col gap-4">
      <input
        className="border p-2 rounded"
        placeholder="CTA Title"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          save(buttons, e.target.value);
        }}
      />

      {buttons.map((btn, i) => (
        <div key={i} className="border rounded p-3 flex items-center gap-2">
          <input
            className="border p-2 rounded flex-1"
            placeholder="Button Label"
            value={btn.label}
            onChange={(e) => updateButton(i, "label", e.target.value)}
          />

          <select
            className="border p-2 rounded"
            value={btn.targetNodeId}
            onChange={(e) => updateButton(i, "targetNodeId", e.target.value)}
          >
            <option value="">Connect Node</option>

            {nodes
              .filter((n) => n.id !== node.id)
              .map((n) => (
                <option key={n.id} value={n.id}>
                  {n.type} - {n.id}
                </option>
              ))}
          </select>

          <button
            onClick={() => removeButton(i)}
            className="text-red-500 font-bold"
          >
            ✕
          </button>
        </div>
      ))}

      <button
        onClick={addButton}
        className="bg-blue-500 text-white px-3 py-2 rounded"
      >
        Add Button
      </button>
    </div>
  );
}
