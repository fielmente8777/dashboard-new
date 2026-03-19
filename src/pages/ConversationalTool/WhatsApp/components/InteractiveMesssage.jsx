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

  // FALLBACK
  return (
    <div className="bg-gray-100 text-xs p-2 rounded">
      Unsupported interactive type: {type}
    </div>
  );
};

export default InteractiveMessage;
