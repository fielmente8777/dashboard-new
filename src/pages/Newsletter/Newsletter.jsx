import { AlertTriangle, Download, FileSpreadsheet, MailPlus, Send, UserPlus } from "lucide-react";
import { useState } from "react";
import AudiencePickerDialog from "../../components/Email/AudiencePickerDialog";
import ComposeEmail from "../../components/Email/ComposeEmail";
import UndoSendBar from "../../components/Email/UndoSendBar";
import { composeFromRestore, useOnUndone } from "../../components/Email/undoSend";
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
  const [sendGroup, setSendGroup] = useState([]); // the group(s) "Send" was pressed for
  // the group the Subscribers tab is showing ("" = everyone)
  const [listGroup, setListGroup] = useState("");
  const [exporting, setExporting] = useState(false);
  const [compose, setCompose] = useState(null); // { batchId, count }
  // a newsletter just sent, in its few minutes before it starts: { campaignId, scheduledAt, count, label }
  const [queued, setQueued] = useState(null);
  // the newsletters sent so far (Sent newsletters tab)
  const [sentCount, setSentCount] = useState(0);
  const [reloadSent, setReloadSent] = useState(0);
  // Undo (the bar or a campaign's card): nothing was sent, the newsletter opens again as it was
  useOnUndone((restore) => {
    setQueued(null);
    setCompose(composeFromRestore(restore));
    setReloadSent((n) => n + 1);
  });
  const [openCampaignId, setOpenCampaignId] = useState(null);

  const stats = useGetNewsletterStatsQuery();
  const settings = useGetNewsletterSettingsQuery();
  const { send, sending, defaultFrom } = useCampaignSender();
  // the "N selected people" chip in the email reviews who gets it
  const review = useRecipientReview(compose, setCompose);

  // the chosen addresses become one recipient batch, then the compose window opens
  const composeTo = async (emails) => {
    if (!emails.length) return;
    try {
      const res = await createManualRecipientBatch({ emails });
      const batchId = res?.doc?.recipientBatchId;
      if (!batchId) throw new Error();
      setChoosingAudience(false);
      setCompose({ key: Date.now(), batchId, count: res?.doc?.count ?? emails.length, emails, label: "" });
    } catch {
      showToast({ message: "Could not prepare the recipients. Please try again.", type: "error" });
    }
  };

  const handleSend = async ({ toEmails, subject, html, text, from, attachments, restore }) => {
    try {
      const { campaignId, scheduledAt } = await send({
        batchIds: [compose.batchId],
        toEmails,
        subject,
        html,
        text,
        from,
        attachments,
        name: `${NEWSLETTER_PREFIX}${subject}`,
        // "Past guests + Opened “Diwali offer”", shown in the Sent list
        audienceLabel: compose.label || "",
        restore,
      });
      const count = compose.count + toEmails.length;
      if (scheduledAt) {
        // waits a few minutes first: the bar offers Undo / Send now
        setQueued({ campaignId, scheduledAt, count, label: compose.label || "" });
      } else {
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
      }
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
          {/* on a phone these three are icons, so all four fit on one line */}
          <Button
            variant="secondary"
            icon={Download}
            loading={exporting}
            onClick={exportCsv}
            disabled={!stats.data?.total}
            title="Export"
            className="max-sm:px-2.5"
          >
            <span className="max-sm:sr-only">Export</span>
          </Button>
          <Button
            variant="secondary"
            icon={FileSpreadsheet}
            onClick={() => {
              setImportGroup("");
              setImporting(true);
            }}
            title="Import"
            className="max-sm:px-2.5"
          >
            <span className="max-sm:sr-only">Import</span>
          </Button>
          <Button variant="secondary" icon={UserPlus} onClick={() => setAdding(true)} title="Add subscriber" className="max-sm:px-2.5">
            <span className="max-sm:sr-only">Add</span>
          </Button>
          <Button
            icon={Send}
            onClick={() => {
              setSendGroup([]);
              setChoosingAudience(true);
            }}
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
          onSend={(names) => {
            setSendGroup(names);
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
                onClick={() => {
                  setSendGroup([]);
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
      {/* who gets it: any mix of the list, its groups, and people who opened / clicked earlier emails */}
      <AudiencePickerDialog
        open={choosingAudience}
        onClose={() => setChoosingAudience(false)}
        initialGroups={sendGroup}
        title="Send a newsletter"
        description="First pick who gets it. Tick as many as you like: each person gets it once, and people who unsubscribed are left out."
        onContinue={({ batchId, count, label, emails }) => {
          setChoosingAudience(false);
          setCompose({ key: Date.now(), batchId, count, emails, label });
        }}
        notice={
          (settings.data?.unsubscribeLinks ?? true) ? null : (
            <p className="flex items-start gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              Unsubscribe links aren&apos;t switched on for your account yet, so add a line telling people how to opt out (for
              example, reply &quot;unsubscribe&quot;). Contact Eazotel support to switch them on.
            </p>
          )
        }
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
          // kept with the email so Undo can bring back the same people
          recipientBatchId={compose.batchId || null}
          recipientLabel={compose.label || ""}
          initialDraft={compose.draft || null}
        />
      )}
      {review.dialog}
      <UndoSendBar
        queued={queued}
        onDone={() => {
          setQueued(null);
          setReloadSent((n) => n + 1);
        }}
      />
    </PageShell>
  );
}
