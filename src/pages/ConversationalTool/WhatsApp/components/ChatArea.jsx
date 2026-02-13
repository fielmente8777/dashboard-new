import { useEffect, useRef, useState } from "react";
import { MessageSkeleton } from "../../../../components/Skeltons/WhatsappChatSkelton";

const ChatArea = ({ selectedContact, messages, onSubmit, loadingMessage }) => {
  const [messageValue, setMessageValue] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageValue.trim()) return;

    onSubmit({
      text: messageValue,
      sender: "me",
      createdAt: new Date(),
    });

    setMessageValue("");
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-teal-600 text-white px-6 py-4">
        <h2 className="text-lg font-semibold">{selectedContact?.name}</h2>
      </div>

      {/* Messages */}

      <div className="flex-1 p-6 overflow-y-auto scrollbar-hidden">
        {loadingMessage ? (
          <div className="flex-1 p-6 space-y-4 overflow-hidden">
            <MessageSkeleton align="left" />
            <MessageSkeleton align="right" />
            <MessageSkeleton align="left" />
            <MessageSkeleton align="right" />
            <MessageSkeleton align="left" />
          </div>
        ) : (
          <div>
            {messages?.length > 0 ? (
              messages?.map((message, index) => {
                const isMe = message.sender === "me";

                return (
                  <div
                    key={index}
                    className={`flex mb-4 ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`rounded-2xl p-3 max-w-sm ${
                        isMe
                          ? "bg-gray-200 border text-gray-900"
                          : "bg-teal-600 text-white"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-400">No conversation yet</p>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="bg-white border-t p-4 flex">
        <input
          value={messageValue}
          onChange={(e) => setMessageValue(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded-lg px-4 py-2 mr-4"
        />
        <button
          type="submit"
          className="bg-teal-600 text-white px-6 py-2 rounded-lg"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatArea;
