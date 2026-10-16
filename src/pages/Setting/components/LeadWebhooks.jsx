import { FileCode2, Globe, Megaphone, Webhook } from "lucide-react";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import Icon from "../../../components/ui/Icon";
import { API_URLS } from "../../../config/env";
import { useTenant } from "../../../hooks/useTenant";
import CopyField from "./CopyField";

// Every endpoint the backend accepts leads on, filled in for this account.
// Kept in step with gian (routes/leadWebhook.route.ts) and core (/eazotel/addcontacts).
const buildWebhooks = ({ domain, ndid, hid }) => [
  {
    key: "website",
    icon: Globe,
    title: "Eazotel website form",
    description: "Enquiry forms on your Eazotel website send leads here, identified by the form domain.",
    fields: [
      { label: "Endpoint (POST)", value: `${API_URLS.core}/eazotel/addcontacts` },
      { label: "Form domain (Domain)", value: domain },
      { label: "Location id (hId)", value: hid },
    ],
  },
  {
    key: "google",
    icon: Megaphone,
    title: "Google Ads lead forms",
    description: "In Google Ads → Lead form → Webhook integration, paste the URL and the key.",
    note: "Leads go to your first location.",
    fields: [
      { label: "Webhook URL", value: `${API_URLS.node}/api/v1/lead-webhook/create` },
      { label: "Key", value: ndid },
    ],
  },
  {
    key: "wordpress",
    icon: FileCode2,
    title: "WordPress (Elementor forms)",
    description:
      'Add a Webhook action to the form. Name the fields "Full Name", "Email" and "Contact number"; other fields are kept as lead details.',
    note: "Leads go to your first location.",
    fields: [{ label: "Webhook URL", value: `${API_URLS.node}/api/v1/lead-webhook/wordpress/${ndid}/create` }],
  },
  {
    key: "webflow",
    icon: Webhook,
    title: "Webflow forms",
    description: "In Webflow → Site settings → Integrations → Webhooks, add a Form submission webhook.",
    fields: [
      {
        label: "Webhook URL",
        value: `${API_URLS.node}/api/v1/lead-webhook/webflow/${ndid}/create${hid ? `?hid=${hid}` : ""}`,
      },
    ],
  },
];

const LeadWebhooks = ({ domain }) => {
  const { hid, ndid } = useTenant();

  if (!ndid) return null;
  const webhooks = buildWebhooks({ domain, ndid, hid });

  return (
    <Card
      title="Lead webhooks"
      description="Connect your forms and ads so new enquiries arrive in Leads automatically."
    >
      <ul className="divide-y divide-app-border">
        {webhooks.map(({ key, icon, title, description, note, fields }) => (
          <li key={key} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 lg:flex-row lg:gap-6">
            <div className="flex min-w-0 gap-3 lg:w-72 lg:shrink-0">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-app-surface-secondary text-app-text-muted">
                <Icon icon={icon} size="sm" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-app-text">{title}</p>
                <p className="mt-0.5 text-xs leading-5 text-app-text-muted">{description}</p>
                {note && (
                  <Badge tone="amber" className="mt-1.5">
                    {note}
                  </Badge>
                )}
              </div>
            </div>
            <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
              {fields
                .filter((field) => field.value)
                .map((field) => (
                  <div key={field.label} className={field.label.startsWith("Webhook URL") || field.label.startsWith("Endpoint") ? "sm:col-span-2" : ""}>
                    <CopyField label={field.label} value={field.value} />
                  </div>
                ))}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default LeadWebhooks;
