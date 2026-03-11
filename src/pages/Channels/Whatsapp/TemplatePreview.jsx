import React from "react";

const replaceVariables = (text = "", examples = []) => {
  return text.replace(/{{(\d+)}}/g, (_, index) => {
    return examples[index - 1] || `{{${index}}}`;
  });
};

export default function TemplatePreview({ components = [] }) {
  const bodyComponent = components.find((c) => c.type === "BODY");
  const buttonComponent = components.find((c) => c.type === "BUTTONS");

  const exampleValues = bodyComponent?.example?.body_text?.[0] || [];
  const bodyText = replaceVariables(bodyComponent?.text, exampleValues);

  return (
    <div className="bg-[#e5ddd5] p-4 rounded-lg w-85">
      {/* Message Bubble */}
      <div className="bg-white rounded-lg p-3 text-sm whitespace-pre-line shadow-sm">
        {bodyText}
      </div>

      {/* Buttons */}
      {buttonComponent?.buttons?.length > 0 && (
        <div className="mt-2 space-y-2">
          {buttonComponent.buttons.map((btn, i) => (
            <button
              key={i}
              className="w-full bg-white border border-gray-300 text-blue-600 text-sm py-2 rounded-md hover:bg-gray-50 transition"
            >
              {btn.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
