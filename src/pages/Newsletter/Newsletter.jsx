import { Download, FileSpreadsheet, MailPlus, Send, UserPlus } from "lucide-react";
import { useState } from "react";
import ComposeEmail from "../../components/Email/ComposeEmail";
import SentEmailsPanel from "../../components/Email/SentEmailsPanel";
import Button from "../../components/ui/Button";
import PageShell from "../../components/ui/PageShell";
import Tabs from "../../components/ui/Tabs";
import { useToast } from "../../context/ToastContext";
import { createManualRecipientBatch } from "../../redux/api/emailMarketingApi";
import {
  downloadSubscribersCsv,
  useGetNewsletterSettingsQuery,
  useGetNewsletterStatsQuery,
} from "../../redux/api/newsletterApi";
import { useCampaignSender } from "../EmailMarketing/useCampaignSender";
import { useRecipientReview } from "./useRecipientReview";
import AddSubscriberDialog from "./AddSubscriberDialog";
import GroupsPanel from "./GroupsPanel";
import ImportDialog from "./ImportDialog";
import NewsletterOverview from "./NewsletterOverview";
import NewsletterSettings from "./NewsletterSettings";
import SendNewsletterDialog from "./SendNewsletterDialog";
import SubscribersPanel from "./SubscribersPanel";
import { formatNumber } from "./newsletterUtils";

// newsletters are sent as Email marketing campaigns named "Newsletter: <subject>"
const NEWSLETTER_PREFIX = "Newsletter: ";
const isNewsletter = (campaign) => String(campaign.name || "").startsWith(NEWSLETTER_PREFIX);

