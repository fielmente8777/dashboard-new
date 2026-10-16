import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { v4 as uuidv4 } from "uuid";
import { Loader2, PanelLeft, Plus, RotateCcw } from "lucide-react";
import { getConversation, sendChatMessage } from "../../services/chatbot.service";
import useChatbotHistory from "../../hooks/useChatbotHistory";
import ChatHistorySidebar from "./ChatHistorySidebar";

const suggestions = [
  "Show today's leads",
  "How many leads came in yesterday?",
  "Which lead source brings the most leads?",
  "Show converted leads this month",
  "Which leads are pending?",
  "Summarize my CRM performance",
];

// Remembers which chat was open so reopening the widget (or navigating) restores it.
const ACTIVE_KEY = "eazotel-chatbot-active-conversation";
const readActive = () => {
  try {
    return sessionStorage.getItem(ACTIVE_KEY) || null;
  } catch {
    return null;
  }
};
const writeActive = (id) => {
  try {
    if (id) sessionStorage.setItem(ACTIVE_KEY, id);
    else sessionStorage.removeItem(ACTIVE_KEY);
  } catch {
    /* storage unavailable: history still works, just not restored */
  }
};

const fromServer = (m) => ({
  id: m._id,
  role: m.role,
  content: m.content,
  sources: Array.isArray(m.sources) ? m.sources : [],
  createdAt: m.createdAt,
  clientMessageId: m.clientMessageId,
  status: "sent",
});

