import {
  Bot,
  File as FileIcon,
  LayoutTemplate,
  MessageSquareReply,
  Paperclip,
  SendHorizontal,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../../components/ui/Button";
import { Select } from "../../../../components/ui/Field";
import Icon from "../../../../components/ui/Icon";
import IconButton from "../../../../components/ui/IconButton";
import { useToast } from "../../../../context/ToastContext";
import { PAGES, dashboardPath } from "../../../../routes/paths";
import { MAX_FILE_SIZE } from "../chatUtils";
import FlowDialog from "./FlowDialog";

// the message box grows with the text up to this height (px)
const MAX_INPUT_HEIGHT = 192;

const getTemplateText = (template) =>
  template.components?.find((component) => component.type === "BODY")?.text ||
  template.components?.find((component) => component.text)?.text ||
  "";

// A row of cards to pick one from (templates, quick replies).
const PickerPanel = ({ title, onClose, children }) => (
  <div className="anim-enter mb-3 rounded-xl border border-app-border! bg-app-surface">
    <div className="flex items-center justify-between gap-2 border-b border-app-border! px-3 py-1.5">
      <p className="text-xs font-medium text-app-text-muted">{title}</p>
      <IconButton icon={X} label="Close" onClick={onClose} />
    </div>
    <div className="grid max-h-56 gap-2 overflow-y-auto p-2 sm:grid-cols-2 xl:grid-cols-3">
      {children}
    </div>
  </div>
);

const PickerCard = ({ title, text, note, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`min-w-0 rounded-lg border p-2.5 text-left transition-colors ${
      selected
        ? "border-blue-500! bg-blue-500/10"
        : "border-app-border! bg-app-surface-secondary hover:border-blue-500!"
    }`}
  >
    <p className="truncate text-xs font-semibold text-app-text">{title}</p>
    <p className="mt-1 line-clamp-2 break-words text-xs text-app-text-muted">
      {text}
    </p>
    {note && <p className="mt-1 text-[11px] text-app-text-faint">{note}</p>}
  </button>
);

const FilePreview = ({ file, onRemove }) => {
  const [url, setUrl] = useState("");
  const isImage = file.type.startsWith("image/");

  useEffect(() => {
    if (!isImage) return undefined;
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file, isImage]);

  return (
    <div className="anim-enter mb-3 flex w-fit max-w-full items-center gap-3 rounded-lg border border-app-border! bg-app-surface p-2 pr-1">
      {isImage && url ? (
        <img src={url} alt="" className="size-12 rounded-md object-cover" />
      ) : (
        <Icon icon={FileIcon} size="2xl" tone="muted" />
      )}
      <div className="min-w-0">
        <p className="truncate text-sm text-app-text">{file.name}</p>
        <p className="text-xs text-app-text-muted">
          {(file.size / 1024 / 1024).toFixed(2)} MB
        </p>
      </div>
      <IconButton icon={X} label="Remove file" onClick={onRemove} />
    </div>
  );
};

// Where a reply is written and sent: text, a file, a saved quick reply, an
// approved template or a form.
//   windowClosed - the 24 hour window is over, so only a template can be sent
//   send         - the senders from useSendMessage
//   onHandBack   - given when the conversation can be handed back to the AI
const Composer = ({
  windowClosed,
  templates,
  templatesLoading,
  flows,
  quickReplies,
  send,
  onHandBack,
  handingBack,
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [panel, setPanel] = useState(null); // "templates" | "quickReplies"
  const [template, setTemplate] = useState(null);
  const [flow, setFlow] = useState(null);

  // the box is as tall as its text, up to the limit
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, MAX_INPUT_HEIGHT)}px`;
  }, [text]);

  const canSend = template
    ? true
    : !windowClosed && Boolean(text.trim() || file);

  const openTemplates = () => {
    // nothing to pick from yet: go and create one
    if (!templates.length) {
      navigate(
        dashboardPath(PAGES.SETTINGS, {
          query: { tab: "whatsapp", template: "true" },
        }),
      );
      return;
    }
    setPanel("templates");
  };

  const closePanel = () => {
    setPanel(null);
    setTemplate(null);
  };

  const handleFile = (picked) => {
    if (!picked) return;
    if (picked.size > MAX_FILE_SIZE) {
      showToast({
        message: "That file is too large. The limit is 5 MB.",
        type: "error",
      });
      return;
    }
    setFile(picked);
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!canSend) return;

    if (template) {
      send.sendTemplate(template);
      closePanel();
      return;
    }

    send.sendText({ text: text.trim(), file });
    setText("");
    setFile(null);
    inputRef.current?.focus();
  };

  return (
    <>
      <form
        onSubmit={handleSend}
        className="shrink-0 border-t border-app-border! bg-app-surface-secondary px-3 py-3 sm:px-5"
      >
        {panel === "templates" && (
          <PickerPanel title="Choose a template to send" onClose={closePanel}>
            {templates.map((item) => (
              <PickerCard
                key={item.id}
                title={item.name}
                text={getTemplateText(item)}
                selected={template?.id === item.id}
                onClick={() => setTemplate(item)}
              />
            ))}
          </PickerPanel>
        )}

        {panel === "quickReplies" && (
          <PickerPanel title="Send a quick reply" onClose={closePanel}>
            {quickReplies.length === 0 && (
              <p className="col-span-full py-4 text-center text-xs text-app-text-muted">
                No quick replies saved yet.
              </p>
            )}
            {quickReplies.map((reply) => {
              const mediaItem = reply.items.find(
                (item) => item.type !== "text",
              );
              return (
                <PickerCard
                  key={reply._id}
                  title={reply.title}
                  text={reply.items.find((item) => item.type === "text")?.text}
                  note={
                    mediaItem &&
                    `${mediaItem.media?.length || 0} ${mediaItem.type}`
                  }
                  onClick={() => {
                    send.sendQuickReply(reply);
                    closePanel();
                  }}
                />
              );
            })}
          </PickerPanel>
        )}

        {file && <FilePreview file={file} onRemove={() => setFile(null)} />}

        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Button
            variant={panel === "templates" ? "primary" : "secondary"}
            size="sm"
            icon={LayoutTemplate}
            loading={templatesLoading}
            onClick={panel === "templates" ? closePanel : openTemplates}
          >
            Templates
          </Button>

          {!windowClosed && (
            <Button
              variant={panel === "quickReplies" ? "primary" : "secondary"}
              size="sm"
              icon={MessageSquareReply}
              onClick={() =>
                panel === "quickReplies"
                  ? closePanel()
                  : setPanel("quickReplies")
              }
            >
              Quick replies
            </Button>
          )}

          {flows.length > 0 && (
            <div className="w-40">
              <Select
                aria-label="Send a form"
                className="h-8 py-0! text-xs!"
                value=""
                onChange={(e) =>
                  setFlow(flows.find((item) => item.flowId === e.target.value))
                }
                options={[
                  { value: "", label: "Send a form" },
                  ...flows.map((item) => ({
                    value: item.flowId,
                    label: item.flowName,
                  })),
                ]}
              />
            </div>
          )}

          {onHandBack && (
            <Button
              variant="ghost"
              size="sm"
              icon={Bot}
              loading={handingBack}
              className="ml-auto"
              onClick={onHandBack}
            >
              Hand back to AI
            </Button>
          )}
        </div>

        <div className="flex items-end gap-2">
          {windowClosed ? (
            <p className="flex-1 rounded-lg border border-amber-500/30! bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
              {template
                ? `"${template.name}" is ready to send.`
                : "The 24-hour reply window has closed. Choose an approved template to message this guest again."}
            </p>
          ) : (
            <>
              <IconButton
                icon={Paperclip}
                label="Attach a file (up to 5 MB)"
                size="lg"
                className="size-10!"
                onClick={() => fileInputRef.current?.click()}
              />
              <input
                ref={fileInputRef}
                type="file"
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
                disabled={Boolean(template)}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  // Enter sends, Shift + Enter starts a new line
                  if (e.key === "Enter" && !e.shiftKey) handleSend(e);
                }}
                placeholder={
                  template
                    ? `"${template.name}" is ready to send`
                    : "Type a message"
                }
                aria-label="Message"
                className="min-w-0 flex-1 resize-none rounded-2xl border border-app-border! bg-app-surface px-4 py-2 text-sm text-app-text outline-none transition placeholder:text-app-text-faint focus:border-blue-500! focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
              />
            </>
          )}

          <button
            type="submit"
            disabled={!canSend}
            aria-label="Send"
            title="Send"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
          >
            <Icon icon={SendHorizontal} size="lg" />
          </button>
        </div>
      </form>

      {/* outside the form: a submit inside the dialog must not send the message box */}
      <FlowDialog
        flow={flow}
        onClose={() => setFlow(null)}
        onSend={(flowText) => {
          send.sendFlow(flow, flowText);
          setFlow(null);
        }}
      />
    </>
  );
};

export default Composer;
