import JoditEditor from "jodit-react";
import {
  CheckCircle2,
  Expand,
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
import ComposeInsertMenu from "./ComposeInsertMenu";
import HelpMeWritePanel from "./HelpMeWritePanel";
import HtmlDesignDialog from "./HtmlDesignDialog";
import SuggestionMenu from "../ui/SuggestionMenu";
import { useSuggestions } from "../ui/useSuggestions";
import { htmlTemplateImporter } from "./htmlTemplateImporter";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";
import SenderMailboxDialog from "./SenderMailboxDialog";
import { useDraftAutosave } from "./useDraftAutosave";

// gian's attachment upload takes files up to 10 MB each (config/multer)
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

// the words of an HTML design, for AI subject lines
const textOfHtml = (html) => {
  const box = document.createElement("div");
  box.innerHTML = String(html || "").replace(/<(style|script|head)[^>]*>[\s\S]*?<\/\1>/gi, "");
  return (box.textContent || "").replace(/\s+/g, " ").trim();
};

const EMPTY_BODIES = new Set(["", "<p><br></p>", "<p></p>", "<br>"]);

// keys that turn what is typed in "To" into a chip
const CHIP_KEYS = new Set(["Enter", ",", ";", " "]);

// Jodit, made to look like Gmail's body: no frame, formatting bar under the text
const EDITOR_CSS = `
/* the editor fills the window, so the formatting bar sits at the bottom, right above Send */
.gm-editor>.jodit-react-container{flex:1 1 auto;display:flex;flex-direction:column;min-height:0}
.gm-editor .jodit-container:not(.jodit_inline){flex:1 1 auto;border:0;border-radius:0;background:transparent;display:flex;flex-direction:column}
.gm-editor .jodit-workplace{order:1;flex:1 1 auto}
/* a long message scrolls under it; the bar stays in view */
.gm-editor .jodit-toolbar__box:not(:empty){order:2;position:sticky;bottom:0;z-index:2;margin:0 12px 6px;border:1px solid var(--color-app-border,#e5e7eb);border-radius:10px;background:var(--color-app-surface-secondary,#f6f8fc)}
.gm-editor.gm-no-toolbar .jodit-toolbar__box{display:none}
.gm-editor .jodit-status-bar{display:none}
.gm-editor .jodit-wysiwyg{padding:10px 16px!important;font-size:14px;line-height:1.55}
.gm-editor .jodit-placeholder{padding:10px 16px!important;font-size:14px}
`;

const formatSize = (bytes) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

// Gmail's "To": every address becomes a chip; Backspace removes the last one. While typing,
// the hotel's own addresses, team members and saved contacts are suggested (SuggestionMenu).
function RecipientInput({ chips, onChipsChange, draft, onDraftChange, disabled, placeholder, autoFocus }) {
  const inputRef = useRef(null);
  const wrapRef = useRef(null);
  const [focused, setFocused] = useState(false);
  const suggestions = useSuggestions({ type: "email", query: draft, exclude: chips, open: focused && !disabled });
  const pick = (s) => {
    onChipsChange([...new Set([...chips, s.value])]);
    onDraftChange("");
  };

  const commit = (text) => {
    const found = parseEmails(text);
    if (found.length) onChipsChange([...new Set([...chips, ...found])]);
    onDraftChange("");
  };

  return (
    <div ref={wrapRef} className="flex min-w-0 flex-1 flex-wrap items-center gap-1" onClick={() => inputRef.current?.focus()}>
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
        onFocus={() => setFocused(true)}
        onKeyDown={(e) => {
          if (suggestions.onKeyDown(e, pick)) return;
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
        onBlur={() => {
          setFocused(false);
          if (draft.trim()) commit(draft);
        }}
        autoComplete="off"
        className="min-w-32 flex-1 bg-transparent py-0.5 text-sm text-app-text outline-none placeholder:text-app-text-faint disabled:opacity-60"
      />
      <SuggestionMenu state={suggestions} anchorRef={wrapRef} onPick={pick} />
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
// onSend({ from, toEmails, subject, html, text, attachments }) -> true when it went out
// onReviewRecipients() - when given, the "N selected people" chip opens a review of them
//
// Drafts (Gmail-style), with `draftsEnabled`: saved a moment after each change;
// the close button keeps the draft, Discard deletes it, sending deletes it.
//   initialDraft          a saved draft to continue (gian /email-marketing/drafts/:id)
//   recipientBatchId / recipientLabel   the chosen people, saved with the draft
//   onDraftsChanged()     a draft was created, deleted or sent: refresh the Drafts list
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
  draftsEnabled = false,
  initialDraft = null,
  recipientBatchId = null,
  recipientLabel = "",
  onDraftsChanged,
}) {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [from, setFrom] = useState(initialDraft?.fromEmail || defaultFrom);
  const [chips, setChips] = useState(() =>
    initialDraft?.toEmails?.length ? initialDraft.toEmails : parseEmails(recipients.join(",")),
  );
  const [draft, setDraft] = useState("");
  const [subject, setSubject] = useState(initialDraft?.subject ?? initialTemplate?.subject ?? "");
  const [body, setBody] = useState(initialDraft?.bodyHtml || "");
  // what is in the editor right now: Jodit only reports it on blur through
  // `body`, so Send (or Discard) reads this instead of a possibly stale state
  const bodyRef = useRef(initialDraft?.bodyHtml || "");
  const [view, setView] = useState("normal"); // normal | minimized | full
  const [showFormatting, setShowFormatting] = useState(true);
  const [attachments, setAttachments] = useState([]);
  const [template, setTemplate] = useState(
    initialDraft?.template?.html ? initialDraft.template : initialTemplate?.html ? initialTemplate : null,
  );
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
  // a photo being put into the message
  const [importing, setImporting] = useState(false);
  // "Upload HTML design": the files picked (null = closed)
  const [designFiles, setDesignFiles] = useState(null);
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const editorRef = useRef(null); // the Jodit instance, to insert at the cursor
  const attachInputRef = useRef(null);
  const designInputRef = useRef(null);
  const photoInputRef = useRef(null);
  // template preview: device, how it measured (fixed-width designs), the big view
  const [device, setDevice] = useState("desktop");
  const [fit, setFit] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  // Mailchimp-style: the inbox preview text, and the property's footer
  const [previewText, setPreviewText] = useState(initialDraft?.previewText ?? initialTemplate?.previewText ?? "");
  const [footerName, setFooterName] = useState(null); // null = default footer
  const [isFooterOpen, setIsFooterOpen] = useState(false);
  // the exact email guests get (gian: device-optimized + footer), for the preview
  const [finalHtml, setFinalHtml] = useState("");
  const [renderVersion, setRenderVersion] = useState(0);
  // "Send test": the email as it is now, to a few addresses, saved nowhere
  const [isTestOpen, setIsTestOpen] = useState(false);
  const [testTo, setTestTo] = useState("");
  // suggestions for the address being typed in the test box (the last one after a comma)
  const testWrapRef = useRef(null);
  const [testFocused, setTestFocused] = useState(false);
  const testParts = testTo.split(/[,;\s]+/);
  const testSuggestions = useSuggestions({
    type: "email",
    query: testParts[testParts.length - 1] || "",
    exclude: parseEmails(testTo),
    open: testFocused,
  });
  const pickTest = (sug) => {
    const done = testParts.slice(0, -1).filter(Boolean);
    setTestTo([...done, sug.value].join(", ") + ", ");
  };
  const [testing, setTesting] = useState(false);
  const hotelName = useSelector((state) => state.userProfile.user?.Profile?.hotelName) || "Your hotel";

  // ---- drafts ----
  // what a draft holds: everything in the window except attachments
  const draftPayload = () => ({
    subject,
    previewText,
    fromEmail: from.trim(),
    toEmails: [...new Set([...chips, ...parseEmails(draft)])],
    recipientBatchId: recipientBatchId || null,
    recipientCount: recipientBatchId ? recipientCount : 0,
    recipientLabel: recipientBatchId ? recipientLabel : "",
    bodyHtml: template ? "" : bodyRef.current,
    template: template ? { name: template.name || "", subject: template.subject || "", html: template.html } : null,
  });
  // an untouched window (or a template picked and nothing else) isn't kept
  const worthKeeping = (payload) =>
    Boolean(
      payload.bodyHtml.replace(/<[^>]*>|&nbsp;/g, "").trim() ||
        /<img/i.test(payload.bodyHtml) ||
        (payload.subject.trim() && payload.subject !== (initialTemplate?.subject || "")) ||
        payload.previewText.trim() ||
        payload.toEmails.length ||
        (payload.template && payload.template.html !== initialTemplate?.html),
    );
  const drafts = useDraftAutosave({
    enabled: draftsEnabled,
    initialId: initialDraft?._id || null,
    buildPayload: draftPayload,
    hasContent: worthKeeping,
    onCreated: onDraftsChanged,
  });
  const scheduleDraftSave = drafts.schedule;

  // every change (but not the first render) saves the draft a moment later
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    scheduleDraftSave();
  }, [subject, previewText, from, chips, draft, template, scheduleDraftSave]);

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
    const hasDraft = worthKeeping(draftPayload()) || attachments.length > 0 || drafts.hasDraft();
    if (hasDraft) {
      const confirmed = await confirm(
        draftsEnabled
          ? "This email will be deleted from your drafts. This can't be undone."
          : "Your message, subject and attachments will be lost.",
        { title: "Discard this email?", confirmText: "Discard" },
      );
      if (!confirmed) return;
    }
    if (draftsEnabled && (await drafts.discard())) onDraftsChanged?.();
    onClose();
  };

  // the close button: with drafts it keeps the email (like Gmail) instead of asking to discard
  const handleClose = async () => {
    if (!draftsEnabled) return handleDiscard();
    await drafts.save();
    if (drafts.hasDraft()) {
      showToast({
        message: attachments.length
          ? "Saved to Drafts. Attachments aren't kept in drafts: add them again before sending."
          : "Saved to Drafts.",
        duration: attachments.length ? 6000 : 3000,
      });
      onDraftsChanged?.();
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

  // a ready-made .html design (checked in HtmlDesignDialog: pictures put online,
  // phone fit, optional AI rebuild) becomes the template, sent exactly as designed
  const applyDesign = (picked) => {
    applyTemplate(picked);
    setDesignFiles(null);
    showToast({ message: `Design “${picked.name}” added.`, type: "success" });
  };

  // text from Help me write / a photo: at the cursor, else at the end
  const insertIntoEditor = (html) => {
    const jodit = editorRef.current;
    if (jodit?.s?.insertHTML) {
      jodit.s.insertHTML(html);
      bodyRef.current = jodit.value;
    } else {
      bodyRef.current = `${bodyRef.current || ""}${html}`;
      setBody(bodyRef.current);
      setEditorKey((k) => k + 1);
    }
    scheduleDraftSave();
  };
  const replaceBody = (html) => {
    bodyRef.current = html;
    setBody(html);
    setEditorKey((k) => k + 1);
    scheduleDraftSave();
  };

  // a photo shown inside the message: uploaded, then linked (never base64,
  // which makes emails heavy and is blocked by many mail apps)
  const insertPhoto = async (file) => {
    if (!file || importing) return;
    setImporting(true);
    try {
      const ready = await htmlTemplateImporter.uploadable(file);
      const url = await htmlTemplateImporter.upload(ready, 1);
      insertIntoEditor(`<p><img src="${url}" alt="" style="display:block;max-width:100%;height:auto;border:0"></p>`);
    } catch (error) {
      fail(error?.message || "Couldn't upload the photo.");
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

    // no autosave while it goes out; once sent, the draft is deleted
    drafts.block();
    const sent = await onSend({
      from: fromEmail,
      toEmails: typedEmails,
      subject: subject.trim(),
      html,
      text,
      attachments,
      // everything in this window, so "Undo" (in the minutes before it starts) can open it again
      restore: draftPayload(),
    });
    if (sent === true) {
      if (draftsEnabled && (await drafts.discard())) onDraftsChanged?.();
    } else {
      drafts.unblock();
    }
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
              aria-label={draftsEnabled ? "Save & close" : "Close"}
              title={draftsEnabled ? "Save & close" : "Close"}
              onClick={handleClose}
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

              <div className="flex flex-1 flex-col">
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
                  <div className={`gm-editor flex flex-1 flex-col ${showFormatting ? "" : "gm-no-toolbar"} ${full ? "gm-full" : ""}`}>
                    <JoditEditor
                      key={editorKey}
                      ref={editorRef}
                      value={body}
                      config={{ ...editorConfig, disabled: isSubmitting }}
                      onChange={(value) => {
                        bodyRef.current = value;
                        scheduleDraftSave();
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

            {isWriteOpen && (
              <HelpMeWritePanel
                getBody={() => bodyRef.current || ""}
                subject={subject}
                designMode={Boolean(template)}
                designText={template ? textOfHtml(template.html) : ""}
                onReplace={(html) => {
                  replaceBody(html);
                  setIsWriteOpen(false);
                }}
                onInsert={(html) => {
                  insertIntoEditor(html);
                  setIsWriteOpen(false);
                }}
                onSubject={(text) => {
                  setSubject(text);
                  scheduleDraftSave();
                  showToast({ message: "Subject updated.", type: "success" });
                }}
                onClose={() => setIsWriteOpen(false)}
              />
            )}

            {isTestOpen && (
              <div className="shrink-0 border-t border-app-border! bg-app-surface-secondary px-4 py-3">
                <div className="flex items-center gap-2">
                  <FlaskConical className="size-4 shrink-0 text-blue-500" />
                  <div ref={testWrapRef} className="min-w-0 flex-1">
                  <input
                    type="text"
                    value={testTo}
                    autoFocus
                    autoComplete="off"
                    onFocus={() => setTestFocused(true)}
                    onBlur={() => setTestFocused(false)}
                    onChange={(e) => setTestTo(e.target.value)}
                    onKeyDown={(e) => {
                      if (testSuggestions.onKeyDown(e, pickTest)) return;
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
                    className="w-full rounded-md border border-app-border! bg-app-surface px-2.5 py-1.5 text-sm text-app-text outline-none placeholder:text-app-text-faint focus:border-blue-500!"
                  />
                  <SuggestionMenu state={testSuggestions} anchorRef={testWrapRef} onPick={pickTest} />
                  </div>
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
              <button
                type="button"
                onClick={() => attachInputRef.current?.click()}
                disabled={isSubmitting}
                className="inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-full px-1.5 text-app-text-muted transition hover:bg-app-surface-secondary hover:text-app-text"
                title="Attach files"
                aria-label="Attach files"
              >
                <Paperclip className="size-4" />
                {attachments.length > 0 && <span className="text-xs">{attachments.length}</span>}
              </button>
              {/* everything that can go into the email, in one pop-up */}
              <ComposeInsertMenu
                disabled={isSubmitting}
                items={[
                  { key: "files", onClick: () => attachInputRef.current?.click() },
                  {
                    key: "photo",
                    onClick: () => photoInputRef.current?.click(),
                    disabled: Boolean(template),
                    busy: importing,
                    hint: template ? "Not in an HTML design: choose “Edit as text” first" : undefined,
                  },
                  { key: "design", onClick: () => designInputRef.current?.click() },
                  { key: "template", onClick: () => setIsTemplateOpen(true) },
                  { key: "ai", onClick: () => setIsWriteOpen(true) },
                ]}
              />
              <button
                type="button"
                onClick={() => setIsWriteOpen((v) => !v)}
                disabled={isSubmitting}
                title="Help me write (AI)"
                className={`inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium transition ${
                  isWriteOpen
                    ? "bg-blue-600 text-white"
                    : "text-blue-700 hover:bg-blue-500/10 dark:text-blue-300"
                }`}
              >
                <Sparkles className="size-4" />
                <span className="hidden sm:inline">Help me write</span>
              </button>
              <IconButton
                icon={FlaskConical}
                label="Send a test email"
                onClick={() => (isTestOpen ? setIsTestOpen(false) : openTest())}
                disabled={isSubmitting}
                className={`rounded-full! ${isTestOpen ? "bg-app-surface-secondary text-app-text" : ""}`}
              />
              <input
                ref={attachInputRef}
                type="file"
                multiple
                hidden
                disabled={isSubmitting}
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  const tooBig = files.filter((f) => f.size > MAX_ATTACHMENT_BYTES);
                  if (tooBig.length) fail(`${tooBig[0].name} is over 10 MB. Attach smaller files, or share a link instead.`);
                  const ok = files.filter((f) => f.size <= MAX_ATTACHMENT_BYTES);
                  if (ok.length) setAttachments((prev) => [...prev, ...ok]);
                  e.target.value = "";
                }}
              />
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  insertPhoto(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              <input
                ref={designInputRef}
                type="file"
                accept=".html,.htm,text/html,image/*"
                multiple
                hidden
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length) setDesignFiles(files);
                  e.target.value = "";
                }}
              />
              {draftsEnabled && drafts.status !== "idle" && (
                <span
                  role="status"
                  title={drafts.status === "error" ? drafts.error : undefined}
                  className={`ml-auto hidden truncate pl-2 text-[11px] sm:inline ${
                    drafts.status === "error" ? "text-red-500" : "text-app-text-faint"
                  }`}
                >
                  {drafts.status === "saving" ? "Saving…" : drafts.status === "saved" ? "Draft saved" : "Draft not saved"}
                </span>
              )}
              <IconButton
                icon={Trash2}
                label="Discard draft"
                onClick={handleDiscard}
                disabled={isSubmitting}
                className={`rounded-full! ml-auto ${draftsEnabled && drafts.status !== "idle" ? "sm:ml-1" : ""}`}
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

      <HtmlDesignDialog files={designFiles} onClose={() => setDesignFiles(null)} onUse={applyDesign} />

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
