import { ExternalLink } from "lucide-react";
import Card from "../../../components/ui/Card";
import Detail from "../../../components/ui/Detail";
import Icon from "../../../components/ui/Icon";
import {
  getCampaignDetails,
  getLeadSourceLabel,
  getLeadSourceUrl,
  getRequestDetails,
  getSourceUrlParams,
} from "../leadUtils";

const Section = ({ title, children }) => (
  <div className="border-t border-app-border! pt-4 first:border-t-0 first:pt-0">
    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-app-text-faint">
      {title}
    </h3>
    {children}
  </div>
);

const DetailGrid = ({ details }) => (
  <dl className="grid gap-4 sm:grid-cols-2">
    {details.map((detail) => (
      <Detail key={detail.label} label={detail.label}>
        {detail.value}
      </Detail>
    ))}
  </dl>
);

// Where the lead came from: the ad, the page and its tracking parameters,
// and the visitor's device and location. Nothing is shown when none of
// that was recorded.
const LeadSourceCard = ({ lead }) => {
  const campaign = getCampaignDetails(lead);
  const sourceUrl = getLeadSourceUrl(lead);
  const urlParams = getSourceUrlParams(lead);
  const request = getRequestDetails(lead);

  if (!campaign.length && !sourceUrl && !request.length) return null;

  return (
    <Card
      title="Source & tracking"
      description={`Created from ${getLeadSourceLabel(lead).replace(/_/g, " ")}`}
    >
      <div className="space-y-4">
        {campaign.length > 0 && (
          <Section title="Ad campaign">
            <DetailGrid details={campaign} />
          </Section>
        )}

        {sourceUrl && (
          <Section title="Source page">
            <a
              href={sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-1.5 break-all text-sm text-blue-500 hover:underline"
            >
              <Icon icon={ExternalLink} size="sm" className="mt-0.5" />
              {sourceUrl}
            </a>
            {urlParams.length > 0 && (
              <div className="mt-4">
                <DetailGrid details={urlParams} />
              </div>
            )}
          </Section>
        )}

        {request.length > 0 && (
          <Section title="Visitor">
            <DetailGrid details={request} />
          </Section>
        )}
      </div>
    </Card>
  );
};

export default LeadSourceCard;
