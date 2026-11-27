import { Ban, FileWarning, MailWarning, Search, ShieldAlert, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import Chip from "../../../components/ui/Chip";
import { Input } from "../../../components/ui/Field";
import Notice from "../../../components/ui/Notice";
import { EmptyState, Skeleton } from "../../../components/ui/States";
import { useConfirm } from "../../../context/ConfirmContext";
import { useToast } from "../../../context/ToastContext";
import { deleteWrongEmails, getWrongEmails } from "../../../redux/api/emailMarketingApi";
import { formatDate, formatNumber } from "../emailUtils";

// why an address is on the list
const KINDS = [
  { value: "", label: "All", icon: MailWarning },
  { value: "import", label: "Found when importing", icon: FileWarning },
  { value: "send_check", label: "Caught before sending", icon: MailWarning },
  { value: "bounce", label: "Bounced", icon: Ban },
  { value: "complaint", label: "Marked as spam", icon: ShieldAlert },
];
const KIND_LABEL = Object.fromEntries(KINDS.map((k) => [k.value, k.label]));

/**
 * Email marketing → Wrong emails: every address that can't receive email, found by the check
 * on imports, the check before sending, bounces and spam complaints (like Mailchimp's cleaned
 * contacts). None of them is emailed again. Delete removes them from this list and from Contacts.
 */
export default function WrongEmailsPanel() {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [kind, setKind] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [picked, setPicked] = useState(() => new Set());
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await getWrongEmails({ page, limit: 50, search: query, kind }));
    } catch (error) {
      showToast({ message: error?.message || "Couldn't load the wrong emails.", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [page, query, kind, showToast]);

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    setPage(1);
    setPicked(new Set());
  }, [query, kind]);

  const items = data?.items || [];
  const allPicked = items.length > 0 && items.every((r) => picked.has(r._id));
  const toggle = (id) =>
    setPicked((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const remove = async (body, count) => {
    const ok = await confirm(
      `Delete ${formatNumber(count)} ${count === 1 ? "address" : "addresses"}? They are removed from this list and from your Contacts. They stay on your do-not-email list, so they are still never emailed.`,
      { title: "Delete wrong emails", confirmText: "Delete" },
    );
    if (!ok) return;
    setDeleting(true);
    try {
      const res = await deleteWrongEmails(body);
      showToast({
        message: `${formatNumber(res?.deleted)} deleted${res?.contactsRemoved ? ` · ${formatNumber(res.contactsRemoved)} removed from Contacts` : ""}`,
        type: "success",
      });
      setPicked(new Set());
      await load();
    } catch (error) {
      showToast({ message: error?.message || "Couldn't delete them.", type: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const total = data?.total || 0;
  const counts = data?.counts || {};
  const allCount = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <section className="space-y-4">
      <Notice tone="info" icon={MailWarning} title="Addresses that can't receive email">
        Found when you import a list, just before a campaign sends, or when an email bounces or is marked as spam. They are never emailed again, so they can&apos;t
        hurt your sender reputation. Fix a typo in your list and import it again, or delete them here.
      </Notice>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible" role="group" aria-label="Why">
        {KINDS.map((k) => (
          <Chip key={k.value} className="shrink-0 whitespace-nowrap" selected={kind === k.value} onClick={() => setKind(k.value)}>
            {k.label} <span className="tabular-nums opacity-70">{formatNumber(k.value ? counts[k.value] || 0 : allCount)}</span>
          </Chip>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 sm:max-w-sm sm:flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-app-text-muted" aria-hidden />
          <Input className="pl-9" placeholder="Search an address or name" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 sm:ml-auto">
          {picked.size > 0 && (
            <Button variant="danger" size="sm" icon={Trash2} loading={deleting} onClick={() => remove({ ids: [...picked] }, picked.size)}>
              Delete {formatNumber(picked.size)}
            </Button>
          )}
          {total > 0 && (
            <Button
              variant="secondary"
              size="sm"
              icon={Trash2}
              disabled={deleting}
              onClick={() => remove({ all: true, ...(kind && { kind }) }, kind ? counts[kind] || total : allCount)}
            >
              Delete all{kind ? ` "${KIND_LABEL[kind]}"` : ""}
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-app-border bg-app-surface">
        <div className="hidden grid-cols-[32px_minmax(0,1.4fr)_minmax(0,1.6fr)_150px_110px] gap-3 border-b border-app-border bg-app-surface-secondary px-3 py-2.5 text-xs font-medium text-app-text-muted md:grid">
          <input
            type="checkbox"
            checked={allPicked}
            onChange={() => setPicked(allPicked ? new Set() : new Set(items.map((r) => r._id)))}
            aria-label="Select all on screen"
            className="size-4 accent-primary"
          />
          <span>Address</span>
          <span>Why</span>
          <span>From</span>
          <span>Last seen</span>
        </div>
        {loading && !data ? (
          <div className="space-y-2 p-3">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        ) : items.length ? (
          items.map((r) => (
            <label
              key={r._id}
              className="grid cursor-pointer grid-cols-[24px_minmax(0,1fr)] gap-x-2 gap-y-1 border-b border-app-border px-3 py-3 last:border-0 hover:bg-app-surface-secondary md:grid-cols-[32px_minmax(0,1.4fr)_minmax(0,1.6fr)_150px_110px] md:items-center md:gap-3"
            >
              <input type="checkbox" checked={picked.has(r._id)} onChange={() => toggle(r._id)} className="mt-1 size-4 accent-primary md:mt-0" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-app-text">{r.email}</span>
                {r.original && <span className="block truncate text-xs text-app-text-muted">in the file: {r.original}</span>}
                {r.name && <span className="block truncate text-xs text-app-text-muted">{r.name}</span>}
              </span>
              <span className="col-start-2 min-w-0 text-sm text-app-text md:col-start-auto">
                <span className="block break-words">{r.reason}</span>
                {r.suggestion && <span className="block text-xs text-blue-600 dark:text-blue-400">Did you mean {r.suggestion}?</span>}
                <span className="block text-xs text-app-text-muted">
                  {KIND_LABEL[r.kind] || r.kind}
                  {r.count > 1 ? ` · seen ${r.count} times` : ""}
                </span>
              </span>
              <span className="col-start-2 truncate text-xs text-app-text-muted md:col-start-auto">{r.source || "—"}</span>
              <span className="col-start-2 text-xs text-app-text-muted md:col-start-auto">{formatDate(r.lastSeenAt)}</span>
            </label>
          ))
        ) : (
          <EmptyState title="No wrong emails" description={query || kind ? "Nothing matches." : "Every address you've imported or emailed can receive email."} />
        )}
      </div>

      {data?.pages > 1 && (
        <div className="flex items-center justify-end gap-2 text-xs text-app-text-muted">
          <Button size="sm" variant="ghost" onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>
            Previous
          </Button>
          {page} / {data.pages}
          <Button size="sm" variant="ghost" onClick={() => setPage((p) => p + 1)} disabled={page >= data.pages}>
            Next
          </Button>
        </div>
      )}
    </section>
  );
}
