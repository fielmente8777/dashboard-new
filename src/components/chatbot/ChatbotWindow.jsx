import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  sendChatMessage,
} from "../../services/chatbot.service";

export default function ChatbotWindow({
  onClose,
}) {
  const [messages, setMessages] =
    useState([
      {
        role: "assistant",
        content:
          "Hi 👋 How can I help you today?",
      },
    ]);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [
    conversationId,
    setConversationId,
  ] = useState(null);

  const messagesEndRef =
    useRef(null);

  /**
   * Auto scroll
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  /**
   * Send message
   */
  async function handleSubmit(event) {
    event.preventDefault();

    const message =
      input.trim();

    if (!message || loading) {
      return;
    }

    /**
     * Add user message
     */
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: message,
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      const response =
        await sendChatMessage(
          message,
          conversationId
        );

      const data =
        response?.data || response;

      setConversationId(
        data.conversationId
      );

      /**
       * Add AI response
       */
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.answer ||
            "I couldn't generate a response.",

          sources:
            data.sources || [],
        },
      ]);
    } catch (error) {
      console.error(
        "Chatbot error:",
        error
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't process your request. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="
        fixed
        bottom-6
        right-6
        z-[9999]

        flex
        h-[600px]
        w-[390px]

        max-w-[calc(100vw-32px)]

        flex-col

        overflow-hidden
        rounded-2xl

        border
        border-gray-200

        bg-white

        shadow-2xl
      "
    >
      {/* HEADER */}
      <div
        className="
          flex
          items-center
          justify-between

          bg-black

          px-4
          py-4

          text-white
        "
      >
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center

              rounded-full

              bg-white/10
            "
          >
            🤖
          </div>

          <div>
            <h3 className="text-sm font-semibold">
              AI Assistant
            </h3>

            <p className="text-xs text-gray-300">
              Online
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="
            rounded-md
            p-2

            text-lg

            hover:bg-white/10
          "
        >
          ×
        </button>
      </div>

      {/* MESSAGES */}
      <div
        className="
          flex-1
          space-y-4

          overflow-y-auto

          bg-gray-50

          p-4
        "
      >
        {messages.map(
          (message, index) => {
            const isUser =
              message.role ===
              "user";

            return (
              <div
                key={index}
                className={`flex ${
                  isUser
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`
                    max-w-[80%]

                    rounded-2xl

                    px-4
                    py-3

                    text-sm
                    leading-relaxed

                    ${
                      isUser
                        ? "rounded-br-md bg-black text-white"
                        : "rounded-bl-md bg-white text-gray-800 shadow-sm"
                    }
                  `}
                >
                  {message.content}

                  {/* SOURCES */}
                  {!isUser &&
                    message.sources
                      ?.length > 0 && (
                      <div
                        className="
                          mt-2

                          border-t
                          border-gray-100

                          pt-2

                          text-[10px]
                          text-gray-400
                        "
                      >
                        Sources:{" "}
                        {message.sources.join(
                          ", "
                        )}
                      </div>
                    )}
                </div>
              </div>
            );
          }
        )}

        {/* TYPING */}
        {loading && (
          <div className="flex justify-start">
            <div
              className="
                rounded-2xl
                rounded-bl-md

                bg-white

                px-4
                py-3

                shadow-sm
              "
            >
              <div className="flex gap-1">
                <span className="animate-bounce">
                  ●
                </span>

                <span
                  className="animate-bounce"
                  style={{
                    animationDelay:
                      "100ms",
                  }}
                >
                  ●
                </span>

                <span
                  className="animate-bounce"
                  style={{
                    animationDelay:
                      "200ms",
                  }}
                >
                  ●
                </span>
              </div>
            </div>
          </div>
        )}

        <div
          ref={messagesEndRef}
        />
      </div>

      {/* INPUT */}
      <form
        onSubmit={handleSubmit}
        className="
          border-t
          border-gray-200

          bg-white

          p-3
        "
      >
        <div
          className="
            flex
            items-center
            gap-2

            rounded-xl

            border
            border-gray-200

            bg-gray-50

            px-3
            py-2

            focus-within:border-gray-400
          "
        >
          <input
            type="text"
            value={input}
            onChange={(event) =>
              setInput(
                event.target.value
              )
            }
            placeholder="Ask anything..."
            disabled={loading}
            className="
              min-w-0
              flex-1

              bg-transparent

              text-sm
              text-gray-900

              outline-none

              placeholder:text-gray-400
            "
          />

          <button
            type="submit"
            disabled={
              loading ||
              !input.trim()
            }
            className="
              flex
              h-9
              w-9
              shrink-0

              items-center
              justify-center

              rounded-lg

              bg-black

              text-white

              transition

              hover:bg-gray-800

              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            ↑
          </button>
        </div>
      </form>
    </div>
  );
}