import { ArrowRight, Mail, MessageCircle, Phone, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Dialog from "../../components/ui/Dialog";
import { Field, Input, Textarea } from "../../components/ui/Field";
import Notice from "../../components/ui/Notice";
import Segmented from "../../components/ui/Segmented";
import { Skeleton } from "../../components/ui/States";
import { useToast } from "../../context/ToastContext";
import { createTradeRecipientBatch, previewTradeAudience } from "../../redux/api/emailMarketingApi";
import { PAGES, dashboardPath } from "../../routes/paths";
import { useCampaignSender } from "../EmailMarketing/useCampaignSender";
import { formatNumber } from "./tradeUtils";

const DEFAULT_SUBJECT = "Special rates for your guests";
const DEFAULT_MESSAGE = `Hello,

We have special B2B rates for groups and FITs this season, and we would love to host your guests.

Reply to this email and we will share our rate card and available dates.

Warm regards`;

const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const toHtml = (text) =>
  text
    .trim()
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("");

/** the Trade Directory page's selection, in the shape gian's trade audience takes */
const toAudience = (pool, selection) => {
  if (selection?.ids?.length) return { pool, ids: selection.ids };
  const f = selection?.filter || {};
  return {
    pool,
    segments: f.segments?.length ? f.segments : f.segment ? [f.segment] : [],
    state: f.state,
    city: f.city,
    search: f.search,
  };
};

/**
 * "Reach out" from the Trade Directory page. Email goes out like any campaign: gian makes the
 * list from the shared data and sends it from the hotel's own email (it then shows under Email
 * marketing → Sent, with opens and clicks). WhatsApp goes from the hotel's own number in
 * WhatsApp marketing (Trade partners), where its approved templates are.
 */
const OutreachDialog = ({ pool, selection, initialChannel, count, onClose, onSent }) => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { send, sending, defaultFrom } = useCampaignSender();
  const [channel, setChannel] = useState(initialChannel === "whatsapp" ? "whatsapp" : "email");
  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState(null);
  const [preparing, setPreparing] = useState(false);
  const audience = useMemo(() => toAudience(pool, selection), [pool, selection]);

  useEffect(() => {
    if (channel !== "email") return undefined;
    let live = true;
    setQuote(null);
    previewTradeAudience(audience)
      .then((res) => {
        if (!live) return;
        setQuote(res);
        setError(null);
      })
      .catch((e) => live && setError(e?.message || "Could not count the partners."));
    return () => {
      live = false;
    };
  }, [channel, audience]);

  const sendEmail = async () => {
    setPreparing(true);
    try {
      const batch = await createTradeRecipientBatch(audience);
      if (!batch?.recipientBatchId) throw new Error("Could not prepare the partners. Please try again.");
      await send({
        batchIds: [batch.recipientBatchId],
        subject: subject.trim(),
        html: toHtml(message),
        text: message.trim(),
        from: defaultFrom,
        audienceLabel: batch.label,
      });
      showToast({
        message: `Sending to ${formatNumber(batch.count)} partners from your email.`,
        type: "success",
        duration: 6000,
        action: { label: "View", onClick: () => navigate(dashboardPath(PAGES.MARKETING_EMAIL)) },
      });
      onSent?.();
    } catch (e) {
      showToast({ message: e?.message || "Could not send. Please try again.", type: "error" });
    } finally {
      setPreparing(false);
    }
  };

  const ready = channel === "email" && quote?.reachable > 0 && subject.trim() && message.trim() && defaultFrom;

  return (
    <Dialog
      open
      size="lg"
      title={count === 1 ? "Reach out" : `Reach out to ${formatNumber(count)} partners`}
      description="Sent from your own email or WhatsApp number, like your other campaigns."
      onClose={onClose}
      footer={
        channel === "email" ? (
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button icon={Send} loading={preparing || sending} disabled={!ready} onClick={sendEmail}>
              Send{quote ? ` to ${formatNumber(quote.reachable)}` : ""}
            </Button>
          </>
        ) : (
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        )
      }
    >
      <div className="space-y-4">
        <Segmented
          label="Channel"
          value={channel}
          onChange={setChannel}
          options={[
            { value: "email", label: <span className="flex items-center gap-1.5"><Mail className="size-4" aria-hidden />Email</span> },
            { value: "whatsapp", label: <span className="flex items-center gap-1.5"><MessageCircle className="size-4" aria-hidden />WhatsApp</span> },
            { value: "call", label: <span className="flex items-center gap-1.5"><Phone className="size-4" aria-hidden />Call</span> },
          ]}
        />

        {channel === "email" && (
          <>
            <Field label="Subject">
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={200} />
            </Field>
            <Field label="Message" hint="For a designed email (HTML), use Email marketing → Create group email campaign → Trade partners.">
              <Textarea rows={9} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={5000} />
            </Field>
            {error ? (
              <Notice tone="warning">{error}</Notice>
            ) : !quote ? (
              <Skeleton className="h-10" />
            ) : (
              <p className="text-xs text-app-text-muted">
                <b className="text-app-text">{formatNumber(quote.reachable)}</b> of these have an email address and haven&apos;t
                opted out. It goes from {defaultFrom || "your hotel email"}; replies come to you.
              </p>
            )}
          </>
        )}

        {channel === "whatsapp" && (
          <Notice
            tone="info"
            title="Send from WhatsApp marketing"
            actions={
              <Button size="sm" icon={ArrowRight} onClick={() => navigate(dashboardPath(PAGES.MARKETING_WHATSAPP))}>
                Open WhatsApp marketing
              </Button>
            }
          >
            WhatsApp goes from your own WhatsApp number with one of your approved templates. Open WhatsApp marketing → New
            campaign → Trade partners and pick these categories.
          </Notice>
        )}

        {channel === "call" && <Notice tone="info">Calling partners from the dashboard is coming soon.</Notice>}
      </div>
    </Dialog>
  );
};

export default OutreachDialog;
