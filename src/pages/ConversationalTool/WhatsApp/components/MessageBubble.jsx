import {
  AlertCircle,
  Check,
  CheckCheck,
  ChevronDown,
  Clock,
  Download,
  File,
  FileImage,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import Icon from "../../../../components/ui/Icon";
import { renderMessageWithLinks } from "../../../../utils/urlParser";
import {
  formatTime,
  getDocumentKind,
  getMediaUrl,
  isOutgoing,
} from "../chatUtils";
import AudioMessage from "./AudioMessage";
import InteractiveMessage from "./InteractiveMesssage";
import VideoMessage from "./VideoMessage";

// longer texts are cut, with a "Read more"
const MAX_TEXT_LENGTH = 600;
const TEXT_TYPES = ["text", "unsupported", "interactive"];
// what "Copy" makes sense for
const COPYABLE_TYPES = ["text", "unsupported", "document", "sticker"];

const DOCUMENT_ICONS = {
  pdf: { icon: FileText, className: "text-red-500" },
  sheet: { icon: FileSpreadsheet, className: "text-emerald-600" },
  word: { icon: FileText, className: "text-blue-500" },
  image: { icon: FileImage, className: "text-purple-500" },
  file: { icon: File, className: "text-app-text-muted" },
};

const STATUS_ICONS = {
  sending: { icon: Clock, label: "Sending" },
  sent: { icon: Check, label: "Sent" },
  delivered: { icon: CheckCheck, label: "Delivered" },
  read: { icon: CheckCheck, label: "Read", className: "text-sky-500" },
  failed: { icon: AlertCircle, label: "Not sent", className: "text-red-500" },
};

const TextBody = ({ text }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > MAX_TEXT_LENGTH;

  return (
    <p className="whitespace-pre-wrap break-words text-sm text-app-text">
      {renderMessageWithLinks(
        isLong && !expanded ? `${text.slice(0, MAX_TEXT_LENGTH)}…` : text,
      )}
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="ml-1 text-sm font-medium text-blue-500 hover:underline"
        >
          {expanded ? "Read less" : "Read more"}
        </button>
      )}
    </p>
  );
};

const DocumentCard = ({ media, url }) => {
  const { icon, className } = DOCUMENT_ICONS[getDocumentKind(media?.mimeType)];

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      download
      className="flex w-60 max-w-full items-center gap-3 rounded-lg border border-app-border! bg-app-surface-secondary p-3 transition-colors hover:border-blue-500!"
    >
      <Icon icon={icon} size={28} className={className} />
      <span className="min-w-0 flex-1 truncate text-sm text-app-text">
        {media?.filename || "Document"}
      </span>
      <Icon icon={Download} tone="muted" />
    </a>
  );
};

// The header of a template message: an image, video, document or a line of text.
const TemplateHeader = ({ message, ndid, onImageClick }) => {
  const header = message.template.template.components?.find(
    (component) => component.type?.toLowerCase() === "header",
  );
  const param = header?.parameters?.[0];
  if (!param) return null;

  const url = message.media?.url || getMediaUrl(param[param.type], ndid);

  if (param.type === "image") {
    return (
      <img
        src={url}
        alt=""
        onClick={() => onImageClick(url)}
        className="mb-2 h-44 w-full cursor-zoom-in rounded-lg object-cover"
      />
    );
  }
  if (param.type === "video") {
    return <video controls src={url} className="mb-2 h-44 w-full rounded-lg" />;
  }
  if (param.type === "document") {
    return (
      <div className="mb-2">
        <DocumentCard media={param.document} url={url} />
      </div>
    );
  }
  if (param.type === "text") {
    return (
      <p className="mb-1 text-sm font-semibold text-app-text">{param.text}</p>
    );
  }
  return null;
};

