import JoditEditor from "jodit-react";
import {
  CheckCircle2,
  Expand,
  FileCode2,
  FileText,
  FlaskConical,
  LayoutTemplate,
  Loader2,
  Maximize2,
  Minimize2,
  Minus,
  Monitor,
  Paperclip,
  Smartphone,
  Sparkles,
  Trash2,
  TriangleAlert,
  Type,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useConfirm } from "../../context/ConfirmContext";
import { useToast } from "../../context/ToastContext";
import AITemplateModal from "../../pages/EmailMarketing/components/AITemplateModal";
import { FittedEmailPreview } from "../../pages/EmailMarketing/components/EmailPreviewFrame";
import Dialog from "../ui/Dialog";
import { EMAIL_REGEX, parseEmails, withPreviewText } from "../../pages/EmailMarketing/emailUtils";
import { getEmailFooter, getSenderMailbox, renderEmail, sendTestEmail } from "../../redux/api/emailMarketingApi";
import FooterEditorDialog from "./FooterEditorDialog";
import { htmlTemplateImporter } from "./htmlTemplateImporter";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";
import SenderMailboxDialog from "./SenderMailboxDialog";

const EMPTY_BODIES = new Set(["", "<p><br></p>", "<p></p>", "<br>"]);

// keys that turn what is typed in "To" into a chip
const CHIP_KEYS = new Set(["Enter", ",", ";", " "]);

// Jodit, made to look like Gmail's body: no frame, formatting bar under the text
const EDITOR_CSS = `
.gm-editor .jodit-container:not(.jodit_inline){border:0;border-radius:0;background:transparent;display:flex;flex-direction:column}
.gm-editor .jodit-workplace{order:1}
.gm-editor .jodit-toolbar__box:not(:empty){order:2;margin:0 12px 6px;border:1px solid var(--color-app-border,#e5e7eb);border-radius:10px;background:var(--color-app-surface-secondary,#f6f8fc)}
.gm-editor.gm-no-toolbar .jodit-toolbar__box{display:none}
.gm-editor .jodit-status-bar{display:none}
.gm-editor .jodit-wysiwyg{padding:10px 16px!important;font-size:14px;line-height:1.55}
.gm-editor .jodit-placeholder{padding:10px 16px!important;font-size:14px}
.gm-editor.gm-full .jodit-workplace{min-height:52vh}
`;

const formatSize = (bytes) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

