import { ArrowLeft, Building2, Check, CheckCircle2, Clock, Copy, ExternalLink, RefreshCw, Send, Server, TriangleAlert, Unplug, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useConfirm } from "../../context/ConfirmContext";
import { useToast } from "../../context/ToastContext";
import {
  checkSesSender,
  deleteSesSender,
  startSesSender,
  testSenderMailbox,
  updateSesSender,
} from "../../redux/api/emailMarketingApi";
import useStaleAfter from "../../hooks/useStaleAfter";
import { STALE_SES_CHECK_MS } from "./staleTimes";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import { Field, Input } from "../ui/Field";
import RefreshNotice from "../ui/RefreshNotice";
import Segmented from "../ui/Segmented";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// while waiting for Amazon, ask again this often (only while the dialog is open)

const STATUS = {
  verified: { tone: "green", label: "Verified", icon: CheckCircle2 },
  pending: { tone: "amber", label: "Waiting for Amazon", icon: Clock },
  failed: { tone: "red", label: "Not verified", icon: TriangleAlert },
};

const domainOf = (value) => (value.includes("@") ? value.split("@").pop() : value).trim().toLowerCase();

// one value with a copy button (DNS name / value)
// `suffix` is shown faint and not copied: DNS panels add the domain to the Name
// themselves, so pasting the full name gives "…domain.com.domain.com"
const CopyValue = ({ value, suffix = "" }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked: the text is selectable
    }
  };
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <code className="min-w-0 flex-1 break-all rounded bg-app-surface-secondary px-1.5 py-1 font-mono text-[11px]">
        {value}
        {suffix && <span className="text-app-text-muted">{suffix}</span>}
      </code>
      <button
        type="button"
        onClick={copy}
        title="Copy"
        className="shrink-0 rounded p-1 text-app-text-muted hover:bg-app-surface-secondary hover:text-app-text"
      >
        {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
      </button>
    </div>
  );
};

