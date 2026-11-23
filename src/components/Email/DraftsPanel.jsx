import { FileEdit, LayoutTemplate, Loader2, RefreshCw, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useConfirm } from "../../context/ConfirmContext";
import { useToast } from "../../context/ToastContext";
import { deleteEmailDraft, getEmailDrafts } from "../../redux/api/emailMarketingApi";
import { Input } from "../ui/Field";
import Icon from "../ui/Icon";
import IconButton from "../ui/IconButton";
import { ErrorState, Skeleton } from "../ui/States";
import { mailDate } from "./mailFormat";

// "To" of a draft as Gmail shows it: the chosen group, then typed addresses
const draftTo = (d) => {
  const parts = [];
  if (d.recipientCount) {
    parts.push(`${d.recipientLabel || "selected people"} (${d.recipientCount.toLocaleString("en-IN")})`);
  }
  parts.push(...(d.toEmails || []));
  const more = (d.toCount || 0) - (d.toEmails || []).length;
  if (!parts.length) return "";
  return more > 0 ? `${parts.join(", ")} +${more}` : parts.join(", ");
};

// Email marketing → Drafts: emails still being written, newest first, like
// Gmail's Drafts. A row opens it in the compose window to carry on.
//
//   reloadSignal     change it to reload (a draft was saved, sent or deleted)
//   onOpen(id)       open this draft in the compose window
//   openingId        the draft being opened (shows a spinner on its row)
//   onCount(n)       how many there are, for the tab badge
//   onNew()          "Write an email" in the empty state
export default function DraftsPanel({ reloadSignal = 0, onOpen, openingId = null, onCount, onNew }) {
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [failed, setFailed] = useState(false);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async ({ quiet = false } = {}) => {
    if (quiet) setRefreshing(true);
    try {
      const result = await getEmailDrafts();
      setDrafts(result?.drafts || []);
      setFailed(false);
    } catch {
      if (!quiet) setFailed(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load({ quiet: reloadSignal > 0 });
  }, [load, reloadSignal]);

  useEffect(() => {
    onCount?.(drafts.length);
  }, [drafts.length, onCount]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return drafts;
    return drafts.filter((d) =>
      [d.subject, d.snippet, d.recipientLabel, ...(d.toEmails || [])].some((v) => v?.toLowerCase().includes(term)),
    );
  }, [drafts, search]);

  const remove = async (event, draft) => {
    event.stopPropagation();
    const ok = await confirm(`“${draft.subject || "(no subject)"}” will be deleted. This can't be undone.`, {
      title: "Delete draft?",
      confirmText: "Delete",
    });
    if (!ok) return;
    setDeleting(draft._id);
    try {
      await deleteEmailDraft(draft._id);
      setDrafts((list) => list.filter((d) => d._id !== draft._id));
    } catch (error) {
      showToast({ type: "error", message: error?.message || "Couldn't delete the draft." });
    } finally {
      setDeleting(null);
    }
  };

  if (failed) return <ErrorState message="Could not load your drafts." onRetry={() => load()} />;

  if (loading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!drafts.length) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-app-border! bg-app-surface px-6 py-12 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
          <FileEdit className="size-6" />
        </span>
        <h2 className="mt-4 text-base font-semibold text-app-text">No drafts</h2>
        <p className="mt-1 max-w-md text-sm text-app-text-muted">
          Emails you start writing are saved here as you type. Close the window any time and carry on later.
        </p>
        {onNew && (
          <button
            type="button"
            onClick={onNew}
            className="mt-4 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Write an email
          </button>
        )}
      </div>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative w-full sm:w-72">
          <Icon icon={Search} size="sm" tone="faint" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search drafts"
            aria-label="Search drafts"
            className="pl-9"
          />
        </div>
        <IconButton
          icon={RefreshCw}
          label="Refresh"
          onClick={() => load({ quiet: true })}
          className={`ml-auto ${refreshing ? "animate-spin" : ""}`}
        />
      </div>

      <ul className="divide-y divide-app-border overflow-hidden rounded-xl border border-app-border! bg-app-surface">
        {visible.map((d) => {
          const to = draftTo(d);
          return (
            <li key={d._id}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => onOpen(d._id)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen(d._id))}
                className="group flex cursor-pointer items-start gap-3 px-3 py-2.5 transition hover:bg-app-surface-secondary hover:shadow-[inset_3px_0_0_var(--color-primary,#2563eb)] focus-visible:bg-app-surface-secondary focus-visible:outline-none sm:items-center sm:px-4"
              >
                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:gap-4">
                  <p className="flex min-w-0 items-center gap-1.5 text-sm sm:w-56 sm:shrink-0">
                    <span className="shrink-0 font-medium text-red-500">Draft</span>
                    <span className="truncate text-app-text-muted">{to ? `to ${to}` : "no recipients"}</span>
                  </p>
                  <p className="mt-0.5 min-w-0 flex-1 truncate text-sm sm:mt-0">
                    <span className="font-medium text-app-text">{d.subject || "(no subject)"}</span>
                    {d.snippet && <span className="text-app-text-muted"> — {d.snippet}</span>}
                  </p>
                  {d.templateName && (
                    <span className="mt-1 hidden shrink-0 items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] text-blue-600 sm:mt-0 sm:inline-flex dark:text-blue-400">
                      <LayoutTemplate className="size-3" />
                      <span className="max-w-32 truncate">{d.templateName}</span>
                    </span>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {openingId === d._id ? (
                    <Loader2 className="size-4 animate-spin text-app-text-muted" />
                  ) : (
                    <span
                      className="w-16 text-right text-xs tabular-nums text-app-text-muted sm:group-hover:hidden"
                      title={new Date(d.updatedAt).toLocaleString("en-IN")}
                    >
                      {mailDate(d.updatedAt)}
                    </span>
                  )}
                  <IconButton
                    icon={Trash2}
                    label="Delete draft"
                    size="sm"
                    disabled={deleting === d._id}
                    onClick={(e) => remove(e, d)}
                    className="sm:hidden sm:group-hover:inline-flex"
                  />
                </div>
              </div>
            </li>
          );
        })}
        {!visible.length && <li className="px-4 py-8 text-center text-sm text-app-text-muted">No drafts match “{search}”.</li>}
      </ul>
    </section>
  );
}
