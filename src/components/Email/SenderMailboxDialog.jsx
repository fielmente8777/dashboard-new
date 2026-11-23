import { ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, ChevronRight, Mail, Send, Server, ShieldCheck, TriangleAlert, Unplug, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useConfirm } from "../../context/ConfirmContext";
import { useToast } from "../../context/ToastContext";
import {
  deleteSenderMailbox,
  detectSenderMailbox,
  saveSenderMailbox,
  testSenderMailbox,
} from "../../redux/api/emailMarketingApi";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import { Field, Input } from "../ui/Field";
import Switch from "../ui/Switch";
import SesSenderDialog from "./SesSenderDialog";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// which preset a saved mailbox matches, by its SMTP host
const presetFor = (presets, host) =>
  presets.find((p) => p.id !== "other" && p.smtp.host === host)?.id || (host ? "other" : "other");

const serversOf = (source) => ({
  smtpHost: source?.smtp?.host || "",
  smtpPort: String(source?.smtp?.port || 465),
  imapHost: source?.imap?.host || "",
  imapPort: String(source?.imap?.port || 993),
});

const emptyForm = () => ({
  email: "",
  password: "",
  displayName: "",
  username: "",
  ...serversOf(null),
  saveToSent: true,
});

// Connects the property's own mailbox so campaigns and newsletters go out
// from the hotel's address, and a copy lands in its Sent folder.
//
// Two steps: the hotel types its email, gian finds where it is hosted (from
// the domain's mail records, e.g. villaantilla.com → One.com) and fills in the
// servers; then only the password is left. gian checks the login before saving.
//
// mailbox: the saved one or null; presets: from gian; onChange(mailbox | null);
// onBack: back to the choice between Amazon and the mail server
function SmtpMailboxDialog({ open, onClose, mailbox, presets = [], onChange, onBack }) {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [step, setStep] = useState("email"); // email | details
  const [presetId, setPresetId] = useState("other");
  const [detected, setDetected] = useState(null); // { label, known, passwordHint, autoSavesSent }
  const [form, setForm] = useState(emptyForm());
  const [showServers, setShowServers] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(!mailbox);

  const preset = useMemo(() => presets.find((p) => p.id === presetId), [presets, presetId]);
  // the usual choices, plus the one found for this address when it isn't one of them
  const choices = presets.filter((p) => p.featured !== false || p.id === presetId);

  // fill the form each time it opens: the saved mailbox, or a blank one
  useEffect(() => {
    if (!open) return;
    setError("");
    setEditing(!mailbox);
    if (mailbox) {
      const id = presetFor(presets, mailbox.smtp?.host);
      setPresetId(id);
      setDetected(null);
      setShowServers(id === "other");
      setStep("details");
      setForm({
        email: mailbox.email,
        password: "",
        displayName: mailbox.displayName || "",
        username: mailbox.username === mailbox.email ? "" : mailbox.username,
        ...serversOf(mailbox),
        saveToSent: mailbox.saveToSent,
      });
    } else {
      setPresetId("other");
      setDetected(null);
      setShowServers(false);
      setStep("email");
      setForm(emptyForm());
    }
  }, [open, mailbox, presets]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e?.target ? e.target.value : e }));

  const pickPreset = (id) => {
    const next = presets.find((p) => p.id === id);
    setPresetId(id);
    setDetected(null);
    setShowServers(true);
    setForm((f) => ({ ...f, ...serversOf(next) }));
  };

  // step 1 → 2: find the provider from the address and fill in its servers
  const findProvider = async () => {
    setError("");
    const email = form.email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(email)) return setError("Enter the email address you want to send from.");
    setDetecting(true);
    try {
      const result = await detectSenderMailbox(email);
      const found = result?.detected;
      if (found) {
        setPresetId(found.presetId);
        setDetected(found);
        setForm((f) => ({ ...f, email, ...serversOf(found) }));
        // not recognised: open the server settings so they can be checked
        setShowServers(!found.known);
      } else {
        setPresetId("other");
        setDetected(null);
        setShowServers(true);
      }
    } catch {
      // detection is a convenience: carry on with the settings open
      setPresetId("other");
      setDetected(null);
      setShowServers(true);
    } finally {
      setDetecting(false);
      setStep("details");
    }
  };

  // the provider files sent mail in Sent by itself: no copy of ours needed
  const providerSavesSent = Boolean(detected ? detected.autoSavesSent : preset?.autoSavesSent);
  const passwordHint = detected?.passwordHint || preset?.passwordHint;
  const providerName = detected?.known ? detected.label : presetId !== "other" ? preset?.label : null;

  const save = async () => {
    setError("");
    if (!mailbox && !form.password) return setError("Enter the password of this mailbox.");
    if (!form.smtpHost.trim()) {
      setShowServers(true);
      return setError("Enter the sending (SMTP) server.");
    }
    setSaving(true);
    try {
      const result = await saveSenderMailbox({
        email: form.email.trim(),
        password: form.password || undefined,
        displayName: form.displayName.trim(),
        username: form.username.trim(),
        smtp: { host: form.smtpHost.trim(), port: Number(form.smtpPort) },
        imap: { host: form.imapHost.trim(), port: Number(form.imapPort) },
        saveToSent: providerSavesSent ? false : form.saveToSent,
      });
      onChange(result?.mailbox || null);
      setEditing(false);
      showToast({ message: `Connected. Emails now go out from ${result?.mailbox?.email}.`, type: "success" });
    } catch (err) {
      setError(err.message);
      // a server problem is fixed in the server settings
      if (/server|port|reach|SMTP|IMAP/i.test(err.message)) setShowServers(true);
    } finally {
      setSaving(false);
    }
  };

  const sendTest = async () => {
    setTesting(true);
    try {
      const result = await testSenderMailbox();
      showToast({ message: `Test email sent to ${result?.to}. Check its inbox and your Sent folder.`, type: "success", duration: 6000 });
    } catch (err) {
      showToast({ message: err.message, type: "error", duration: 8000 });
    } finally {
      setTesting(false);
    }
  };

  const disconnect = async () => {
    const ok = await confirm("Campaigns and newsletters will go out from support@eazotel.com again, with replies coming to you.", {
      title: `Disconnect ${mailbox.email}?`,
      confirmText: "Disconnect",
    });
    if (!ok) return;
    try {
      await deleteSenderMailbox();
      onChange(null);
      onClose();
      showToast({ message: "Mailbox disconnected.", type: "success" });
    } catch (err) {
      showToast({ message: err.message, type: "error" });
    }
  };

  const errorBox = error && (
    <p className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-400">
      <TriangleAlert className="mt-px size-4 shrink-0" />
      {error}
    </p>
  );

  // ---- a saved mailbox, not being edited ----
  if (open && mailbox && !editing) {
    const broken = mailbox.status === "error";
    return (
      <Dialog open={open} onClose={onClose} title="Send from your own email" description="Your campaigns and newsletters go out from this mailbox.">
        <div className={`flex items-start gap-3 rounded-lg border p-3 ${broken ? "border-red-300! bg-red-50 dark:border-red-500/40! dark:bg-red-500/10" : "border-emerald-300! bg-emerald-50 dark:border-emerald-500/30! dark:bg-emerald-500/10"}`}>
          {broken ? <TriangleAlert className="mt-0.5 size-5 shrink-0 text-red-500" /> : <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />}
          <div className="min-w-0 text-sm">
            <p className="truncate font-medium">{mailbox.displayName ? `${mailbox.displayName} <${mailbox.email}>` : mailbox.email}</p>
            <p className="mt-0.5 text-xs text-app-text-muted">
              {broken
                ? mailbox.lastError || "The mailbox refused the login. Update the password to reconnect."
                : mailbox.providerSavesSent
                  ? "Sent emails appear in your Sent folder automatically."
                  : mailbox.saveToSent
                    ? `A copy of every email is saved to “${mailbox.sentFolder || "Sent"}”.`
                    : "Copies are not saved to your Sent folder."}
            </p>
            {!broken && mailbox.lastSentCopyError && (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">Last Sent copy failed: {mailbox.lastSentCopyError}</p>
            )}
          </div>
        </div>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            <Zap className="size-3.5" />
            Send faster through Amazon instead
          </button>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Button variant="ghost" icon={Unplug} onClick={disconnect} className="text-red-500! hover:bg-red-500/10!">
            Disconnect
          </Button>
          <div className="ml-auto flex gap-2">
            <Button variant="secondary" onClick={() => setEditing(true)}>
              {broken ? "Reconnect" : "Edit"}
            </Button>
            {!broken && (
              <Button icon={Send} onClick={sendTest} loading={testing}>
                Send test
              </Button>
            )}
          </div>
        </div>
      </Dialog>
    );
  }

  // ---- step 1: just the email ----
  if (step === "email") {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        title="Send from your own email"
        description="Guests see your address instead of support@eazotel.com, and every email shows in your own Sent folder."
        footer={
          <>
            <Button variant="secondary" icon={onBack ? ArrowLeft : undefined} onClick={onBack || onClose} disabled={detecting}>
              {onBack ? "Back" : "Cancel"}
            </Button>
            <Button onClick={findProvider} loading={detecting}>
              Continue <ArrowRight className="size-4" />
            </Button>
          </>
        }
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            findProvider();
          }}
        >
          <Field label="Your email address" hint="We'll find your email provider and fill in its settings for you.">
            <Input
              type="email"
              autoFocus
              value={form.email}
              placeholder="reservations@yourhotel.com"
              onChange={set("email")}
            />
          </Field>
          {errorBox}
        </form>
      </Dialog>
    );
  }

  // ---- step 2: password (servers are filled in) ----
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Send from your own email"
      description={mailbox ? "Update the password or settings of your mailbox." : "Almost done: enter the password of this mailbox."}
      footer={
        <>
          <Button
            variant="secondary"
            icon={mailbox ? undefined : ArrowLeft}
            onClick={mailbox ? () => setEditing(false) : () => setStep("email")}
            disabled={saving}
          >
            {mailbox ? "Cancel" : "Back"}
          </Button>
          <Button icon={ShieldCheck} onClick={save} loading={saving}>
            {saving ? "Checking login…" : mailbox ? "Save" : "Connect"}
          </Button>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <div className="flex items-center gap-3 rounded-lg bg-app-surface-secondary p-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Mail className="size-4" />
          </span>
          <div className="min-w-0 flex-1 text-sm">
            <p className="truncate font-medium">{form.email}</p>
            <p className={`text-xs ${providerName ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}`}>
              {providerName ? `Email by ${providerName}: settings filled in` : "Provider not recognised: check the server settings below"}
            </p>
          </div>
          {!mailbox && (
            <button type="button" onClick={() => setStep("email")} className="shrink-0 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400">
              Change
            </button>
          )}
        </div>

        <Field label={mailbox ? "Password (leave empty to keep the saved one)" : "Password"} hint={passwordHint}>
          <Input type="password" autoFocus={!mailbox} autoComplete="new-password" value={form.password} onChange={set("password")} />
        </Field>

        <Field label="Name guests see (optional)" hint="Empty = your hotel name.">
          <Input value={form.displayName} placeholder="Hotel Sunrise" onChange={set("displayName")} />
        </Field>

        {!providerSavesSent ? (
          <div className="flex items-start justify-between gap-3 rounded-lg bg-app-surface-secondary p-3">
            <div className="text-sm">
              <p className="font-medium">Save a copy in my Sent folder</p>
              <p className="mt-0.5 text-xs text-app-text-muted">So you can see every email in your own mail app.</p>
            </div>
            <Switch checked={form.saveToSent} onChange={set("saveToSent")} label="Save a copy in my Sent folder" />
          </div>
        ) : (
          <p className="flex items-center gap-2 rounded-lg bg-app-surface-secondary p-3 text-xs text-app-text-muted">
            <Mail className="size-4 shrink-0 text-blue-500" />
            {providerName?.split(" /")[0] || "Your provider"} puts every sent email in your Sent folder by itself.
          </p>
        )}

        <div>
          <button
            type="button"
            onClick={() => setShowServers((s) => !s)}
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Server settings
            <ChevronDown className={`size-3.5 transition ${showServers ? "rotate-180" : ""}`} />
          </button>
          {showServers && (
            <div className="mt-3 space-y-3">
              <div>
                <span className="mb-1.5 block text-xs font-medium text-app-text-muted">Your email is with</span>
                <div className="flex flex-wrap gap-1.5">
                  {choices.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => pickPreset(p.id)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                        presetId === p.id
                          ? "border-blue-500! bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "border-app-border! text-app-text-muted hover:text-app-text"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-[1fr_6rem] gap-3">
                <Field label="SMTP server (sending)">
                  <Input value={form.smtpHost} placeholder="mail.yourhotel.com" onChange={set("smtpHost")} />
                </Field>
                <Field label="Port" hint="465 or 587">
                  <Input inputMode="numeric" value={form.smtpPort} onChange={set("smtpPort")} />
                </Field>
                {!providerSavesSent && form.saveToSent && (
                  <>
                    <Field label="IMAP server (Sent copy)">
                      <Input value={form.imapHost} placeholder="mail.yourhotel.com" onChange={set("imapHost")} />
                    </Field>
                    <Field label="Port" hint="Usually 993">
                      <Input inputMode="numeric" value={form.imapPort} onChange={set("imapPort")} />
                    </Field>
                  </>
                )}
                <Field label="Login name (optional)" hint="Only if it isn't the email address." className="col-span-2">
                  <Input value={form.username} onChange={set("username")} />
                </Field>
              </div>
            </div>
          )}
        </div>

        {errorBox}
        {/* lets Enter in the password field connect */}
        <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
      </form>
    </Dialog>
  );
}