// Gmail's "To": every address becomes a chip; Backspace removes the last one
function RecipientInput({ chips, onChipsChange, draft, onDraftChange, disabled, placeholder, autoFocus }) {
  const inputRef = useRef(null);

  const commit = (text) => {
    const found = parseEmails(text);
    if (found.length) onChipsChange([...new Set([...chips, ...found])]);
    onDraftChange("");
  };

  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1" onClick={() => inputRef.current?.focus()}>
      {chips.map((email) => {
        const valid = EMAIL_REGEX.test(email);
        return (
          <span
            key={email}
            title={valid ? email : "This address doesn't look right"}
            className={`inline-flex max-w-full items-center gap-1 rounded-full border py-0.5 pl-0.5 pr-1 text-xs ${
              valid
                ? "border-app-border! bg-app-surface-secondary text-app-text"
                : "border-red-300! bg-red-50 text-red-600 dark:border-red-500/40! dark:bg-red-500/10 dark:text-red-400"
            }`}
          >
            <span
              className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold uppercase text-white ${
                valid ? "bg-blue-500" : "bg-red-500"
              }`}
            >
              {email[0]}
            </span>
            <span className="max-w-52 truncate">{email}</span>
            <button
              type="button"
              aria-label={`Remove ${email}`}
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                onChipsChange(chips.filter((c) => c !== email));
              }}
              className="rounded-full p-0.5 text-app-text-faint hover:bg-black/10 hover:text-app-text dark:hover:bg-white/10"
            >
              <X className="size-3" />
            </button>
          </span>
        );
      })}
      <input
        ref={inputRef}
        value={draft}
        autoFocus={autoFocus}
        disabled={disabled}
        placeholder={chips.length ? "" : placeholder}
        onChange={(e) => {
          const value = e.target.value;
          // a pasted list, or a separator typed mid-way: chip all but the last piece
          const parts = value.split(/[,;\s\n]+/);
          if (parts.length > 1) {
            const rest = parts.pop();
            const found = parseEmails(parts.join(","));
            if (found.length) onChipsChange([...new Set([...chips, ...found])]);
            onDraftChange(rest);
          } else {
            onDraftChange(value);
          }
        }}
        onKeyDown={(e) => {
          if (CHIP_KEYS.has(e.key) && draft.trim()) {
            e.preventDefault();
            commit(draft);
          } else if (e.key === "Tab" && draft.trim()) {
            commit(draft);
          } else if (e.key === "Backspace" && !draft && chips.length) {
            e.preventDefault();
            onDraftChange(chips[chips.length - 1]);
            onChipsChange(chips.slice(0, -1));
          }
        }}
        onBlur={() => draft.trim() && commit(draft)}
        className="min-w-32 flex-1 bg-transparent py-0.5 text-sm text-app-text outline-none placeholder:text-app-text-faint disabled:opacity-60"
      />
    </div>
  );
}

// Desktop / Mobile switch for the template preview
function DeviceToggle({ value, onChange }) {
  const options = [
    { id: "desktop", label: "Desktop", icon: Monitor },
    { id: "ios", label: "iPhone", icon: Smartphone },
    { id: "android", label: "Android", icon: Smartphone },
  ];
  return (
    <div className="inline-flex shrink-0 rounded-full bg-app-surface-secondary p-0.5 ring-1 ring-app-border">
      {options.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          aria-pressed={value === id}
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
            value === id ? "bg-app-surface text-app-text shadow-sm" : "text-app-text-muted hover:text-app-text"
          }`}
        >
          <Icon className="size-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}

const Row = ({ label, children }) => (
  <div className="flex min-h-10 items-center gap-2 border-b border-app-border! py-1.5">
    {label && <span className="shrink-0 text-sm text-app-text-muted">{label}</span>}
    {children}
  </div>
);

const fieldClass =
  "min-w-0 flex-1 bg-transparent text-sm text-app-text outline-none placeholder:text-app-text-faint disabled:opacity-60";

// A new email in a Gmail-style window: docked bottom-right, can be minimised
// to its title bar or opened full screen. With `isBroadcast` it goes to
// `recipientCount` already-chosen people plus anyone added in "To".
// onSend({ from, toEmails, subject, html, text, attachments })
// onReviewRecipients() - when given, the "N selected people" chip opens a review of them
function ComposeEmail({
  onClose,
  recipients = [],
  recipientCount = 0,
  isBroadcast = false,
  onSend,
  isSubmitting = false,
  defaultFrom = "",
  initialTemplate = null,
  onReviewRecipients,
}) {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [from, setFrom] = useState(defaultFrom);
  const [chips, setChips] = useState(() => parseEmails(recipients.join(",")));
  const [draft, setDraft] = useState("");
  const [subject, setSubject] = useState(initialTemplate?.subject || "");
  const [body, setBody] = useState("");
  // what is in the editor right now: Jodit only reports it on blur through
  // `body`, so Send (or Discard) reads this instead of a possibly stale state
  const bodyRef = useRef("");
  const [view, setView] = useState("normal"); // normal | minimized | full
  const [showFormatting, setShowFormatting] = useState(true);
  const [attachments, setAttachments] = useState([]);
  const [template, setTemplate] = useState(initialTemplate?.html ? initialTemplate : null);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  // the property's own mailbox: when connected, emails go out from it
  // (gian sendCampaignMail); otherwise from support@eazotel.com "via Eazotel"
  const [mailbox, setMailbox] = useState(null);
  // or its own address verified in Amazon SES (comes first when verified)
  const [ses, setSes] = useState(null);
  const sesOn = ses?.status === "verified";
  const [presets, setPresets] = useState([]);
  const [isMailboxOpen, setIsMailboxOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  // template preview: device, how it measured (fixed-width designs), the big view
  const [device, setDevice] = useState("desktop");
  const [fit, setFit] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  // Mailchimp-style: the inbox preview text, and the property's footer
  const [previewText, setPreviewText] = useState(initialTemplate?.previewText || "");
  const [footerName, setFooterName] = useState(null); // null = default footer
  const [isFooterOpen, setIsFooterOpen] = useState(false);
  // the exact email guests get (gian: device-optimized + footer), for the preview
  const [finalHtml, setFinalHtml] = useState("");
  const [renderVersion, setRenderVersion] = useState(0);
  // "Send test": the email as it is now, to a few addresses, saved nowhere
  const [isTestOpen, setIsTestOpen] = useState(false);
  const [testTo, setTestTo] = useState("");
  const [testing, setTesting] = useState(false);
  const hotelName = useSelector((state) => state.userProfile.user?.Profile?.hotelName) || "Your hotel";

  // how this property sends: own mail server, own address in Amazon, or via Eazotel
  const loadSender = useCallback((alive = { current: true }) => {
    getSenderMailbox()
      .then((result) => {
        if (!alive.current) return;
        setMailbox(result?.mailbox || null);
        setSes(result?.ses || null);
        setPresets(result?.presets || []);
      })
      .catch(() => {}); // not connected / older server: send through Eazotel as before
  }, []);

  useEffect(() => {
    const alive = { current: true };
    loadSender(alive);
    return () => {
      alive.current = false;
    };
  }, [loadSender]);

  useEffect(() => {
    let alive = true;
    getEmailFooter()
      .then((result) => alive && setFooterName(result?.footer ? result.footer.companyName || "Custom footer" : null))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // the preview shows what gian will send; the raw template until it answers (or on an older server)
  useEffect(() => {
    if (!template?.html) {
      setFinalHtml("");
      return undefined;
    }
    let alive = true;
    const timer = setTimeout(() => {
      renderEmail({ html: template.html, previewText })
        .then((result) => alive && setFinalHtml(result?.html || ""))
        .catch(() => alive && setFinalHtml(""));
    }, 400);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [template, previewText, renderVersion]);

  // a verified Amazon address, else a connected mailbox, is the sender
  useEffect(() => {
    if (sesOn) setFrom(ses.fromEmail);
    else if (mailbox?.email) setFrom(mailbox.email);
  }, [mailbox, ses, sesOn]);

  const minimized = view === "minimized";
  const full = view === "full";

  // the dashboard's chat button sits where this window docks: hide it meanwhile
  useEffect(() => {
    document.body.classList.add("compose-open");
    return () => document.body.classList.remove("compose-open");
  }, []);

  // Esc leaves full screen, as in Gmail
  useEffect(() => {
    if (!full) return undefined;
    const onKey = (e) => e.key === "Escape" && !isTemplateOpen && !isMailboxOpen && !isTestOpen && !isPreviewOpen && setView("normal");
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [full, isTemplateOpen, isMailboxOpen, isTestOpen, isPreviewOpen]);

  useEffect(() => {
    if (defaultFrom) setFrom((current) => current || defaultFrom);
  }, [defaultFrom]);

  // a draft with something written in it is only thrown away after asking
  const handleDiscard = async () => {
    const hasDraft =
      bodyRef.current.replace(/<[^>]*>|&nbsp;/g, "").trim() ||
      (subject.trim() && subject !== (initialTemplate?.subject || "")) ||
      attachments.length > 0;
    if (hasDraft) {
      const confirmed = await confirm("Your message, subject and attachments will be lost.", {
        title: "Discard this email?",
        confirmText: "Discard",
      });
      if (!confirmed) return;
    }
    onClose();
  };

  const editorConfig = useMemo(
    () => ({
      readonly: false,
      height: "auto",
      minHeight: 220,
      allowResizeY: false,
      placeholder: "Write your message…",
      toolbarAdaptive: false,
      toolbarSticky: false,
      toolbarButtonSize: "small",
      showCharsCounter: false,
      showWordsCounter: false,
      showXPathInStatusbar: false,
      hidePoweredByJodit: true,
      buttons: ["undo", "redo", "|", "fontsize", "bold", "italic", "underline", "brush", "|", "align", "ul", "ol", "|", "link", "eraser"],
      uploader: { insertImageAsBase64URI: true },
      // keeps template table cells intact when edited as text
      cleanHTML: { removeEmptyElements: false },
    }),
    [],
  );

  const typedEmails = [...new Set([...chips, ...parseEmails(draft)])];
  const invalidTyped = typedEmails.filter((email) => !EMAIL_REGEX.test(email));
  const totalRecipients = recipientCount + typedEmails.length - invalidTyped.length;

  const applyTemplate = (picked) => {
    setTemplate(picked);
    if (picked?.subject && !subject.trim()) setSubject(picked.subject);
  };

  // moves the template into the text editor for free editing
  const editTemplateAsText = () => {
    setBody(template.html);
    bodyRef.current = template.html;
    setTemplate(null);
    setEditorKey((k) => k + 1);
  };

  const fail = (message) => showToast({ message, type: "error", duration: 5000 });

  // a ready-made .html file from the user's computer becomes the template,
  // shown and sent exactly as designed (Change → can save it to Saved templates).
  // Pictures embedded in the file are uploaded and linked (htmlTemplateImporter).
  const importHtmlFile = async (file) => {
    if (!file || importing) return;
    setImporting(true);
    try {
      const imported = await htmlTemplateImporter.read(file);
      applyTemplate({ name: imported.name, subject: imported.subject, html: imported.html });
      const notes = [];
      if (imported.hostedImages) notes.push(`${imported.hostedImages} picture(s) uploaded and linked`);
      if (imported.localImages.length) {
        notes.push(`${imported.localImages.length} picture(s) point to files on your computer and won't show, e.g. ${imported.localImages[0]}`);
      }
      if (imported.tooLongForGmail) notes.push(`it is ${imported.sizeKb} KB, so Gmail may cut it short`);
      showToast({
        message: `Template “${file.name}” added${notes.length ? `: ${notes.join("; ")}.` : "."}`,
        type: imported.localImages.length || imported.tooLongForGmail ? "warning" : "success",
        duration: notes.length ? 8000 : 4000,
      });
    } catch (error) {
      fail(error?.message || "Couldn't read that file.");
    } finally {
      setImporting(false);
    }
  };

  // the current email, as Send would send it; null (with a message shown) when not ready
  const currentContent = () => {
    if (!subject.trim()) {
      fail("Add a subject.");
      return null;
    }
    const html = template ? template.html : bodyRef.current;
    const scratch = document.createElement("div");
    scratch.innerHTML = html || "";
    const text = (scratch.textContent || "").trim();
    if (EMPTY_BODIES.has(String(html || "").trim()) || (!text && !/<img/i.test(html))) {
      fail("Write your message first.");
      return null;
    }
    return { html: withPreviewText(html, previewText), text };
  };

  const openTest = () => {
    setTestTo((current) => current || mailbox?.email || from.trim());
    setIsTestOpen(true);
  };

  const sendTest = async () => {
    if (testing) return;
    const to = parseEmails(testTo);
    if (!to.length) return fail("Enter an address to send the test to.");
    const bad = to.find((email) => !EMAIL_REGEX.test(email));
    if (bad) return fail(`“${bad}” doesn't look like an email address.`);
    if (to.length > 5) return fail("Send a test to at most 5 addresses.");
    const content = currentContent();
    if (!content) return;
    setTesting(true);
    try {
      await sendTestEmail({
        to,
        subject: subject.trim(),
        html: content.html,
        text: content.text,
        fromName: hotelName,
        replyTo: from.trim().toLowerCase(),
      });
      showToast({ message: `Test sent to ${to.join(", ")}. Check the inbox (and spam).`, type: "success" });
      setIsTestOpen(false);
    } catch (error) {
      fail(error?.message || "The test email could not be sent.");
    } finally {
      setTesting(false);
    }
  };

  const send = async () => {
    if (isSubmitting) return;
    if (!sesOn && mailbox?.status === "error") {
      setIsMailboxOpen(true);
      return fail(`Your mailbox ${mailbox.email} needs to be reconnected before sending.`);
    }
    const fromEmail = from.trim().toLowerCase();
    if (!EMAIL_REGEX.test(fromEmail)) return fail("Enter a valid “From” email address.");
    if (!recipientCount && !typedEmails.length) return fail("Add at least one recipient.");
    if (invalidTyped.length) {
      return fail(`Check these addresses: ${invalidTyped.slice(0, 3).join(", ")}${invalidTyped.length > 3 ? "…" : ""}`);
    }
    // a template is optional: a plain written message is sent as it is
    const content = currentContent();
    if (!content) return;
    const { html, text } = content;

    await onSend({
      from: fromEmail,
      toEmails: typedEmails,
      subject: subject.trim(),
      html,
      text,
      attachments,
    });
  };

  // Ctrl/⌘ + Enter sends from anywhere in the window
  const onWindowKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      send();
    }
  };

  const headerButton =
    "flex size-7 items-center justify-center rounded-full text-app-text-muted transition hover:bg-black/10 hover:text-app-text disabled:opacity-50 dark:hover:bg-white/10";

  const windowClass = minimized
    ? "bottom-0 right-2 w-[min(18rem,calc(100vw-1rem))] rounded-t-xl sm:right-6"
    : full
      ? "inset-0 m-auto h-[min(92dvh,900px)] w-[min(1100px,calc(100vw-2rem))] rounded-xl"
      : "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-xl sm:left-auto sm:right-6 sm:w-[580px]";

  return (
    <>
      <style>{`body.compose-open [data-chatbot-fab]{display:none!important}${EDITOR_CSS}`}</style>

      {full && <div className="fixed inset-0 z-[9989] bg-black/45" onClick={() => setView("normal")} aria-hidden />}

      <div
        role="dialog"
        aria-label={subject.trim() || "New message"}
        onKeyDown={onWindowKeyDown}
        className={`fixed z-[9990] flex flex-col overflow-hidden bg-app-surface text-app-text shadow-[0_8px_30px_rgba(0,0,0,0.22)] ring-1 ring-black/5 dark:ring-white/10 ${windowClass}`}
      >
        {/* title bar: click to minimise / restore, like Gmail */}
        <div
          onClick={() => setView((v) => (v === "minimized" ? "normal" : "minimized"))}
          className="flex h-10 shrink-0 cursor-pointer select-none items-center gap-1 bg-[#f2f6fc] pl-4 pr-2 dark:bg-app-surface-secondary"
        >
          <p className="min-w-0 flex-1 truncate text-sm font-medium text-app-text">
            {subject.trim() || (isBroadcast ? "New broadcast" : "New message")}
          </p>
          <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              aria-label={minimized ? "Restore" : "Minimise"}
              title={minimized ? "Restore" : "Minimise"}
              onClick={() => setView(minimized ? "normal" : "minimized")}
              className={headerButton}
            >
              <Minus className="size-4" />
            </button>
            <button
              type="button"
              aria-label={full ? "Exit full screen" : "Full screen"}
              title={full ? "Exit full screen (Esc)" : "Full screen"}
              onClick={() => setView(full ? "normal" : "full")}
              className={`${headerButton} hidden sm:flex`}
            >
              {full ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
            </button>
            <button
              type="button"
              aria-label="Close"
              title="Close"
              onClick={handleDiscard}
              disabled={isSubmitting}
              className={headerButton}
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {!minimized && (
          <>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              <div className="px-4">
                {sesOn ? (
                  <Row label="From">
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {ses.displayName || hotelName}{" "}
                      <span className="text-app-text-muted">&lt;{ses.fromEmail}&gt;</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsMailboxOpen(true)}
                      title="Sent from your own address through Amazon SES"
                      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-700 hover:bg-amber-500/20 dark:text-amber-400"
                    >
                      <Zap className="size-3" />
                      Amazon
                    </button>
                  </Row>
                ) : mailbox ? (
                  <Row label="From">
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {mailbox.displayName || hotelName}{" "}
                      <span className="text-app-text-muted">&lt;{mailbox.email}&gt;</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsMailboxOpen(true)}
                      title={mailbox.status === "error" ? mailbox.lastError : "Sent from your own mailbox"}
                      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        mailbox.status === "error"
                          ? "bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:text-red-400"
                          : "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400"
                      }`}
                    >
                      {mailbox.status === "error" ? <TriangleAlert className="size-3" /> : <CheckCircle2 className="size-3" />}
                      {mailbox.status === "error" ? "Reconnect" : "Your mailbox"}
                    </button>
                  </Row>
                ) : (
                  <div className="border-b border-app-border! py-1.5">
                    <div className="flex min-h-7 items-center gap-2">
                      <span className="shrink-0 text-sm text-app-text-muted">Reply to</span>
                      <input
                        type="email"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        placeholder="you@yourhotel.com"
                        disabled={isSubmitting}
                        className={fieldClass}
                      />
                    </div>
                    <p className="pb-0.5 text-[11px] leading-snug text-app-text-faint">
                      Guests see “{hotelName} via Eazotel” &lt;support@eazotel.com&gt;.{" "}
                      <button
                        type="button"
                        onClick={() => setIsMailboxOpen(true)}
                        className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Send from your own email
                      </button>
                    </p>
                  </div>
                )}

                {isBroadcast && (
                  <Row label="To">
                    <button
                      type="button"
                      onClick={onReviewRecipients}
                      disabled={!onReviewRecipients}
                      title={onReviewRecipients ? "Review, remove or add people" : undefined}
                      className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-600 enabled:hover:bg-blue-500/20 disabled:cursor-default dark:text-blue-400"
                    >
                      <Users className="size-3.5" />
                      {recipientCount.toLocaleString("en-IN")} selected {recipientCount === 1 ? "person" : "people"}
                      {onReviewRecipients && <span className="underline underline-offset-2">Review</span>}
                    </button>
                  </Row>
                )}

                <Row label={isBroadcast ? "Also to" : "To"}>
                  <RecipientInput
                    chips={chips}
                    onChipsChange={setChips}
                    draft={draft}
                    onDraftChange={setDraft}
                    disabled={isSubmitting}
                    autoFocus={!isBroadcast && !chips.length}
                    placeholder={isBroadcast ? "Optional: more addresses" : "Recipients"}
                  />
                </Row>

                <Row>
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Subject"
                    disabled={isSubmitting}
                    className={fieldClass}
                  />
                  {subject.length > 60 && (
                    <span className="shrink-0 text-[11px] text-amber-600" title="Phones cut subjects at about 40–60 characters">
                      {subject.length} chars
                    </span>
                  )}
                </Row>

                <Row>
                  <input
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value.slice(0, 150))}
                    placeholder="Preview text: the line shown after the subject in the inbox"
                    disabled={isSubmitting}
                    className={fieldClass}
                  />
                </Row>

                <Row label="Footer">
                  <span className="min-w-0 flex-1 truncate text-sm text-app-text-muted">
                    {footerName ? `${footerName} · address, contacts & unsubscribe` : "Default (hotel name + unsubscribe)"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsFooterOpen(true)}
                    className="shrink-0 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Edit footer
                  </button>
                </Row>
              </div>

              <div className="flex-1">
                {template ? (
                  <div className="m-3 overflow-hidden rounded-lg border border-app-border!">
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
                    <div className="flex items-center gap-2 border-b border-app-border! px-3 py-1.5">
                      <DeviceToggle value={device} onChange={setDevice} />
                      {fit && !fit.mobileFriendly && (
                        <span
                          className="inline-flex min-w-0 items-center gap-1 truncate text-[11px] text-amber-700 dark:text-amber-400"
                          title="Even after optimizing, part of this design is wider than a phone (often side-by-side columns or a wide picture). Phones shrink it to fit, so text gets small."
                        >
                          <TriangleAlert className="size-3 shrink-0" />
                          <span className="truncate">Still {fit.contentWidth}px wide on phones: text may look small</span>
                        </span>
                      )}
                      <Button size="sm" variant="ghost" icon={Expand} onClick={() => setIsPreviewOpen(true)} className="ml-auto">
                        Preview
                      </Button>
                    </div>
                    <FittedEmailPreview
                      html={finalHtml || template.html}
                      device={device}
                      onMeasure={setFit}
                      className={full ? "h-[58vh]" : "h-80"}
                    />
                  </div>
                ) : (
                  <div className={`gm-editor ${showFormatting ? "" : "gm-no-toolbar"} ${full ? "gm-full" : ""}`}>
                    <JoditEditor
                      key={editorKey}
                      value={body}
                      config={{ ...editorConfig, disabled: isSubmitting }}
                      onChange={(value) => {
                        bodyRef.current = value;
                      }}
                      onBlur={(value) => {
                        bodyRef.current = value;
                        setBody(value);
                      }}
                    />
                  </div>
                )}
              </div>

              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 px-4 pb-3">
                  {attachments.map((file, index) => (
                    <span
                      key={`${file.name}-${index}`}
                      className="inline-flex max-w-full items-center gap-2 rounded-md bg-app-surface-secondary py-1.5 pl-2.5 pr-1 text-xs"
                    >
                      <FileText className="size-3.5 shrink-0 text-blue-500" />
                      <span className="max-w-48 truncate font-medium text-blue-600 dark:text-blue-400" title={file.name}>
                        {file.name}
                      </span>
                      <span className="shrink-0 text-app-text-faint">({formatSize(file.size)})</span>
                      <button
                        type="button"
                        aria-label={`Remove ${file.name}`}
                        onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== index))}
                        className="rounded p-0.5 text-app-text-faint hover:text-red-500"
                      >
                        <X className="size-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {isTestOpen && (
              <div className="shrink-0 border-t border-app-border! bg-app-surface-secondary px-4 py-3">
                <div className="flex items-center gap-2">
                  <FlaskConical className="size-4 shrink-0 text-blue-500" />
                  <input
                    type="text"
                    value={testTo}
                    autoFocus
                    onChange={(e) => setTestTo(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        e.stopPropagation();
                        sendTest();
                      } else if (e.key === "Escape") {
                        e.stopPropagation();
                        setIsTestOpen(false);
                      }
                    }}
                    placeholder="you@yourhotel.com, colleague@yourhotel.com"
                    disabled={testing}
                    className="min-w-0 flex-1 rounded-md border border-app-border! bg-app-surface px-2.5 py-1.5 text-sm text-app-text outline-none placeholder:text-app-text-faint focus:border-blue-500!"
                  />
                  <Button size="sm" onClick={sendTest} loading={testing} icon={null}>
                    Send test
                  </Button>
                  <IconButton icon={X} label="Close test" size="sm" onClick={() => setIsTestOpen(false)} disabled={testing} />
                </div>
                <p className="mt-1.5 text-[11px] leading-snug text-app-text-faint">
                  Up to 5 addresses. Sent exactly as guests will get it, with “[Test]” in the subject. It isn't saved as a
                  campaign. Attachments aren't included.
                </p>
              </div>
            )}

            {/* bottom bar: Send, then the tools, Discard on the far right */}
            <div className="flex shrink-0 items-center gap-1 px-4 py-3">
              <Button
                icon={null}
                onClick={send}
                loading={isSubmitting}
                title="Send (Ctrl + Enter)"
                className="mr-2 rounded-full! px-6 dark:bg-blue-600"
              >
                Send{totalRecipients > 1 ? ` to ${totalRecipients.toLocaleString("en-IN")}` : ""}
              </Button>
              {!template && (
                <IconButton
                  icon={Type}
                  label={showFormatting ? "Hide formatting options" : "Formatting options"}
                  onClick={() => setShowFormatting((s) => !s)}
                  className={`rounded-full! ${showFormatting ? "bg-app-surface-secondary text-app-text" : ""}`}
                />
              )}
              <label
                className="inline-flex h-8 min-w-8 cursor-pointer items-center justify-center gap-1 rounded-full px-1.5 text-app-text-muted transition hover:bg-app-surface-secondary hover:text-app-text"
                title="Attach files"
              >
                <Paperclip className="size-4" />
                {attachments.length > 0 && <span className="text-xs">{attachments.length}</span>}
                <input
                  type="file"
                  multiple
                  hidden
                  disabled={isSubmitting}
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length) setAttachments((prev) => [...prev, ...files]);
                    e.target.value = "";
                  }}
                />
              </label>
              <IconButton
                icon={FlaskConical}
                label="Send a test email"
                onClick={() => (isTestOpen ? setIsTestOpen(false) : openTest())}
                disabled={isSubmitting}
                className={`rounded-full! ${isTestOpen ? "bg-app-surface-secondary text-app-text" : ""}`}
              />
              <label
                className={`inline-flex h-8 min-w-8 items-center justify-center rounded-full px-1.5 text-app-text-muted transition hover:bg-app-surface-secondary hover:text-app-text ${
                  importing ? "cursor-wait" : "cursor-pointer"
                }`}
                title={importing ? "Uploading the template's pictures…" : "Upload HTML template"}
                aria-label="Upload HTML template"
              >
                {importing ? <Loader2 className="size-4 animate-spin" /> : <FileCode2 className="size-4" />}
                <input
                  type="file"
                  accept=".html,.htm,text/html"
                  hidden
                  disabled={isSubmitting || importing}
                  onChange={(e) => {
                    importHtmlFile(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
              <IconButton
                icon={Sparkles}
                label={template ? "Change template" : "Use a template"}
                onClick={() => setIsTemplateOpen(true)}
                disabled={isSubmitting}
                className="rounded-full!"
              />
              <IconButton
                icon={Trash2}
                label="Discard draft"
                onClick={handleDiscard}
                disabled={isSubmitting}
                className="ml-auto rounded-full!"
              />
            </div>
          </>
        )}
      </div>

      <Dialog
        open={isPreviewOpen && Boolean(template)}
        onClose={() => setIsPreviewOpen(false)}
        size="xl"
        title={subject.trim() || template?.name || "Preview"}
        description="How guests will see this email."
      >
        <div className="mb-3 flex justify-center">
          <DeviceToggle value={device} onChange={setDevice} />
        </div>
        {template && (
          <FittedEmailPreview
            html={finalHtml || template.html}
            device={device}
            className="h-[72vh] rounded-lg"
          />
        )}
      </Dialog>

      <FooterEditorDialog
        open={isFooterOpen}
        onClose={() => setIsFooterOpen(false)}
        onSaved={(saved) => {
          setFooterName(saved ? saved.companyName || "Custom footer" : null);
          setRenderVersion((v) => v + 1); // the preview picks up the new footer
        }}
      />

      <SenderMailboxDialog
        open={isMailboxOpen}
        onClose={() => setIsMailboxOpen(false)}
        mailbox={mailbox}
        ses={ses}
        presets={presets}
        onChange={() => {
          // Amazon / mail server changed: read both again; back to the default Reply-To until it answers
          setFrom(defaultFrom || "");
          loadSender();
        }}
      />

      <AITemplateModal
        isOpen={isTemplateOpen}
        mode="compose"
        initialTemplate={template}
        onClose={() => setIsTemplateOpen(false)}
        onUse={applyTemplate}
      />
    </>
  );
}

export default ComposeEmail;