// Newsletter: who is on the list and how it grows, adding / importing / tagging people,
// sending a newsletter (through Email marketing, so it gets open and click stats), and the
// website signup box with its welcome email.
export default function Newsletter() {
  const { showToast } = useToast();
  const [view, setView] = useState("subscribers");
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importGroup, setImportGroup] = useState("");
  const [choosingAudience, setChoosingAudience] = useState(false);
  const [sendGroup, setSendGroup] = useState("");
  // the group the Subscribers tab is showing ("" = everyone)
  const [listGroup, setListGroup] = useState("");
  const [preparing, setPreparing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [compose, setCompose] = useState(null); // { batchId, count }
  // the newsletters sent so far (Sent newsletters tab)
  const [sentCount, setSentCount] = useState(0);
  const [reloadSent, setReloadSent] = useState(0);
  const [openCampaignId, setOpenCampaignId] = useState(null);

  const stats = useGetNewsletterStatsQuery();
  const settings = useGetNewsletterSettingsQuery();
  const { send, sending, defaultFrom } = useCampaignSender();
  // the "N selected people" chip in the email reviews who gets it
  const review = useRecipientReview(compose, setCompose);

  // the chosen addresses become one recipient batch, then the compose window opens
  const composeTo = async (emails) => {
    if (!emails.length) return;
    setPreparing(true);
    try {
      const res = await createManualRecipientBatch({ emails });
      const batchId = res?.doc?.recipientBatchId;
      if (!batchId) throw new Error();
      setChoosingAudience(false);
      setCompose({ key: Date.now(), batchId, count: res?.doc?.count ?? emails.length, emails, label: choosingAudience ? sendGroup : "" });
    } catch {
      showToast({ message: "Could not prepare the recipients. Please try again.", type: "error" });
    } finally {
      setPreparing(false);
    }
  };

  const handleSend = async ({ toEmails, subject, html, text, from, attachments }) => {
    try {
      const campaignId = await send({
        batchIds: [compose.batchId],
        toEmails,
        subject,
        html,
        text,
        from,
        attachments,
        name: `${NEWSLETTER_PREFIX}${subject}`,
      });
      const count = compose.count + toEmails.length;
      // stays on the same tab, so another group can be sent to straight away
      showToast({
        message: `Sending to ${formatNumber(count)} ${count === 1 ? "person" : "people"}${compose.label ? ` (${compose.label})` : ""}.`,
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
      setReloadSent((n) => n + 1);
    } catch (error) {
      showToast({ message: error?.message || "Could not send the newsletter. Please try again.", type: "error" });
    }
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      await downloadSubscribersCsv();
    } catch (error) {
      showToast({ message: error.message, type: "error" });
    } finally {
      setExporting(false);
    }
  };

  const tabs = [
    { value: "subscribers", label: "Subscribers", count: stats.data?.total },
    { value: "groups", label: "Groups" },
    { value: "sent", label: "Sent newsletters", count: sentCount },
    { value: "settings", label: "Signup & welcome" },
  ];

  return (
    <PageShell
      title="Newsletter"
      description="Everyone who signed up for your news and offers, and the emails you send them."
      actions={
        <>
          <Button variant="secondary" icon={Download} loading={exporting} onClick={exportCsv} disabled={!stats.data?.total}>
            Export
          </Button>
          <Button
            variant="secondary"
            icon={FileSpreadsheet}
            onClick={() => {
              setImportGroup("");
              setImporting(true);
            }}
          >
            Import
          </Button>
          <Button variant="secondary" icon={UserPlus} onClick={() => setAdding(true)}>
            Add
          </Button>
          <Button
            icon={Send}
            onClick={() => {
              setSendGroup("");
              setChoosingAudience(true);
            }}
            disabled={!stats.data?.subscribed}
          >
            Send newsletter
          </Button>
        </>
      }
    >
      {/* on a failed load the list below shows the error and "Try again" */}
      {!stats.isError && <NewsletterOverview stats={stats.data} loading={stats.isLoading} />}

      <div className="hide-scrollbar -mx-1 overflow-x-auto px-1">
        <Tabs tabs={tabs} value={view} onChange={setView} className="w-max" />
      </div>

      {view === "subscribers" && (
        <SubscribersPanel
          onSendTo={composeTo}
          onAdd={() => setAdding(true)}
          onImport={() => setImporting(true)}
          onRetry={() => stats.refetch()}
          group={listGroup}
          onGroupChange={setListGroup}
        />
      )}
      {view === "groups" && (
        <GroupsPanel
          onSend={(name) => {
            setSendGroup(name);
            setChoosingAudience(true);
          }}
          onImport={(name) => {
            setImportGroup(name);
            setImporting(true);
          }}
        />
      )}
      {/* kept mounted, so the count on its tab is right from the start */}
      <div hidden={view !== "sent"}>
        <SentEmailsPanel
          filter={isNewsletter}
          label="Newsletters sent"
          reloadSignal={reloadSent}
          openId={openCampaignId}
          onOpenChange={setOpenCampaignId}
          onCount={setSentCount}
          empty={
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-app-border! bg-app-surface px-6 py-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <MailPlus className="size-6" />
              </span>
              <h2 className="mt-4 text-base font-semibold text-app-text">No newsletters sent yet</h2>
              <p className="mt-1 max-w-md text-sm text-app-text-muted">
                Each newsletter you send shows here, with how many people got it, opened it and clicked.
              </p>
              <Button
                icon={Send}
                className="mt-5"
                disabled={!stats.data?.subscribed}
                onClick={() => {
                  setSendGroup("");
                  setChoosingAudience(true);
                }}
              >
                Send a newsletter
              </Button>
            </div>
          }
        />
      </div>
      {view === "settings" && <NewsletterSettings />}
      <div className="h-14" aria-hidden="true" />

      <AddSubscriberDialog open={adding} onClose={() => setAdding(false)} />
      <ImportDialog open={importing} group={importGroup} onClose={() => setImporting(false)} />
      <SendNewsletterDialog
        open={choosingAudience}
        onClose={() => setChoosingAudience(false)}
        onContinue={composeTo}
        preparing={preparing}
        group={sendGroup}
        linksOn={settings.data?.unsubscribeLinks ?? true}
      />

      {compose && (
        <ComposeEmail
          key={compose.key}
          onClose={() => setCompose(null)}
          isBroadcast
          recipientCount={compose.count}
          onSend={handleSend}
          isSubmitting={sending}
          defaultFrom={defaultFrom}
          onReviewRecipients={review.canReview ? review.openReview : undefined}
        />
      )}
      {review.dialog}
    </PageShell>
  );
}
