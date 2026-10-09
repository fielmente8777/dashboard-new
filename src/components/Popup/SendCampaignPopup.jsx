import { Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext";
import { Sources } from "../../data/constant";
import { useTenant } from "../../hooks/useTenant";
import { useGetWhatsAppTemplatesQuery } from "../../redux/api/callsApi";
import { useGetCampaignAudienceQuery } from "../../redux/api/whatsappApi";
import TemplatePreview from "../../pages/Channels/Whatsapp/components/TemplatePreview";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import { Field, Select } from "../ui/Field";

const SOURCE_OPTIONS = [{ value: "", label: "All sources" }, ...Sources];

// Picks the WhatsApp template for a campaign and shows who it would reach:
// the `contacts` selected on the page, or (when none are selected) everyone
// from one lead source.
const SendCampaignPopup = ({ open, setOpen, contacts }) => {
  const { showToast } = useToast();
  const { hid } = useTenant();

  const [templateId, setTemplateId] = useState("");
  const [source, setSource] = useState("");
  const hasSelection = contacts.length > 0;

  const templates = useGetWhatsAppTemplatesQuery(hid, { skip: !hid || !open });
  const audience = useGetCampaignAudienceQuery(
    { hid, source },
    { skip: !hid || !open || hasSelection },
  );

  useEffect(() => {
    if (!open) return;
    setTemplateId("");
    setSource("");
  }, [open]);

  const template = (templates.data || []).find((item) => item.id === templateId);
  const recipients = hasSelection ? contacts.length : audience.data || 0;

  const handleSend = () => {
    // Sending was never connected for this popup: the previous version closed
    // as if it had sent. Say so instead, until an endpoint exists for it.
    showToast({
      message:
        "Campaigns cannot be sent from here yet. Use Marketing → WhatsApp to send one.",
      type: "error",
    });
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      title="Send campaign"
      description="Send one approved WhatsApp template to many contacts."
      footer={
        <>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            icon={Send}
            disabled={!template || recipients === 0}
            onClick={handleSend}
          >
            Send to {recipients.toLocaleString()}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Template">
          <Select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            options={[
              {
                value: "",
                label: templates.isLoading
                  ? "Loading templates..."
                  : "Select a template",
              },
              ...(templates.data || []).map((item) => ({
                value: item.id,
                label: item.name,
              })),
            ]}
          />
        </Field>

        {!hasSelection && (
          <Field label="Send to contacts from">
            <Select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              options={SOURCE_OPTIONS}
            />
          </Field>
        )}

        <p className="rounded-lg bg-app-surface-secondary px-3 py-2 text-sm text-app-text-muted">
          {audience.isFetching ? (
            "Counting contacts..."
          ) : (
            <>
              <span className="font-semibold text-app-text">
                {recipients.toLocaleString()}
              </span>{" "}
              {recipients === 1 ? "contact" : "contacts"}{" "}
              {hasSelection ? "selected" : "will receive it"}
            </>
          )}
        </p>

        {template && <TemplatePreview components={template.components || []} />}
      </div>
    </Dialog>
  );
};

export default SendCampaignPopup;
