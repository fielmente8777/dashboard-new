import {
  CalendarCheck,
  Clock,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Icon from "../../../components/ui/Icon";
import { formatDateTime, timeAgo } from "../../../utils/formateDate";
import {
  getFollowUpState,
  getLeadCreatedAt,
  getLeadEmail,
  getLeadInitials,
  getLeadName,
  getLeadPhone,
  getLeadSourceLabel,
  getSourceStyle,
  getStageTone,
} from "../leadUtils";

const FOLLOW_UP_BADGES = {
  overdue: { tone: "red", label: "Follow-up overdue" },
  today: { tone: "amber", label: "Follow up today" },
  upcoming: { tone: "sky", label: "Follow-up scheduled" },
};

// The top of a lead: who it is, where it stands, and the ways to reach them.
// Actions are passed in: onWhatsApp()  onCall()  onConvert()
const LeadHeader = ({ lead, checkingWhatsApp, onWhatsApp, onCall, onConvert }) => {
  const phone = getLeadPhone(lead);
  const email = getLeadEmail(lead);
  const createdAt = getLeadCreatedAt(lead);
  const followUp = FOLLOW_UP_BADGES[getFollowUpState(lead)];

  return (
    <section className="relative overflow-hidden rounded-xl border border-app-border! bg-app-surface">
      <div
        className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-blue-500/20 via-indigo-500/15 to-emerald-500/20 dark:from-blue-500/25 dark:via-indigo-500/20 dark:to-emerald-500/20"
        aria-hidden="true"
      />
      <div className="relative flex flex-wrap items-end justify-between gap-4 p-4 pt-8 sm:p-5 sm:pt-10">
        <div className="flex min-w-0 items-center gap-4">
          {/* a solid base under the tinted avatar, so the banner does not show through */}
          <span
            className="shrink-0 rounded-2xl bg-app-surface p-1 shadow-sm"
            aria-hidden="true"
          >
            <span
              className={`flex size-14 items-center justify-center rounded-xl text-xl font-semibold ${getSourceStyle(lead)}`}
            >
              {getLeadInitials(lead) || "?"}
            </span>
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold text-app-text">
              {getLeadName(lead)}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {lead.status && (
                <Badge tone={getStageTone(lead.status)}>{lead.status}</Badge>
              )}
              <span
                className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium capitalize ${getSourceStyle(lead)}`}
              >
                {getLeadSourceLabel(lead).replace(/_/g, " ")}
              </span>
              {lead.turnAwayCode && (
                <Badge tone="red">Code {lead.turnAwayCode}</Badge>
              )}
              {followUp && <Badge tone={followUp.tone}>{followUp.label}</Badge>}
            </div>
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-app-text-muted">
              <Icon icon={Clock} size="xs" />
              {formatDateTime(createdAt)} · {timeAgo(createdAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {phone && (
            <>
              <Button
                icon={checkingWhatsApp ? Loader2 : MessageCircle}
                disabled={checkingWhatsApp}
                className={`bg-emerald-600! text-white hover:bg-emerald-500! ${checkingWhatsApp ? "[&_svg]:animate-spin" : ""}`}
                onClick={onWhatsApp}
              >
                WhatsApp
              </Button>
              <Button variant="secondary" icon={Phone} onClick={onCall}>
                Call
              </Button>
            </>
          )}
          {email && (
            <Button
              variant="secondary"
              icon={Mail}
              onClick={() => window.location.assign(`mailto:${email}`)}
            >
              Email
            </Button>
          )}
          <Button icon={CalendarCheck} onClick={onConvert}>
            Convert to booking
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LeadHeader;