// where the domain's DNS is (gian reads its nameservers): a button that opens
// that provider's DNS page, and how to add the records there, step by step
const DnsHelp = ({ provider, domain }) => {
  if (!provider) return null;
  const open = provider.url && (
    <a
      href={provider.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
    >
      {provider.managedByEazotel ? "Open in Route 53" : `Open ${provider.name} DNS`}
      <ExternalLink className="size-3.5" />
    </a>
  );
  return (
    <div className="space-y-3 rounded-lg bg-app-surface-secondary p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <Building2 className="size-4 shrink-0 text-blue-500" />
          <span className="min-w-0">
            {provider.managedByEazotel ? (
              <>
                <span className="font-medium">Eazotel manages {domain}</span>
                <span className="text-app-text-muted"> (Amazon Route 53). Our team adds these records for you.</span>
              </>
            ) : (
              <>
                <span className="text-app-text-muted">{domain}&apos;s DNS is at </span>
                <span className="font-medium">{provider.name}</span>
              </>
            )}
          </span>
        </div>
        {open}
      </div>
      {provider.steps?.length > 0 && (
        <ol className="grid gap-1.5 text-xs text-app-text">
          {provider.steps.map((step, i) => (
            <li key={step} className="flex gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                {i + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
          <li className="flex gap-2">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              {provider.steps.length + 1}
            </span>
            <span className="pt-0.5">Wait 10-30 minutes, then press “Check records” here.</span>
          </li>
        </ol>
      )}
    </div>
  );
};

// the DNS records the hotel adds at its domain provider
const hostOf = (name, domain) => (domain && name.endsWith(`.${domain}`) ? name.slice(0, -domain.length - 1) : name);

const RecordsTable = ({ records, domain }) => (
  <div className="overflow-x-auto rounded-lg border border-app-border!">
    <table className="w-full min-w-[34rem] text-left text-xs">
      <thead className="bg-app-surface-secondary text-app-text-muted">
        <tr>
          <th className="px-3 py-2 font-medium">Type</th>
          <th className="px-3 py-2 font-medium">Name / Host (copy only the dark part)</th>
          <th className="px-3 py-2 font-medium">Value / Points to</th>
        </tr>
      </thead>
      <tbody>
        {records.map((r) => (
          <tr key={r.name + r.value} className="border-t border-app-border! align-top">
            <td className="px-3 py-2">
              <span className="font-semibold">{r.type}</span>
              {!r.required && <span className="mt-0.5 block text-[10px] text-app-text-muted">optional</span>}
            </td>
            <td className="px-3 py-2">
              <CopyValue value={hostOf(r.name, domain)} suffix={hostOf(r.name, domain) !== r.name ? `.${domain}` : ""} />
            </td>
            <td className="px-3 py-2">
              <CopyValue value={r.value} />
              <p className="mt-1 text-[11px] text-app-text-muted">{r.purpose}</p>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Sends campaigns and newsletters through Eazotel's Amazon SES from the hotel's
// own address: fast (thousands an hour), no "via Eazotel".
//
// Domain (recommended): gian adds it to Amazon, Amazon gives 3 DNS records; the
// hotel adds them at its domain provider; Amazon checks by itself. One address:
// Amazon emails a link to click.
//
// ses: the saved sender or null; onChange(): reload; onBack(): back to the choice
function SesSenderDialog({ open, onClose, ses, onChange, onBack }) {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [editing, setEditing] = useState(!ses);
  const [form, setForm] = useState({ kind: "domain", domain: "", fromEmail: "", displayName: "" });
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState("");
  const [editFrom, setEditFrom] = useState(null); // { fromEmail, displayName } while changing them

  useEffect(() => {
    if (!open) return;
    setError("");
    setEditFrom(null);
    setEditing(!ses);
    setForm(
      ses
        ? { kind: ses.kind, domain: ses.domain, fromEmail: ses.fromEmail, displayName: ses.displayName || "" }
        : { kind: "domain", domain: "", fromEmail: "", displayName: "" },
    );
  }, [open, ses]);

  // Waiting for Amazon: no auto-check (each one called Amazon and the server).
  // After a while a line suggests "Check now"; the user clicks when the records are in.
  const pending = Boolean(ses && (ses.status !== "verified" || (ses.kind === "email" && !ses.signing && ses.records?.length)));
  const { stale: checkDue, loadedAt: lastChecked, markFresh } = useStaleAfter(STALE_SES_CHECK_MS, {
    enabled: open && pending && !editing,
  });
  useEffect(() => {
    if (open) markFresh();
  }, [open, markFresh]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e?.target ? e.target.value : e }));

  const start = async () => {
    setError("");
    const fromEmail = form.fromEmail.trim().toLowerCase();
    const domain = (form.kind === "domain" ? form.domain || fromEmail : fromEmail).trim().toLowerCase();
    if (form.kind === "domain" && !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domainOf(domain))) return setError("Enter your domain, like yourhotel.com.");
    if (!EMAIL_REGEX.test(fromEmail)) return setError("Enter the address guests will see in From.");
    setSaving(true);
    try {
      const result = await startSesSender({
        kind: form.kind,
        domain: form.kind === "domain" ? domainOf(domain) : undefined,
        fromEmail,
        displayName: form.displayName.trim(),
      });
      setEditing(false);
      onChange();
      const s = result?.ses;
      showToast({
        message:
          s?.status === "verified"
            ? `Verified. Campaigns now go out from ${s.fromEmail}.`
            : form.kind === "domain"
              ? "Added. Now add the DNS records shown."
              : `Amazon sent a verification link to ${fromEmail}.`,
        type: "success",
        duration: 6000,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const checkNow = async () => {
    setChecking(true);
    try {
      const result = await checkSesSender();
      markFresh();
      onChange();
      const s = result?.ses;
      const waitingForVia = s?.status === "verified" && s.kind === "email" && !s.signing;
      showToast({
        message: waitingForVia
          ? "Still sending fine. The “via” goes away once Amazon finds the records (a few minutes after adding them)."
          : s?.status === "verified"
            ? "Verified. Campaigns now go out through Amazon."
            : "Not verified yet. Amazon can take a few minutes after the records are added.",
        type: s?.status === "verified" && !waitingForVia ? "success" : "info",
        duration: 6000,
      });
    } catch (err) {
      showToast({ message: err.message, type: "error" });
    } finally {
      setChecking(false);
    }
  };

  const saveFrom = async () => {
    setError("");
    if (!EMAIL_REGEX.test(editFrom.fromEmail.trim())) return setError("Enter a valid From address.");
    setSaving(true);
    try {
      await updateSesSender({ fromEmail: editFrom.fromEmail.trim().toLowerCase(), displayName: editFrom.displayName.trim() });
      setEditFrom(null);
      onChange();
      showToast({ message: "Saved.", type: "success" });
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
      showToast({ message: `Test email sent to ${result?.to} through Amazon.`, type: "success", duration: 6000 });
    } catch (err) {
      showToast({ message: err.message, type: "error", duration: 8000 });
    } finally {
      setTesting(false);
    }
  };

  const remove = async () => {
    const ok = await confirm(
      "Campaigns go back to your mail server if one is connected, or to support@eazotel.com (\"via Eazotel\").",
      { title: "Stop sending through Amazon?", confirmText: "Stop" },
    );
    if (!ok) return;
    try {
      await deleteSesSender();
      onChange();
      onClose();
      showToast({ message: "Stopped sending through Amazon.", type: "success" });
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

  // ---- add (or change) the domain / address ----
  if (editing || !ses) {
    const domainGuess = domainOf(form.kind === "domain" ? form.domain || form.fromEmail : form.fromEmail);
    return (
      <Dialog
        open={open}
        onClose={onClose}
        title="Send through Amazon (fast)"
        description="Send campaigns and newsletters from your own hotel email address. Thousands of emails an hour, and guests won't see “via Eazotel” next to your name."
        footer={
          <>
            <Button
              variant="secondary"
              icon={ses ? undefined : ArrowLeft}
              onClick={ses ? () => setEditing(false) : onBack}
              disabled={saving}
            >
              {ses ? "Cancel" : "Back"}
            </Button>
            <Button icon={Zap} onClick={start} loading={saving}>
              {form.kind === "domain" ? "Get DNS records" : "Send verification link"}
            </Button>
          </>
        }
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            start();
          }}
        >
          <div>
            <span className="mb-1.5 block text-xs font-medium text-app-text-muted">How do you want to set this up?</span>
            <Segmented
              label="How do you want to set this up?"
              value={form.kind}
              onChange={set("kind")}
              options={[
                { value: "domain", label: "Use my domain (best)" },
                { value: "email", label: "Use one email address" },
              ]}
            />
            <p className="mt-1.5 text-xs text-app-text-muted">
              {form.kind === "domain"
                ? "Recommended. You add 3 settings (DNS records) once where you bought your domain, like GoDaddy or Hostinger. It takes about 10 minutes. After that, any email address on your domain can send, and more emails reach the inbox instead of spam."
                : "Quicker to set up. Amazon sends a confirmation link to the email address below. You open it and click the link, and that's it. More emails may land in spam than with the domain option."}
            </p>
          </div>

          {form.kind === "domain" && (
            <Field label="Your domain" hint="The part after @ in your hotel email. For info@yourhotel.com, enter yourhotel.com.">
              <Input autoFocus value={form.domain} placeholder="yourhotel.com" onChange={set("domain")} />
            </Field>
          )}

          <Field
            label={form.kind === "domain" ? "Send emails from" : "Your hotel email address"}
            hint={
              form.kind === "domain"
                ? domainGuess
                  ? `Guests see this as the sender. It must end with @${domainGuess}.`
                  : "Guests see this as the sender. It must end with your domain."
                : "Guests see this as the sender. It must be your hotel's own email. Gmail, Yahoo and Outlook.com addresses won't work."
            }
          >
            <Input
              type="email"
              autoFocus={form.kind === "email"}
              value={form.fromEmail}
              placeholder={form.kind === "domain" ? `offers@${domainGuess || "yourhotel.com"}` : "reservations@yourhotel.com"}
              onChange={set("fromEmail")}
            />
          </Field>

          <Field label="Sender name (optional)" hint="Shown in the guest's inbox next to the email. Leave empty to use your hotel name.">
            <Input value={form.displayName} placeholder="Hotel Sunrise" onChange={set("displayName")} />
          </Field>

          {errorBox}
          <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
        </form>
      </Dialog>
    );
  }

  // ---- saved: status, records, test ----
  const status = STATUS[ses.status] || STATUS.pending;
  const StatusIcon = status.icon;
  const verified = ses.status === "verified";
  const from = ses.displayName ? `${ses.displayName} <${ses.fromEmail}>` : ses.fromEmail;
  // an address verified by link: Gmail shows "via amazonses.com" until its domain's records are added
  const showVia = verified && ses.kind === "email" && !ses.signing && ses.records?.length > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size={(!verified && ses.kind === "domain") || showVia ? "lg" : "md"}
      title="Send through Amazon (fast)"
      description={ses.kind === "domain" ? `Domain: ${ses.identity}` : `Address: ${ses.identity}`}
    >
      <div className="space-y-4">
        <div
          className={`flex items-start gap-3 rounded-lg border p-3 ${
            verified
              ? "border-emerald-300! bg-emerald-50 dark:border-emerald-500/30! dark:bg-emerald-500/10"
              : ses.status === "failed"
                ? "border-red-300! bg-red-50 dark:border-red-500/40! dark:bg-red-500/10"
                : "border-amber-300! bg-amber-50 dark:border-amber-500/30! dark:bg-amber-500/10"
          }`}
        >
          <StatusIcon
            className={`mt-0.5 size-5 shrink-0 ${verified ? "text-emerald-600" : ses.status === "failed" ? "text-red-500" : "text-amber-600"}`}
          />
          <div className="min-w-0 flex-1 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={status.tone}>{status.label}</Badge>
              <span className="truncate font-medium">{from}</span>
            </div>
            <p className="mt-1 text-xs text-app-text-muted">
              {verified
                ? "Campaigns and newsletters go out through Amazon SES from this address. Replies come to the address you set in Email marketing."
                : ses.lastError
                  ? ses.lastError
                  : ses.kind === "domain"
                    ? "Add the records below at your domain provider. Amazon checks them by itself, usually within 10-30 minutes (at most 72 hours). Until then campaigns keep going the old way."
                    : `Amazon sent a link to ${ses.identity} from no-reply-aws@amazon.com. Open that email and click the link. Check spam if you don't see it.`}
            </p>
          </div>
        </div>

        {!verified && ses.kind === "domain" && ses.records?.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Add these records in your domain's DNS</p>
            {ses.dnsProvider ? (
              <DnsHelp provider={ses.dnsProvider} domain={ses.domain} />
            ) : (
              <p className="text-xs text-app-text-muted">
                Open the site where your domain is managed (GoDaddy, Cloudflare, Hostinger, One.com…) → DNS settings → Add
                record. Some providers add “{ses.identity}” to the name by themselves: then paste only the part before it.
              </p>
            )}
            <p className="text-xs text-app-text-muted">Your current email keeps working.</p>
            <RecordsTable records={ses.records} domain={ses.domain} />
          </div>
        )}

        {showVia && (
          <div className="space-y-2 rounded-lg border border-app-border! p-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium">Remove “via amazonses.com” (optional)</p>
              <Badge tone="gray">Not needed to send</Badge>
            </div>
            <p className="text-xs text-app-text-muted">
              Emails already go out from {ses.fromEmail}. Gmail adds “via amazonses.com” next to it because they are signed by
              Amazon. Add these 3 records where {ses.domain} is managed (GoDaddy, Cloudflare, Hostinger, One.com…) and emails get
              signed with {ses.domain}: the “via” goes away and inbox delivery gets better. Nothing else changes.
            </p>
            <DnsHelp provider={ses.dnsProvider} domain={ses.domain} />
            <RecordsTable records={ses.records} domain={ses.domain} />
          </div>
        )}

        {verified && ses.signing && (
          <p className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="size-4 shrink-0" />
            Signed with {ses.domain}: no “via amazonses.com” in Gmail.
          </p>
        )}

        {verified && editFrom && (
          <div className="space-y-3 rounded-lg bg-app-surface-secondary p-3">
            {ses.kind === "domain" && (
              <Field label="From address" hint={`Any address ending with @${ses.identity}.`}>
                <Input
                  type="email"
                  value={editFrom.fromEmail}
                  onChange={(e) => setEditFrom((f) => ({ ...f, fromEmail: e.target.value }))}
                />
              </Field>
            )}
            <Field label="Name guests see (optional)">
              <Input value={editFrom.displayName} onChange={(e) => setEditFrom((f) => ({ ...f, displayName: e.target.value }))} />
            </Field>
            {errorBox}
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="secondary" onClick={() => setEditFrom(null)} disabled={saving}>
                Cancel
              </Button>
              <Button size="sm" onClick={saveFrom} loading={saving}>
                Save
              </Button>
            </div>
          </div>
        )}

        <RefreshNotice
          show={checkDue}
          loadedAt={lastChecked}
          refreshing={checking}
          onRefresh={checkNow}
          timeLabel="Last checked at"
          actionLabel="Check now"
        >
          Added the DNS records? Amazon may have found them by now.
        </RefreshNotice>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button variant="ghost" icon={Unplug} onClick={remove} className="text-red-500! hover:bg-red-500/10!">
            Stop using Amazon
          </Button>
          <div className="ml-auto flex flex-wrap gap-2">
            {verified ? (
              <>
                {!editFrom && (
                  <Button variant="secondary" onClick={() => setEditFrom({ fromEmail: ses.fromEmail, displayName: ses.displayName || "" })}>
                    Change From
                  </Button>
                )}
                {showVia && (
                  <Button variant="secondary" icon={RefreshCw} onClick={checkNow} loading={checking}>
                    Check records
                  </Button>
                )}
                <Button icon={Send} onClick={sendTest} loading={testing}>
                  Send test
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" onClick={() => setEditing(true)}>
                  Change {ses.kind === "domain" ? "domain" : "address"}
                </Button>
                <Button icon={RefreshCw} onClick={checkNow} loading={checking}>
                  Check now
                </Button>
              </>
            )}
          </div>
        </div>
        {onBack && !verified && (
          <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400">
            <Server className="size-3.5" />
            Use my mail server (SMTP) instead
          </button>
        )}
      </div>
    </Dialog>
  );
}

export default SesSenderDialog;
