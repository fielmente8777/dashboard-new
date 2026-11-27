import { Mail, Send, Tag, Trash2, UserCheck, UserMinus, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Dialog from "../../components/ui/Dialog";
import { Field, Input, Select } from "../../components/ui/Field";
import Segmented from "../../components/ui/Segmented";
import { EmptyState, ErrorState, Skeleton } from "../../components/ui/States";
import TablePagination from "../../components/ui/TablePagination";
import { useToast } from "../../context/ToastContext";
import {
  newsletterError,
  useBulkSubscribersMutation,
  useGetNewsletterTagsQuery,
  useGetSubscribersQuery,
} from "../../redux/api/newsletterApi";
import SubscriberDrawer from "./SubscriberDrawer";
import { SOURCE_LABELS, SOURCE_OPTIONS, STATUS_OPTIONS, formatDate, formatNumber } from "./newsletterUtils";

const Checkbox = ({ checked, indeterminate = false, onChange, label }) => (
  <input
    type="checkbox"
    aria-label={label}
    checked={checked}
    ref={(el) => el && (el.indeterminate = indeterminate)}
    onChange={(e) => onChange(e.target.checked)}
    onClick={(e) => e.stopPropagation()}
    className="size-4 cursor-pointer rounded accent-blue-600"
  />
);

const useDebounced = (value, ms = 300) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
};

