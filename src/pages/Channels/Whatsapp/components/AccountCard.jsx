import { FaWhatsapp } from "react-icons/fa";
import Badge from "../../../../components/ui/Badge";
import Card from "../../../../components/ui/Card";
import Detail from "../../../../components/ui/Detail";

const QUALITY = {
  GREEN: { tone: "green", label: "High" },
  YELLOW: { tone: "amber", label: "Medium" },
  RED: { tone: "red", label: "Low" },
};

// The connected WhatsApp Business account and its phone number.
const AccountCard = ({ waba, business, phoneNumber }) => {
  const isCloudApi = phoneNumber?.platformType === "CLOUD_API";
  const isLive = phoneNumber?.accountMode === "LIVE";
  const canMessage = isCloudApi && isLive;
  const quality = QUALITY[phoneNumber?.qualityRating];

  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          <FaWhatsapp className="size-4 text-green-600 dark:text-green-400" />
          WhatsApp Business account
        </span>
      }
      actions={
        <Badge tone={canMessage ? "green" : "amber"}>
          {canMessage ? "Messaging enabled" : "Messaging disabled"}
        </Badge>
      }
    >
      {phoneNumber && (
        <div className="mb-4">
          <p className="text-xl font-semibold text-app-text">
            {phoneNumber.displayPhoneNumber}
          </p>
          <p className="text-sm text-app-text-muted">{phoneNumber.verifiedName}</p>
        </div>
      )}

      <dl className="grid gap-4 sm:grid-cols-2">
        <Detail label="Account name">{waba?.name}</Detail>
        <Detail label="Quality rating">
          {quality ? (
            <Badge tone={quality.tone}>{quality.label}</Badge>
          ) : (
            phoneNumber?.qualityRating
          )}
        </Detail>
        <Detail label="Cloud API">
          {canMessage ? "Connected" : isCloudApi ? "Not live yet" : "Not connected"}
        </Detail>
        <Detail label="Account mode">{phoneNumber?.accountMode}</Detail>
        <Detail label="WABA ID">{waba?.id}</Detail>
        <Detail label="Business ID">{business?.id}</Detail>
      </dl>

      {!isCloudApi && phoneNumber && (
        <p className="mt-4 text-xs text-app-text-muted">
          Messages can only be sent once the number is on the WhatsApp Cloud API.
        </p>
      )}
    </Card>
  );
};

export default AccountCard;
