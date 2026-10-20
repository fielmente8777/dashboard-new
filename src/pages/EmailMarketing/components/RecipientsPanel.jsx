import { Check, ChevronLeft, ChevronRight, Minus, RefreshCw, Search, Send, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Field";
import Icon from "../../../components/ui/Icon";
import IconButton from "../../../components/ui/IconButton";
import { EmptyState, ErrorState, Skeleton } from "../../../components/ui/States";
import { useToast } from "../../../context/ToastContext";
import useDebounce from "../../../hooks/useDebounce";
import {
  createLeadRecipientBatch,
  createLeadRecipientBatchFromFilter,
  getEmailRecipients,
} from "../../../redux/api/emailMarketingApi";
import { formatNumber } from "../emailUtils";

const PAGE_SIZE = 50;

const Checkbox = ({ checked, indeterminate, onChange, label, disabled }) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={indeterminate ? "mixed" : checked}
    aria-label={label}
    disabled={disabled}
    onClick={onChange}
    className={`flex size-4.5 shrink-0 items-center justify-center rounded border transition disabled:cursor-not-allowed ${
      checked || indeterminate
        ? "border-blue-600 bg-blue-600 text-white"
        : "border-(--app-border-strong)! bg-app-surface hover:border-blue-500!"
    }`}
  >
    {checked ? <Check className="size-3" strokeWidth={3} /> : indeterminate ? <Minus className="size-3" strokeWidth={3} /> : null}
  </button>
);

const initials = (name, email) =>
  (name || email || "?")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

// Leads that have an email address. The selected ones become a recipient
// batch on the server and are handed to `onCompose({ batchId, count })`.
// Bump `clearSignal` to drop the selection (after the email is sent).
const RecipientsPanel = ({ onCompose, clearSignal }) => {
  const { showToast } = useToast();
  const [recipients, setRecipients] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 350);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [allMatching, setAllMatching] = useState(false);
  const [preparing, setPreparing] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const res = await getEmailRecipients({ page, limit: PAGE_SIZE, search: debouncedSearch });
      setRecipients(res?.doc || []);
      setTotal(res?.pagination?.total || 0);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  const clearSelection = () => {
    setAllMatching(false);
    setSelectedIds([]);
  };

  // a new search starts again from page 1 with nothing selected
  useEffect(() => {
    setPage(1);
    clearSelection();
  }, [debouncedSearch]);

  useEffect(() => {
    if (clearSignal) clearSelection();
  }, [clearSignal]);

  const pageIds = recipients.map((r) => r.id);
  const pageSelectedCount = pageIds.filter((id) => selectedIds.includes(id)).length;
  const pageAllSelected = recipients.length > 0 && pageSelectedCount === recipients.length;
  const selectedCount = allMatching ? total : selectedIds.length;

  const toggleOne = (id) => {
    setAllMatching(false);
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const togglePage = () => {
    setAllMatching(false);
    setSelectedIds((prev) =>
      pageAllSelected ? prev.filter((id) => !pageIds.includes(id)) : [...new Set([...prev, ...pageIds])],
    );
  };

  const composeToSelected = async () => {
    if (!selectedCount) return;
    setPreparing(true);
    try {
      const res = allMatching
        ? await createLeadRecipientBatchFromFilter({ search: debouncedSearch })
        : await createLeadRecipientBatch({ leadIds: selectedIds });
      const batchId = res?.doc?.recipientBatchId;
      if (!batchId) throw new Error();
      onCompose({ batchId, count: res?.doc?.count ?? selectedCount });
    } catch {
      showToast({ message: "Could not prepare the recipients. Please try again.", type: "error" });
    } finally {
      setPreparing(false);
    }
  };

  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="overflow-hidden rounded-xl border border-app-border! bg-app-surface">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-app-border! p-3">
        <Checkbox
          label="Select all on this page"
          checked={pageAllSelected}
          indeterminate={pageSelectedCount > 0 && !pageAllSelected}
          onChange={togglePage}
          disabled={!recipients.length}
        />
        <div className="relative min-w-48 flex-1 sm:max-w-sm">
          <Icon icon={Search} size="sm" tone="faint" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
            aria-label="Search recipients"
            className="pl-9"
          />
        </div>
        <IconButton icon={RefreshCw} label="Refresh" onClick={load} disabled={loading} />

        <div className="ml-auto flex items-center gap-1 text-xs text-app-text-muted">
          <span className="mr-1 whitespace-nowrap">
            {total ? `${from}–${to} of ${formatNumber(total)}` : "0 recipients"}
          </span>
          <IconButton icon={ChevronLeft} label="Previous page" onClick={() => setPage((p) => p - 1)} disabled={page <= 1 || loading} />
          <IconButton icon={ChevronRight} label="Next page" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages || loading} />
        </div>
      </div>

      {/* selection bar */}
      {selectedCount > 0 && (
        <div className="flex flex-wrap items-center gap-3 border-b border-app-border! bg-blue-500/5 px-3 py-2 text-sm">
          <span className="font-medium text-app-text">{formatNumber(selectedCount)} selected</span>
          {pageAllSelected && !allMatching && total > recipients.length && (
            <button type="button" onClick={() => setAllMatching(true)} className="text-blue-600 hover:underline dark:text-blue-400">
              Select all {formatNumber(total)}
              {debouncedSearch ? " matching" : ""}
            </button>
          )}
          <button type="button" onClick={clearSelection} className="text-app-text-muted hover:text-app-text hover:underline">
            Clear
          </button>
          <Button size="sm" icon={Send} onClick={composeToSelected} loading={preparing} className="ml-auto">
            Email {formatNumber(selectedCount)} {selectedCount === 1 ? "person" : "people"}
          </Button>
        </div>
      )}

      {/* rows */}
      {loading ? (
        <div className="divide-y divide-app-border!">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-3">
              <Skeleton className="size-4.5" />
              <Skeleton className="size-9 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
            </div>
          ))}
        </div>
      ) : failed ? (
        <div className="p-3">
          <ErrorState message="Could not load your recipients." onRetry={load} />
        </div>
      ) : recipients.length === 0 ? (
        <div className="p-3">
          <EmptyState
            icon={Users}
            title={debouncedSearch ? "No one matches that search" : "No recipients yet"}
            description={
              debouncedSearch
                ? "Try a different name or email."
                : "Leads with an email address show up here. You can also import a list from Excel."
            }
          />
        </div>
      ) : (
        <ul className="divide-y divide-app-border!">
          {recipients.map((r) => {
            const selected = allMatching || selectedIds.includes(r.id);
            return (
              <li
                key={r.id}
                onClick={() => !allMatching && toggleOne(r.id)}
                className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors ${selected ? "bg-blue-500/5" : "hover:bg-app-surface-secondary"}`}
              >
                <span onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    label={`Select ${r.email}`}
                    checked={selected}
                    onChange={() => toggleOne(r.id)}
                    disabled={allMatching}
                  />
                </span>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  {initials(r.name, r.email)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-app-text">{r.name || "No name"}</p>
                  <p className="truncate text-xs text-app-text-muted">{r.email}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default RecipientsPanel;
