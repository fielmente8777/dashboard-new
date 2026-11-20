import { MailOpen, MousePointerClick, Paperclip, Users } from "lucide-react";
import { campaignStatus, formatNumber, percent } from "../../pages/EmailMarketing/emailUtils.js";
import Badge from "../ui/Badge";
import CampaignDeleteButton from "./CampaignDeleteButton";
import CampaignRunControl from "./CampaignRunControl";
import { avatarColor, mailDate, personName, recipientsSummary } from "./mailFormat";

// Sent emails as a Gmail list: who it went to, subject and first words, how it
// is doing, and the date. A row opens the message; on hover (or below it on
// phones) are Stop / Start and Delete.
//
//   campaigns           rows from gian GET /campaigns (with toPreview + snippet)
//   onOpen(campaign)    open the message
//   onChanged()         a run was stopped / started
//   onDeleted(c)        a campaign was deleted
export default function SentMailList({ campaigns, loading, onOpen, onChanged, onDeleted, emptyMessage }) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-app-surface-secondary" />
        ))}
      </div>
    );
  }

  if (!campaigns.length) {
    return (
      <p className="rounded-xl border border-app-border! bg-app-surface p-6 text-center text-sm text-app-text-muted">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-app-border overflow-hidden rounded-xl border border-app-border! bg-app-surface">
      {campaigns.map((c) => {
        const first = c.toPreview?.[0];
        const many = (c.recipientCount || 0) > 1;
        const status = campaignStatus(c.status);
        const showStatus = c.status !== "sent";
        const sent = c.stats?.sent || 0;
        return (
          <li key={c._id}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => onOpen(c)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen(c))}
              className="group flex cursor-pointer items-start gap-3 px-3 py-2.5 transition hover:bg-app-surface-secondary hover:shadow-[inset_3px_0_0_var(--color-primary,#2563eb)] focus-visible:bg-app-surface-secondary focus-visible:outline-none sm:items-center sm:px-4"
            >
              {/* who it went to */}
              <span
                className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold uppercase text-white sm:mt-0 ${
                  many ? "bg-slate-500" : avatarColor(first?.email)
                }`}
                aria-hidden
              >
                {many ? <Users className="size-4" /> : personName(first)[0] || "?"}
              </span>

              <div className="min-w-0 flex-1 lg:flex lg:items-center lg:gap-4">
                <div className="flex min-w-0 items-center gap-2 lg:w-60 lg:shrink-0">
                  <p className="min-w-0 truncate text-sm text-app-text">
                    <span className="text-app-text-muted">To: </span>
                    {recipientsSummary(c)}
                  </p>
                  {/* the date sits here on phones, at the far right on wider screens */}
                  <span className="ml-auto shrink-0 text-xs tabular-nums text-app-text-muted sm:hidden">
                    {mailDate(c.createdAt)}
                  </span>
                </div>

                <p className="mt-0.5 min-w-0 flex-1 truncate text-sm lg:mt-0">
                  {showStatus && (
                    <Badge tone={status.tone} className="mr-1.5 align-middle">
                      {status.label}
                    </Badge>
                  )}
                  <span className="font-medium text-app-text">{c.subject || c.name || "(no subject)"}</span>
                  {c.snippet && <span className="text-app-text-muted"> — {c.snippet}</span>}
                </p>

                {/* how it is doing */}
                <div className="mt-1 flex items-center gap-3 text-xs tabular-nums text-app-text-muted lg:mt-0 lg:shrink-0">
                  {c.attachments?.length > 0 && <Paperclip className="size-3.5" aria-label="Has attachments" />}
                  <span title={`${formatNumber(sent)} of ${formatNumber(c.recipientCount)} sent`}>
                    {formatNumber(sent)}/{formatNumber(c.recipientCount)} sent
                  </span>
                  <span className="inline-flex items-center gap-1" title={`${formatNumber(c.stats?.opened)} opened`}>
                    <MailOpen className="size-3.5" />
                    {percent(c.stats?.opened, sent)}%
                  </span>
                  <span className="inline-flex items-center gap-1" title={`${formatNumber(c.stats?.clicked)} clicked`}>
                    <MousePointerClick className="size-3.5" />
                    {percent(c.stats?.clicked, sent)}%
                  </span>
                  {c.stats?.failed > 0 && <span className="text-red-500">{formatNumber(c.stats.failed)} failed</span>}
                </div>
              </div>

              {/* date, swapped for the actions on hover */}
              <div
                className="hidden shrink-0 items-center gap-1 sm:flex"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <span
                  className="w-16 text-right text-xs tabular-nums text-app-text-muted group-hover:hidden group-focus-within:hidden"
                  title={new Date(c.createdAt).toLocaleString("en-IN")}
                >
                  {mailDate(c.createdAt)}
                </span>
                <div className="hidden items-center gap-1 group-hover:flex group-focus-within:flex">
                  <CampaignRunControl campaign={c} onChanged={onChanged} />
                  <CampaignDeleteButton campaign={c} onDeleted={onDeleted} />
                </div>
              </div>
            </div>

            {/* phones: actions under the row */}
            <div className="flex justify-end gap-2 px-3 pb-2 sm:hidden empty:hidden" onClick={(e) => e.stopPropagation()}>
              <CampaignRunControl campaign={c} onChanged={onChanged} />
              <CampaignDeleteButton campaign={c} onDeleted={onDeleted} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
