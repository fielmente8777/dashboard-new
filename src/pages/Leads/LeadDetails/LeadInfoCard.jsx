import { Mail, MessageCircle, Phone } from "lucide-react";
import Card from "../../../components/ui/Card";
import Detail from "../../../components/ui/Detail";
import CustomDropdown from "../../../components/ui/Dropdown";
import { Field } from "../../../components/ui/Field";
import Icon from "../../../components/ui/Icon";
import IconButton from "../../../components/ui/IconButton";
import { Stages, TurnAwayCode } from "../../../data/constant";
import { normalizePhoneNumber } from "../../../utils/normalizePhoneNumber";
import {
  getLeadSourceLabel,
  getLeadSourceUrl,
  getSourceUrlParams,
} from "../leadUtils";

// Who the lead is, where it came from, and the controls to work it.
// Actions are passed in:
//   onWhatsApp()  onCall()  onStageChange(stage)  onTurnAway(code)  onAssign(user)
const LeadInfoCard = ({
  lead,
  users,
  onWhatsApp,
  onCall,
  onStageChange,
  onTurnAway,
  onAssign,
}) => {
  const sourceUrl = getLeadSourceUrl(lead);
  const urlParams = getSourceUrlParams(lead);

  return (
    <Card
      title="Customer information"
      description={`Created from ${getLeadSourceLabel(lead)}`}
    >
      <dl className="grid gap-4 sm:grid-cols-2">
        <Detail label="Mobile number">
          {lead.Contact && (
            <span className="flex items-center gap-1">
              {normalizePhoneNumber(lead.Contact)}
              <IconButton
                icon={MessageCircle}
                label="Send a WhatsApp message"
                tone="success"
                onClick={onWhatsApp}
              />
              <IconButton icon={Phone} label="Call" onClick={onCall} />
            </span>
          )}
        </Detail>
        <Detail label="Email address">
          {lead.Email && (
            <a
              href={`mailto:${lead.Email}`}
              className="inline-flex items-center gap-1.5 hover:text-blue-500"
            >
              <Icon icon={Mail} size="sm" />
              {lead.Email}
            </a>
          )}
        </Detail>
        {lead.check_in && <Detail label="Check in">{lead.check_in}</Detail>}
        {lead.check_out && <Detail label="Check out">{lead.check_out}</Detail>}
        {lead.number_of_guest && (
          <Detail label="Guests">{lead.number_of_guest}</Detail>
        )}
      </dl>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Field label="Attempted by" as="div">
          <CustomDropdown
            key={`assignee-${lead._id}-${lead.assignee}`}
            label={lead.assignee || "Select user"}
            options={users.map((user) => ({
              value: user.userName,
              label: user.userName,
            }))}
            onChange={(userName) =>
              onAssign(users.find((user) => user.userName === userName))
            }
          />
        </Field>
        <Field label="Stage" as="div">
          <CustomDropdown
            key={`stage-${lead._id}-${lead.status}`}
            label={lead.status}
            options={Stages}
            onChange={onStageChange}
          />
        </Field>
        <Field label="Turn away code" as="div">
          <CustomDropdown
            key={`code-${lead._id}-${lead.turnAwayCode}`}
            label={lead.turnAwayCode || "Select code"}
            options={TurnAwayCode}
            onChange={onTurnAway}
          />
        </Field>
      </div>

      {sourceUrl && (
        <div className="mt-5 border-t border-app-border! pt-4">
          <p className="text-xs text-app-text-muted">Source page</p>
          <a
            href={sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-0.5 block break-all text-sm text-blue-500 hover:underline"
          >
            {sourceUrl}
          </a>

          {urlParams.length > 0 && (
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              {urlParams.map((param) => (
                <Detail key={param.label} label={param.label}>
                  {param.value}
                </Detail>
              ))}
            </dl>
          )}
        </div>
      )}
    </Card>
  );
};

export default LeadInfoCard;
