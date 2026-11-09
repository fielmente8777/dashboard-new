import { Mail, PhoneMissed } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import Badge from "../../../../components/ui/Badge";
import Icon from "../../../../components/ui/Icon";
import Switch from "../../../../components/ui/Switch";
import { CHANNELS, SOURCES } from "../notificationUtils";

// how many lead sources have this channel turned on
const sourcesOn = (config, channel) =>
  SOURCES.filter((source) => config[source.key]?.[CHANNELS[channel].allowed]).length;

const Tile = ({ icon, iconClass, title, status, action, children }) => (
  <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-app-border! bg-app-surface p-4">
    <div className="flex items-start justify-between gap-3">
      <span className={`flex size-9 items-center justify-center rounded-lg ${iconClass}`}>
        <Icon icon={icon} />
      </span>
      {action}
    </div>
    <div className="min-w-0">
      <p className="flex items-center gap-2 text-sm font-semibold text-app-text">
        {title}
        {status}
      </p>
      <p className="mt-0.5 text-xs leading-5 text-app-text-muted">{children}</p>
    </div>
  </div>
);

// The state of each alert channel at a glance. The WhatsApp switch turns the
// whole channel on or off and saves straight away; everything else is set below.
const ChannelSummary = ({ whatsApp, exotel, draft }) => {
  const total = SOURCES.length;
  const whatsAppCount = sourcesOn(draft.config, "phone");
  const emailCount = sourcesOn(draft.config, "email");

  const whatsAppStatus = !whatsApp.available ? (
    <Badge>Not in plan</Badge>
  ) : whatsApp.loading ? null : !whatsApp.connected ? (
    <Badge tone="amber">Not connected</Badge>
  ) : whatsApp.enabled ? (
    <Badge tone="green">On</Badge>
  ) : (
    <Badge>Off</Badge>
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <Tile
        icon={FaWhatsapp}
        iconClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        title="WhatsApp"
        status={whatsAppStatus}
        action={
          whatsApp.available && (
            <Switch
              label="WhatsApp alerts"
              checked={whatsApp.enabled}
              disabled={!whatsApp.connected}
              onChange={whatsApp.toggle}
            />
          )
        }
      >
        {!whatsApp.available
          ? "Upgrade your plan to alert your team on WhatsApp."
          : !whatsApp.loading && !whatsApp.connected
            ? "Connect WhatsApp Business under Settings → WhatsApp to send alerts."
            : `${whatsAppCount} of ${total} lead sources alert on WhatsApp. The switch saves straight away.`}
      </Tile>

      <Tile
        icon={Mail}
        iconClass="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        title="Email"
        status={emailCount ? <Badge tone="green">On</Badge> : <Badge>Off</Badge>}
      >
        {`${emailCount} of ${total} lead sources send an email alert.`}
      </Tile>

      {whatsApp.available && (
        <Tile
          icon={PhoneMissed}
          iconClass="bg-purple-500/10 text-purple-600 dark:text-purple-400"
          title="Call follow-up"
          status={
            exotel.loading ? null : !exotel.connected ? (
              <Badge tone="amber">Not connected</Badge>
            ) : draft.callConfig.enabled && whatsApp.enabled ? (
              <Badge tone="green">On</Badge>
            ) : (
              <Badge>Off</Badge>
            )
          }
        >
          {!exotel.loading && !exotel.connected
            ? "Connect Exotel under Integrations to message callers after a missed call."
            : "Message callers on WhatsApp when their call is missed, busy or not answered."}
        </Tile>
      )}
    </div>
  );
};

export default ChannelSummary;
