import { Check, Copy, Mail, Phone } from "lucide-react";
import { useState } from "react";
import Card from "../../../components/ui/Card";
import Detail from "../../../components/ui/Detail";
import Icon from "../../../components/ui/Icon";
import IconButton from "../../../components/ui/IconButton";
import { formatDateTime, timeAgo } from "../../../utils/formateDate";
import { normalizePhoneNumber } from "../../../utils/normalizePhoneNumber";
import { getLeadCreatedAt, getLeadEmail, getLeadPhone } from "../leadUtils";

// A value with a button that copies it.
const CopyButton = ({ text, label }) => {
  const [copied, setCopied] = useState(false);
  return (
    <IconButton
      icon={copied ? Check : Copy}
      label={copied ? "Copied" : label}
      size="sm"
      tone={copied ? "success" : "default"}
      className="size-7!"
      onClick={() =>
        navigator.clipboard?.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }, () => {})
      }
    />
  );
};

const ContactRow = ({ icon, href, text, copyLabel }) => (
  <div className="flex min-w-0 items-center gap-3 rounded-lg bg-app-surface-secondary/60 px-3 py-2">
    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-app-surface text-app-text-muted">
      <Icon icon={icon} size="sm" />
    </span>
    <a
      href={href}
      className="min-w-0 flex-1 truncate text-sm font-medium text-app-text hover:text-blue-500"
      title={text}
    >
      {text}
    </a>
    <CopyButton text={text} label={copyLabel} />
  </div>
);

// How to reach the lead, and the facts about it at a glance.
const LeadInfoCard = ({ lead }) => {
  const phone = getLeadPhone(lead);
  const email = getLeadEmail(lead);
  const createdAt = getLeadCreatedAt(lead);
  const updatedAt = lead.updatedAt || lead.updated_at;
  const followUpAt = lead.followUpDate || lead.followUp;
  const notes = Array.isArray(lead.notes) ? lead.notes : [];
  const lastNoteAt = notes.at(-1)?.createdAt;

  return (
    <Card title="Contact & overview">
      <div className="space-y-2">
        {phone && (
          <ContactRow
            icon={Phone}
            href={`tel:${phone}`}
            text={normalizePhoneNumber(phone)}
            copyLabel="Copy number"
          />
        )}
        {email && (
          <ContactRow
            icon={Mail}
            href={`mailto:${email}`}
            text={email}
            copyLabel="Copy email"
          />
        )}
        {!phone && !email && (
          <p className="text-sm text-app-text-muted">
            No contact details were left.
          </p>
        )}
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-app-border! pt-4">
        <Detail label="Lead age">{timeAgo(createdAt)}</Detail>
        <Detail label="Last updated">
          {updatedAt ? timeAgo(updatedAt) : "—"}
        </Detail>
        <Detail label="Attempted by">{lead.assignee}</Detail>
        <Detail label="Follow up">
          {followUpAt ? formatDateTime(followUpAt) : "Not set"}
        </Detail>
        <Detail label="Notes">
          {notes.length
            ? `${notes.length}${lastNoteAt ? ` · last ${timeAgo(lastNoteAt)}` : ""}`
            : "None yet"}
        </Detail>
        <Detail label="Converted">
          {lead.is_converted ? "Yes" : "No"}
        </Detail>
        {lead._id && (
          <div className="col-span-2 min-w-0">
            <dt className="text-xs text-app-text-muted">Lead ID</dt>
            <dd className="mt-0.5 flex items-center gap-1 text-xs font-medium text-app-text-muted">
              <span className="truncate font-mono">{lead._id}</span>
              <CopyButton text={lead._id} label="Copy lead ID" />
            </dd>
          </div>
        )}
      </dl>
    </Card>
  );
};

export default LeadInfoCard;
