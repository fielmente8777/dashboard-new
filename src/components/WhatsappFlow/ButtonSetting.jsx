import { useState } from "react";
import { FiX } from "react-icons/fi";
import { v4 as uuidv4 } from "uuid";

export default function ButtonsSettings({ onSave, onCancel, data }) {
  const interactive = data?.interactive || {};

  const [header, setHeader] = useState(interactive?.header?.text || "");

  const [body, setBody] = useState(
    interactive?.body?.text || "Ask a question here",
  );

  const [footer, setFooter] = useState(interactive?.footer?.text || "");

  const [buttons, setButtons] = useState(
    interactive?.action?.buttons?.map((btn) => btn.reply.title) || ["Answer 1"],
  );

  const [variable, setVariable] = useState(data?.variable || "");

  const [newButton, setNewButton] = useState("");

  const addButton = () => {
    if (!newButton.trim()) return;
    if (buttons.length >= 3) return;

    setButtons((prev) => [...prev, newButton.trim()]);
    setNewButton("");
  };

  const updateButton = (index, value) => {
    const updated = [...buttons];
    updated[index] = value;
    setButtons(updated);
  };

  const handleSave = () => {
    const interactiveMessage = {
      type: "interactive",
      interactive: {
        type: "button",

        header: header
          ? {
              type: "text",
              text: header,
            }
          : undefined,

        body: {
          text: body,
        },

        footer: footer
          ? {
              text: footer,
            }
          : undefined,

        action: {
          buttons: buttons.map((btn, index) => ({
            type: "reply",
            reply: {
              id: `btn_${index + 1}_${uuidv4()}`,
              title: btn,
            },
          })),
        },
      },

      variable,
    };

    onSave(interactiveMessage);
  };

  return (
    <div className="bg-white w-full rounded-lg shadow-lg p-5">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Set Buttons</h2>
        <FiX className="cursor-pointer" onClick={onCancel} />
      </div>

      {/* Header Text */}
      <div className="mb-4">
        <label className="text-sm text-gray-600">
          Header Text (optional, max 60 chars)
        </label>

        <div className="flex gap-2 mt-1">
          <input
            value={header}
            maxLength={60}
            onChange={(e) => setHeader(e.target.value)}
            className="border rounded w-full p-2"
            placeholder="Input value"
          />

          <button className="bg-green-500 text-white px-3 rounded">
            Variables
          </button>
        </div>
      </div>

      {/* Body Text */}
      <div className="mb-4">
        <label className="text-sm text-gray-600">
          Body Text (required, max 1024 chars)
        </label>

        <textarea
          value={body}
          maxLength={1024}
          onChange={(e) => setBody(e.target.value)}
          className="border rounded w-full p-2 mt-1"
          rows={4}
        />

        <div className="flex justify-end mt-2">
          <button className="bg-green-500 text-white px-3 py-1 rounded">
            Variables
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mb-4">
        <label className="text-sm text-gray-600">
          Footer Text (optional, max 60 chars)
        </label>

        <input
          value={footer}
          maxLength={60}
          onChange={(e) => setFooter(e.target.value)}
          className="border rounded w-full p-2 mt-1"
          placeholder="Input value"
        />
      </div>

      {/* Existing Buttons */}
      {buttons.map((btn, index) => (
        <div key={index} className="mb-3">
          <label className="text-sm text-gray-600">
            Button {index + 1} (required, max 20 chars)
          </label>

          <input
            value={btn}
            maxLength={20}
            onChange={(e) => updateButton(index, e.target.value)}
            className="border rounded w-full p-2 mt-1"
          />
        </div>
      ))}

      {/* Add New Button */}
      {buttons.length < 3 && (
        <div className="mb-4">
          <label className="text-sm text-gray-600">
            New Button (max 20 chars)
          </label>

          <div className="flex gap-2 mt-1">
            <input
              value={newButton}
              maxLength={20}
              onChange={(e) => setNewButton(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addButton();
                }
              }}
              className="border rounded w-full p-2"
              placeholder="Input value"
            />

            <button
              onClick={addButton}
              className="bg-green-500 text-white px-4 rounded"
            >
              Create
            </button>
          </div>
        </div>
      )}

      {/* Variable */}
      {/* <div className="mb-5">
        <label className="text-sm text-gray-600">
          Save Answers in a variable
        </label>

        <input
          value={variable}
          onChange={(e) => setVariable(e.target.value)}
          className="border rounded w-full p-2 mt-1"
          placeholder="@value"
        />
      </div> */}

      {/* Footer Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="border px-4 py-2 rounded text-gray-600"
        >
          Cancel
        </button>

        <button
          onClick={handleSave}
          className="bg-green-500 text-white px-5 py-2 rounded"
        >
          Save
        </button>
      </div>
    </div>
  );
}
