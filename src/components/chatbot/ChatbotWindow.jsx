import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { v4 as uuidv4 } from "uuid";
import { Check, Copy, Loader2, PanelLeft, Plus, RotateCcw, SendHorizontal, Sparkles, X } from "lucide-react";
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

// Remembers which chat was open (per hotel) so reopening the widget restores it.
// localStorage, so logging out (clearSession) forgets it and the next user never sees it.
const activeKey = (hid) => `eazotel-chatbot-active-conversation:${hid || "none"}`;
const readActive = (hid) => {
  try {
    return localStorage.getItem(activeKey(hid)) || null;
  } catch {
    return null;
  }
};
const writeActive = (hid, id) => {
  try {
    if (id) localStorage.setItem(activeKey(hid), id);
    else localStorage.removeItem(activeKey(hid));
  } catch {
    /* storage unavailable: history still works, just not restored */
  }
};

const MAX_INPUT_HEIGHT = 160;

const sourceLabel = (source) =>
  typeof source === "string"
    ? source
    : source.sourceType === "crm"
      ? "Live CRM data"
      : source.title || source.sourceType || "Source";

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard?.writeText(text).then(() => setCopied(true), () => {})}
      aria-label={copied ? "Copied" : "Copy answer"}
      title={copied ? "Copied" : "Copy"}
      className="rounded-md p-1 text-[var(--cb-faint)] transition hover:bg-[var(--cb-hover)] hover:text-[var(--cb-text-2)]"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

const fromServer = (m) => ({
  id: m._id,
  role: m.role,
  content: m.content,
  sources: Array.isArray(m.sources) ? m.sources : [],
  createdAt: m.createdAt,
  clientMessageId: m.clientMessageId,
  status: "sent",
});

