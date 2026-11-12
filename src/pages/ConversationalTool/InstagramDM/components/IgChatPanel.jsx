import {
  ArrowDown,
  ArrowLeft,
  ExternalLink,
  PanelRight,
  SendHorizontal,
  Trash2,
  X,
} from "lucide-react";
import Button from "../../../../components/ui/Button";
import { useConfirm } from "../../../../context/ConfirmContext";
import { useApiAction } from "../../../../hooks/useApiAction";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import Icon from "../../../../components/ui/Icon";
import IconButton from "../../../../components/ui/IconButton";
import { ErrorState, Skeleton } from "../../../../components/ui/States";
import { getApiErrorMessage } from "../../../../redux/api/baseApi";
import {
  useDeleteInstagramMessagesMutation,
  useGetInstagramMessagesQuery,
  useSendInstagramMessageMutation,
} from "../../../../redux/api/instagramApi";
import {
  buildOutgoingMessage,
  canReply,
  formatDayLabel,
  getDisplayName,
  getMessageTime,
  isOutgoing,
  isSameDay,
  sameMessage,
} from "../igUtils";
import { useInstagramCache } from "../hooks/useInstagramCache";
import IgAvatar from "./IgAvatar";
import IgMessageBubble from "./IgMessageBubble";

const NO_MESSAGES = [];
const NEAR_BOTTOM = 120;
const MAX_LENGTH = 1000;

const ImageViewer = ({ url, onClose }) => {
  useEffect(() => {
    const onKeyDown = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      onClick={onClose}
      className="anim-fade fixed inset-0 z-[9995] flex items-center justify-center bg-black/80 p-4"
    >
      <img
        src={url}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="anim-pop max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
      />
      <IconButton
        icon={X}
        label="Close"
        onClick={onClose}
        className="absolute right-4 top-4 bg-white/10 text-white! hover:bg-white/20!"
      />
    </div>,
    document.body,
  );
};

const ChatHeader = ({
  conversation,
  selectedCount,
  onBack,
  onShowProfile,
  onDeleteSelected,
  onClearSelection,
}) => {
  const open = canReply(conversation);

  // while messages are selected the header is the bar for deleting them
  if (selectedCount > 0) {
    return (
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-app-border! bg-pink-500/10 px-3 sm:px-5">
        <IconButton icon={X} label="Cancel" onClick={onClearSelection} />
        <p className="flex-1 text-sm font-medium text-app-text">
          {selectedCount} {selectedCount === 1 ? "message" : "messages"} selected
        </p>
        <Button variant="danger" size="sm" icon={Trash2} onClick={onDeleteSelected}>
          Delete
        </Button>
      </header>
    );
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-app-border! bg-app-surface px-3 sm:px-4">
      <IconButton
        icon={ArrowLeft}
        label="Back to conversations"
        className="lg:hidden"
        onClick={onBack}
      />
      <span className="relative">
        <IgAvatar conversation={conversation} />
        <span
          className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-app-surface! ${open ? "bg-emerald-500" : "bg-gray-400"}`}
          aria-hidden="true"
        />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-app-text">
          {getDisplayName(conversation)}
        </p>
        <p className="truncate text-xs text-app-text-muted">
          {conversation.username ? `@${conversation.username}` : "Instagram"}
          <span className="mx-1.5 text-app-text-faint">·</span>
          {open ? "Can reply" : "Reply window closed (24h passed)"}
        </p>
      </div>
      {conversation.username && (
        <a
          href={`https://www.instagram.com/${conversation.username}/`}
          target="_blank"
          rel="noreferrer"
          title="Open profile on Instagram"
          className="inline-flex size-8 items-center justify-center rounded-lg text-app-text-muted transition hover:bg-app-surface-secondary hover:text-app-text"
        >
          <Icon icon={ExternalLink} />
        </a>
      )}
      <IconButton
        icon={PanelRight}
        label="Guest details"
        className="xl:hidden"
        onClick={onShowProfile}
      />
    </header>
  );
};

