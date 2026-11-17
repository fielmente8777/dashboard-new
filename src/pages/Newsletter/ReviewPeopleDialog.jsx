import { Plus, RotateCcw, Search, UserMinus, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Dialog from "../../components/ui/Dialog";
import { Input } from "../../components/ui/Field";
import IconButton from "../../components/ui/IconButton";
import { Skeleton } from "../../components/ui/States";
import { EMAIL_REGEX, formatNumber } from "./newsletterUtils";

const PAGE = 100;

// Review a list of people before anything happens: remove people (they move to "Removed",
// where they can be added back), add email addresses, then confirm. Nothing changes until
// the confirm button is pressed; closing the pop-up throws the changes away.
//
//   people      - [{ email, name }] (the starting list)
//   loading     - the list is still loading
//   title, description, confirmLabel(count) - wording for where it is used
//   addConsent  - ask "these people agreed to get emails" before adding new addresses
//   onConfirm({ kept, removed, added }) - email lists; may return a promise
export default function ReviewPeopleDialog({
  open,
  onClose,
  people = [],
  loading = false,
  title = "Review people",
  description,
  confirmLabel = (n) => `Save (${formatNumber(n)})`,
  addConsent = false,
  confirming = false,
  onConfirm,
}) {
  const [removed, setRemoved] = useState(() => new Set());
  const [added, setAdded] = useState([]);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [consent, setConsent] = useState(false);
  const [shown, setShown] = useState(PAGE);

  // every opening starts from the list as it is
  useEffect(() => {
    if (!open) return;
    setRemoved(new Set());
    setAdded([]);
    setSearch("");
    setDraft("");
    setError("");
    setConsent(false);
    setShown(PAGE);
  }, [open]);

  const known = useMemo(() => new Set(people.map((p) => p.email.toLowerCase())), [people]);
  const term = search.trim().toLowerCase();
  const matches = (p) => !term || p.email.toLowerCase().includes(term) || (p.name || "").toLowerCase().includes(term);

  const current = [
    ...added.map((email) => ({ email, name: null, isNew: true })),
    ...people.filter((p) => !removed.has(p.email.toLowerCase())),
  ];
  const removedPeople = people.filter((p) => removed.has(p.email.toLowerCase()));
  const visible = current.filter(matches);
  const changed = removed.size > 0 || added.length > 0;

  const remove = (person) => {
    if (person.isNew) setAdded((list) => list.filter((e) => e !== person.email));
    else setRemoved((set) => new Set(set).add(person.email.toLowerCase()));
  };
  const readd = (person) =>
    setRemoved((set) => {
      const next = new Set(set);
      next.delete(person.email.toLowerCase());
      return next;
    });

  const addEmails = () => {
    const emails = draft
      .split(/[\s,;]+/)
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    if (!emails.length) return;
    const bad = emails.filter((e) => !EMAIL_REGEX.test(e));
    if (bad.length) {
      setError(`Not a valid email: ${bad.slice(0, 3).join(", ")}`);
      return;
    }
    const fresh = [];
    for (const email of emails) {
      if (removed.has(email)) readd({ email }); // was here, removed a moment ago: bring back
      else if (!known.has(email) && !added.includes(email) && !fresh.includes(email)) fresh.push(email);
    }
    setAdded((list) => [...fresh, ...list]);
    setDraft("");
    setError("");
  };

  const confirm = () =>
    onConfirm({
      kept: current.map((p) => p.email),
      removed: removedPeople.map((p) => p.email),
      added,
    });

  const needsConsent = addConsent && added.length > 0;

  return (
    <Dialog
      open={open}
      title={title}
      description={description}
      onClose={onClose}
      size="lg"
      sheetOnPhone
      footer={
        <>
          <span className="mr-auto hidden self-center text-xs text-app-text-muted sm:block">
            {changed
              ? `${formatNumber(added.length)} to add · ${formatNumber(removed.size)} to remove. Nothing changes until you confirm.`
              : "Remove or add people; nothing changes until you confirm."}
          </span>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            loading={confirming}
            disabled={loading || current.length === 0 || (needsConsent && !consent)}
            onClick={confirm}
          >
            {confirmLabel(current.length)}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-app-text-faint" aria-hidden />
            <Input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShown(PAGE);
              }}
              placeholder="Search email or name"
              aria-label="Search email or name"
              className="pl-9"
            />
          </div>
          <form
            className="flex flex-1 gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              addEmails();
            }}
          >
            <Input
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                setError("");
              }}
              placeholder="Add email(s), comma separated"
              aria-label="Add email addresses"
            />
            <Button type="submit" variant="secondary" icon={Plus} disabled={!draft.trim()}>
              Add
            </Button>
          </form>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}

        <section>
          <h3 className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-app-text-muted">
            <Users className="size-3.5" aria-hidden /> Will get it · {formatNumber(current.length)}
          </h3>
          <div className="max-h-80 overflow-y-auto rounded-xl border border-app-border!">
            {loading ? (
              <div className="space-y-2 p-3">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8" />
                ))}
              </div>
            ) : visible.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-app-text-muted">
                {term ? "No one matches your search." : "No one left. Add an email, or re-add someone below."}
              </p>
            ) : (
              <ul className="divide-y divide-app-border">
                {visible.slice(0, shown).map((p) => (
                  <li key={p.email} className="flex items-center gap-3 px-3 py-2">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-app-text">{p.name || p.email}</span>
                      {p.name && <span className="block truncate text-xs text-app-text-muted">{p.email}</span>}
                    </span>
                    {p.isNew && <Badge tone="blue">New</Badge>}
                    <IconButton icon={p.isNew ? X : UserMinus} label={`Remove ${p.email}`} onClick={() => remove(p)} />
                  </li>
                ))}
              </ul>
            )}
            {visible.length > shown && (
              <div className="border-t border-app-border! p-2 text-center">
                <Button size="sm" variant="ghost" onClick={() => setShown((n) => n + PAGE)}>
                  Show more ({formatNumber(visible.length - shown)})
                </Button>
              </div>
            )}
          </div>
        </section>

        {removedPeople.length > 0 && (
          <section>
            <h3 className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-app-text-muted">
              <UserMinus className="size-3.5" aria-hidden /> Removed · {formatNumber(removedPeople.length)}
              <span className="normal-case tracking-normal">(not saved yet)</span>
            </h3>
            <ul className="max-h-48 divide-y divide-app-border overflow-y-auto rounded-xl border border-dashed border-app-border!">
              {removedPeople.map((p) => (
                <li key={p.email} className="flex items-center gap-3 px-3 py-2">
                  <span className="min-w-0 flex-1 truncate text-sm text-app-text-muted line-through">{p.name || p.email}</span>
                  <Button size="sm" variant="ghost" icon={RotateCcw} onClick={() => readd(p)}>
                    Re-add
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {needsConsent && (
          <label className="flex items-start gap-2 text-sm text-app-text">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 size-4 accent-blue-600"
            />
            The people I added agreed to get emails from us.
          </label>
        )}
      </div>
    </Dialog>
  );
}
