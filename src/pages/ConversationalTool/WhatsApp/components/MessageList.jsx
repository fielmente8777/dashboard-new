import { ArrowDown, X } from "lucide-react";
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Icon from "../../../../components/ui/Icon";
import IconButton from "../../../../components/ui/IconButton";
import { Skeleton } from "../../../../components/ui/States";
import { formatDayLabel, formatTime, isOutgoing, isSameDay } from "../chatUtils";
import MessageBubble from "./MessageBubble";

// how close to the end (px) still counts as "reading the latest messages"
const NEAR_BOTTOM = 120;

// What the guest tapped (an ad, a post) to start the conversation.
const AdCard = ({ ad }) => (
  <div className="mb-3 w-72 max-w-full space-y-2 rounded-2xl rounded-bl-md border border-app-border! bg-app-surface p-3 shadow-sm">
    {ad.mediaType === "image" && ad.imageUrl && (
      <img src={ad.imageUrl} alt="" className="w-full rounded-lg" />
    )}
    {ad.mediaType === "video" && ad.videoUrl && (
      <video
        src={ad.videoUrl}
        className="w-full rounded-lg"
        autoPlay
        muted
        loop
        playsInline
      />
    )}
    {ad.headline && (
      <p className="text-sm font-medium text-app-text">{ad.headline}</p>
    )}
    {ad.body && <p className="text-sm text-app-text-muted">{ad.body}</p>}
    <p className="flex items-center justify-between gap-2 text-[11px] text-app-text-muted">
      <span className="rounded bg-app-surface-secondary px-2 py-0.5 capitalize">
        Came from {ad.sourceType || "an ad"}
      </span>
      {ad.receivedAt && formatTime(ad.receivedAt)}
    </p>
  </div>
);

const ImageViewer = ({ url, onClose }) => {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
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

// The messages of the open conversation, oldest first, with a divider per
// day. It follows new messages only while the reader is at the end;
// otherwise a button offers to jump there.
const MessageList = ({
  conversation,
  messages,
  loading,
  ndid,
  selectedKeys,
  onToggleSelect,
  onResend,
}) => {
  const scrollRef = useRef(null);
  const atBottomRef = useRef(true);
  const [showJump, setShowJump] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const selecting = selectedKeys.length > 0;
  const lastMessage = messages[messages.length - 1];

  const scrollToEnd = (behavior = "auto") => {
    const element = scrollRef.current;
    element?.scrollTo({ top: element.scrollHeight, behavior });
  };

  // a conversation always opens at its latest message
  useLayoutEffect(() => {
    atBottomRef.current = true;
    setShowJump(false);
    scrollToEnd();
  }, [conversation._id, loading]);

  // a new message: follow it if it is ours or the reader is already at the end
  useLayoutEffect(() => {
    if (!lastMessage) return;
    if (atBottomRef.current || isOutgoing(lastMessage)) scrollToEnd("smooth");
    else setShowJump(true);
    // only a new last message matters here, not a change to an existing one
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessage?._id]);

  const handleScroll = () => {
    const element = scrollRef.current;
    const distance =
      element.scrollHeight - element.scrollTop - element.clientHeight;
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
            <Skeleton className="ml-auto h-12 w-2/5 rounded-2xl" />
          </div>
        ) : (
          <>
            {conversation.adAttribution && (
              <AdCard ad={conversation.adAttribution} />
            )}

            {messages.length === 0 && (
              <p className="py-10 text-center text-sm text-app-text-muted">
                No messages yet. Say hello to start the conversation.
              </p>
            )}

            <div className="space-y-1">
              {messages.map((message, index) => {
                const key = message.messageId || message._id;
                const previous = messages[index - 1];
                const startsDay =
                  !previous ||
                  !isSameDay(previous.createdAt, message.createdAt);

                return (
                  <Fragment key={message._id || key || index}>
                    {startsDay && (
                      <p className="sticky top-0 z-[5] py-2 text-center">
                        <span className="rounded-full bg-app-surface px-3 py-1 text-[11px] font-medium text-app-text-muted shadow-sm">
                          {formatDayLabel(message.createdAt)}
                        </span>
                      </p>
                    )}
                    <MessageBubble
                      message={message}
                      ndid={ndid}
                      selecting={selecting}
                      selected={selectedKeys.includes(key)}
                      onToggleSelect={onToggleSelect}
                      onResend={onResend}
                      onImageClick={setImageUrl}
                    />
                  </Fragment>
                );
              })}
            </div>
          </>
        )}
      </div>

      {showJump && (
        // the wrapper does the centring, so the button's entrance animation
        // (which uses transform) does not fight with it
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

export default MessageList;