const MessageList = ({
  conversation,
  messages,
  loading,
  selectedKeys,
  onToggleSelect,
  onResend,
}) => {
  const selecting = selectedKeys.length > 0;
  const scrollRef = useRef(null);
  const atBottomRef = useRef(true);
  const [showJump, setShowJump] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const lastMessage = messages[messages.length - 1];

  const days = useMemo(
    () =>
      messages.reduce((groups, message) => {
        const time = getMessageTime(message);
        const current = groups[groups.length - 1];
        if (current && isSameDay(current.date, time)) current.messages.push(message);
        else groups.push({ key: `${time}-${groups.length}`, date: time, messages: [message] });
        return groups;
      }, []),
    [messages],
  );

  const scrollToEnd = (behavior = "auto") => {
    const element = scrollRef.current;
    element?.scrollTo({ top: element.scrollHeight, behavior });
  };

  useLayoutEffect(() => {
    atBottomRef.current = true;
    setShowJump(false);
    scrollToEnd();
  }, [conversation._id, loading]);

  useLayoutEffect(() => {
    if (!lastMessage) return;
    if (atBottomRef.current || isOutgoing(lastMessage)) scrollToEnd("smooth");
    else setShowJump(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessage?._id]);

  const handleScroll = () => {
    const element = scrollRef.current;
    const distance = element.scrollHeight - element.scrollTop - element.clientHeight;
    atBottomRef.current = distance < NEAR_BOTTOM;
    if (atBottomRef.current) setShowJump(false);
  };

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="chat-backdrop h-full overflow-y-auto px-3 py-4 sm:px-6"
      >
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-14 w-2/5 rounded-2xl" />
            <Skeleton className="ml-auto h-10 w-1/3 rounded-2xl" />
            <Skeleton className="h-20 w-1/2 rounded-2xl" />
          </div>
        ) : (
          <>
            {messages.length === 0 && (
              <p className="py-10 text-center text-sm text-app-text-muted">
                No messages yet.
              </p>
            )}
            {days.map((day) => (
              <section key={day.key} className="space-y-1">
                <p className="pointer-events-none sticky top-0 z-[5] py-2 text-center">
                  <span className="rounded-full border border-app-border! bg-app-surface px-3 py-1 text-[11px] font-medium text-app-text shadow-sm dark:border-white/10! dark:bg-[#1f2633]">
                    {formatDayLabel(day.date)}
                  </span>
                </p>
                {day.messages.map((message) => (
                  <IgMessageBubble
                    key={message._id || message.mid}
                    message={message}
                    selecting={selecting}
                    selected={selectedKeys.includes(message._id)}
                    onToggleSelect={onToggleSelect}
                    onImageClick={setImageUrl}
                    onResend={onResend}
                  />
                ))}
              </section>
            ))}
          </>
        )}
      </div>

      {showJump && (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
          <button
            type="button"
            onClick={() => {
              scrollToEnd("smooth");
              setShowJump(false);
            }}
            className="anim-pop pointer-events-auto flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-white shadow-lg dark:bg-blue-600"
          >
            <Icon icon={ArrowDown} size="sm" /> New messages
          </button>
        </div>
      )}

      {imageUrl && <ImageViewer url={imageUrl} onClose={() => setImageUrl("")} />}
    </div>
  );
};

