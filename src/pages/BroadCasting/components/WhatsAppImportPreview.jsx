import { ArrowRight, CheckCircle2, Copy, Search, Trash2, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import WhatsAppMark from "../../../components/WhatsApp/WhatsAppMark";
import Button from "../../../components/ui/Button";
import Dialog from "../../../components/ui/Dialog";
import { Input } from "../../../components/ui/Field";
import { formatNumber } from "../broadcastUtils";

// rows drawn at once: a 10,000-number file stays smooth; search finds the rest
const PAGE = 100;

const Stat = ({ icon: StatIcon, tone, label, value }) => (
  <div className="flex items-center gap-3 rounded-xl border border-app-border! p-3">
    <span className={`flex size-9 items-center justify-center rounded-lg ${tone}`}>
      <StatIcon className="size-4.5" aria-hidden />
    </span>
    <div>
      <p className="text-[11px] text-app-text-muted">{label}</p>
      <p className="text-lg font-semibold tabular-nums text-app-text">{formatNumber(value)}</p>
    </div>
  </div>
);

/**
 * The numbers read from an Excel / CSV file, before they become a campaign's audience: how many
 * were valid, invalid or repeated, a searchable list, and a remove button per number.
 *   data { contacts: [{ name, phone }], valid, invalid, duplicates } | null
 *   onConfirm(contacts)
 */
export default function WhatsAppImportPreview({ data, onClose, onConfirm }) {
  const [contacts, setContacts] = useState([]);
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(PAGE);

  // a new file starts fresh
  useEffect(() => {
    setContacts(data?.contacts || []);
    setQuery("");
    setShown(PAGE);
  }, [data]);

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return contacts;
    const digits = term.replace(/\D/g, "");
    return contacts.filter(
      (c) => (c.name || "").toLowerCase().includes(term) || (digits && c.phone.replace(/\D/g, "").includes(digits)),
    );
  }, [contacts, query]);

  if (!data) return null;

  const remove = (phone) => setContacts((prev) => prev.filter((c) => c.phone !== phone));

  return (
    <Dialog
      open
      size="lg"
      sheetOnPhone
      onClose={onClose}
      title="Check the imported numbers"
      icon={
        <span className="flex size-10 items-center justify-center rounded-full bg-emerald-500 text-white">
          <WhatsAppMark className="size-5.5" />
        </span>
      }
      description="Remove anyone who shouldn't get it, then choose the message."
      footer={
        <>
          <p className="mr-auto flex items-center gap-1.5 self-center text-xs text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="size-4" /> {formatNumber(contacts.length)} {contacts.length === 1 ? "number" : "numbers"} ready
          </p>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button icon={ArrowRight} disabled={!contacts.length} onClick={() => onConfirm(contacts)}>
            Next: choose the message
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-3">
          <Stat icon={CheckCircle2} tone="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" label="Valid numbers" value={data.valid} />
          <Stat icon={XCircle} tone="bg-red-500/10 text-red-600 dark:text-red-400" label="Not a valid number" value={data.invalid} />
          <Stat icon={Copy} tone="bg-amber-500/10 text-amber-600 dark:text-amber-400" label="Repeated (kept once)" value={data.duplicates} />
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-app-text-faint" aria-hidden />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShown(PAGE);
            }}
            placeholder="Search a name or number"
            aria-label="Search the imported numbers"
            className="pl-9"
          />
        </div>

        <ul className="max-h-80 divide-y divide-app-border overflow-y-auto rounded-xl border border-app-border!">
          {matches.slice(0, shown).map((c) => (
            <li key={c.phone} className="flex items-center gap-3 px-3 py-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                {(c.name || "?").trim().charAt(0).toUpperCase() || "?"}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-app-text">{c.name || "No name"}</span>
                <span className="block text-xs tabular-nums text-app-text-muted">{c.phone}</span>
              </span>
              <button
                type="button"
                onClick={() => remove(c.phone)}
                aria-label={`Remove ${c.phone}`}
                title="Remove"
                className="rounded-lg p-1.5 text-app-text-muted hover:bg-red-500/10 hover:text-red-600"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
          {!matches.length && (
            <li className="px-3 py-8 text-center text-sm text-app-text-muted">
              {contacts.length ? "No number matches the search." : "No numbers left."}
            </li>
          )}
        </ul>
        {matches.length > shown && (
          <div className="text-center">
            <Button size="sm" variant="secondary" onClick={() => setShown((n) => n + PAGE * 5)}>
              Show more ({formatNumber(matches.length - shown)} left)
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  );
}
