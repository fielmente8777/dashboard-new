import {
  Check,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Mail,
  Minus,
  PenLine,
  RefreshCw,
  Search,
  Send,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import CampaignsList from "../../components/Email/CampaignsList.jsx";
import ComposeEmail from "../../components/Email/ComposeEmail";
import Button from "../../components/ui/Button";
import { Input } from "../../components/ui/Field";
import Icon from "../../components/ui/Icon";
import IconButton from "../../components/ui/IconButton";
import { EmptyState, ErrorState, Skeleton } from "../../components/ui/States";
import Tabs from "../../components/ui/Tabs";
import { useToast } from "../../context/ToastContext";
import useDebounce from "../../hooks/useDebounce";
import {
  createEmailCampaign,
  createLeadRecipientBatch,
  createLeadRecipientBatchFromFilter,
  createManualRecipientBatch,
  getEmailRecipients,
  sendEmailCampaign,
} from "../../services/api/emailCampaign.js";
import ExcelRecipientsDialog from "./components/ExcelRecipientsDialog.jsx";
import TemplatesList from "./components/TemplatesList.jsx";
import { EMAIL_REGEX } from "./emailUtils.js";

/* ---------------- Excel import ---------------- */

const normalizeHeader = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

const EMAIL_COLUMN_NAMES = new Set([
  "email", "emailaddress", "emailid", "emailids", "mail", "mailid", "mailaddress",
  "recipient", "recipientemail", "recipientemailaddress", "e-mail", "e-mailaddress",
]);

// Every valid email in the file: from "email"-like columns when the sheet has
// them, otherwise from any cell.
const extractEmailsFromExcel = async (file) => {
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const found = [];
  const add = (value) => {
    const email = String(value ?? "").trim().toLowerCase();
    if (EMAIL_REGEX.test(email)) found.push(email);
  };

  workbook.SheetNames.forEach((sheetName) => {
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: 1,
      defval: "",
      raw: false,
    });
    if (!rows.length) return;

    const emailColumns = (rows[0] || [])
      .map((header, index) => (EMAIL_COLUMN_NAMES.has(normalizeHeader(header)) ? index : -1))
      .filter((index) => index >= 0);

    if (emailColumns.length) {
      rows.slice(1).forEach((row) => emailColumns.forEach((i) => add(row[i])));
    } else {
      rows.forEach((row) => row.forEach(add));
    }
  });

  return [...new Set(found)];
};

/* ---------------- page ---------------- */

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