// The list: search, status, source and tag filters; tick rows for bulk actions; open one to edit.
//   onSendTo(emails) - send a newsletter to the ticked people
//   onAdd / onImport - the empty state's buttons
//   group - show only this group (set from the Groups tab); onGroupChange keeps it in sync
export default function SubscribersPanel({ onSendTo, onAdd, onImport, onRetry, group = "", onGroupChange }) {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const tag = group;
  const setTag = (next) => onGroupChange?.(next);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selected, setSelected] = useState(() => new Map()); // id -> subscriber
  const [openId, setOpenId] = useState(null);
  const [tagAction, setTagAction] = useState(null); // "addTags" | "removeTags"
  const [tagDraft, setTagDraft] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const term = useDebounced(search.trim());
  const filter = useMemo(
    () => ({
      ...(term && { search: term }),
      ...(status && { status }),
      ...(source && { source }),
      ...(tag && { tag }),
    }),
    [term, status, source, tag],
  );
  const filterKey = JSON.stringify(filter);
  // a new filter starts at page one with nothing ticked
  useEffect(() => {
    setPage(1);
    setSelected(new Map());
  }, [filterKey]);

  const list = useGetSubscribersQuery({ ...filter, page, limit });
  const tags = useGetNewsletterTagsQuery();
  const [bulk, { isLoading: working }] = useBulkSubscribersMutation();

  const rows = list.data?.items || [];
  const total = list.data?.total || 0;
  const filtered = Boolean(term || status || source || tag);
  const allOnPage = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const someOnPage = rows.some((r) => selected.has(r.id));
  const picked = [...selected.values()];

  const toggle = (row, on) =>
    setSelected((prev) => {
      const next = new Map(prev);
      if (on) next.set(row.id, row);
      else next.delete(row.id);
      return next;
    });
  const togglePage = (on) =>
    setSelected((prev) => {
      const next = new Map(prev);
      for (const row of rows) on ? next.set(row.id, row) : next.delete(row.id);
      return next;
    });

  const runBulk = async (action, extra = {}) => {
    try {
      const { changed, skipped } = await bulk({ ids: [...selected.keys()], action, ...extra }).unwrap();
      const done = {
        delete: `${formatNumber(changed)} deleted`,
        unsubscribe: `${formatNumber(changed)} unsubscribed`,
        resubscribe: `${formatNumber(changed)} subscribed again`,
        addTags: "Added to the group",
        removeTags: "Removed from the group",
      }[action];
      showToast({
        message: skipped ? `${done}. ${formatNumber(skipped)} unsubscribed themselves and can only rejoin from your website.` : done,
        type: skipped ? "warning" : "success",
      });
      setSelected(new Map());
      return true;
    } catch (error) {
      showToast({ message: newsletterError(error), type: "error" });
      return false;
    }
  };

  const tagOptions = [{ value: "", label: "Any group" }, ...(tags.data || []).map((t) => ({ value: t, label: t }))];

  if (list.isError) {
    return (
      <ErrorState
        message={newsletterError(list.error, "Could not load your subscribers.")}
        onRetry={() => {
          list.refetch();
          onRetry?.();
        }}
      />
    );
  }

  if (!list.isLoading && total === 0 && !filtered) {
    return (
      <EmptyState
        icon={Users}
        title="No subscribers yet"
        description="People who sign up with the newsletter box on your website appear here. You can also add people by hand or import a list of guests who agreed to hear from you."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="secondary" onClick={onImport}>Import a list</Button>
            <Button onClick={onAdd}>Add subscriber</Button>
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="w-full sm:w-64">
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email or name"
            aria-label="Search email or name"
          />
        </div>
        <Segmented options={STATUS_OPTIONS} value={status} onChange={setStatus} label="Status" />
        {/* a phone: the two lists share a line */}
        <div className="min-w-0 flex-1 sm:w-40 sm:flex-none">
          <Select options={SOURCE_OPTIONS} value={source} onChange={(e) => setSource(e.target.value)} aria-label="Source" />
        </div>
        {tagOptions.length > 1 && (
          <div className="min-w-0 flex-1 sm:w-40 sm:flex-none">
            <Select options={tagOptions} value={tag} onChange={(e) => setTag(e.target.value)} aria-label="Group" />
          </div>
        )}
        {filtered && (
          <Button
            variant="ghost"
            size="sm"
            icon={X}
            onClick={() => {
              setSearch("");
              setStatus("");
              setSource("");
              setTag("");
            }}
          >
            Clear
          </Button>
        )}
      </div>

      {/* bulk actions */}
      {picked.length > 0 && (
        <div className="anim-fade flex flex-wrap items-center gap-2 rounded-xl border border-blue-500/30! bg-blue-500/5 px-3 py-2">
          <span className="mr-auto text-sm font-medium text-app-text">{formatNumber(picked.length)} selected</span>
          {/* a phone: one row that scrolls sideways instead of four rows of buttons */}
          <div className="hide-scrollbar -mx-3 flex gap-2 overflow-x-auto px-3 max-sm:w-[calc(100%+1.5rem)] sm:contents">
          <Button
            size="sm"
            variant="secondary"
            icon={Send}
            onClick={() => onSendTo(picked.filter((s) => s.status === "subscribed").map((s) => s.email))}
            disabled={!picked.some((s) => s.status === "subscribed")}
          >
            Send email
          </Button>
          <Button size="sm" variant="secondary" icon={Tag} onClick={() => setTagAction("addTags")}>Add to group</Button>
          <Button size="sm" variant="secondary" onClick={() => setTagAction("removeTags")}>Remove from group</Button>
          <Button size="sm" variant="secondary" icon={UserMinus} loading={working} onClick={() => runBulk("unsubscribe")}>
            Unsubscribe
          </Button>
          <Button size="sm" variant="secondary" icon={UserCheck} loading={working} onClick={() => runBulk("resubscribe")}>
            Resubscribe
          </Button>
          <Button size="sm" variant="danger" icon={Trash2} onClick={() => setConfirmDelete(true)}>Delete</Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Map())}>Cancel</Button>
          </div>
        </div>
      )}

      {/* a phone: one card per person instead of the wide table */}
      <div className="overflow-hidden rounded-xl border border-app-border! bg-app-surface sm:hidden">
        <div className="flex items-center gap-3 border-b border-app-border! bg-app-surface-secondary px-3 py-2 text-xs text-app-text-muted">
          <Checkbox label="Select every row on this page" checked={allOnPage} indeterminate={!allOnPage && someOnPage} onChange={togglePage} />
          Select all on this page
        </div>
        {list.isLoading ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-app-text-muted">No subscriber matches these filters.</p>
        ) : (
          <ul className={`divide-y divide-app-border ${list.isFetching ? "opacity-60" : ""}`}>
            {rows.map((row) => {
              const rowTags = row.tags || [];
              return (
                <li
                  key={row.id}
                  onClick={() => setOpenId(row.id)}
                  className={`flex cursor-pointer items-start gap-3 px-3 py-3 ${selected.has(row.id) ? "bg-blue-500/5" : ""}`}
                >
                  <span className="pt-0.5">
                    <Checkbox label={`Select ${row.email}`} checked={selected.has(row.id)} onChange={(on) => toggle(row, on)} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-app-text">{row.name || row.email}</p>
                        {row.name && <p className="truncate text-xs text-app-text-muted">{row.email}</p>}
                      </div>
                      {row.status === "subscribed" ? (
                        <Badge tone="green">Subscribed</Badge>
                      ) : (
                        <Badge tone={row.unsubscribedBy === "subscriber" ? "red" : "amber"}>
                          {row.unsubscribedBy === "subscriber" ? "Opted out" : "Unsubscribed"}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[11px] text-app-text-muted">
                      <span>{SOURCE_LABELS[row.source] || row.source}</span>
                      <span aria-hidden>·</span>
                      <span>{formatDate(row.subscribedAt)}</span>
                      {rowTags.slice(0, 2).map((t) => (
                        <Badge key={t} tone="blue">{t}</Badge>
                      ))}
                      {rowTags.length > 2 && <Badge>+{rowTags.length - 2}</Badge>}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* table (tablet and desktop) */}
      <div className="hidden overflow-x-auto rounded-xl border border-app-border! bg-app-surface sm:block">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-app-surface-secondary text-xs uppercase tracking-wide text-app-text-muted">
            <tr>
              <th className="w-10 px-4 py-3">
                <Checkbox
                  label="Select every row on this page"
                  checked={allOnPage}
                  indeterminate={!allOnPage && someOnPage}
                  onChange={togglePage}
                />
              </th>
              <th className="px-4 py-3 font-medium">Subscriber</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Groups</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {list.isLoading &&
              Array.from({ length: 6 }, (_, i) => (
                <tr key={i} className="border-t border-app-border!">
                  <td colSpan={6} className="px-4 py-2.5">
                    <Skeleton className="h-6" />
                  </td>
                </tr>
              ))}
            {!list.isLoading && rows.length === 0 && (
              <tr className="border-t border-app-border!">
                <td colSpan={6} className="px-4 py-10 text-center text-app-text-muted">
                  No subscriber matches these filters.
                </td>
              </tr>
            )}
            {!list.isLoading &&
              rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => setOpenId(row.id)}
                  className={`cursor-pointer border-t border-app-border! transition-colors hover:bg-app-surface-secondary ${
                    selected.has(row.id) ? "bg-blue-500/5" : ""
                  } ${list.isFetching ? "opacity-60" : ""}`}
                >
                  <td className="px-4 py-3">
                    <Checkbox label={`Select ${row.email}`} checked={selected.has(row.id)} onChange={(on) => toggle(row, on)} />
                  </td>
                  <td className="max-w-72 px-4 py-3">
                    <p className="truncate font-medium text-app-text">{row.name || row.email}</p>
                    {row.name && <p className="truncate text-xs text-app-text-muted">{row.email}</p>}
                  </td>
                  <td className="px-4 py-3">
                    {row.status === "subscribed" ? (
                      <Badge tone="green">Subscribed</Badge>
                    ) : (
                      <Badge tone={row.unsubscribedBy === "subscriber" ? "red" : "amber"}>
                        {row.unsubscribedBy === "subscriber" ? "Opted out" : "Unsubscribed"}
                      </Badge>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-app-text-muted">{SOURCE_LABELS[row.source] || row.source}</td>
                  <td className="px-4 py-3">
                    <div className="flex max-w-56 flex-wrap gap-1">
                      {(row.tags || []).slice(0, 3).map((t) => (
                        <Badge key={t} tone="blue">{t}</Badge>
                      ))}
                      {(row.tags || []).length > 3 && <Badge>+{row.tags.length - 3}</Badge>}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-app-text-muted">{formatDate(row.subscribedAt)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <TablePagination
        page={page}
        total={total}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={(next) => {
          setLimit(next);
          setPage(1);
        }}
        itemLabel="subscribers"
      />

      <SubscriberDrawer
        subscriber={rows.find((r) => r.id === openId) || null}
        onClose={() => setOpenId(null)}
        knownTags={tags.data || []}
      />

      {/* add / remove a tag on the ticked rows */}
      <Dialog
        open={Boolean(tagAction)}
        title={tagAction === "addTags" ? "Add to a group" : "Remove from a group"}
        description={`${formatNumber(picked.length)} selected. Groups let you send a newsletter to just some people, e.g. "Past guests", "Corporate" or "Weddings".`}
        onClose={() => setTagAction(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setTagAction(null)}>Cancel</Button>
            <Button
              loading={working}
              disabled={!tagDraft.trim()}
              onClick={async () => {
                if (await runBulk(tagAction, { tags: [tagDraft.trim()] })) {
                  setTagAction(null);
                  setTagDraft("");
                }
              }}
            >
              {tagAction === "addTags" ? "Add to group" : "Remove from group"}
            </Button>
          </>
        }
      >
        <Field label="Group">
          <Input
            value={tagDraft}
            onChange={(e) => setTagDraft(e.target.value)}
            list="newsletter-tags"
            maxLength={40}
            autoFocus
            placeholder="e.g. Past guests"
          />
          <datalist id="newsletter-tags">
            {(tags.data || []).map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </Field>
      </Dialog>

      <Dialog
        open={confirmDelete}
        title={`Delete ${formatNumber(picked.length)} ${picked.length === 1 ? "subscriber" : "subscribers"}?`}
        description="They are removed from your list for good. To stop emailing someone but keep the record that they asked not to be emailed, unsubscribe them instead."
        onClose={() => setConfirmDelete(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button
              variant="danger"
              icon={Trash2}
              loading={working}
              onClick={async () => {
                if (await runBulk("delete")) setConfirmDelete(false);
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="flex items-start gap-2 text-sm text-app-text-muted">
          <Mail className="mt-0.5 size-4 shrink-0" aria-hidden />
          A deleted person who signs up again on your website comes back as a new subscriber.
        </p>
      </Dialog>
    </div>
  );
}
