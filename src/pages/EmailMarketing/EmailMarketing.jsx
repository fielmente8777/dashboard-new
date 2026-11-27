import { ChevronRight, FileSpreadsheet, FolderOpen, MailPlus, PenLine, Plus, Users } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import * as XLSX from "xlsx";
import GroupCampaignDialog from "../../components/Email/GroupCampaignDialog";
import ComposeEmail from "../../components/Email/ComposeEmail";
import SentEmailsPanel from "../../components/Email/SentEmailsPanel";
import DraftsPanel from "../../components/Email/DraftsPanel";
import PerformancePanel from "../../components/Email/PerformancePanel";
import EmailQuotaPanel from "../../components/Email/EmailQuotaPanel";
import ServiceReportButton from "../../components/reports/ServiceReportButton";
import SenderHealthPanel from "../../components/Email/SenderHealthPanel";
import WrongEmailsPanel from "./components/WrongEmailsPanel.jsx";
import Button from "../../components/ui/Button";
import PageShell from "../../components/ui/PageShell";
import Tabs from "../../components/ui/Tabs";
import { useToast } from "../../context/ToastContext";
import { createManualRecipientBatch, getEmailDraft } from "../../redux/api/emailMarketingApi";
import ExcelRecipientsDialog from "./components/ExcelRecipientsDialog.jsx";
import RecipientsPanel from "./components/RecipientsPanel.jsx";
import TemplatesList from "./components/TemplatesList.jsx";
import { EMAIL_REGEX, formatNumber, normalizeEmail } from "./emailUtils.js";
import { readSheetFile } from "./readSheetFile.js";
import { useCampaignSender } from "./useCampaignSender.js";
import { useRecipientReview } from "../Newsletter/useRecipientReview";
import GroupsPanel from "../Newsletter/GroupsPanel";
import ImportDialog from "../Newsletter/ImportDialog";

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
  const workbook = await readSheetFile(file);
  const found = [];
  const add = (value) => {
    const email = normalizeEmail(value);
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

// "Send an email to…": the four ways to start, always one click away
const StartRow = ({ actions }) => (
  <section aria-label="Send an email" className="space-y-2">
    <h2 className="text-xs font-semibold uppercase tracking-wide text-app-text-muted">Send an email to…</h2>
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
      {actions.map((action) => {
        const ActionIcon = action.icon;
        return (
          <button
            key={action.title}
            type="button"
            onClick={action.onClick}
            disabled={action.loading}
            className={`group flex items-center gap-3 rounded-xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60 ${
              action.primary
                ? "border-transparent! bg-gradient-to-br from-primary to-blue-600 text-white dark:from-blue-600 dark:to-indigo-500"
                : "border-app-border! bg-app-surface text-app-text"
            }`}
          >
            <span
              className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                action.primary ? "bg-white/15" : "bg-app-surface-secondary text-app-text-muted"
              }`}
            >
              <ActionIcon className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{action.title}</span>
              {/* two short lines on a phone instead of a cut-off one */}
              <span
                className={`line-clamp-2 text-xs leading-snug sm:block sm:truncate ${action.primary ? "text-white/80" : "text-app-text-muted"}`}
              >
                {action.description}
              </span>
            </span>
            <ChevronRight className="hidden size-4 shrink-0 opacity-60 transition group-hover:translate-x-0.5 sm:block" />
          </button>
        );
      })}
    </div>
  </section>
);

// Email marketing: start an email (to anyone, a group, your leads or a file),
// then see every email sent with who opened and clicked.
export function EmailMarketingManagement() {
  const { showToast } = useToast();
  const [view, setView] = useState("sent");
  const [groupImport, setGroupImport] = useState(null); // the group a file is imported into, or null
  // "Create group email campaign": null = closed, else the group chosen first ("" = none yet)
  const [picking, setPicking] = useState(null);
  // the sent email whose details are open
  const [openCampaignId, setOpenCampaignId] = useState(null);
  const [sentCount, setSentCount] = useState(0);
  const [reloadSent, setReloadSent] = useState(0);
  // drafts: saved by the compose window as it is written
  const [draftCount, setDraftCount] = useState(0);
  const [reloadDrafts, setReloadDrafts] = useState(0);
  const [openingDraft, setOpeningDraft] = useState(null);
  const refreshDrafts = useCallback(() => setReloadDrafts((n) => n + 1), []);
  // the compose window saved a new draft: remember its id, so opening it from the list
  // doesn't open a second, older copy
  const onDraftsChanged = useCallback(
    (createdId) => {
      refreshDrafts();
      if (createdId) setCompose((c) => (c && !c.draftId ? { ...c, draftId: createdId } : c));
    },
    [refreshDrafts],
  );

  /* compose / send */
  const [compose, setCompose] = useState(null); // { batchId, count, template, label }
  const { send, sending, defaultFrom } = useCampaignSender();
  // the "N selected people" chip in the email reviews who gets it (groups and imported lists)
  const review = useRecipientReview(compose, setCompose);
  const [clearSignal, setClearSignal] = useState(0);

  const openCompose = (template = null) => setCompose({ batchId: null, count: 0, template });

  // a saved draft opens in the compose window, with the people it was for
  const openDraft = async (id) => {
    if (compose?.draft?._id === id || compose?.draftId === id || openingDraft) return;
    setOpeningDraft(id);
    try {
      const { draft } = await getEmailDraft(id);
      setCompose({
        key: `draft-${draft._id}`,
        draft,
        batchId: draft.recipientBatchId || null,
        count: draft.recipientBatchId ? draft.recipientCount || 0 : 0,
        label: draft.recipientLabel || "",
        template: null,
      });
    } catch (error) {
      showToast({ message: error?.message || "Could not open the draft.", type: "error" });
      refreshDrafts();
    } finally {
      setOpeningDraft(null);
    }
  };

  // After sending, the page stays where it was, so the next group can go out
  // straight away; the toast links to the email's numbers.
  const handleSend = async ({ toEmails, subject, html, text, from, attachments }) => {
    try {
      const campaignId = await send({
        batchIds: compose?.batchId ? [compose.batchId] : [],
        toEmails,
        subject,
        html,
        text,
        from,
        attachments,
        // "Past guests", "selected leads"… shown in the Sent list
        audienceLabel: compose?.label || "",
      });

      const count = (compose?.count || 0) + toEmails.length;
      const to = compose?.label ? ` (${compose.label})` : "";
      showToast({
        message: `Sending to ${formatNumber(count)} ${count === 1 ? "person" : "people"}${to}.`,
        duration: 6000,
        action: campaignId
          ? {
              label: "View",
              onClick: () => {
                setView("sent");
                setOpenCampaignId(campaignId);
              },
            }
          : undefined,
      });
      setCompose(null);
      setClearSignal((n) => n + 1);
      setReloadSent((n) => n + 1);
      return true;
    } catch (error) {
      showToast({ message: error?.message || "Could not send the email. Please try again.", type: "error" });
      return false;
    }
  };

  /* Excel import */
  const excelInputRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [preparingList, setPreparingList] = useState(false);
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

  // a list of addresses becomes one recipient batch, then the compose window opens
  const composeToList = async (emails, label = "") => {
    setPreparingList(true);
    try {
      const res = await createManualRecipientBatch({ emails });
      const batchId = res?.doc?.recipientBatchId;
      if (!batchId) throw new Error();
      setExcelEmails(null);
      setCompose({ key: Date.now(), batchId, count: res?.doc?.count ?? emails.length, template: null, emails, label });
      // the server leaves out addresses that would only bounce (no such domain, "gmial.com")
      const dropped = res?.doc?.undeliverableCount || 0;
      if (dropped)
        showToast({
          message: `${dropped.toLocaleString("en-IN")} ${dropped === 1 ? "address was" : "addresses were"} left out: ${dropped === 1 ? "its" : "their"} domain can't receive email.`,
          type: "info",
          duration: 6000,
        });
    } catch {
      showToast({ message: "Could not prepare the recipients. Please try again.", type: "error" });
    } finally {
      setPreparingList(false);
    }
  };


  const startActions = [
    {
      icon: PenLine,
      title: "Anyone",
      description: "Type the addresses yourself",
      onClick: () => openCompose(),
      primary: true,
    },
    {
      icon: FolderOpen,
      title: "A group",
      description: "Everyone, or who opened / clicked",
      onClick: () => setPicking(""),
    },
    {
      icon: Users,
      title: "Your leads",
      description: "By source, status or date",
      onClick: () => setView("leads"),
    },
    {
      icon: FileSpreadsheet,
      title: "A file",
      description: "Excel or CSV of emails",
      onClick: () => excelInputRef.current?.click(),
      loading: importing,
    },
  ];

  const tabs = [
    { value: "sent", label: "Sent", count: sentCount },
    { value: "drafts", label: "Drafts", count: draftCount },
    { value: "groups", label: "Groups" },
    { value: "leads", label: "Leads" },
    { value: "templates", label: "Templates" },
    // "quota" kept as the value: old links (?tab=quota) still open it
    { value: "quota", label: "Sender health" },
    { value: "wrong", label: "Wrong emails" },
  ];

  return (
    <PageShell
      title="Email marketing"
      description="Send offers and news to your guests, then see who opened and clicked."
      actions={
        <>
          <input
            ref={excelInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={onExcelPicked}
            className="hidden"
          />
          {/* on a phone the "Send an email to…" tiles below do the same, so these step aside */}
          <Button variant="secondary" icon={Plus} onClick={() => setPicking("")} className="max-sm:hidden">
            <span className="hidden lg:inline">Create group email campaign</span>
            <span className="lg:hidden">Group campaign</span>
          </Button>
          <Button icon={Plus} onClick={() => openCompose()} className="max-sm:hidden">
            New email
          </Button>
          <ServiceReportButton part="emailMarketing" />
        </>
      }
    >
      <StartRow actions={startActions} />

      <div className="hide-scrollbar -mx-1 overflow-x-auto px-1">
        <Tabs tabs={tabs} value={view} onChange={setView} className="w-max" />
      </div>

      {/* kept mounted, so its numbers and list stay loaded while other tabs are open */}
      <div hidden={view !== "sent"} className="space-y-4">
        {/* how many went out today, from which address (hidden while an email is open) */}
        {!openCampaignId && <PerformancePanel reloadSignal={reloadSent} onOpenCampaign={setOpenCampaignId} />}
        <SentEmailsPanel
          showStats={false}
          reloadSignal={reloadSent}
          openId={openCampaignId}
          onOpenChange={setOpenCampaignId}
          onCount={setSentCount}
          onSendTo={({ batchId, count, label }) => setCompose({ key: `batch-${batchId}`, batchId, count, label, template: null })}
          empty={
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-app-border! bg-app-surface px-6 py-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <MailPlus className="size-6" />
              </span>
              <h2 className="mt-4 text-base font-semibold text-app-text">No emails sent yet</h2>
              <p className="mt-1 max-w-md text-sm text-app-text-muted">
                Bring past guests back with an offer, share a festive package, or say thank you. Pick who to send
                to above, and you&apos;ll see here who opened and clicked.
              </p>
              <Button icon={Plus} className="mt-5" onClick={() => openCompose()}>
                Write your first email
              </Button>
            </div>
          }
        />
      </div>

      {/* kept mounted too, so the tab's count is right before it is opened */}
      <div hidden={view !== "drafts"}>
        <DraftsPanel
          reloadSignal={reloadDrafts}
          onOpen={openDraft}
          openingId={openingDraft}
          onCount={setDraftCount}
          onNew={() => openCompose()}
        />
      </div>

      {view === "leads" && (
        <RecipientsPanel
          clearSignal={clearSignal}
          onCompose={({ batchId, count }) => setCompose({ batchId, count, template: null, label: "selected leads" })}
        />
      )}

      {view === "groups" && (
        <GroupsPanel kind="email" onSend={(names) => setPicking(names)} onImport={(name) => setGroupImport(name)} />
      )}

      {view === "templates" && <TemplatesList onUseTemplate={(template) => openCompose(template)} />}
      {view === "quota" && (
        <div className="space-y-8">
          <SenderHealthPanel />
          <EmailQuotaPanel />
        </div>
      )}
      {view === "wrong" && <WrongEmailsPanel />}
      <div className="h-14" aria-hidden="true" />

      <GroupCampaignDialog
        open={picking !== null}
        initialGroup={picking || ""}
        onManageGroups={() => {
          setPicking(null);
          setView("groups");
        }}
        onClose={() => setPicking(null)}
        onContinue={({ batchId, count, label, emails }) => {
          setPicking(null);
          setCompose({ key: `mix-${batchId}`, batchId, count, label, emails, template: null });
        }}
      />

      <ImportDialog open={groupImport !== null} group={groupImport || ""} onClose={() => setGroupImport(null)} />

      <ExcelRecipientsDialog
        emails={excelEmails}
        onClose={() => setExcelEmails(null)}
        onContinue={(emails) => composeToList(emails, "imported list")}
        preparing={preparingList}
      />

      {compose && (
        <ComposeEmail
          key={compose.key || compose.batchId || compose.template?._id || "new"}
          onClose={() => setCompose(null)}
          isBroadcast={Boolean(compose.batchId)}
          recipientCount={compose.count}
          initialTemplate={compose.template}
          onSend={handleSend}
          isSubmitting={sending}
          defaultFrom={defaultFrom}
          onReviewRecipients={review.canReview ? review.openReview : undefined}
          draftsEnabled
          initialDraft={compose.draft || null}
          recipientBatchId={compose.batchId || null}
          recipientLabel={compose.label || ""}
          onDraftsChanged={onDraftsChanged}
        />
      )}
      {review.dialog}
    </PageShell>
  );
}
