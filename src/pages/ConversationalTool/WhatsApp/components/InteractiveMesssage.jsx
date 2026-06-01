import React, { useRef, useState } from "react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";

const InteractiveMessage = ({ interactive }) => {
  const [flowPopup, setFlowPopup] = useState({
    open: false,
    data: null,
  });

  const handleFlowClick = (message) => {
    console.log(message);
    setFlowPopup({
      open: true,
      data: message?.data || null,
    });
  };

  const scrollRef = useRef(null);

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
      <div className="bg-app-surface rounded-xl p-3 w-72">
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
  if (type === "flow_response" || type === "flow") {
    const ctaText = action?.parameters?.flow_cta || "Open";

    return (
      <div>
        {flowPopup.open && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setFlowPopup({ open: false, data: null })}
          >
            <div
              className="bg-white rounded-xl w-[90%] max-w-md p-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">Flow Details</h2>
                <button
                  onClick={() => setFlowPopup({ open: false, data: null })}
                  className="text-gray-500"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="space-y-2 max-h-80 overflow-auto">
                {flowPopup.data ? (
                  Object.entries(flowPopup.data).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between border-b pb-1 text-sm"
                    >
                      <span className="font-medium text-gray-600">{key}</span>
                      <span className="text-gray-800">{value}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No data available</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div
          className={`bg-gray-100 rounded-xl p-3 max-w-xs ${type === "flow_response" && "cursor-pointer"}`}
        >
          {renderHeader()}
          {renderBody()}

          {/* CTA Button */}
          <button
            className="w-full bg-green-500 text-white text-sm py-2 rounded-lg hover:bg-green-600 transition"
            onClick={() => {
              handleFlowClick(interactive);
            }}
          >
            {ctaText}
          </button>

          {renderFooter()}
        </div>
      </div>
    );
  }

  if (type === "carousel") {
    const scroll = (direction) => {
      if (!scrollRef.current) return;

      const scrollAmount = 240; // width of one card
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    };

    return (
      <div className="bg-gray-100 rounded-xl p-3 max-w-sm relative">
        {renderHeader()}
        {renderBody()}

        {/* LEFT BUTTON */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-1 top-1/2 -translate-y-1/2 bg-primary/80 text-white shadow-md rounded-full size-6 flex items-center justify-center z-10 hover:bg-primary/90"
        >
          <FaAngleLeft />
        </button>

        {/* RIGHT BUTTON */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-1 top-1/2 -translate-y-1/2 bg-primary/80 text-white shadow-md rounded-full size-6 flex items-center justify-center z-10 hover:bg-primary/90"
        >
          <FaAngleRight />
        </button>

        {/* SCROLL CONTAINER */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scroll-smooth scrollbar-hidden px-6"
        >
          {action?.cards?.map((card) => (
            <div
              key={card.card_index}
              className="min-w-[220px] bg-white rounded-xl border p-2 shadow-sm"
            >
              {/* Header */}
              {card?.header?.type === "image" && (
                <img
                  src={card.header.image.link}
                  alt="card"
                  className="w-full h-32 object-cover rounded-lg mb-2"
                />
              )}

              {card?.header?.type === "video" && (
                <video
                  src={card.header.video.link}
                  controls
                  className="w-full h-32 object-cover rounded-lg mb-2"
                />
              )}

              {/* Body */}
              {card?.body?.text && (
                <p className="text-sm text-gray-800 mb-2">{card.body.text}</p>
              )}

              {/* CTA */}
              {card?.action?.name === "cta_url" && (
                <button
                  onClick={() =>
                    window.open(card.action.parameters.url, "_blank")
                  }
                  className="w-full border border-green-500 text-green-600 text-sm rounded-lg py-1.5 px-2 hover:bg-green-50 transition"
                >
                  {card.action.parameters.display_text}
                </button>
              )}
            </div>
          ))}
        </div>

        {renderFooter()}
      </div>
    );
  }

  if (type === "list_reply" || type === "button_reply") {
    return null;
  }

  return (
    <div className="bg-gray-100 text-xs p-2 rounded">
      Unsupported interactive type: {type}
    </div>
  );
};

export default InteractiveMessage;
