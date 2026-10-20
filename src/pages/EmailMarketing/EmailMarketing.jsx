import { FileSpreadsheet, Mail, Plus, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import CampaignsList from "../../components/Email/CampaignsList.jsx";
import ComposeEmail from "../../components/Email/ComposeEmail";
import Button from "../../components/ui/Button";
import PageShell from "../../components/ui/PageShell";
import { EmptyState, ErrorState } from "../../components/ui/States";
import Tabs from "../../components/ui/Tabs";
import { useToast } from "../../context/ToastContext";
import {
  createEmailCampaign,
  createManualRecipientBatch,
  getEmailCampaigns,
  sendEmailCampaign,
} from "../../redux/api/emailMarketingApi";
import EmailCampaignSummary from "./components/EmailCampaignSummary.jsx";
import ExcelRecipientsDialog from "./components/ExcelRecipientsDialog.jsx";
import RecipientsPanel from "./components/RecipientsPanel.jsx";
import TemplatesList from "./components/TemplatesList.jsx";
import { EMAIL_REGEX, formatNumber } from "./emailUtils.js";

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

// campaigns are loaded in one go so the totals and filters cover all of them
const CAMPAIGN_LIMIT = 500;

// Email marketing: campaigns sent so far with their opens and clicks, the
// leads to send to (or an imported list), and reusable templates.
export function EmailMarketingManagement() {
  const { showToast } = useToast();
  const hotel = useSelector((state) => state.userProfile.user);
  const [view, setView] = useState("campaigns");

  /* campaigns */
  const [campaigns, setCampaigns] = useState([]);
  const [campaignTotal, setCampaignTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [failed, setFailed] = useState(false);

  const loadCampaigns = useCallback(async ({ quiet = false } = {}) => {
    if (quiet) setRefreshing(true);
    setFailed(false);
    try {
      const res = await getEmailCampaigns({ page: 1, limit: CAMPAIGN_LIMIT });
      if (!res) throw new Error();
      setCampaigns(res.doc || []);
      setCampaignTotal(res.pagination?.total || res.doc?.length || 0);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  /* compose / send */
  const [compose, setCompose] = useState(null); // { batchId, count, template }
  const [sending, setSending] = useState(false);
  const [clearSignal, setClearSignal] = useState(0);

  const openCompose = (template = null) => setCompose({ batchId: null, count: 0, template });

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
      showToast({ message: `Sending to ${formatNumber(count)} ${count === 1 ? "person" : "people"}` });
      setCompose(null);
      setClearSignal((n) => n + 1);
      setView("campaigns");
      loadCampaigns({ quiet: true });
    } catch (error) {
      showToast({ message: error?.message || "Could not send the email. Please try again.", type: "error" });
    } finally {
      setSending(false);
    }
  };

  /* Excel import */
  const excelInputRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [preparingExcel, setPreparingExcel] = useState(false);
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
    setPreparingExcel(true);
    try {
      const res = await createManualRecipientBatch({ emails });
      const batchId = res?.doc?.recipientBatchId;
      if (!batchId) throw new Error();
      setExcelEmails(null);
      setCompose({ batchId, count: res?.doc?.count ?? emails.length, template: null });
    } catch {
      showToast({ message: "Could not prepare the recipients. Please try again.", type: "error" });
    } finally {
      setPreparingExcel(false);
    }
  };

  const newEmailButton = (
    <Button icon={Plus} onClick={() => openCompose()}>
      New email
    </Button>
  );

  const tabs = [
    { value: "campaigns", label: "Campaigns", count: campaignTotal },
    { value: "recipients", label: "Recipients" },
    { value: "templates", label: "Templates" },
  ];

  return (
    <PageShell
      title="Email Campaigns"
      description="Send emails and offers to your leads, then follow who opened and clicked."
      actions={
        <>
          <Button
            variant="secondary"
            icon={RefreshCw}
            loading={refreshing}
            onClick={() => loadCampaigns({ quiet: true })}
          >
            Refresh
          </Button>
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
          {newEmailButton}
        </>
      }
    >
      {!failed && (loading || campaigns.length > 0) && (
        <EmailCampaignSummary campaigns={campaigns} />
      )}

      <Tabs tabs={tabs} value={view} onChange={setView} />

      {view === "campaigns" &&
        (failed ? (
          <ErrorState message="Could not load your campaigns." onRetry={() => loadCampaigns()} />
        ) : !loading && campaigns.length === 0 ? (
          <EmptyState
            icon={Mail}
            title="No campaigns yet"
            description="Pick leads under Recipients, or import a list, to send your first email."
            action={newEmailButton}
          />
        ) : (
          <CampaignsList campaigns={campaigns} loading={loading} />
        ))}

      {view === "recipients" && (
        <RecipientsPanel
          clearSignal={clearSignal}
          onCompose={({ batchId, count }) => setCompose({ batchId, count, template: null })}
        />
      )}

      {view === "templates" && <TemplatesList onUseTemplate={(template) => openCompose(template)} />}

      <ExcelRecipientsDialog
        emails={excelEmails}
        onClose={() => setExcelEmails(null)}
        onContinue={composeToExcel}
        preparing={preparingExcel}
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
    </PageShell>
  );
}
