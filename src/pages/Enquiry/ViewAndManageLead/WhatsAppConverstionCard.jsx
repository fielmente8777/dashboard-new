import { useEffect, useRef, useState } from "react";
import { BsCheckLg, BsCheckAll } from "react-icons/bs";
import { IoChevronUp, IoChevronDown } from "react-icons/io5";
import { renderMessageWithLinks } from "../../../utils/urlParser";
import { NEW_BASE_URL } from "../../../data/constant";
import { MessageSkeleton } from "../../../components/Skeltons/WhatsappChatSkelton";

const WhatsAppConverstionCard = ({ messageList, messageLoading }) => {
  const bottomRef = useRef(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (expanded) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    }
  }, [expanded, messageList]);

  return (
    <>
      {/* SLIDING CHAT PANEL */}
      <div
        className={`fixed max-w-96 w-full bg-gray-100 border border-black rounded-sm md:shadow z-40 transition-all duration-300 ease-in-out
        ${expanded ? "bottom-20 h-[60vh] right-6" : "bottom-0 right-0 h-0 overflow-hidden"}`}
      >
        <div
          style={{
            backgroundImage:
              "url('https://www.transparenttextures.com/patterns/cubes.png')",
          }}
          className="h-full p-4 overflow-y-auto"
        >
          {messageLoading ? (
            <div className="space-y-4">
              <MessageSkeleton align="left" />
              <MessageSkeleton align="right" />
            </div>
          ) : messageList?.length > 0 ? (
            messageList.map((message, index) => {
              const isMe = message.sender === "me";

              return (
                <div
                  key={index}
                  className={`flex ${
                    isMe ? "justify-end" : "justify-start"
                  } mb-2`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 ${
                      isMe
                        ? "rounded-tl-xl border rounded-br-xl rounded-bl-lg bg-white"
                        : "bg-white border rounded-tr-xl rounded-br-lg rounded-bl-xl"
                    }`}
                  >
                    {/* TEXT */}
                    {message.messageType === "text" && message.body && (
                      <p className="text-sm whitespace-pre-wrap">
                        {renderMessageWithLinks(message.body)}
                      </p>
                    )}

                    {/* TEMPLATE */}
                    {message.messageType === "template" && (
                      <div className="bg-green-100 px-3 py-2 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1 capitalize">
                          {message.template?.template?.name}
                        </p>
                        <p className="text-sm">
                          {message.body || (
                            <span className="text-xs text-zinc-400">
                              No text defined
                            </span>
                          )}
                        </p>
                      </div>
                    )}

                    {/* IMAGE */}
                    {message.messageType === "image" && (
                      <img
                        src={
                          message.media?.url ||
                          `${NEW_BASE_URL}/api/v1/whatsapp/media/${message.media.id}?ndid=${localStorage.getItem(
                            "ndid",
                          )}`
                        }
                        alt="WhatsApp"
                        className="mt-2 rounded-lg w-full"
                      />
                    )}

                    {/* TIME + STATUS */}
                    <div className="flex justify-end gap-1 mt-1 items-center">
                      <span className="text-[10px] opacity-70">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                      {isMe && (
                        <span className="text-xs">
                          {message.status === "sent" && <BsCheckLg />}
                          {message.status === "delivered" && <BsCheckAll />}
                          {message.status === "read" && (
                            <span className="text-blue-400">
                              <BsCheckAll />
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-400">No conversation yet</p>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* BOTTOM HEADER BAR (ALWAYS VISIBLE) */}
      <div className="fixed! bottom-5 right-0  md:right-6 z-50 bg-gray-100 border-t shadow-sm px-4 py-3 flex items-center justify-between max-w-96 w-full">
        <p className="text-sm font-medium text-gray-700">
          WhatsApp Conversation
        </p>

        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="size-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
        >
          {expanded ? <IoChevronDown /> : <IoChevronUp />}
        </button>
      </div>
    </>
  );
};

export default WhatsAppConverstionCard;
