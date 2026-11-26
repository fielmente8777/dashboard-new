import { Check, FolderOpen, MailOpen, MousePointerClick, PenLine, Users } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "../../context/ToastContext";
import { createAudienceBatch, getAudienceOptions, previewAudience } from "../../redux/api/emailMarketingApi";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import { Skeleton } from "../ui/States";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
const people = (n) => `${fmt(n)} ${n === 1 ? "person" : "people"}`;
const shortDate = (at) =>
  at ? new Date(at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

// one tickable row: a box, the words, and how many people
function TickRow({ checked, disabled, onChange, icon: RowIcon, label, sub, count, tone = "text-app-text-muted" }) {
  return (
    <label
      className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition ${
        checked ? "border-blue-500/40! bg-blue-500/5" : "border-app-border! hover:bg-app-surface-secondary/60"
      } ${disabled ? "cursor-default opacity-60" : "cursor-pointer"}`}
    >
      <input type="checkbox" checked={checked} disabled={disabled} onChange={onChange} className="size-4 shrink-0 accent-blue-600" />
      {RowIcon && <RowIcon className={`size-4 shrink-0 ${tone}`} aria-hidden />}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-app-text">{label}</span>
        {sub && <span className="block truncate text-xs text-app-text-muted">{sub}</span>}
      </span>
      <span className="shrink-0 text-xs tabular-nums text-app-text-muted">{fmt(count)}</span>
    </label>
  );
}

// a small tick button for Opened / Clicked inside a campaign row
function TickPill({ checked, onChange, icon: PillIcon, label, count, tone }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      disabled={!count}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition disabled:opacity-40 ${
        checked
          ? "border-blue-500/50! bg-blue-500/10 text-blue-700 dark:text-blue-300"
          : "border-app-border! text-app-text-muted enabled:hover:bg-app-surface-secondary"
      }`}
    >
      {checked ? <Check className="size-3.5" /> : <PillIcon className={`size-3.5 ${tone}`} />}
      {label}
      <span className="tabular-nums opacity-80">{fmt(count)}</span>
    </button>
  );
}

const Section = ({ title, hint, children }) => (
  <section className="space-y-2">
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-app-text-muted">{title}</h3>
      {hint && <p className="text-xs text-app-text-muted">{hint}</p>}
    </div>
    {children}
  </section>
);