const Composer = ({ windowOpen, onSend }) => {
  const [text, setText] = useState("");
  const inputRef = useRef(null);
  const trimmed = text.trim();
  const canSend = windowOpen && trimmed.length > 0 && trimmed.length <= MAX_LENGTH;

  // grow with the text, up to a few lines
  useLayoutEffect(() => {
    const element = inputRef.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, 140)}px`;
  }, [text]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSend) return;
    onSend(trimmed);
    setText("");
    inputRef.current?.focus();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="shrink-0 border-t border-app-border! bg-app-surface px-3 py-3 sm:px-4"
    >
      <div className="flex items-end gap-2">
        {windowOpen ? (
          <textarea
            ref={inputRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) handleSubmit(e);
            }}
            maxLength={MAX_LENGTH}
            placeholder="Message..."
            aria-label="Message"
            className="min-w-0 flex-1 resize-none rounded-2xl border border-app-border! bg-app-surface px-4 py-2 text-sm text-app-text outline-none transition placeholder:text-app-text-faint focus:border-pink-500! focus:ring-1 focus:ring-pink-500"
          />
        ) : (
          <p className="flex-1 rounded-lg border border-amber-500/30! bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
            Instagram only allows replies within 24 hours of the guest's last
            message. You can reply again once they message you.
          </p>
        )}
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send"
          title="Send"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 text-white transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
        >
          <Icon icon={SendHorizontal} size="lg" />
        </button>
      </div>
      {windowOpen && trimmed.length > MAX_LENGTH * 0.9 && (
        <p className="mt-1 text-right text-[11px] text-app-text-muted">
          {trimmed.length}/{MAX_LENGTH}
        </p>
      )}
    </form>
  );
};

// The open Instagram conversation. Give it `key={conversation._id}`.
//   onBack()  onShowProfile()
const IgChatPanel = ({ conversation, hid, onBack, onShowProfile }) => {
  const { confirm } = useConfirm();
  const run = useApiAction();
  const cache = useInstagramCache(hid);
  const messages = useGetInstagramMessagesQuery(conversation._id, {
    refetchOnMountOrArgChange: true,
  });
  const [sendMessage] = useSendInstagramMessageMutation();
  const [deleteMessages] = useDeleteInstagramMessagesMutation();
  const messageList = messages.data || NO_MESSAGES;
  const [selectedKeys, setSelectedKeys] = useState([]);

  const handleToggleSelect = useCallback((message) => {
    setSelectedKeys((keys) =>
      keys.includes(message._id)
        ? keys.filter((key) => key !== message._id)
        : [...keys, message._id],
    );
  }, []);

  const handleDeleteSelected = async () => {
    const count = selectedKeys.length;
    const confirmed = await confirm(
      `Delete ${count} ${count === 1 ? "message" : "messages"} from the dashboard? They stay in Instagram (Meta does not allow unsending from here).`,
      { title: "Delete messages" },
    );
    if (!confirmed) return;

    // messages still sending / not sent only exist here
    const savedIds = selectedKeys.filter((key) => !String(key).startsWith("temp-"));
    if (savedIds.length > 0) {
      const result = await run(deleteMessages(savedIds), {
        error: "Could not delete the messages.",
      });
      if (!result) return;
      // the chat list shows the latest remaining message
      result.conversations?.forEach((item) =>
        cache.patchConversation(item._id, { last_message: item.last_message }),
      );
    }

    cache.patchMessages(conversation._id, (list) =>
      list.filter((message) => !selectedKeys.includes(message._id)),
    );
    setSelectedKeys([]);
  };

  const send = useCallback(
    async (text, retryOf) => {
      const temp = retryOf
        ? { ...retryOf, status: "sending", failure: undefined }
        : buildOutgoingMessage(conversation, text);

      cache.patchMessages(conversation._id, (list) => {
        const index = list.findIndex((item) => item._id === temp._id);
        if (index >= 0) list[index] = temp;
        else list.push(temp);
      });

      try {
        const result = await sendMessage({
          conversationId: conversation._id,
          text,
        }).unwrap();
        const saved = result?.message;

        cache.patchMessages(conversation._id, (list) => {
          const index = list.findIndex((item) => item._id === temp._id);
          if (index < 0) return;
          // the websocket may have delivered the saved copy already
          if (saved && list.some((item, i) => i !== index && sameMessage(item, saved))) {
            list.splice(index, 1);
          } else {
            list[index] = saved || { ...temp, status: "sent" };
          }
        });
        cache.patchConversation(conversation._id, {
          last_message: { text, sender: "me", created_at: new Date().toISOString() },
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        cache.patchMessages(conversation._id, (list) => {
          const message = list.find((item) => item._id === temp._id);
          if (message) {
            message.status = "failed";
            message.failure = {
              message: getApiErrorMessage(err, "Could not send the message."),
            };
          }
        });
      }
    },
    [cache, conversation, sendMessage],
  );

  const sendRef = useRef(send);
  useEffect(() => {
    sendRef.current = send;
  });
  const handleResend = useCallback(
    (message) => sendRef.current(message.text, message),
    [],
  );

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-app-surface">
      <ChatHeader
        conversation={conversation}
        selectedCount={selectedKeys.length}
        onBack={onBack}
        onShowProfile={onShowProfile}
        onDeleteSelected={handleDeleteSelected}
        onClearSelection={() => setSelectedKeys([])}
      />

      {messages.isError ? (
        <div className="min-h-0 flex-1 p-4">
          <ErrorState message="Could not load the messages." onRetry={messages.refetch} />
        </div>
      ) : (
        <MessageList
          conversation={conversation}
          messages={messageList}
          loading={messages.isLoading}
          selectedKeys={selectedKeys}
          onToggleSelect={handleToggleSelect}
          onResend={handleResend}
        />
      )}

      <Composer windowOpen={canReply(conversation)} onSend={(text) => send(text)} />
    </div>
  );
};

export default IgChatPanel;
