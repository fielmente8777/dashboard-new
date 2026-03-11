import { useState } from "react";

export default function FlowBuilderForm({ node, nodes, updateNode }) {
  const [title, setTitle] = useState(node.data?.title || "User Details");
  const [fields, setFields] = useState(node.data?.fields || []);
  const [nextNode, setNextNode] = useState(node.data?.nextNode || "");
  const [loading, setLoading] = useState(false);

  const buildFlowJSON = () => {
    const screenId = title.toUpperCase().replace(/\s/g, "_");

    const children = [
      {
        type: "TextHeading",
        text: `Enter your ${title}`,
      },

      // form fields
      ...fields.map((f) => ({
        type: f.type,
        name: f.name,
        label: f.label,
        required: f.required,
      })),

      // footer submit
      {
        type: "Footer",
        label: "Submit",
        "on-click-action": {
          name: "complete",
          payload: fields.reduce((acc, f) => {
            acc[f.name] = `\${form.${f.name}}`;
            return acc;
          }, {}),
        },
      },
    ];

    return {
      id: screenId,
      title: title,
      terminal: true,
      layout: {
        type: "SingleColumnLayout",
        children,
      },
    };
  };

  const updateParent = (
    updatedFields = fields,
    updatedTitle = title,
    updatedNext = nextNode,
  ) => {
    updateNode(node.id, {
      title: updatedTitle,
      fields: updatedFields,
      nextNode: updatedNext,
    });
  };

  const addField = () => {
    const updated = [
      ...fields,
      {
        id: Date.now(),
        type: "TextInput",
        name: "",
        label: "",
        required: false,
      },
    ];

    setFields(updated);
    updateParent(updated);
  };

  const removeField = (index) => {
    const updated = fields.filter((_, i) => i !== index);
    setFields(updated);
    updateParent(updated);
  };

  const updateField = (index, key, value) => {
    const updated = [...fields];
    updated[index][key] = value;
    setFields(updated);
    updateParent(updated);
  };

  const handleTitleChange = (value) => {
    setTitle(value);
    updateParent(fields, value);
  };

  const handleNextNode = (value) => {
    setNextNode(value);
    updateParent(fields, title, value);
  };

  /* SUBMIT FLOW FOR REVIEW */

  const submitForReview = async () => {
    try {
      const data = buildFlowJSON();

      const response = await fetch(
        "http://localhost:8000/api/v1/whatsapp-flow/submit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data }),
        },
      );

      const result = await response.json();

      console.log(result);
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* SUBMIT BUTTON */}

      {/* SCREEN TITLE */}

      <input
        className="border p-2 w-full rounded"
        placeholder="Screen Title"
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
      />

      {/* FIELDS */}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="border rounded-lg p-3 bg-gray-50 relative"
          >
            {/* REMOVE ICON */}

            <button
              onClick={() => removeField(index)}
              className="absolute top-2 right-2 text-white text-[10px] flex justify-center items-center size-4 bg-slate-800 rounded-full font-medium"
            >
              X
            </button>

            {/* GRID */}

            <div className="grid grid-cols-2 gap-3">
              <select
                className="border p-2 rounded"
                value={field.type}
                onChange={(e) => updateField(index, "type", e.target.value)}
              >
                <option value="TextInput">Text Input</option>
                <option value="DatePicker">Date Picker</option>
              </select>

              <input
                className="border p-2 rounded"
                placeholder="Field Name"
                value={field.name}
                onChange={(e) => updateField(index, "name", e.target.value)}
              />

              <input
                className="border p-2 rounded col-span-2"
                placeholder="Field Label"
                value={field.label}
                onChange={(e) => updateField(index, "label", e.target.value)}
              />
            </div>

            {/* REQUIRED */}

            <label className="flex items-center gap-2 mt-2 text-sm">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) =>
                  updateField(index, "required", e.target.checked)
                }
              />
              Required
            </label>
          </div>
        ))}
      </div>

      {/* ADD FIELD */}

      <button
        onClick={addField}
        className="bg-blue-500 text-white px-4 py-2 rounded w-full"
      >
        + Add Field
      </button>

      <button
        onClick={submitForReview}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded w-full"
      >
        {loading ? "Submitting..." : "Submit for Review"}
      </button>

      {/* CONNECT NODE */}

      <select
        className="border p-2 w-full rounded"
        value={nextNode}
        onChange={(e) => handleNextNode(e.target.value)}
      >
        <option value="">Connect Next Node</option>

        {nodes
          ?.filter((n) => n.id !== node.id)
          .map((n) => (
            <option key={n.id} value={n.id}>
              {n.type} - {n.id}
            </option>
          ))}
      </select>
    </div>
  );
}