// Email marketing: pick leads (or import a list), write an email, send it as
// a campaign; see past campaigns and manage reusable templates.
export function EmailMarketingManagement() {
  const { showToast } = useToast();
  const hotel = useSelector((state) => state.userProfile.user);
  const [view, setView] = useState("recipients");

  /* recipients: paginated, searchable leads that have an email */
  const [recipients, setRecipients] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 350);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [allMatching, setAllMatching] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const loadRecipients = useCallback(async () => {
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
    loadRecipients();
  }, [loadRecipients]);

  // a new search starts again from page 1 with nothing selected
  useEffect(() => {
    setPage(1);
    setSelectedIds([]);
    setAllMatching(false);
  }, [debouncedSearch]);

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

  const clearSelection = () => {
    setAllMatching(false);
    setSelectedIds([]);
  };

  /* compose / send */
  const [compose, setCompose] = useState(null); // { batchId, count, template }
  const [preparing, setPreparing] = useState(false);
  const [sending, setSending] = useState(false);

  const openCompose = (template = null) => setCompose({ batchId: null, count: 0, template });

  // the selected leads become a recipient batch on the server first
  const composeToSelected = async () => {
    if (!selectedCount) return;
    setPreparing(true);
    try {
      const res = allMatching
        ? await createLeadRecipientBatchFromFilter({ search: debouncedSearch })
        : await createLeadRecipientBatch({ leadIds: selectedIds });
      const batchId = res?.doc?.recipientBatchId;
      if (!batchId) throw new Error();
      setCompose({ batchId, count: res?.doc?.count ?? selectedCount, template: null });
    } catch {
      showToast({ message: "Could not prepare the recipients. Please try again.", type: "error" });
    } finally {
      setPreparing(false);
    }
  };

  const handleSend = async ({ toEmails, subject, html, text, from, attachments }) => {
    setSending(true);
    try {
      const batchIds = compose?.batchId ? [compose.batchId] : [];
      // addresses typed into "To" go out too, as their own batch
      if (toEmails.length) {
        const res = await createManualRecipientBatch({ emails: toEmails });
        const batchId = res?.doc?.recipientBatchId;
        if (!batchId) throw new Error("Could not prepare the recipients.");
        batchIds.push(batchId);
      }

      const campaignRes = await createEmailCampaign({
        name: subject,
        subject,
        html,
        text,
        fromName: hotel?.Profile?.hotelName,
        fromEmail: from,
        recipientBatchIds: batchIds,
        attachments,
      });
      const campaignId = campaignRes?.doc?.campaign?._id;
      if (!campaignId) throw new Error("Could not create the campaign.");

      await sendEmailCampaign({ campaignId });

      const count = (compose?.count || 0) + toEmails.length;
      showToast({ message: `Sending to ${count} ${count === 1 ? "person" : "people"}. Track it under Campaigns.` });
      setCompose(null);
      clearSelection();
    } catch (error) {
      showToast({ message: error?.message || "Could not send the email. Please try again.", type: "error" });
    } finally {
      setSending(false);
    }
  };

  /* Excel import */
  const excelInputRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [excelEmails, setExcelEmails] = useState(null);

  const onExcelPicked = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setImporting(true);
    try {
      const emails = await extractEmailsFromExcel(file);
      if (!emails.length) {
        showToast({ message: "No email addresses were found in that file.", type: "error" });
        return;
      }
      setExcelEmails(emails);
    } catch {
      showToast({ message: "Could not read that file. Use an .xlsx, .xls or .csv file.", type: "error" });
    } finally {
      setImporting(false);
    }
  };

  const composeToExcel = async (emails) => {
    setPreparing(true);
    try {
      const res = await createManualRecipientBatch({ emails });
      const batchId = res?.doc?.recipientBatchId;
      if (!batchId) throw new Error();
      setExcelEmails(null);
      setCompose({ batchId, count: res?.doc?.count ?? emails.length, template: null });
    } catch {
      showToast({ message: "Could not prepare the recipients. Please try again.", type: "error" });
    } finally {
      setPreparing(false);
    }
  };

  const tabs = [
    { value: "recipients", label: `Recipients${total ? ` (${total.toLocaleString("en-IN")})` : ""}` },
    { value: "campaigns", label: "Campaigns" },
    { value: "templates", label: "Templates" },
  ];

  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-4 p-1 pb-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-semibold text-app-text">
            <Mail className="size-5 text-blue-600 dark:text-blue-400" />
            Email marketing
          </h1>
          <p className="text-xs text-app-text-muted">
            Send emails and offers to your leads, then see who opened and clicked.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={excelInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={onExcelPicked}
            className="hidden"
          />
          <Button
            variant="secondary"
            icon={FileSpreadsheet}
            onClick={() => excelInputRef.current?.click()}
            loading={importing}
          >
            Import list
          </Button>
          <Button icon={PenLine} onClick={() => openCompose()}>
            Compose
          </Button>
        </div>
      </div>

      <Tabs tabs={tabs} value={view} onChange={setView} />

      {view === "recipients" && (
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
                className="pl-9"
              />
            </div>
            <IconButton icon={RefreshCw} label="Refresh" onClick={loadRecipients} disabled={loading} />

            <div className="ml-auto flex items-center gap-1 text-xs text-app-text-muted">
              <span className="mr-1 whitespace-nowrap">
                {total ? `${from}–${to} of ${total.toLocaleString("en-IN")}` : "0 recipients"}
              </span>
              <IconButton icon={ChevronLeft} label="Previous page" onClick={() => setPage((p) => p - 1)} disabled={page <= 1 || loading} />
              <IconButton icon={ChevronRight} label="Next page" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages || loading} />
            </div>
          </div>

          {/* selection bar */}
          {selectedCount > 0 && (
            <div className="flex flex-wrap items-center gap-3 border-b border-app-border! bg-blue-500/5 px-3 py-2 text-sm">
              <span className="font-medium text-app-text">
                {selectedCount.toLocaleString("en-IN")} selected
              </span>
              {pageAllSelected && !allMatching && total > recipients.length && (
                <button type="button" onClick={() => setAllMatching(true)} className="text-blue-600 hover:underline dark:text-blue-400">
                  Select all {total.toLocaleString("en-IN")}
                  {debouncedSearch ? " matching" : ""}
                </button>
              )}
              <button type="button" onClick={clearSelection} className="text-app-text-muted hover:text-app-text hover:underline">
                Clear
              </button>
              <Button size="sm" icon={Send} onClick={composeToSelected} loading={preparing} className="ml-auto">
                Email {selectedCount.toLocaleString("en-IN")} {selectedCount === 1 ? "person" : "people"}
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
              <ErrorState message="Could not load your recipients." onRetry={loadRecipients} />
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
      )}

      {view === "campaigns" && <CampaignsList onCompose={() => openCompose()} />}
      {view === "templates" && <TemplatesList onUseTemplate={(template) => openCompose(template)} />}

      <ExcelRecipientsDialog
        emails={excelEmails}
        onClose={() => setExcelEmails(null)}
        onContinue={composeToExcel}
        preparing={preparing}
      />

      {compose && (
        <ComposeEmail
          key={compose.batchId || compose.template?._id || "new"}
          onClose={() => setCompose(null)}
          isBroadcast={Boolean(compose.batchId)}
          recipientCount={compose.count}
          initialTemplate={compose.template}
          onSend={handleSend}
          isSubmitting={sending}
          defaultFrom={hotel?.Profile?.hotelEmail}
        />
      )}
    </div>
  );
}

