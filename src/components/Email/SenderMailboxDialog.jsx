import { CheckCircle2, ChevronDown, Mail, Send, ShieldCheck, TriangleAlert, Unplug } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useConfirm } from "../../context/ConfirmContext";
import { useToast } from "../../context/ToastContext";
import { deleteSenderMailbox, saveSenderMailbox, testSenderMailbox } from "../../redux/api/emailMarketingApi";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import { Field, Input } from "../ui/Field";
import Switch from "../ui/Switch";

// which preset a saved mailbox matches, by its SMTP host
const presetFor = (presets, host) =>
  presets.find((p) => p.id !== "other" && p.smtp.host === host)?.id || (host ? "other" : presets[0]?.id || "other");

// guess the provider from the address while connecting for the first time
const presetFromEmail = (email) => {
  const domain = email.split("@")[1]?.toLowerCase() || "";
  if (/^(gmail|googlemail)\.com$/.test(domain)) return "gmail";
  if (/^(outlook|hotmail|live|msn)\.[a-z.]+$/.test(domain)) return "outlook";
  if (/^zoho(mail)?\.[a-z.]+$/.test(domain)) return "zoho";
  return null;
};

const emptyForm = (preset) => ({
  email: "",
  password: "",
  displayName: "",
  username: "",
  smtpHost: preset?.smtp.host || "",
  smtpPort: String(preset?.smtp.port || 465),
  imapHost: preset?.imap.host || "",
  imapPort: String(preset?.imap.port || 993),
  saveToSent: true,
});

// Connects the property's own mailbox (SMTP + IMAP) so campaigns and
// newsletters go out from the hotel's address, and a copy lands in its Sent
// folder. gian checks the login before saving (see gian sendCampaignMail.ts).
//
// mailbox: the saved one or null; presets: from gian; onChange(mailbox | null)
function SenderMailboxDialog({ open, onClose, mailbox, presets = [], onChange }) {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [presetId, setPresetId] = useState("gmail");
  const [form, setForm] = useState(emptyForm(null));
  const [showServers, setShowServers] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(!mailbox);

  const preset = useMemo(() => presets.find((p) => p.id === presetId), [presets, presetId]);

  // fill the form each time it opens: the saved mailbox, or a blank one
  useEffect(() => {
    if (!open) return;
    setError("");
    setEditing(!mailbox);
    if (mailbox) {
      const id = presetFor(presets, mailbox.smtp?.host);
      setPresetId(id);
      setShowServers(id === "other");
      setForm({
        email: mailbox.email,
        password: "",
        displayName: mailbox.displayName || "",
        username: mailbox.username === mailbox.email ? "" : mailbox.username,
        smtpHost: mailbox.smtp?.host || "",
        smtpPort: String(mailbox.smtp?.port || 465),
        imapHost: mailbox.imap?.host || "",
        imapPort: String(mailbox.imap?.port || 993),
        saveToSent: mailbox.saveToSent,
      });
    } else {
      const first = presets[0];
      setPresetId(first?.id || "other");
      setShowServers(first?.id === "other");
      setForm(emptyForm(first));
    }
  }, [open, mailbox, presets]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e?.target ? e.target.value : e }));

  const pickPreset = (id) => {
    const next = presets.find((p) => p.id === id);
    setPresetId(id);
    setShowServers(id === "other");
    setForm((f) => ({
      ...f,
      smtpHost: next?.smtp.host ?? "",
      smtpPort: String(next?.smtp.port ?? 465),
      imapHost: next?.imap.host ?? "",
      imapPort: String(next?.imap.port ?? 993),
    }));
  };

  // the provider files sent mail in Sent by itself: no copy of ours needed
  const providerSavesSent = Boolean(preset?.autoSavesSent);

  const save = async () => {
    setError("");
    if (!form.email.trim()) return setError("Enter the email address to send from.");
    if (!mailbox && !form.password) return setError("Enter the password (or App Password) of this mailbox.");
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

  // ---- connect / edit form ----
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Send from your own email"
      description="Guests see your address instead of support@eazotel.com, and every email shows in your own Sent folder."
      footer={
        <>
          <Button variant="secondary" onClick={mailbox ? () => setEditing(false) : onClose} disabled={saving}>
            Cancel
          </Button>
          <Button icon={ShieldCheck} onClick={save} loading={saving}>
            {saving ? "Checking login…" : mailbox ? "Save" : "Connect"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <span className="mb-1.5 block text-xs font-medium text-app-text-muted">Your email is with</span>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p) => (
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

        <Field label="Email address">
          <Input
            type="email"
            value={form.email}
            placeholder="reservations@yourhotel.com"
            onChange={set("email")}
            onBlur={() => {
              const guess = !mailbox && presetFromEmail(form.email);
              if (guess && guess !== presetId) pickPreset(guess);
            }}
          />
        </Field>

        <Field label={mailbox ? "Password (leave empty to keep the saved one)" : "Password"} hint={preset?.passwordHint}>
          <Input type="password" autoComplete="new-password" value={form.password} onChange={set("password")} />
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
            {preset?.label.split(" /")[0]} puts every sent email in your Sent folder by itself.
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
            <div className="mt-3 grid grid-cols-[1fr_6rem] gap-3">
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
          )}
        </div>

        {error && (
          <p className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-400">
            <TriangleAlert className="mt-px size-4 shrink-0" />
            {error}
          </p>
        )}
      </div>
    </Dialog>
  );
}

export default SenderMailboxDialog;