// "Who gets this email?": tick any mix of the newsletter list, its groups, and
// the people who opened or clicked earlier emails. gian joins them, keeps each
// address once and leaves out anyone who unsubscribed; the count updates live.
//
//   open / onClose
//   onContinue({ batchId, count, label, emails })  the batch is made: open the compose window
//   initialGroups   groups ticked when it opens (e.g. "Send" on a group)
//   title / description / notice   wording for the page it opens from
export default function AudiencePickerDialog({
  open,
  onClose,
  onContinue,
  initialGroups = [],
  title = "Who gets this email?",
  description = "Tick as many as you like. Each person gets it once, and people who unsubscribed are left out.",
  notice = null,
}) {
  const { showToast } = useToast();
  const [options, setOptions] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [everyone, setEveryone] = useState(false);
  const [groups, setGroups] = useState([]);
  const [engaged, setEngaged] = useState([]); // [{ campaignId, group }]
  const [preview, setPreview] = useState(null); // { count, unsubscribed }
  const [counting, setCounting] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const askId = useRef(0);
  const initialKey = initialGroups.join("|");

  // fresh choices every time it opens
  useEffect(() => {
    if (!open) return;
    setEveryone(false);
    setGroups(initialKey ? initialKey.split("|") : []);
    setEngaged([]);
    setPreview(null);
    setOptions(null);
    setLoadFailed(false);
    getAudienceOptions()
      .then((res) => setOptions(res?.doc || { newsletter: { subscribed: 0, groups: [] }, campaigns: [] }))
      .catch(() => setLoadFailed(true));
  }, [open, initialKey]);

  const selection = useMemo(() => ({ everyone, groups: everyone ? [] : groups, engaged }), [everyone, groups, engaged]);
  const nothing = !selection.everyone && !selection.groups.length && !selection.engaged.length;

  // the live count, a moment after the last tick (only the latest answer counts)
  useEffect(() => {
    if (!open) return undefined;
    if (nothing) {
      setPreview(null);
      return undefined;
    }
    const id = ++askId.current;
    setCounting(true);
    const timer = setTimeout(async () => {
      try {
        const res = await previewAudience(selection);
        if (id === askId.current) setPreview(res?.doc || null);
      } catch {
        if (id === askId.current) setPreview(null);
      } finally {
        if (id === askId.current) setCounting(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [open, selection, nothing]);

  const toggleGroup = (name) => setGroups((now) => (now.includes(name) ? now.filter((g) => g !== name) : [...now, name]));
  const isEngaged = (campaignId, group) => engaged.some((e) => e.campaignId === campaignId && e.group === group);
  const toggleEngaged = (campaignId, group) =>
    setEngaged((now) =>
      isEngaged(campaignId, group)
        ? now.filter((e) => !(e.campaignId === campaignId && e.group === group))
        : [...now, { campaignId, group }],
    );

  const proceed = async () => {
    setPreparing(true);
    try {
      const doc = (await createAudienceBatch(selection))?.doc;
      if (!doc?.recipientBatchId) throw new Error("Could not prepare the recipients. Please try again.");
      onContinue({ batchId: doc.recipientBatchId, count: doc.count, label: doc.label, emails: doc.emails });
    } catch (error) {
      showToast({ message: error.message, type: "error" });
    } finally {
      setPreparing(false);
    }
  };

  const count = preview?.count ?? 0;
  const newsletter = options?.newsletter;
  const campaigns = options?.campaigns || [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="lg"
      sheetOnPhone
      footer={
        <>
          <span className="mr-auto min-w-0 self-center truncate text-xs text-app-text-muted">
            {nothing
              ? "Nothing ticked yet."
              : counting
                ? "Counting…"
                : `${people(count)}${preview?.unsubscribed ? ` · ${fmt(preview.unsubscribed)} unsubscribed left out` : ""}`}
          </span>
          <Button variant="secondary" onClick={onClose} disabled={preparing}>
            Cancel
          </Button>
          <Button icon={PenLine} onClick={proceed} loading={preparing} disabled={nothing || counting || count === 0}>
            Write to {fmt(count)}
          </Button>
        </>
      }
    >
      {loadFailed ? (
        <p className="text-sm text-red-600 dark:text-red-400">Could not load your groups and emails. Close and try again.</p>
      ) : !options ? (
        <div className="space-y-3">
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
        </div>
      ) : (
        <div className="space-y-5">
          <Section title="Newsletter list" hint="People who signed up, or who you added to a group.">
            <TickRow
              checked={everyone}
              onChange={() => setEveryone((v) => !v)}
              icon={Users}
              label="Everyone subscribed"
              count={newsletter.subscribed}
              disabled={!newsletter.subscribed}
            />
            {newsletter.groups.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {newsletter.groups.map((g) => (
                  <TickRow
                    key={g.name}
                    checked={everyone || groups.includes(g.name)}
                    disabled={everyone}
                    onChange={() => toggleGroup(g.name)}
                    icon={FolderOpen}
                    label={g.name}
                    count={g.subscribed}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-app-text-muted">No groups yet. Make one in the Groups tab, e.g. Past guests or Corporate.</p>
            )}
          </Section>

          <Section
            title="People who opened or clicked an earlier email"
            hint="Tick Opened, Clicked, or both, on as many emails as you like. Opened already includes those who clicked."
          >
            {campaigns.length ? (
              <ul className="divide-y divide-app-border overflow-hidden rounded-lg border border-app-border!">
                {campaigns.map((c) => (
                  <li key={c._id} className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-app-text" title={c.subject}>
                        {c.subject}
                      </span>
                      <span className="block text-xs text-app-text-muted">
                        {shortDate(c.sentAt)} · sent to {people(c.recipients)}
                      </span>
                    </span>
                    <span className="flex shrink-0 gap-2">
                      <TickPill
                        checked={isEngaged(c._id, "opened")}
                        onChange={() => toggleEngaged(c._id, "opened")}
                        icon={MailOpen}
                        label="Opened"
                        count={c.opened}
                        tone="text-violet-600 dark:text-violet-400"
                      />
                      <TickPill
                        checked={isEngaged(c._id, "clicked")}
                        onChange={() => toggleEngaged(c._id, "clicked")}
                        icon={MousePointerClick}
                        label="Clicked"
                        count={c.clicked}
                        tone="text-sky-600 dark:text-sky-400"
                      />
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-app-text-muted">Once people open an email you sent, it shows here so you can send to them again.</p>
            )}
          </Section>

          {notice}
        </div>
      )}
    </Dialog>
  );
}
