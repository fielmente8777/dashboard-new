import { ExternalLink, Link2Off, Phone } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import Icon from "../../../../components/ui/Icon";
import { useConfirm } from "../../../../context/ConfirmContext";
import { useToast } from "../../../../context/ToastContext";
import { useIntegrationStatus } from "../../../../hooks/useIntegrationStatus";
import { useTenant } from "../../../../hooks/useTenant";
import { useDisconnectIntegrationMutation } from "../../../../redux/api/integrationsApi";
import { getApiErrorMessage } from "../../../../redux/api/baseApi";
import { integrationPath } from "../../../../routes/paths";

const Row = ({ label, children }) => (
  <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
    <dt className="w-40 shrink-0 text-xs text-app-text-muted">{label}</dt>
    <dd className="min-w-0 break-all text-sm text-app-text">{children || "—"}</dd>
  </div>
);

// WhatsApp → Settings: the connected number and disconnecting it.
const WhatsAppSettings = ({ phoneNumber, waba }) => {
  const { hid } = useTenant();
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const { checkIntegrationStatus } = useIntegrationStatus();
  const [disconnectIntegration] = useDisconnectIntegrationMutation();
  const [busy, setBusy] = useState(false);

  const disconnect = async () => {
    const confirmed = await confirm(
      "Messages, templates and auto replies stop working in the dashboard until you connect a number again. Nothing is deleted on Meta's side.",
      { title: "Disconnect this WhatsApp number?", confirmText: "Disconnect" },
    );
    if (!confirmed) return;

    setBusy(true);
    try {
      const response = await disconnectIntegration({ hid, id: "metaWhatsapp" }).unwrap();
      if (!response?.success) throw new Error(response?.responseMessage);
      showToast({ message: "WhatsApp disconnected" });
      // the page shows the connect screen once the status says so
      await checkIntegrationStatus();
    } catch (error) {
      showToast({
        message: error?.message || getApiErrorMessage(error, "Could not disconnect WhatsApp."),
        type: "error",
      });
      setBusy(false);
    }
  };

  return (
    <div className="flex w-full max-w-3xl flex-col gap-4">
      <Card title="Connected number">
        <dl className="space-y-2.5">
          <Row label="Number">
            <span className="inline-flex items-center gap-1.5">
              <Icon icon={Phone} size="sm" className="text-app-text-muted" />
              {phoneNumber?.displayPhoneNumber}
            </span>
          </Row>
          <Row label="Name shown to guests">{phoneNumber?.verifiedName}</Row>
          <Row label="Phone number ID">{phoneNumber?.id}</Row>
          <Row label="Business account ID">{waba?.id}</Row>
        </dl>
        <Link
          to={integrationPath("whatsapp")}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          Connection health <ExternalLink className="size-3.5" />
        </Link>
      </Card>

      <Card
        title="Disconnect"
        description="Stops WhatsApp in the dashboard. You can connect the same or another number later."
      >
        <Button variant="danger" icon={Link2Off} loading={busy} onClick={disconnect}>
          Disconnect WhatsApp
        </Button>
      </Card>
    </div>
  );
};

export default WhatsAppSettings;
