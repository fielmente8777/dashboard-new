import { RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useConfirm } from "../../context/ConfirmContext";
import { useToast } from "../../context/ToastContext";
import { FittedEmailPreview } from "../../pages/EmailMarketing/components/EmailPreviewFrame";
import { deleteEmailFooter, getEmailFooter, renderEmail, saveEmailFooter } from "../../redux/api/emailMarketingApi";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";

const SOCIALS = [
  { key: "facebook", label: "Facebook", placeholder: "facebook.com/yourhotel" },
  { key: "instagram", label: "Instagram", placeholder: "instagram.com/yourhotel" },
  { key: "tripadvisor", label: "Tripadvisor", placeholder: "tripadvisor.com/Hotel_Review-…" },
  { key: "whatsapp", label: "WhatsApp", placeholder: "+34 600 000 000" },
  { key: "youtube", label: "YouTube", placeholder: "youtube.com/@yourhotel" },
  { key: "tiktok", label: "TikTok", placeholder: "tiktok.com/@yourhotel" },
  { key: "x", label: "X", placeholder: "x.com/yourhotel" },
  { key: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/company/yourhotel" },
];

// a short sample email above the footer, so it is seen in place
const SAMPLE = `<table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;color:#333">
<tr><td style="padding:28px 24px;font-size:15px;line-height:1.6">
<p style="margin:0 0 10px;font-size:20px;font-weight:bold">Your email content</p>
<p style="margin:0;color:#666">The footer below is added to every campaign and newsletter you send.</p>
</td></tr></table>`;

const inputClass =
  "w-full rounded-md border border-app-border! bg-app-surface px-2.5 py-1.5 text-sm text-app-text outline-none placeholder:text-app-text-faint focus:border-blue-500!";

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-app-text-muted">{label}</span>
      {children}
      {hint && <span className="mt-0.5 block text-[11px] text-app-text-faint">{hint}</span>}
    </label>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <label className="flex items-center gap-2 text-xs text-app-text-muted">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="size-7 cursor-pointer rounded border border-app-border! bg-transparent p-0"
      />
      {label}
    </label>
  );
}

