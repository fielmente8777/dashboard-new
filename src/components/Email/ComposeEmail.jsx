import JoditEditor from "jodit-react";
import {
  FileText,
  LayoutTemplate,
  Maximize2,
  Minus,
  Paperclip,
  Send,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import DataContext from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import AITemplateModal from "../../pages/EmailMarketing/components/AITemplateModal";
import EmailPreviewFrame from "../../pages/EmailMarketing/components/EmailPreviewFrame";
import { EMAIL_REGEX, parseEmails } from "../../pages/EmailMarketing/emailUtils";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";

const EMPTY_BODIES = new Set(["", "<p><br></p>", "<p></p>", "<br>"]);

const Row = ({ label, children }) => (
  <label className="flex items-center gap-3 border-b border-app-border! py-2.5">
    <span className="w-14 shrink-0 text-xs font-medium text-app-text-muted">{label}</span>
    {children}
  </label>
);

const fieldClass =
  "min-w-0 flex-1 bg-transparent text-sm text-app-text outline-none placeholder:text-app-text-faint disabled:opacity-60";

// A new email, docked bottom-right like a mail app. With `isBroadcast` it
// goes to `recipientCount` already-chosen people plus anyone typed in "To".
// onSend({ from, toEmails, subject, html, text, attachments })
function ComposeEmail({
  onClose,
  recipients = [],
  recipientCount = 0,
  isBroadcast = false,
  onSend,
  isSubmitting = false,
  defaultFrom = "",
  initialTemplate = null,
}) {
  const { showToast } = useToast();
  const { isDarkMode } = useContext(DataContext);
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(recipients.join(", "));
  const [subject, setSubject] = useState(initialTemplate?.subject || "");
  const [body, setBody] = useState("");
  const [minimized, setMinimized] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [template, setTemplate] = useState(initialTemplate?.html ? initialTemplate : null);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [editorKey, setEditorKey] = useState(0);

  useEffect(() => {
    if (defaultFrom) setFrom((current) => current || defaultFrom);
  }, [defaultFrom]);

  const editorConfig = useMemo(
    () => ({
      readonly: false,
      theme: isDarkMode ? "dark" : "default",
      height: 240,
      minHeight: 160,
      placeholder: "Write your message…",
      toolbarAdaptive: true,
      toolbarSticky: false,
      showCharsCounter: false,
      showWordsCounter: false,
      showXPathInStatusbar: false,
      buttons: ["bold", "italic", "underline", "|", "fontsize", "brush", "|", "ul", "ol", "|", "align", "link", "|", "undo", "redo"],
      uploader: { insertImageAsBase64URI: true },
      // keeps template table cells intact when edited as text
      cleanHTML: { removeEmptyElements: false },
    }),
    [isDarkMode],
  );

  const typedEmails = parseEmails(to);
  const invalidTyped = typedEmails.filter((email) => !EMAIL_REGEX.test(email));
  const totalRecipients = recipientCount + typedEmails.length - invalidTyped.length;

  const applyTemplate = (picked) => {
    setTemplate(picked);
    if (picked?.subject && !subject.trim()) setSubject(picked.subject);
  };

  // moves the template into the text editor for free editing
  const editTemplateAsText = () => {
    setBody(template.html);
    setTemplate(null);
    setEditorKey((k) => k + 1);
  };

  const fail = (message) => showToast({ message, type: "error", duration: 5000 });

  const send = async () => {
    if (isSubmitting) return;
    const fromEmail = from.trim().toLowerCase();
    if (!EMAIL_REGEX.test(fromEmail)) return fail("Enter a valid “From” email address.");
    if (!recipientCount && !typedEmails.length) return fail("Add at least one recipient.");
    if (invalidTyped.length) {
      return fail(`Check these addresses: ${invalidTyped.slice(0, 3).join(", ")}${invalidTyped.length > 3 ? "…" : ""}`);
    }
    if (!subject.trim()) return fail("Add a subject.");

    const html = template ? template.html : body;
    if (EMPTY_BODIES.has(String(html || "").trim())) return fail("Write a message or pick a template.");

    const scratch = document.createElement("div");
    scratch.innerHTML = html;

    await onSend({
      from: fromEmail,
      toEmails: typedEmails,
      subject: subject.trim(),
      html,
      text: (scratch.textContent || "").trim(),
      attachments,
    });
  };

  return (
    <div
      className={`fixed bottom-0 z-[9990] flex flex-col overflow-hidden border border-app-border! bg-app-surface text-app-text shadow-2xl ${
        minimized
          ? "right-2 w-72 rounded-t-xl sm:right-5"
          : "inset-x-0 max-h-[92dvh] rounded-t-xl sm:left-auto sm:right-4 sm:w-[560px]"
      }`}
    >
      <div className="flex h-11 shrink-0 items-center gap-2 bg-primary px-3 text-white dark:bg-app-navbar">
        <p className="min-w-0 flex-1 truncate text-sm font-semibold">
          {subject.trim() || (isBroadcast ? "New broadcast" : "New email")}
        </p>
        <button
          type="button"
          aria-label={minimized ? "Expand" : "Minimise"}
          onClick={() => setMinimized((m) => !m)}
          className="flex size-7 items-center justify-center rounded-md hover:bg-white/15"
        >
          {minimized ? <Maximize2 className="size-3.5" /> : <Minus className="size-4" />}
        </button>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          disabled={isSubmitting}
          className="flex size-7 items-center justify-center rounded-md hover:bg-white/15 disabled:opacity-50"
        >
          <X className="size-4" />
        </button>
      </div>

      {!minimized && (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto px-4">
            <Row label="From">
              <input
                type="email"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="you@yourhotel.com"
                disabled={isSubmitting}
                className={fieldClass}
              />
            </Row>

            {isBroadcast && (
              <div className="flex items-center gap-2 border-b border-app-border! py-2.5 text-sm">
                <span className="w-14 shrink-0 text-xs font-medium text-app-text-muted">To</span>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                  <Users className="size-3.5" />
                  {recipientCount.toLocaleString("en-IN")} selected {recipientCount === 1 ? "person" : "people"}
                </span>
              </div>
            )}

            <Row label={isBroadcast ? "Also to" : "To"}>
              <input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder={isBroadcast ? "Optional: more addresses, comma separated" : "guest@example.com, another@example.com"}
                disabled={isSubmitting}
                className={`${fieldClass} ${invalidTyped.length ? "text-red-500" : ""}`}
              />
            </Row>

            <Row label="Subject">
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. 20% off your next stay"
                disabled={isSubmitting}
                className={`${fieldClass} font-medium`}
              />
            </Row>

            <div className="py-3">
              {template ? (
                <div className="overflow-hidden rounded-lg border border-app-border!">
                  <div className="flex items-center gap-2 border-b border-app-border! bg-app-surface-secondary px-3 py-2">
                    <LayoutTemplate className="size-3.5 shrink-0 text-blue-500" />
                    <span className="min-w-0 flex-1 truncate text-xs font-medium">{template.name || "Template"}</span>
                    <Button size="sm" variant="ghost" onClick={() => setIsTemplateOpen(true)} disabled={isSubmitting}>
                      Change
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={editTemplateAsText}
                      disabled={isSubmitting}
                      title="Open in the text editor. Some layout may be simplified."
                    >
                      Edit text
                    </Button>
                    <IconButton icon={X} label="Remove template" size="sm" onClick={() => setTemplate(null)} disabled={isSubmitting} />
                  </div>
                  <EmailPreviewFrame html={template.html} className="h-80" />
                </div>
              ) : (
                <JoditEditor
                  key={`${editorKey}-${isDarkMode}`}
                  value={body}
                  config={{ ...editorConfig, disabled: isSubmitting }}
                  onBlur={setBody}
                />
              )}
            </div>

            {attachments.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {attachments.map((file, index) => (
                  <span
                    key={`${file.name}-${index}`}
                    className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-app-border! bg-app-surface-secondary py-1 pl-2 pr-1 text-xs"
                  >
                    <FileText className="size-3.5 shrink-0 text-app-text-muted" />
                    <span className="max-w-44 truncate" title={file.name}>
                      {file.name}
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove ${file.name}`}
                      onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== index))}
                      className="rounded p-0.5 text-app-text-faint hover:text-red-500"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2 border-t border-app-border! px-3 py-2.5">
            <Button icon={Send} onClick={send} loading={isSubmitting}>
              Send{totalRecipients > 1 ? ` to ${totalRecipients.toLocaleString("en-IN")}` : ""}
            </Button>
            <Button variant="secondary" icon={Sparkles} onClick={() => setIsTemplateOpen(true)} disabled={isSubmitting}>
              <span className="hidden sm:inline">Template</span>
            </Button>
            <label
              className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-sm text-app-text-muted transition hover:bg-app-surface-secondary hover:text-app-text"
              title="Attach files"
            >
              <Paperclip className="size-4" />
              {attachments.length > 0 && <span className="text-xs">{attachments.length}</span>}
              <input
                type="file"
                multiple
                hidden
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length) setAttachments((prev) => [...prev, ...files]);
                  e.target.value = "";
                }}
              />
            </label>
            <IconButton icon={Trash2} label="Discard" tone="danger" onClick={onClose} disabled={isSubmitting} className="ml-auto" />
          </div>
        </>
      )}

      <AITemplateModal
        isOpen={isTemplateOpen}
        mode="compose"
        initialTemplate={template}
        onClose={() => setIsTemplateOpen(false)}
        onUse={applyTemplate}
      />
    </div>
  );
}

export default ComposeEmail;
