import {
  ArrowDown,
  ArrowLeft,
  Bot,
  ExternalLink,
  PanelRight,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useTenant } from "../../../../hooks/useTenant";
import { useGetAiAgentQuery } from "../../../../redux/api/aiAgentsApi";
import { useUpdateInstagramHandlingMutation } from "../../../../redux/api/instagramApi";
import { useGetQuickRepliesQuery } from "../../../../redux/api/whatsappApi";
import { useIgSend } from "../hooks/useIgSend";
import IgComposer from "./IgComposer";
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
import {
  useDeleteInstagramMessagesMutation,
  useGetInstagramMessagesQuery,
} from "../../../../redux/api/instagramApi";
import {
  canReply,
  isAiHandling,
  formatDayLabel,
  getDisplayName,
  getMessageTime,
  isOutgoing,
  isSameDay,
} from "../igUtils";
import { useInstagramCache } from "../hooks/useInstagramCache";
import IgAvatar from "./IgAvatar";
import IgMessageBubble from "./IgMessageBubble";

const NO_MESSAGES = [];
const NEAR_BOTTOM = 120;

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

// Who answers this chat: the AI agent or your team, with a button to switch.
// Shown only while the Instagram AI agent is turned on.
const AiHandlingControl = ({ conversation }) => {
  const { hid } = useTenant();
  const run = useApiAction();
  const cache = useInstagramCache(hid);
  const agent = useGetAiAgentQuery({ channel: "instagram", hid }, { skip: !hid });
  const [updateHandling, { isLoading }] = useUpdateInstagramHandlingMutation();

  if (!agent.data?.config?.enabled) return null;
  const aiOn = isAiHandling(conversation);

  const toggle = async () => {
    const mode = aiOn ? "HUMAN" : "AI";
    const result = await run(updateHandling({ conversationId: conversation._id, mode }), {
      success: aiOn ? "AI paused in this chat" : "AI resumed in this chat",
      error: "Could not change who replies.",
    });
    if (result?.handling) {
      cache.patchConversation(conversation._id, {
        handling: result.handling,
        aiReplyCount: result.aiReplyCount,
      });
    }
  };

  return (
    <div className="hidden items-center gap-2 sm:flex">
      <span
        title={conversation.handling?.reason || ""}
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
          aiOn
            ? "bg-purple-500/10 text-purple-600 dark:text-purple-300"
            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
        }`}
      >
        <Icon icon={aiOn ? Bot : UserRound} size="xs" />
        {aiOn ? "AI replying" : "Your team"}
      </span>
      <Button variant="secondary" size="sm" loading={isLoading} onClick={toggle}>
        {aiOn ? "Pause AI" : "Resume AI"}
      </Button>
    </div>
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
      <AiHandlingControl conversation={conversation} />
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
  onReact,
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
                    onReact={onReact}
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

// The open Instagram conversation. Give it `key={conversation._id}`.
//   onBack()  onShowProfile()
const IgChatPanel = ({ conversation, hid, onBack, onShowProfile }) => {
  const { confirm } = useConfirm();
  const run = useApiAction();
  const cache = useInstagramCache(hid);
  const messages = useGetInstagramMessagesQuery(conversation._id, {
    refetchOnMountOrArgChange: true,
  });
  const quickReplies = useGetQuickRepliesQuery(hid, { skip: !hid });
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

  // stable: the memoised bubbles get handlers that never change
  const send = useIgSend(hid, conversation);

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
          onResend={send.resend}
          onReact={send.react}
        />
      )}

      <IgComposer
        windowOpen={canReply(conversation)}
        quickReplies={quickReplies.data || []}
        send={send}
      />
    </div>
  );
};

export default IgChatPanel;
