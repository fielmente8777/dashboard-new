import {
  File as FileIcon,
  Heart,
  MessageSquareReply,
  Music,
  Paperclip,
  SendHorizontal,
  Video,
  X,
} from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Button from "../../../../components/ui/Button";
import Icon from "../../../../components/ui/Icon";
import IconButton from "../../../../components/ui/IconButton";
import { useToast } from "../../../../context/ToastContext";
import { IG_ACCEPT, checkIgFile, getIgMediaType } from "../igUtils";

const MAX_LENGTH = 1000;
const MAX_INPUT_HEIGHT = 160;
const FILE_ICONS = { video: Video, audio: Music, file: FileIcon };

const FilePreview = ({ file, onRemove }) => {
  const [url, setUrl] = useState("");
  const type = getIgMediaType(file.type);

  useEffect(() => {
    if (type !== "image") return undefined;
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file, type]);

  return (
    <div className="anim-enter mb-3 flex w-fit max-w-full items-center gap-3 rounded-lg border border-app-border! bg-app-surface p-2 pr-1">
      {type === "image" && url ? (
        <img src={url} alt="" className="size-12 rounded-md object-cover" />
      ) : (
        <Icon icon={FILE_ICONS[type] || FileIcon} size="2xl" tone="muted" />
      )}
      <div className="min-w-0">
        <p className="truncate text-sm text-app-text">{file.name}</p>
        <p className="text-xs text-app-text-muted">
          {(file.size / 1024 / 1024).toFixed(2)} MB · sent before the text
        </p>
      </div>
      <IconButton icon={X} label="Remove file" onClick={onRemove} />
    </div>
  );
};

// Saved quick replies (Settings), the same ones the WhatsApp chat uses.
const QuickReplyPanel = ({ quickReplies, onPick, onClose }) => (
  <div className="anim-enter mb-3 rounded-xl border border-app-border! bg-app-surface">
    <div className="flex items-center justify-between gap-2 border-b border-app-border! px-3 py-1.5">
      <p className="text-xs font-medium text-app-text-muted">Send a quick reply</p>
      <IconButton icon={X} label="Close" onClick={onClose} />
    </div>
    <div className="grid max-h-56 gap-2 overflow-y-auto p-2 sm:grid-cols-2 xl:grid-cols-3">
      {quickReplies.length === 0 && (
        <p className="col-span-full py-4 text-center text-xs text-app-text-muted">
          No quick replies saved yet.
        </p>
      )}
      {quickReplies.map((reply) => {
        const text = reply.items?.find((item) => item.type === "text")?.text;
        const media = reply.items?.find((item) => item.type !== "text");
        return (
          <button
            key={reply._id}
            type="button"
            onClick={() => onPick(reply)}
            className="h-full min-w-0 rounded-lg border border-app-border! bg-app-surface-secondary p-2.5 text-left transition-colors hover:border-pink-500!"
          >
            <p className="truncate text-xs font-semibold text-app-text">{reply.title}</p>
            {text && (
              <p className="mt-1 line-clamp-2 break-words text-xs text-app-text-muted">{text}</p>
            )}
            {media && (
              <p className="mt-1 text-[11px] text-app-text-faint">
                {media.media?.length || 0} {media.type}
              </p>
            )}
          </button>
        );
      })}
    </div>
  </div>
);

// Where an Instagram reply is written: text, a photo / video / audio / PDF,
// the ❤️ sticker, or a saved quick reply.
//   windowOpen - within 24h of the guest's last message (Instagram's rule)
//   send       - from useIgSend
const IgComposer = ({ windowOpen, quickReplies, send }) => {
  const { showToast } = useToast();
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [showQuickReplies, setShowQuickReplies] = useState(false);

  const trimmed = text.trim();
  const canSend = windowOpen && (Boolean(file) || trimmed.length > 0) && trimmed.length <= MAX_LENGTH;

  useLayoutEffect(() => {
    const element = inputRef.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, MAX_INPUT_HEIGHT)}px`;
  }, [text]);

  const handleFile = (picked) => {
    if (!picked) return;
    const problem = checkIgFile(picked);
    if (problem) {
      showToast({ message: problem, type: "error" });
      return;
    }
    setFile(picked);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!canSend) return;
    send.sendCompose({ text: trimmed, file });
    setText("");
    setFile(null);
    inputRef.current?.focus();
  };

  if (!windowOpen) {
    return (
      <div className="shrink-0 border-t border-app-border! bg-app-surface px-3 py-3 sm:px-4">
        <p className="rounded-lg border border-amber-500/30! bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
          Instagram only allows replies within 24 hours of the guest's last
          message. You can reply again once they message you.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="shrink-0 border-t border-app-border! bg-app-surface px-3 py-3 sm:px-4"
    >
      {showQuickReplies && (
        <QuickReplyPanel
          quickReplies={quickReplies}
          onClose={() => setShowQuickReplies(false)}
          onPick={(reply) => {
            send.sendQuickReply(reply);
            setShowQuickReplies(false);
          }}
        />
      )}

      {file && <FilePreview file={file} onRemove={() => setFile(null)} />}

      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Button
          variant={showQuickReplies ? "primary" : "secondary"}
          size="sm"
          icon={MessageSquareReply}
          onClick={() => setShowQuickReplies((open) => !open)}
        >
          Quick replies
        </Button>
      </div>

      <div className="flex items-end gap-2">
        <IconButton
          icon={Paperclip}
          label="Attach a photo, video, audio or PDF"
          size="lg"
          className="size-10!"
          onClick={() => fileInputRef.current?.click()}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept={IG_ACCEPT}
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <textarea
          ref={inputRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) handleSubmit(e);
          }}
          onPaste={(e) => {
            // a pasted screenshot becomes the attachment
            const pasted = [...(e.clipboardData?.files || [])][0];
            if (pasted) {
              e.preventDefault();
              handleFile(pasted);
            }
          }}
          maxLength={MAX_LENGTH}
          placeholder={file ? "Add a message (sent after the file)…" : "Message..."}
          aria-label="Message"
          className="min-w-0 flex-1 resize-none rounded-2xl border border-app-border! bg-app-surface px-4 py-2 text-sm text-app-text outline-none transition placeholder:text-app-text-faint focus:border-pink-500! focus:ring-1 focus:ring-pink-500"
        />
        {canSend ? (
          <button
            type="submit"
            aria-label="Send"
            title="Send"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 text-white transition hover:opacity-90 active:scale-95"
          >
            <Icon icon={SendHorizontal} size="lg" />
          </button>
        ) : (
          // nothing typed: like Instagram, the button sends a ❤️
          <button
            type="button"
            onClick={() => send.sendHeart()}
            aria-label="Send a heart"
            title="Send ❤️"
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-pink-500 transition hover:bg-pink-500/10 active:scale-95"
          >
            <Icon icon={Heart} size="lg" />
          </button>
        )}
      </div>
      {trimmed.length > MAX_LENGTH * 0.9 && (
        <p className="mt-1 text-right text-[11px] text-app-text-muted">
          {trimmed.length}/{MAX_LENGTH}
        </p>
      )}
    </form>
  );
};

export default IgComposer;