// one of the two ways, as a big tappable card
const MethodCard = ({ icon: Icon, tone, title, badge, points, onClick, current }) => (
  <button
    type="button"
    onClick={onClick}
    className={`group flex w-full items-start gap-3 rounded-xl border p-4 text-left transition hover:border-blue-500! hover:bg-blue-500/5 ${
      current ? "border-blue-500! bg-blue-500/5" : "border-app-border!"
    }`}
  >
    <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${tone}`}>
      <Icon className="size-5" />
    </span>
    <span className="min-w-0 flex-1">
      <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
        {title}
        {badge && <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">{badge}</span>}
        {current && <span className="rounded-md bg-blue-500/10 px-1.5 py-0.5 text-[11px] font-medium text-blue-600 dark:text-blue-400">In use</span>}
      </span>
      <span className="mt-1.5 grid gap-1 text-xs text-app-text-muted">
        {points.map((point) => (
          <span key={point}>• {point}</span>
        ))}
      </span>
    </span>
    <ChevronRight className="mt-2 size-4 shrink-0 text-app-text-muted transition group-hover:translate-x-0.5" />
  </button>
);

// Send from your own email: the hotel picks how.
//   Amazon (SES): its domain / address verified in Eazotel's Amazon SES: fast, no "via Eazotel"
//   Mail server (SMTP): its own mailbox's login: copies in its Sent folder, its provider's limits
// Only one is used: a verified Amazon address comes first; saving a mail server stops Amazon.
//
// mailbox / ses: the saved ones or null (gian sender-mailbox); onChange(): reload
function SenderMailboxDialog({ open, onClose, mailbox, ses = null, presets = [], onChange }) {
  const [method, setMethod] = useState("choose"); // choose | ses | smtp

  useEffect(() => {
    if (open) setMethod(ses ? "ses" : mailbox ? "smtp" : "choose");
  }, [open, ses, mailbox]);

  if (method === "ses") {
    return (
      <SesSenderDialog open={open} onClose={onClose} ses={ses} onChange={() => onChange?.(null)} onBack={() => setMethod("choose")} />
    );
  }
  if (method === "smtp") {
    return (
      <SmtpMailboxDialog
        open={open}
        onClose={onClose}
        mailbox={mailbox}
        presets={presets}
        onChange={onChange}
        onBack={() => setMethod("choose")}
      />
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Send from your own email"
      description="Guests see your address instead of support@eazotel.com. Choose how your emails go out."
    >
      <div className="space-y-3">
        <MethodCard
          icon={Zap}
          tone="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          title="Through Amazon (fast)"
          badge="Recommended for big lists"
          current={ses?.status === "verified"}
          onClick={() => setMethod("ses")}
          points={[
            "Thousands of emails an hour, from your own address",
            "Verify your domain once (3 DNS records) or one address by a link",
            "Not for Gmail / Yahoo / Outlook.com addresses",
          ]}
        />
        <MethodCard
          icon={Server}
          tone="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          title="Through your mail server (SMTP)"
          current={Boolean(mailbox) && ses?.status !== "verified"}
          onClick={() => setMethod("smtp")}
          points={[
            "Log in with your mailbox's email and password",
            "Every email is saved in your own Sent folder",
            "Your provider's limits apply (e.g. One.com about 240 an hour, Gmail 500 a day)",
          ]}
        />
        <p className="text-xs text-app-text-muted">Not set up: emails go out from support@eazotel.com as “your hotel via Eazotel”, and replies still come to you.</p>
      </div>
    </Dialog>
  );
}

export default SenderMailboxDialog;
