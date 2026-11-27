import { ArrowRight, BookUser, Check, FolderOpen, MailOpen, MousePointerClick, UserPlus, Users } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "../../context/ToastContext";
import { createAudienceBatch, createTradeRecipientBatch, getAudienceOptions, previewAudience } from "../../redux/api/emailMarketingApi";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import Segmented from "../ui/Segmented";
import TradeAudiencePicker from "./TradeAudiencePicker";
import { Skeleton } from "../ui/States";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
const people = (n) => `${fmt(n)} ${n === 1 ? "person" : "people"}`;

// the whole list, shown above the groups as one more choice
const EVERYONE = "__everyone__";

const Step = ({ number, title, hint, children }) => (
  <section className="space-y-2.5">
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-semibold text-white">
        {number}
      </span>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-app-text">{title}</h3>
        {hint && <p className="text-xs text-app-text-muted">{hint}</p>}
      </div>
    </div>
    <div className="pl-7.5">{children}</div>
  </section>
);

// one group to choose (a radio card)
function GroupCard({ selected, onSelect, icon: CardIcon, name, total, opened, clicked }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
        selected ? "border-blue-500! bg-blue-500/5 ring-1 ring-blue-500/40" : "border-app-border! hover:bg-app-surface-secondary/60"
      }`}
    >
      <span
        className={`flex size-4 shrink-0 items-center justify-center rounded border ${
          selected ? "border-blue-600! bg-blue-600" : "border-app-border!"
        }`}
      >
        {selected && <Check className="size-3 text-white" />}
      </span>
      <CardIcon className="size-4 shrink-0 text-app-text-muted" aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-app-text">{name}</span>
        <span className="block truncate text-xs text-app-text-muted">
          {people(total)}
          {opened != null && ` · ${fmt(opened)} opened · ${fmt(clicked)} clicked`}
        </span>
      </span>
    </button>
  );
}

// one "who in the group" tick box
function WhoTick({ checked, onChange, icon: TickIcon, tone, label, sub, count, disabled }) {
  return (
    <label
      className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition ${
        checked ? "border-blue-500/50! bg-blue-500/5" : "border-app-border! hover:bg-app-surface-secondary/60"
      } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="size-4 shrink-0 accent-blue-600"
      />
      <TickIcon className={`size-4 shrink-0 ${tone}`} aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block text-sm text-app-text">{label}</span>
        {sub && <span className="block text-xs text-app-text-muted">{sub}</span>}
      </span>
      {count != null && <span className="shrink-0 text-xs tabular-nums text-app-text-muted">{fmt(count)}</span>}
    </label>
  );
}

// "Create group email campaign": 1. pick a group (e.g. one per country or
// language), 2. who in it gets the email: everyone, or only those who opened
// and / or clicked (any earlier email). Then the compose window opens for that audience.
//
//   open / onClose
//   initialGroup   the group(s) chosen when it opens ("Send" on a group, or several ticked on Groups)
//   onContinue({ batchId, count, label, emails })   one of the hotel's groups
//   onContinue({ batchId, count, label })   Trade Directory partners (travel agents, yoga…): gian
//                makes the batch from the shared data; the addresses never reach the browser
//   onManageGroups()  "make a group" link when there are none
export default function GroupCampaignDialog({ open, onClose, onContinue, initialGroup = "", initialSource = "groups", onManageGroups }) {
  const { showToast } = useToast();
  const [options, setOptions] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);
  // the ticked groups (several at once: everyone in any of them gets the email once), or [EVERYONE]
  const [picked, setPicked] = useState([]);
  const [everyoneInGroup, setEveryoneInGroup] = useState(true);
  const [engagement, setEngagement] = useState([]); // "opened" | "clicked"
  // with Opened / Clicked: also people added to the group who never got an email yet
  const [includeNew, setIncludeNew] = useState(true);
  const [preview, setPreview] = useState(null);
  const [counting, setCounting] = useState(false);
  const [preparing, setPreparing] = useState(false);
  // "groups" = the hotel's own email groups; "trade" = Trade Directory partners
  const [source, setSource] = useState("groups");
  const [trade, setTrade] = useState(null);
  const askId = useRef(0);

  // fresh every time it opens
  useEffect(() => {
    if (!open) return;
    setPicked((Array.isArray(initialGroup) ? initialGroup : [initialGroup]).filter(Boolean));
    setSource(initialSource);
    setTrade(null);
    setEveryoneInGroup(true);
    setEngagement([]);
    setIncludeNew(true);
    setPreview(null);
    setOptions(null);
    setLoadFailed(false);
    getAudienceOptions()
      .then((res) => {
        const doc = res?.doc || { newsletter: { subscribed: 0, groups: [] }, campaigns: [] };
        setOptions(doc);
        // only one group: choose it straight away
        if (!initialGroup?.length && doc.newsletter.groups.length === 1) setPicked([doc.newsletter.groups[0].name]);
      })
      .catch(() => setLoadFailed(true));
  }, [open, initialGroup, initialSource]);

  const filtered = !everyoneInGroup && engagement.length > 0;
  const everyoneOnList = picked.includes(EVERYONE);
  const selection = useMemo(() => {
    if (!picked.length) return null;
    return {
      everyone: everyoneOnList,
      groups: everyoneOnList ? [] : picked,
      engaged: [],
      engagement: filtered ? engagement : [],
      engagementCampaignId: null,
      includeNew: filtered ? includeNew : false,
    };
  }, [picked, everyoneOnList, filtered, engagement, includeNew]);
  const incomplete = !selection || (!everyoneInGroup && !engagement.length);

  // the live count, a moment after the last change (only the latest answer counts)
  useEffect(() => {
    if (!open || incomplete) {
      setPreview(null);
      setCounting(false);
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
  }, [open, selection, incomplete]);

  // "Everyone" and "Opened / Clicked" exclude each other
  const tickEveryone = () => {
    setEveryoneInGroup((v) => !v);
    setEngagement([]);
  };
  const tickEngagement = (kind) => {
    setEveryoneInGroup(false);
    setEngagement((now) => (now.includes(kind) ? now.filter((k) => k !== kind) : [...now, kind]));
  };

  const proceed = async () => {
    setPreparing(true);
    if (source === "trade") {
      try {
        const doc = await createTradeRecipientBatch({ pool: trade.pool, segments: trade.segments });
        if (!doc?.recipientBatchId) throw new Error("Could not prepare the partners. Please try again.");
        onContinue({ batchId: doc.recipientBatchId, count: doc.count, label: doc.label });
      } catch (error) {
        showToast({ message: error.message, type: "error" });
      } finally {
        setPreparing(false);
      }
      return;
    }
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

  const groups = options?.newsletter?.groups || [];
  const chosen = everyoneOnList ? [] : groups.filter((g) => picked.includes(g.name));
  // before the server's count: the groups added up (someone in two groups is counted twice here, once in the send)
  const sum = (key) => chosen.reduce((n, g) => n + (g[key] || 0), 0);
  const total = everyoneOnList ? options?.newsletter?.subscribed : sum("subscribed");
  const count = preview?.count ?? 0;
  const pickedLabel = everyoneOnList ? "your list" : chosen.length === 1 ? `“${chosen[0].name}”` : `${chosen.length} groups`;
  /** tick / untick a group; "Everyone" and single groups exclude each other */
  const togglePick = (name) =>
    setPicked((now) => {
      if (name === EVERYONE) return now.includes(EVERYONE) ? [] : [EVERYONE];
      const rest = now.filter((n) => n !== EVERYONE);
      return rest.includes(name) ? rest.filter((n) => n !== name) : [...rest, name];
    });

  const groupStatus = !picked.length
    ? "Choose one or more groups."
    : incomplete
      ? "Tick who in the group gets it."
      : counting
        ? "Counting…"
        : `${people(count)} will get this email${preview?.unsubscribed ? ` · ${fmt(preview.unsubscribed)} unsubscribed left out` : ""}`;
  const isTrade = source === "trade";
  const status = isTrade ? (trade ? `${fmt(trade.count)} ${trade.count === 1 ? "partner" : "partners"} will get this email` : "Choose the partners.") : groupStatus;
  const warn = !isTrade && !incomplete && !counting && count === 0;
  const blocked = isTrade ? !trade : incomplete || counting || count === 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Create group email campaign"
      description={
        isTrade
          ? "Email travel agents, MICE, wedding planners, yoga and other trade partners. Pick one or more categories."
          : "Choose one or more groups, then who in them gets the email. Each person gets it once, even if they are in several groups; unsubscribed people are always left out."
      }
      size="lg"
      sheetOnPhone
      footer={
        <>
          <span
            className={`mr-auto min-w-0 self-center truncate text-xs ${warn ? "text-amber-600 dark:text-amber-400" : "text-app-text-muted"}`}
          >
            {warn ? "No one matches. Try another choice." : status}
          </span>
          <Button variant="secondary" onClick={onClose} disabled={preparing}>
            Cancel
          </Button>
          <Button icon={ArrowRight} onClick={proceed} loading={preparing} disabled={blocked}>
            Next: write the email
          </Button>
        </>
      }
    >
      <Segmented
        label="Send to"
        value={source}
        onChange={setSource}
        className="mb-5"
        options={[
          { value: "groups", label: <span className="flex items-center gap-1.5"><FolderOpen className="size-4" aria-hidden />Your groups</span> },
          { value: "trade", label: <span className="flex items-center gap-1.5"><BookUser className="size-4" aria-hidden />Trade partners</span> },
        ]}
      />
      {isTrade ? (
        <TradeAudiencePicker onChange={setTrade} />
      ) : loadFailed ? (
        <p className="text-sm text-red-600 dark:text-red-400">Could not load your groups. Close and try again.</p>
      ) : !options ? (
        <div className="space-y-3">
          <Skeleton className="h-14 rounded-xl" />
          <Skeleton className="h-14 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      ) : (
        <div className="space-y-6">
          <Step number={1} title="Choose groups" hint="Tick one or more. Someone in two groups gets the email once.">
            {groups.length ? (
              <div role="group" aria-label="Groups" className="grid gap-2 sm:grid-cols-2">
                {groups.map((g) => (
                  <GroupCard
                    key={g.name}
                    selected={picked.includes(g.name)}
                    onSelect={() => togglePick(g.name)}
                    icon={FolderOpen}
                    name={g.name}
                    total={g.subscribed}
                    opened={g.opened ?? null}
                    clicked={g.clicked ?? 0}
                  />
                ))}
                {options.newsletter.subscribed > 0 && (
                  <GroupCard
                    selected={everyoneOnList}
                    onSelect={() => togglePick(EVERYONE)}
                    icon={Users}
                    name="Everyone on your list"
                    total={options.newsletter.subscribed}
                    opened={null}
                  />
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-app-border! px-4 py-5 text-center">
                <p className="text-sm text-app-text">You have no groups yet.</p>
                <p className="mt-1 text-xs text-app-text-muted">
                  Make one (e.g. Past guests or Corporate) and add people to it from a file or your leads.
                </p>
                {onManageGroups && (
                  <Button size="sm" variant="secondary" className="mt-3" onClick={onManageGroups}>
                    Go to Groups
                  </Button>
                )}
              </div>
            )}
          </Step>

          {picked.length > 0 && (
            <Step
              number={2}
              title={`Who in ${pickedLabel} gets it?`}
              hint="Everyone, or only the people who opened or clicked. Tick both Opened and Clicked to include anyone who did either."
            >
              <div className="space-y-2">
                <WhoTick
                  checked={everyoneInGroup}
                  onChange={tickEveryone}
                  icon={Users}
                  tone="text-blue-600 dark:text-blue-400"
                  label={chosen.length > 1 ? "Everyone in these groups" : "Everyone in the group"}
                  sub="All subscribed people, whether they opened before or not"
                  count={total}
                />
                <WhoTick
                  checked={engagement.includes("opened")}
                  onChange={() => tickEngagement("opened")}
                  icon={MailOpen}
                  tone="text-violet-600 dark:text-violet-400"
                  label="Only people who opened"
                  sub="Opened an earlier email (this includes those who clicked)"
                  count={everyoneOnList ? null : sum("opened")}
                />
                <WhoTick
                  checked={engagement.includes("clicked")}
                  onChange={() => tickEngagement("clicked")}
                  icon={MousePointerClick}
                  tone="text-sky-600 dark:text-sky-400"
                  label="Only people who clicked"
                  sub="Clicked a link or button in an earlier email"
                  count={everyoneOnList ? null : sum("clicked")}
                />
              </div>
              {filtered && (
                <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl border border-app-border! p-3 hover:bg-app-surface-secondary">
                  <input
                    type="checkbox"
                    checked={includeNew}
                    onChange={(e) => setIncludeNew(e.target.checked)}
                    className="mt-0.5 size-4 accent-blue-600"
                  />
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-app-text">
                      <UserPlus className="size-4 text-emerald-600 dark:text-emerald-400" />
                      Also people added since
                    </span>
                    <span className="block text-xs text-app-text-muted">
                      New addresses in this group that haven&apos;t had an email yet, so they couldn&apos;t open one. Untick to send
                      only to people who opened or clicked.
                    </span>
                  </span>
                </label>
              )}
              {filtered && !incomplete && !counting && preview && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400">
                  <Check className="size-3.5" /> {people(count)} in this group match
                  {includeNew && preview.newMembers != null
                    ? ` (${fmt(preview.engaged ?? 0)} ${engagement.length === 2 ? "opened or clicked" : engagement[0]}, ${fmt(preview.newMembers)} new)`
                    : ""}
                  .
                </p>
              )}
            </Step>
          )}
        </div>
      )}
    </Dialog>
  );
}
