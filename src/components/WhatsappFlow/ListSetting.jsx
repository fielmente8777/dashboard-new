import { useState } from "react";
import { FiX, FiTrash2, FiPlus } from "react-icons/fi";
import { v4 as uuidv4 } from "uuid";

const MAX_MESSAGE_BODY_TEXT = 4096;
const MAX_MESSAGE_FOOTER_TEXT = 60;
const MAX_MESSAGE_HEADER_TEXT = 60;
const MAX_SECTION_TITLE_TEXT = 24;
const MAX_ROW_TITLE_TEXT = 24;
const MAX_BUTTON_TEXT = 20;

export default function ListSetting({ data, onSave, onCancel }) {
  const [header, setHeader] = useState(data?.interactive?.header?.text || "");
  const [body, setBody] = useState(
    data?.interactive?.body?.text || "Select an option",
  );
  const [footer, setFooter] = useState(data?.interactive?.footer?.text || "");
  const [buttonText, setButtonText] = useState("Choose");

  const [sections, setSections] = useState(
    data?.interactive?.action?.sections || [
      {
        title: "Section 1",
        rows: [
          {
            id: "row_1_1",
            title: "Option 1",
          },
        ],
      },
    ],
  );

  const [variable, setVariable] = useState(data?.variable || "");

  const addSection = () => {
    setSections([
      ...sections,
      {
        title: "New Section",
        rows: [
          {
            id: `row_1_1_${uuidv4()}`,
            title: "New Option",
          },
        ],
      },
    ]);
  };

  const removeSection = (index) => {
    const updated = sections.filter((_, i) => i !== index);
    setSections(updated);
  };

  const updateSectionTitle = (index, value) => {
    const updated = [...sections];
    updated[index].title = value;
    setSections(updated);
  };

  const addRow = (sectionIndex) => {
    const updated = [...sections];
    updated[sectionIndex].rows.push({
      id: `row_1_1_${uuidv4()}`,
      title: "New Option",
    });
    setSections(updated);
  };

  const removeRow = (sectionIndex, rowIndex) => {
    const updated = [...sections];
    updated[sectionIndex].rows = updated[sectionIndex].rows.filter(
      (_, i) => i !== rowIndex,
    );
    setSections(updated);
  };

  const updateRow = (sectionIndex, rowIndex, value) => {
    const updated = [...sections];
    updated[sectionIndex].rows[rowIndex] = {
      id: `row_${sectionIndex + 1}_${rowIndex + 1}_${uuidv4()}`,
      title: value,
    };
    setSections(updated);
  };

  const handleSave = () => {
    const interactiveMessage = {
      type: "interactive",
      interactive: {
        type: "list",
        header: header ? { type: "text", text: header } : undefined,
        body: { text: body },
        footer: footer ? { text: footer } : undefined,
        action: {
          button: buttonText,
          sections: sections.map((section) => ({
            title: section.title,
            rows: section.rows.map((row) => ({
              id: row.id,
              title: row?.title,
            })),
          })),
        },
      },
      variable,
    };

    onSave(interactiveMessage);
  };

  return (
    <div className="bg-white w-full rounded-xl shadow-xl p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-semibold text-lg">List Settings</h2>
      </div>

      {/* Header */}
      <div className="mb-4">
        <label className="text-sm text-gray-600">Header Text</label>
        <input
          value={header}
          maxLength={MAX_MESSAGE_HEADER_TEXT}
          onChange={(e) => setHeader(e.target.value)}
          className="border rounded-lg w-full p-2 mt-1"
          placeholder="Optional header"
        />

        <span className="text-end text-xs text-gray-400 block mt-1">
          Max {MAX_MESSAGE_HEADER_TEXT}
        </span>
      </div>

      {/* Body */}
      <div className="mb-4">
        <label className="text-sm text-gray-600">Body Text</label>
        <textarea
          value={body}
          maxLength={MAX_MESSAGE_BODY_TEXT}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          className="border rounded-lg w-full p-2 mt-1"
        />
        <span className="text-end text-xs text-gray-400 block mt-1">
          Max {MAX_MESSAGE_BODY_TEXT}
        </span>
      </div>

      {/* Footer */}
      <div className="mb-4">
        <label className="text-sm text-gray-600">Footer Text</label>
        <input
          value={footer}
          maxLength={MAX_MESSAGE_FOOTER_TEXT}
          onChange={(e) => setFooter(e.target.value)}
          className="border rounded-lg w-full p-2 mt-1"
          placeholder="Optional footer"
        />

        <span className="text-end text-xs text-gray-400 block mt-1">
          Max {MAX_MESSAGE_FOOTER_TEXT}
        </span>
      </div>

      {/* Button Text */}
      <div className="mb-6">
        <label className="text-sm text-gray-600">List Button Text</label>
        <input
          value={buttonText}
          maxLength={MAX_BUTTON_TEXT}
          onChange={(e) => setButtonText(e.target.value)}
          className="border rounded-lg w-full p-2 mt-1"
        />
        <span className="text-end text-xs text-gray-400 block mt-1">
          Max {MAX_BUTTON_TEXT}
        </span>
      </div>

      {/* Sections */}
      <div className="space-y-4 mb-4">
        {sections.map((section, sIndex) => (
          <div
            key={sIndex}
            className="border rounded-lg p-4 bg-gray-50 relative"
          >
            {/* Remove Section */}
            {sections.length > 1 && (
              <FiTrash2
                onClick={() => removeSection(sIndex)}
                className="absolute right-3 top-3 text-gray-400 cursor-pointer hover:text-red-500"
              />
            )}

            {/* Section Title */}
            <input
              value={section.title}
              onChange={(e) => updateSectionTitle(sIndex, e.target.value)}
              className="border rounded-md w-full p-2 mb-3"
              placeholder="Section title"
              maxLength={MAX_SECTION_TITLE_TEXT}
            />

            <span className="text-end text-xs text-gray-400 block mb-3">
              Max {MAX_SECTION_TITLE_TEXT}
            </span>

            {/* Rows */}
            <div className="space-y-2">
              {section.rows.map((row, rIndex) => (
                <div key={rIndex} className="flex items-center gap-2">
                  <input
                    value={row?.title}
                    maxLength={24}
                    onChange={(e) => updateRow(sIndex, rIndex, e.target.value)}
                    className="border rounded-md w-full p-2"
                  />

                  {section.rows.length > 1 && (
                    <FiTrash2
                      onClick={() => removeRow(sIndex, rIndex)}
                      className="text-gray-400 cursor-pointer hover:text-red-500"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Add Row */}
            <button
              onClick={() => addRow(sIndex)}
              className="flex items-center gap-1 text-sm text-green-600 mt-3"
            >
              <FiPlus size={16} /> Add Option
            </button>
          </div>
        ))}
      </div>

      {/* Add Section */}
      <button
        onClick={addSection}
        className="flex items-center gap-1 text-green-600 text-sm mb-6"
      >
        <FiPlus size={16} /> Add Section
      </button>

      {/* Variable */}
      {/* <div className="mb-6">
        <label className="text-sm text-gray-600">Save answer in variable</label>
        <input
          value={variable}
          onChange={(e) => setVariable(e.target.value)}
          className="border rounded-lg w-full p-2 mt-1"
          placeholder="@value"
        />
      </div> */}

      {/* Footer Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="border px-4 py-2 rounded-lg text-gray-600"
        >
          Cancel
        </button>

        <button
          onClick={handleSave}
          className="bg-green-500 text-white px-5 py-2 rounded-lg"
        >
          Save
        </button>
      </div>
    </div>
  );
}