export default function ChatbotWindow({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationIdState] = useState(null);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [conversationError, setConversationError] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false); // mobile drawer

  const history = useChatbotHistory();
  const { upsert: upsertConversation, refresh: refreshHistory } = history;

  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const loadingRef = useRef(false);
  const conversationIdRef = useRef(null);
  // Bumped whenever the visible chat changes, so late responses never land in the wrong chat.
  const viewRef = useRef(0);
  const overlayRef = useRef(false);

  const setConversationId = useCallback((id) => {
    conversationIdRef.current = id;
    setConversationIdState(id);
    writeActive(id);
  }, []);

  const closeChat = useCallback(() => onClose?.(), [onClose]);
  const handleOverlayChange = useCallback((open) => {
    overlayRef.current = open;
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      if (overlayRef.current) return; // menu / rename / delete dialog handles its own Escape
      if (historyOpen) return setHistoryOpen(false);
      closeChat();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeChat, historyOpen]);

  const openConversation = useCallback(
    async (id) => {
      if (!id) return;
      const view = ++viewRef.current;
      setHistoryOpen(false);
      setConversationId(id);
      setConversationError(null);
      setConversationLoading(true);
      setMessages([]);
      try {
        const response = await getConversation(id);
        if (view !== viewRef.current) return;
        const data = response?.data;
        setMessages(Array.isArray(data?.messages) ? data.messages.map(fromServer) : []);
        if (data?._id) upsertConversation({ ...data, messages: undefined });
      } catch (error) {
        if (view !== viewRef.current) return;
        if (error?.status === 404) {
          // Deleted elsewhere: fall back to a fresh chat.
          setConversationId(null);
          setMessages([]);
          refreshHistory();
        } else {
          setConversationError(error?.message || "Couldn't load this conversation.");
        }
      } finally {
        if (view === viewRef.current) {
          setConversationLoading(false);
          inputRef.current?.focus();
        }
      }
    },
    [refreshHistory, setConversationId, upsertConversation]
  );

  // Restore the last open chat when the widget is reopened.
  useEffect(() => {
    const saved = readActive();
    if (saved) openConversation(saved);
  }, [openConversation]);

  function newChat() {
    viewRef.current += 1;
    setMessages([]);
    setConversationId(null);
    setConversationError(null);
    setConversationLoading(false);
    setHistoryOpen(false);
    setInput("");
    inputRef.current?.focus();
  }

  function handleSelectConversation(conversation) {
    if (conversation._id === conversationIdRef.current && !conversationError) {
      setHistoryOpen(false);
      return;
    }
    openConversation(conversation._id);
  }

  function handleConversationDeleted(conversation) {
    if (conversation._id === conversationIdRef.current) newChat();
  }

  async function handleSubmit(event, suggestedQuestion, retryMessage) {
    event?.preventDefault();

    const question = String(retryMessage?.content ?? suggestedQuestion ?? input).trim();
    if (!question || loadingRef.current || conversationLoading) return;

    const view = viewRef.current;
    const clientMessageId = retryMessage?.clientMessageId || uuidv4();
    const localId = retryMessage?.id || `local-${clientMessageId}`;

    loadingRef.current = true;
    setLoading(true);
    if (!retryMessage) setInput("");

    setMessages((previous) =>
      retryMessage
        ? previous
            .filter((m) => m.errorFor !== localId)
            .map((m) => (m.id === localId ? { ...m, status: "sending" } : m))
        : [...previous, { id: localId, role: "user", content: question, clientMessageId, status: "sending" }]
    );

    try {
      const response = await sendChatMessage(question, conversationIdRef.current, clientMessageId);
      const result = response?.data ?? response;

      if (!result || typeof result.answer !== "string") {
        throw new Error(result?.message || "Invalid response from chatbot API");
      }

      if (result.conversation) upsertConversation(result.conversation);
      if (view !== viewRef.current) return; // user switched chats; reply is saved and visible there

      if (result.conversationId) setConversationId(result.conversationId);

      setMessages((previous) => [
        ...previous.map((m) =>
          m.id === localId
            ? { ...m, ...(result.userMessage ? fromServer(result.userMessage) : {}), status: "sent" }
            : m
        ),
        result.assistantMessage
          ? fromServer(result.assistantMessage)
          : {
              id: `local-a-${clientMessageId}`,
              role: "assistant",
              content: result.answer,
              sources: Array.isArray(result.sources) ? result.sources : [],
              status: "sent",
            },
      ]);
    } catch (error) {
      console.error("Chatbot request failed:", error);

      // The backend saves the user message before calling the model; keep using that conversation.
      const savedConversationId = error?.data?.conversationId;
      if (savedConversationId) refreshHistory();
      if (view !== viewRef.current) return;

      if (error?.status === 404) {
        // Conversation was deleted: retry will start a new one.
        setConversationId(null);
        refreshHistory();
      } else if (savedConversationId) {
        setConversationId(savedConversationId);
      }

      setMessages((previous) => [
        ...previous.map((m) => (m.id === localId ? { ...m, status: "failed" } : m)),
        {
          id: `error-${clientMessageId}`,
          errorFor: localId,
          role: "assistant",
          content: error?.message || "Sorry, I couldn't process your request. Please try again.",
          isError: true,
        },
      ]);
    } finally {
      loadingRef.current = false;
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function retry(errorMessage) {
    const original = messages.find((m) => m.id === errorMessage.errorFor);
    if (original) handleSubmit(null, undefined, original);
  }

  const showEmptyState = messages.length === 0 && !conversationLoading && !conversationError;
  
  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/65 p-3 backdrop-blur-[2px] sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeChat();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Ask Eazotel AI"
        className="relative flex h-[min(86vh,780px)] min-h-[420px] w-full max-w-[1120px] overflow-hidden rounded-2xl border border-[#292832] bg-[#17161c] text-white shadow-2xl sm:rounded-[22px]"
      >
        {/* Desktop: persistent history column */}
        <ChatHistorySidebar
          history={history}
          activeId={conversationId}
          onSelect={handleSelectConversation}
          onNewChat={newChat}
          onDeleted={handleConversationDeleted}
          onOverlayChange={handleOverlayChange}
          className="hidden w-[260px] shrink-0 md:flex"
        />

        {/* Mobile: history as a drawer */}
        {historyOpen && (
          <div
            className="absolute inset-0 z-20 flex bg-black/50 md:hidden"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setHistoryOpen(false);
            }}
          >
            <ChatHistorySidebar
              history={history}
              activeId={conversationId}
              onSelect={handleSelectConversation}
              onNewChat={newChat}
              onDeleted={handleConversationDeleted}
              onOverlayChange={handleOverlayChange}
              onClose={() => setHistoryOpen(false)}
              className="flex h-full w-[min(300px,85%)] shadow-2xl"
            />
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex shrink-0 items-center justify-between border-b border-white/[0.07] px-4 py-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setHistoryOpen(true)}
                aria-label="Show chat history"
                className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white md:hidden"
              >
                <PanelLeft size={20} />
              </button>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-violet-600 text-2xl shadow-lg">
                ✧
              </div>
              <div>
                <h2 className="text-base font-semibold sm:text-lg">Ask Eazotel AI</h2>
                <p className="text-xs text-gray-400 sm:text-sm">Answers from your dashboard data</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Desktop has New chat in the history column; this is the mobile entry point. */}
              {(messages.length > 0 || conversationId) && (
                <button
                  type="button"
                  onClick={newChat}
                  aria-label="New chat"
                  className="flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-xs text-gray-300 hover:bg-white/10 md:hidden"
                >
                  <Plus size={14} />
                  New
                </button>
              )}
              <span className="hidden rounded-md border border-white/10 px-2 py-1 text-xs text-gray-400 sm:block">Esc</span>
              <button
                type="button"
                onClick={closeChat}
                aria-label="Close chatbot"
                className="rounded-lg px-2 py-1 text-2xl text-gray-400 hover:bg-white/10 hover:text-white"
              >
                ×
              </button>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto">
            {conversationLoading ? (
              <div className="flex min-h-full items-center justify-center gap-2 text-sm text-gray-400" aria-busy="true">
                <Loader2 size={18} className="animate-spin text-violet-300" />
                Loading conversation…
              </div>
            ) : conversationError ? (
              <div className="flex min-h-full flex-col items-center justify-center px-6 text-center">
                <p className="text-sm text-red-200">{conversationError}</p>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => openConversation(conversationIdRef.current)}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-200 hover:bg-white/10"
                  >
                    <RotateCcw size={14} /> Try again
                  </button>
                  <button
                    type="button"
                    onClick={newChat}
                    className="rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 hover:bg-white/10"
                  >
                    New chat
                  </button>
                </div>
              </div>
            ) : showEmptyState ? (
              <div className="flex min-h-full flex-col items-center justify-center px-4 py-8 sm:px-10">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 text-4xl shadow-lg">
                  ✧
                </div>
                <h1 className="text-center text-xl font-semibold sm:text-2xl">Ask anything about your dashboard</h1>
                <p className="mt-3 max-w-lg text-center text-sm leading-6 text-gray-400 sm:text-base">
                  Ask about your leads, lead sources and CRM performance, or your
                  uploaded knowledge base. Try a date like "leads of October 2".
                </p>
                <div className="mt-8 grid w-full max-w-[710px] grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      disabled={loading || conversationLoading}
                      onClick={() => handleSubmit(null, suggestion)}
                      className="flex min-h-[66px] items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-4 text-left text-sm leading-5 text-gray-300 transition hover:border-violet-400/40 hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
                    >
                      <span className="text-lg text-violet-300">✧</span>
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6 sm:px-6">
                {messages.map((message, index) => (
                  <div
                    key={message.id || `${index}-${message.role}`}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[90%] break-words rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[85%] ${
                        message.role === "user"
                          ? "whitespace-pre-wrap rounded-br-md bg-violet-600 text-white"
                          : message.isError
                            ? "whitespace-pre-wrap border border-red-500/30 bg-red-500/10 text-red-200"
                            : "border border-white/[0.07] bg-[#211f28] text-gray-200"
                      }`}
                    >
                      {message.role === "assistant" && !message.isError ? (
                        <div className="chat-markdown">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              a: ({ children, ...props }) => (
                                <a
                                  {...props}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-violet-300 underline underline-offset-2 hover:text-violet-200"
                                >
                                  {children}
                                </a>
                              ),
                            }}
                          >
                            {message.content || ""}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        message.content
                      )}

                      {message.role === "user" && message.status === "failed" && (
                        <div className="mt-1 text-[11px] text-violet-100/80">No reply yet — use Retry below</div>
                      )}

                      {message.isError && message.errorFor && (
                        <button
                          type="button"
                          onClick={() => retry(message)}
                          disabled={loading}
                          className="mt-2 flex items-center gap-1.5 rounded-md border border-red-300/30 px-2 py-1 text-xs text-red-100 hover:bg-red-500/20 disabled:opacity-40"
                        >
                          <RotateCcw size={12} /> Retry
                        </button>
                      )}

                      {message.role === "assistant" && message.sources?.length > 0 && (
                        <div className="mt-3 border-t border-white/10 pt-2 text-xs text-gray-400">
                          Source:{" "}
                          {[
                            ...new Set(
                              message.sources.map((source) =>
                                typeof source === "string"
                                  ? source
                                  : source.sourceType === "crm"
                                    ? "Live CRM data"
                                    : source.title || source.sourceType || "Source"
                              )
                            ),
                          ].join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-1 self-start rounded-xl border border-white/10 bg-[#211f28] px-4 py-3">
                    {[0, 1, 2].map((number) => (
                      <span
                        key={number}
                        className="h-2 w-2 animate-bounce rounded-full bg-violet-400"
                        style={{ animationDelay: `${number * 120}ms` }}
                      />
                    ))}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </main>

          <footer className="shrink-0 border-t border-white/[0.05] bg-[#17161c] px-3 pb-4 pt-3 sm:px-4 sm:pb-5">
            <form
              onSubmit={(event) => handleSubmit(event)}
              className="mx-auto flex w-full max-w-[710px] items-center gap-2 rounded-2xl border border-[#6259ff] bg-[#1b1a22] p-1.5 focus-within:ring-2 focus-within:ring-violet-500/20 sm:p-2"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about your leads, e.g. leads of October 2"
                disabled={loading || conversationLoading}
                aria-label="Ask Eazotel AI a question"
                className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-white outline-none placeholder:text-gray-500 sm:px-3"
              />
              <button
                type="submit"
                disabled={loading || conversationLoading || !input.trim()}
                aria-label="Send message"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl text-white disabled:opacity-40"
              >
                ➤
              </button>
            </form>
          </footer>
        </div>
      </section>
    </div>
  );
}