export default function ChatbotWindow({ hid, onClose }) {
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
    writeActive(hid, id);
  }, [hid]);

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

  // Grow the input with its text, up to MAX_INPUT_HEIGHT.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_INPUT_HEIGHT)}px`;
  }, [input]);

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
    const saved = readActive(hid);
    if (saved) openConversation(saved);
  }, [hid, openConversation]);

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
      const response = await sendChatMessage({
        message: question,
        conversationId: conversationIdRef.current,
        clientMessageId,
        hid,
      });
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
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-[var(--cb-overlay)] p-3 backdrop-blur-[2px] sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeChat();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Ask Eazotel AI"
        className="relative flex h-[min(86vh,780px)] min-h-[420px] w-full max-w-[1120px] overflow-hidden rounded-2xl border border-[var(--cb-border)] bg-[var(--cb-bg)] text-[var(--cb-text)] shadow-2xl sm:rounded-[22px]"
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
          <header className="flex shrink-0 items-center justify-between border-b border-[var(--cb-border)] px-4 py-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setHistoryOpen(true)}
                aria-label="Show chat history"
                className="rounded-lg p-2 text-[var(--cb-muted)] hover:bg-[var(--cb-hover)] hover:text-[var(--cb-text)] md:hidden"
              >
                <PanelLeft size={20} />
              </button>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-600 dark:from-blue-600 dark:to-indigo-500 text-white shadow-lg">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="text-base font-semibold sm:text-lg">Ask Eazotel AI</h2>
                <p className="text-xs text-[var(--cb-muted)] sm:text-sm">Answers from your dashboard data</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Desktop has New chat in the history column; this is the mobile entry point. */}
              {(messages.length > 0 || conversationId) && (
                <button
                  type="button"
                  onClick={newChat}
                  aria-label="New chat"
                  className="flex items-center gap-1 rounded-md border border-[var(--cb-border)] px-2 py-1 text-xs text-[var(--cb-text-2)] hover:bg-[var(--cb-hover)] md:hidden"
                >
                  <Plus size={14} />
                  New
                </button>
              )}
              <span className="hidden rounded-md border border-[var(--cb-border)] px-2 py-1 text-xs text-[var(--cb-muted)] sm:block">Esc</span>
              <button
                type="button"
                onClick={closeChat}
                aria-label="Close chatbot"
                className="rounded-lg p-2 text-[var(--cb-muted)] hover:bg-[var(--cb-hover)] hover:text-[var(--cb-text)]"
              >
                <X size={20} />
              </button>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto">
            {conversationLoading ? (
              <div className="flex min-h-full items-center justify-center gap-2 text-sm text-[var(--cb-muted)]" aria-busy="true">
                <Loader2 size={18} className="animate-spin text-[var(--cb-accent)]" />
                Loading conversation…
              </div>
            ) : conversationError ? (
              <div className="flex min-h-full flex-col items-center justify-center px-6 text-center">
                <p className="text-sm text-[var(--cb-danger)]">{conversationError}</p>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => openConversation(conversationIdRef.current)}
                    className="flex items-center gap-1.5 rounded-lg border border-[var(--cb-border)] px-3 py-2 text-sm text-[var(--cb-text-2)] hover:bg-[var(--cb-hover)]"
                  >
                    <RotateCcw size={14} /> Try again
                  </button>
                  <button
                    type="button"
                    onClick={newChat}
                    className="rounded-lg border border-[var(--cb-border)] px-3 py-2 text-sm text-[var(--cb-text-2)] hover:bg-[var(--cb-hover)]"
                  >
                    New chat
                  </button>
                </div>
              </div>
            ) : showEmptyState ? (
              <div className="flex min-h-full flex-col items-center justify-center px-4 py-8 sm:px-10">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-600 dark:from-blue-600 dark:to-indigo-500 text-white shadow-lg">
                  <Sparkles size={32} />
                </div>
                <h1 className="text-center text-xl font-semibold sm:text-2xl">Ask anything about your dashboard</h1>
                <p className="mt-3 max-w-lg text-center text-sm leading-6 text-[var(--cb-muted)] sm:text-base">
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
                      className="flex min-h-[66px] items-start gap-3 rounded-xl border border-[var(--cb-border)] bg-[var(--cb-hover)] px-4 py-4 text-left text-sm leading-5 text-[var(--cb-text-2)] transition hover:border-blue-400/40 hover:bg-[var(--cb-hover)] hover:text-[var(--cb-text)] disabled:opacity-50"
                    >
                      <Sparkles size={16} className="mt-0.5 shrink-0 text-[var(--cb-accent)]" />
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
                          ? "whitespace-pre-wrap rounded-br-md bg-primary text-white dark:bg-blue-600"
                          : message.isError
                            ? "whitespace-pre-wrap border border-red-500/30 bg-red-500/10 text-[var(--cb-danger)]"
                            : "border border-[var(--cb-border)] bg-[var(--cb-bubble)] text-[var(--cb-text-2)]"
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
                                  className="text-[var(--cb-accent)] underline underline-offset-2 hover:opacity-80"
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
                        <div className="mt-1 text-[11px] text-white/70">No reply yet — use Retry below</div>
                      )}

                      {message.isError && message.errorFor && (
                        <button
                          type="button"
                          onClick={() => retry(message)}
                          disabled={loading}
                          className="mt-2 flex items-center gap-1.5 rounded-md border border-red-300/30 px-2 py-1 text-xs text-[var(--cb-danger)] hover:bg-red-500/20 disabled:opacity-40"
                        >
                          <RotateCcw size={12} /> Retry
                        </button>
                      )}

                      {message.role === "assistant" && !message.isError && (
                        <div className="mt-2 flex items-center justify-between gap-3 border-t border-[var(--cb-border)] pt-2 text-xs text-[var(--cb-muted)]">
                          <span className="min-w-0">
                            {message.sources?.length > 0 &&
                              `Source: ${[...new Set(message.sources.map(sourceLabel))].join(", ")}`}
                          </span>
                          {message.content && <CopyButton text={message.content} />}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-1 self-start rounded-xl border border-[var(--cb-border)] bg-[var(--cb-bubble)] px-4 py-3">
                    {[0, 1, 2].map((number) => (
                      <span
                        key={number}
                        className="h-2 w-2 animate-bounce rounded-full bg-blue-400"
                        style={{ animationDelay: `${number * 120}ms` }}
                      />
                    ))}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </main>

          <footer className="shrink-0 border-t border-[var(--cb-border)] bg-[var(--cb-bg)] px-3 pb-4 pt-3 sm:px-4 sm:pb-5">
            <form
              onSubmit={(event) => handleSubmit(event)}
              className="mx-auto flex w-full max-w-[710px] items-end gap-2 rounded-2xl border border-blue-500/50 bg-[var(--cb-raised)] p-1.5 focus-within:ring-2 focus-within:ring-blue-500/20 transition sm:p-2"
            >
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  // Enter sends, Shift+Enter adds a line; ignore Enter while an IME is composing
                  if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    handleSubmit(event);
                  }
                }}
                placeholder="Ask about your leads, e.g. leads of October 2"
                disabled={loading || conversationLoading}
                aria-label="Ask Eazotel AI a question"
                className="min-w-0 flex-1 resize-none bg-transparent px-2 py-3 text-sm leading-5 text-[var(--cb-text)] outline-none placeholder:text-[var(--cb-faint)] sm:px-3"
              />
              <button
                type="submit"
                disabled={loading || conversationLoading || !input.trim()}
                aria-label="Send message"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-600 dark:from-blue-600 dark:to-indigo-500 text-white disabled:opacity-40"
              >
                <SendHorizontal size={18} />
              </button>
            </form>
            <p className="mx-auto mt-2 hidden max-w-[710px] px-2 text-[11px] text-[var(--cb-faint)] sm:block">
              Enter to send · Shift+Enter for a new line · AI answers can be wrong, so check important numbers.
            </p>
          </footer>
        </div>
      </section>
    </div>
  );
}