const MessageContent = ({ message, ndid, onImageClick }) => {
  const type = message.messageType;
  const mediaUrl = getMediaUrl(message.media, ndid);

  return (
    <>
      {message.context?.message && (
        <p className="mb-1.5 truncate rounded border-l-4 border-emerald-500! bg-app-surface-secondary px-2 py-1 text-xs text-app-text-muted">
          {message.context.message}
        </p>
      )}

      {type === "template" && message.template?.template?.name && (
        <>
          <TemplateHeader
            message={message}
            ndid={ndid}
            onImageClick={onImageClick}
          />
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-amber-600 dark:text-amber-400">
            Template · {message.template.template.name}
          </p>
          {message.body ? (
            <TextBody text={message.body} />
          ) : (
            <p className="text-xs text-app-text-faint">No text defined</p>
          )}
        </>
      )}

      {(type === "image" || type === "sticker") && (
        <img
          src={mediaUrl}
          alt=""
          loading="lazy"
          onClick={() => onImageClick(mediaUrl)}
          className="aspect-square w-56 max-w-full cursor-zoom-in rounded-lg object-cover"
        />
      )}

      {type === "audio" && <AudioMessage src={mediaUrl} />}

      {type === "video" && (
        <VideoMessage src={mediaUrl} caption={message.caption} />
      )}

      {type === "document" && (
        <DocumentCard media={message.media} url={mediaUrl} />
      )}

      {type === "location" && message.location && (
        <div className="w-64 max-w-full">
          <iframe
            title="Location"
            loading="lazy"
            src={`https://www.google.com/maps?q=${encodeURIComponent(message.location.name || "")},${message.location.latitude},${message.location.longitude}&z=17&output=embed`}
            className="aspect-[4/3] w-full rounded-lg border-0"
          />
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${message.location.latitude},${message.location.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block text-center text-sm font-medium text-blue-500 hover:underline"
          >
            Open in Google Maps
          </a>
        </div>
      )}

      {(type === "image" || type === "document") && message.caption && (
        <div className="mt-1.5">
          <TextBody text={message.caption} />
        </div>
      )}

      {TEXT_TYPES.includes(type) && message.body && (
        <TextBody text={message.body} />
      )}

      {message.interactive && (
        <InteractiveMessage interactive={message.interactive} />
      )}
    </>
  );
};

// The "..." on a bubble: copy, and start selecting messages to delete.
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
          {COPYABLE_TYPES.includes(message.messageType) && message.body && (
            <button
              type="button"
              className={`${itemClassName} text-app-text`}
              onClick={() => {
                navigator.clipboard?.writeText(message.body);
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
// toggles it. Actions: onToggleSelect(message), onResend(message),
// onImageClick(url). Keep them stable (useCallback): the bubble is memoised
// so a new message does not redraw the whole chat.
const MessageBubble = ({
  message,
  ndid,
  selecting,
  selected,
  onToggleSelect,
  onResend,
  onImageClick,
}) => {
  const mine = isOutgoing(message);
  const status = STATUS_ICONS[message.status];
  const toggleSelect = () => onToggleSelect(message);

  return (
    <div
      onClick={selecting ? toggleSelect : undefined}
      className={`flex items-center gap-2 rounded-lg px-1 py-0.5 ${
        selected ? "bg-blue-500/10" : ""
      } ${selecting ? "cursor-pointer" : ""}`}
    >
      {selecting && (
        <input
          type="checkbox"
          aria-label="Select message"
          className="size-4 shrink-0 cursor-pointer accent-primary"
          checked={selected}
          onChange={toggleSelect}
          onClick={(e) => e.stopPropagation()}
        />
      )}

      <div
        className={`flex min-w-0 flex-1 ${mine ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`group relative min-w-24 max-w-[85%] rounded-2xl border px-3 pb-1.5 pt-2.5 shadow-sm sm:max-w-md ${
            mine
              ? "rounded-br-md border-emerald-500/25! bg-emerald-500/10"
              : "rounded-bl-md border-app-border! bg-app-surface"
          } ${message.status === "failed" ? "border-red-500/50!" : ""}`}
        >
          <MessageContent
            message={message}
            ndid={ndid}
            onImageClick={onImageClick}
          />

          <div className="mt-1 flex items-center justify-end gap-1 text-[11px] text-app-text-muted">
            {message.reaction?.emoji && (
              <span className="mr-auto text-sm">{message.reaction.emoji}</span>
            )}
            {formatTime(message.createdAt)}
            {mine && status && (
              <span title={status.label} className={status.className}>
                <Icon icon={status.icon} size="sm" />
              </span>
            )}
          </div>

          {message.status === "failed" && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onResend(message);
              }}
              className="mt-0.5 block w-full text-right text-xs font-medium text-red-500 hover:underline"
            >
              Not sent. Try again
            </button>
          )}

          {!selecting && (
            <MessageMenu message={message} onSelect={toggleSelect} />
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(MessageBubble);
