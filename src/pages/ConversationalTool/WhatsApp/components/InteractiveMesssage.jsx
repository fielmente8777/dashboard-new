import React from "react";

const InteractiveMessage = ({ interactive }) => {
  if (!interactive) return null;

  const { type, body, action } = interactive;

  // BUTTON TYPE
  if (type === "button") {
    return (
      <div className="bg-gray-100 rounded-xl p-3">
        {/* Body */}
        {body?.text && (
          <p className="text-sm text-gray-800 mb-2">{body.text}</p>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          {action?.buttons?.map((btn) => (
            <button
              key={btn.reply.id}
              className="border border-green-500 text-green-600 text-sm rounded-lg py-1 px-2 hover:bg-green-50"
            >
              {btn.reply.title}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (type === "list") {
    return (
      <div className="bg-gray-100 rounded-xl p-3 w-72">
        {/* Body */}
        {body?.text && (
          <p className="text-sm text-gray-800 mb-2">{body.text}</p>
        )}

        {/* List Button (like WhatsApp "View options") */}
        <button className="w-full bg-green-500 text-white text-sm py-2 rounded-lg mb-2">
          {action?.button || "View options"}
        </button>

        {/* Sections */}
        <div className="max-h-60 overflow-y-auto">
          {action?.sections?.map((section, i) => (
            <div key={i} className="mb-3">
              {/* Section Title */}
              {section.title && (
                <p className="text-xs text-gray-500 mb-1">{section.title}</p>
              )}

              {/* Rows */}
              <div className="flex flex-col gap-1">
                {section.rows?.map((row) => (
                  <div
                    key={row.id}
                    className="bg-white border rounded-lg p-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <p className="text-sm text-gray-800">{row.title}</p>
                    {row.description && (
                      <p className="text-xs text-gray-500">{row.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // FALLBACK
  return (
    <div className="bg-gray-100 text-xs p-2 rounded">
      Unsupported interactive type: {type}
    </div>
  );
};

export default InteractiveMessage;
