import {
  AlertCircle,
  Check,
  CheckCheck,
  ChevronDown,
  Clock,
  ExternalLink,
  FileText,
  RotateCw,
} from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import Icon from "../../../../components/ui/Icon";
import { formatTime, getMessageTime, isOutgoing } from "../igUtils";

const STATUS = {
  sending: { icon: Clock, label: "Sending", className: "text-app-text-faint" },
  sent: { icon: Check, label: "Sent", className: "text-app-text-muted" },
  delivered: { icon: CheckCheck, label: "Delivered", className: "text-app-text-muted" },
  read: { icon: CheckCheck, label: "Seen", className: "text-sky-500" },
  failed: { icon: AlertCircle, label: "Not sent", className: "text-red-500" },
};

const LINK_LABELS = {
  share: "Shared a post",
  ig_reel: "Shared a reel",
  reel: "Shared a reel",
  story_mention: "Mentioned you in their story",
  ig_post: "Shared a post",
};

const Attachment = ({ attachment, onImageClick }) => {
  const { type, url } = attachment;

  if (type === "image" && url) {
    return (
      <img
        src={url}
        alt=""
        onClick={() => onImageClick(url)}
        className="mb-1.5 max-h-72 w-56 max-w-full cursor-zoom-in rounded-lg object-cover"
      />
    );
  }
  if (type === "video" && url) {
    return <video controls src={url} className="mb-1.5 w-60 max-w-full rounded-lg" />;
  }
  if (type === "audio" && url) {
    return <audio controls src={url} className="mb-1.5 w-60 max-w-full" />;
  }

  // posts, reels, story mentions, files: Instagram gives a link only
  return (
    <a
      href={url || undefined}
      target="_blank"
      rel="noreferrer"
      className="mb-1.5 flex w-60 max-w-full items-center gap-3 rounded-lg border border-app-border! bg-app-surface-secondary p-3 text-sm text-app-text transition-colors hover:border-pink-500!"
    >
      <Icon icon={type === "file" ? FileText : ExternalLink} size="lg" className="text-pink-500" />
      <span className="min-w-0 flex-1 truncate">
        {LINK_LABELS[type] || (type === "file" ? "File" : "Attachment")}
      </span>
    </a>
  );
};

const MessageMenu = ({ message, onSelect }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const itemClassName =
    "block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-app-surface-secondary";

  return (
    <div ref={ref} className="absolute right-1 top-1 z-10">
      <button
        type="button"
        aria-label="Message options"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={`flex size-6 items-center justify-center rounded-full bg-app-surface/90 text-app-text-muted shadow-sm transition-opacity hover:text-app-text focus:opacity-100 lg:opacity-0 lg:group-hover:opacity-100 ${open ? "opacity-100!" : ""}`}
      >
        <Icon icon={ChevronDown} />
      </button>

      {open && (
        <div className="anim-menu absolute right-0 mt-1 w-32 overflow-hidden rounded-lg border border-app-border! bg-app-surface shadow-lg">
          {message.text && message.status !== "deleted" && (
            <button
              type="button"
              className={`${itemClassName} text-app-text`}
              onClick={() => {
                navigator.clipboard?.writeText(message.text);
                setOpen(false);
              }}
            >
              Copy
            </button>
          )}
          <button
            type="button"
            className={`${itemClassName} text-red-500`}
            onClick={() => {
              onSelect();
              setOpen(false);
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

// One message. In `selecting` mode a checkbox is shown and the whole row
// toggles it. Keep the handlers stable (useCallback): the bubble is memoised.
const IgMessageBubble = ({
  message,
  selecting,
  selected,
  onToggleSelect,
  onImageClick,
  onResend,
}) => {
  const mine = isOutgoing(message);
  const status = mine ? STATUS[message.status] : null;
  const deleted = message.status === "deleted";
  const toggleSelect = () => onToggleSelect(message);

  return (
    <div
      onClick={selecting ? toggleSelect : undefined}
      className={`flex items-center gap-2 rounded-lg px-1 py-0.5 ${
        selected ? "bg-pink-500/10" : ""
      } ${selecting ? "cursor-pointer" : ""}`}
    >
      {selecting && (
        <input
          type="checkbox"
          aria-label="Select message"
          className="size-4 shrink-0 cursor-pointer accent-pink-500"
          checked={selected}
          onChange={toggleSelect}
          onClick={(e) => e.stopPropagation()}
        />
      )}
      <div className={`flex min-w-0 flex-1 ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`group relative min-w-24 max-w-[85%] rounded-2xl border px-3 pb-1.5 pt-2.5 shadow-sm sm:max-w-md ${
          mine
            ? "rounded-br-md border-purple-200! bg-purple-50 dark:border-purple-800! dark:bg-[#2d1f3d]"
            : "rounded-bl-md border-app-border! bg-app-surface dark:border-white/10! dark:bg-[#1f2633]"
        } ${message.status === "failed" ? "border-red-500/50!" : ""}`}
      >
        {message.reply_to?.story?.url && (
          <a
            href={message.reply_to.story.url}
            target="_blank"
            rel="noreferrer"
            className="mb-1.5 block truncate rounded border-l-4 border-pink-500! bg-app-surface-secondary px-2 py-1 text-xs text-app-text-muted"
          >
            Replied to your story
          </a>
        )}

        {!deleted &&
          (message.attachments || []).map((attachment, index) => (
            <Attachment
              key={`${attachment.url}-${index}`}
              attachment={attachment}
              onImageClick={onImageClick}
            />
          ))}

        {(message.text || deleted || message.messageType === "unsupported") && (
          <p
            className={`whitespace-pre-wrap break-words text-sm ${deleted ? "italic text-app-text-muted" : "text-app-text"}`}
          >
            {deleted
              ? "This message was deleted"
              : message.text || "This message type isn't supported yet. Open it in Instagram."}
          </p>
        )}

        <div className="mt-1 flex items-center justify-end gap-1 text-[11px] text-app-text-muted">
          {message.reaction?.emoji && (
            <span className="mr-auto text-sm">{message.reaction.emoji}</span>
          )}
          {formatTime(getMessageTime(message))}
          {status && (
            <span title={status.label} className={status.className}>
              <Icon icon={status.icon} size="sm" />
            </span>
          )}
        </div>

        {message.status === "failed" && (
          <div className="mt-0.5 text-right text-xs text-red-500">
            {message.failure?.message || "Not sent."}{" "}
            <button
              type="button"
              onClick={() => onResend(message)}
              className="inline-flex items-center gap-1 font-medium hover:underline"
            >
              <Icon icon={RotateCw} size="xs" /> Retry
            </button>
          </div>
        )}

        {!selecting && <MessageMenu message={message} onSelect={toggleSelect} />}
      </div>
      </div>
    </div>
  );
};

export default memo(IgMessageBubble);
