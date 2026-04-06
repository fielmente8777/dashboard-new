import React from "react";

const InteractiveMessage = ({ interactive }) => {
  console.log(interactive);
  if (!interactive) return null;

  const { type, header, body, footer, action } = interactive;

  // 🔹 HEADER RENDERER
  const renderHeader = () => {
    if (!header) return null;

    if (header.type === "text") {
      return (
        <p className="font-semibold text-sm text-gray-900 mb-1">
          {header.text}
        </p>
      );
    }

    if (header.type === "image" || header.type === "video") {
      return (
        <div className="mb-2">
          <img
            src={header?.image?.link || header?.video?.link}
            alt="header"
            className="rounded-lg max-h-40 object-cover w-full"
          />
        </div>
      );
    }

    if (header.type === "document") {
      return (
        <div className="mb-2 text-sm text-blue-600 underline cursor-pointer">
          📄 {header?.document?.filename || "View Document"}
        </div>
      );
    }

    return null;
  };

  // 🔹 FOOTER
  const renderFooter = () => {
    if (!footer?.text) return null;
    return <p className="text-[11px] text-gray-500 mt-2">{footer.text}</p>;
  };

  // 🔹 COMMON BODY
  const renderBody = () =>
    body?.text && <p className="text-sm text-gray-800 mb-2">{body.text}</p>;

  // =========================
  // 🔘 BUTTON TYPE
  // =========================
  if (type === "button") {
    return (
      <div className="bg-gray-100 rounded-xl p-3 max-w-xs">
        {renderHeader()}
        {renderBody()}

        <div className="flex flex-col gap-2">
          {action?.buttons?.map((btn) => (
            <button
              key={btn.reply.id}
              className="border border-green-500 text-green-600 text-sm rounded-lg py-1.5 px-2 hover:bg-green-50 transition"
            >
              {btn.reply.title}
            </button>
          ))}
        </div>

        {renderFooter()}
      </div>
    );
  }

  // =========================
  // 📋 LIST TYPE
  // =========================
  if (type === "list") {
    return (
      <div className="bg-gray-100 rounded-xl p-3 w-72">
        {renderHeader()}
        {renderBody()}

        <button className="w-full bg-green-500 text-white text-sm py-2 rounded-lg mb-2 hover:bg-green-600 transition">
          {action?.button || "View options"}
        </button>

        <div className="max-h-60 overflow-y-auto pr-1">
          {action?.sections?.map((section, i) => (
            <div key={i} className="mb-3">
              {section.title && (
                <p className="text-xs text-gray-500 mb-1">{section.title}</p>
              )}

              <div className="flex flex-col gap-1">
                {section.rows?.map((row) => (
                  <div
                    key={row.id}
                    className="bg-white border rounded-lg p-2 hover:bg-gray-50 cursor-pointer transition"
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

        {renderFooter()}
      </div>
    );
  }

  // =========================
  // 🔁 FLOW TYPE
  // =========================
  if (type === "flow") {
    const ctaText = action?.parameters?.flow_cta || "Open";

    return (
      <div className="bg-gray-100 rounded-xl p-3 max-w-xs">
        {renderHeader()}
        {renderBody()}

        {/* CTA Button */}
        <button
          className="w-full bg-green-500 text-white text-sm py-2 rounded-lg hover:bg-green-600 transition"
          onClick={() => {
            console.log("Flow clicked:", action?.parameters);

            // 👉 You can trigger your flow handler here
            // openFlow(action.parameters)
          }}
        >
          {ctaText}
        </button>

        {renderFooter()}
      </div>
    );
  }

  return (
    <div className="bg-gray-100 text-xs p-2 rounded">
      Unsupported interactive type: {type}
    </div>
  );
};

export default InteractiveMessage;