// Edits the footer under every campaign / newsletter email of this property,
// like Mailchimp's: name, logo, address, contacts, social links, a note, colours.
// The unsubscribe link is always added by the server and can't be removed.
// onSaved(footer) after saving.
export default function FooterEditorDialog({ open, onClose, onSaved }) {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [footer, setFooter] = useState(null);
  const [isCustom, setIsCustom] = useState(false);
  const [defaults, setDefaults] = useState(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [device, setDevice] = useState("desktop");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setError("");
    setLoadError("");
    getEmailFooter()
      .then((result) => {
        if (!alive) return;
        setDefaults(result?.defaults || null);
        setFooter({ ...(result?.defaults || {}), ...(result?.footer || {}), socials: { ...(result?.footer?.socials || {}) } });
        setIsCustom(Boolean(result?.footer));
      })
      .catch((e) => alive && setLoadError(e?.message || "Couldn't load the footer."));
    return () => {
      alive = false;
    };
  }, [open]);

  // live preview: what the server would send, from the unsaved values
  const timer = useRef(null);
  const footerJson = useMemo(() => JSON.stringify(footer), [footer]);
  useEffect(() => {
    if (!open || !footer) return undefined;
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const result = await renderEmail({ html: SAMPLE, footer: JSON.parse(footerJson) });
        setPreviewHtml(result?.html || "");
        setError("");
      } catch (e) {
        setError(e?.message || ""); // e.g. a link that isn't valid yet
      }
    }, 450);
    return () => clearTimeout(timer.current);
  }, [open, footerJson]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (key) => (e) => setFooter((f) => ({ ...f, [key]: e?.target ? e.target.value : e }));
  const setSocial = (key) => (e) => setFooter((f) => ({ ...f, socials: { ...f.socials, [key]: e.target.value } }));

  const save = async () => {
    setSaving(true);
    try {
      const result = await saveEmailFooter(footer);
      setIsCustom(true);
      showToast({ message: "Footer saved. It's added to every email you send.", type: "success" });
      onSaved?.(result?.footer);
      onClose();
    } catch (e) {
      setError(e?.message || "Couldn't save the footer.");
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    const ok = await confirm("Your footer is removed and emails get the plain default one (hotel name + unsubscribe).", {
      title: "Use the default footer?",
      confirmText: "Use default",
    });
    if (!ok) return;
    try {
      if (isCustom) await deleteEmailFooter();
      setFooter({ ...(defaults || {}), socials: {} });
      setIsCustom(false);
      onSaved?.(null);
      showToast({ message: "Back to the default footer.", type: "success" });
    } catch (e) {
      setError(e?.message || "Couldn't reset the footer.");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="xl"
      title="Email footer"
      description="Shown at the bottom of every campaign and newsletter. The unsubscribe link is always included."
      footer={
        footer && (
          <>
            <Button variant="ghost" icon={RotateCcw} onClick={reset} disabled={saving} className="mr-auto">
              Use default
            </Button>
            <Button variant="ghost" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={save} loading={saving} icon={null}>
              Save footer
            </Button>
          </>
        )
      }
    >
      {loadError ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">{loadError}</p>
      ) : !footer ? (
        <p className="py-10 text-center text-sm text-app-text-muted">Loading…</p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <div className="space-y-4">
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-app-text-faint">Who it's from</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Name">
                  <input className={inputClass} value={footer.companyName} onChange={set("companyName")} maxLength={120} />
                </Field>
                <Field label="Logo link" hint="A hosted image (https://…), shown 40px tall">
                  <input className={inputClass} value={footer.logoUrl} onChange={set("logoUrl")} placeholder="https://…/logo.png" />
                </Field>
              </div>
              <Field label="Address" hint="Required by law in many countries for marketing emails">
                <textarea
                  className={`${inputClass} min-h-16 resize-y`}
                  value={footer.address}
                  onChange={set("address")}
                  maxLength={400}
                  placeholder={"Street, number\nPostcode, City, Country"}
                />
              </Field>
            </section>

            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-app-text-faint">Contact</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Phone">
                  <input className={inputClass} value={footer.phone} onChange={set("phone")} maxLength={120} />
                </Field>
                <Field label="Email">
                  <input className={inputClass} value={footer.email} onChange={set("email")} maxLength={120} />
                </Field>
                <Field label="Website">
                  <input className={inputClass} value={footer.website} onChange={set("website")} placeholder="yourhotel.com" />
                </Field>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-app-text-faint">Social links</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {SOCIALS.map(({ key, label, placeholder }) => (
                  <Field key={key} label={label}>
                    <input className={inputClass} value={footer.socials?.[key] || ""} onChange={setSocial(key)} placeholder={placeholder} />
                  </Field>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-app-text-faint">Message & look</h3>
              <Field label="Note" hint="e.g. why they get these emails">
                <textarea
                  className={`${inputClass} min-h-14 resize-y`}
                  value={footer.message}
                  onChange={set("message")}
                  maxLength={600}
                />
              </Field>
              <div className="flex flex-wrap items-center gap-4">
                <ColorField label="Background" value={footer.background} onChange={set("background")} />
                <ColorField label="Text" value={footer.textColor} onChange={set("textColor")} />
                <ColorField label="Links" value={footer.linkColor} onChange={set("linkColor")} />
                <div className="ml-auto inline-flex rounded-full bg-app-surface-secondary p-0.5 ring-1 ring-app-border">
                  {["center", "left"].map((align) => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => set("align")(align)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${
                        footer.align === align ? "bg-app-surface text-app-text shadow-sm" : "text-app-text-muted"
                      }`}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <div className="flex min-h-0 flex-col gap-2 lg:sticky lg:top-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-app-text-muted">Preview</span>
              <div className="inline-flex rounded-full bg-app-surface-secondary p-0.5 ring-1 ring-app-border">
                {[
                  ["desktop", "Desktop"],
                  ["ios", "iPhone"],
                  ["android", "Android"],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setDevice(id)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      device === id ? "bg-app-surface text-app-text shadow-sm" : "text-app-text-muted"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {error && (
              <p className="rounded-md bg-red-50 px-3 py-1.5 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-400">{error}</p>
            )}
            <FittedEmailPreview html={previewHtml || SAMPLE} device={device} className="h-[60vh] rounded-lg" />
          </div>
        </div>
      )}
    </Dialog>
  );
}
