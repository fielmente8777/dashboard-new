import { Check, Copy, Mail, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";
import { SUPPORT } from "../../config/env";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";

const WHAT = {
  renew: { title: "Renew your subscription", verb: "renew" },
  upgrade: { title: "Upgrade your plan", verb: "upgrade" },
};

function ContactRow({ icon: Icon, label, value, href }) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      className="flex items-center gap-3 rounded-xl border border-app-border! bg-app-surface px-4 py-3 transition hover:border-orange-500/60 hover:bg-app-surface-secondary"
    >
      <span className="grid size-9 place-content-center rounded-lg bg-orange-500/10 text-orange-500">
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-xs text-app-text-muted">{label}</span>
        <span className="block truncate text-sm font-medium text-app-text">{value}</span>
      </span>
    </a>
  );
}

// Online payment isn't connected yet, so renewing or upgrading goes through
// Eazotel support. The message is prefilled with the hotel and its account id.
export default function SupportDialog({ action, hotelName, accountId, onClose }) {
  const [copied, setCopied] = useState(false);
  if (!action) return null;

  const { title, verb } = WHAT[action];
  const message = `Hi Eazotel team, I'd like to ${verb} the subscription for ${hotelName || "my hotel"}${
    accountId ? ` (account ${accountId})` : ""
  }.`;
  const subject = `${verb === "renew" ? "Renew" : "Upgrade"} subscription: ${hotelName || "my hotel"}`;
  const phone = SUPPORT.phone;

  async function copyId() {
    try {
      await navigator.clipboard.writeText(accountId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={title}
      description={`Online payment is coming soon. Until then our team will ${verb} it for you, usually the same day.`}
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-2.5">
        <ContactRow
          icon={Mail}
          label="Email Eazotel support"
          value={SUPPORT.email}
          href={`mailto:${SUPPORT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`}
        />
        {phone && (
          <ContactRow
            icon={MessageCircle}
            label="WhatsApp"
            value={`+${phone}`}
            href={`https://wa.me/${phone}?text=${encodeURIComponent(message)}`}
          />
        )}
        {phone && <ContactRow icon={Phone} label="Call us" value={`+${phone}`} href={`tel:+${phone}`} />}
      </div>

      {accountId && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-app-surface-secondary px-3 py-2 text-xs">
          <span className="min-w-0 text-app-text-muted">
            Your account id{" "}
            <span className="font-mono text-app-text">{accountId}</span>
          </span>
          <button
            type="button"
            onClick={copyId}
            className="inline-flex shrink-0 items-center gap-1 font-medium text-orange-500 hover:underline"
          >
            {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}
    </Dialog>
  );
}
