import { BellRing } from "lucide-react";
import SaveBar from "../../../components/ui/SaveBar";
import SettingsCard from "../../../components/ui/SettingsCard";
import { ErrorState, Skeleton } from "../../../components/ui/States";
import AlertMatrix from "./components/AlertMatrix";
import CallFollowUp from "./components/CallFollowUp";
import ChannelSummary from "./components/ChannelSummary";
import { useNotificationSettings } from "./hooks/useNotificationSettings";

const Notification = () => {
  const n = useNotificationSettings();
  const { whatsApp } = n;

  if (n.settings.isError) {
    return (
      <div className="p-1">
        <ErrorState
          message="Could not load the notification settings."
          onRetry={n.settings.refetch}
        />
      </div>
    );
  }

  if (n.settings.isLoading || n.settings.isUninitialized) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="hidden h-32 xl:block" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const whatsAppOff = !whatsApp.enabled;
  // WhatsApp is a column only when the plan includes it
  const channels = [
    ...(whatsApp.available
      ? [{ key: "phone", options: n.recipients.phone, disabled: whatsAppOff }]
      : []),
    { key: "email", options: n.recipients.email },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      <ChannelSummary whatsApp={whatsApp} draft={n.draft} />

      <SettingsCard
        icon={BellRing}
        title="Lead alerts"
        description="Choose which new leads alert your team, on which channel, and who receives each alert."
        bodyClassName="px-0! py-0!"
        footer={
          <span>
            {whatsApp.available && whatsAppOff && whatsApp.connected
              ? "WhatsApp alerts are off. Turn them on above to choose who gets them."
              : "Only team members with a phone number or email address can be chosen."}
          </span>
        }
      >
        <AlertMatrix channels={channels} config={n.draft.config} onChange={n.setSource} />
      </SettingsCard>

      {whatsApp.available && (
        <CallFollowUp
          callConfig={n.draft.callConfig}
          templates={whatsApp.templates}
          disabled={whatsAppOff}
          onToggle={n.setCallEnabled}
          onChange={n.setCallStatus}
        />
      )}

      <SaveBar
        show={n.isDirty}
        onSave={n.save}
        onDiscard={n.discard}
        saving={n.isSaving}
      />
    </div>
  );
};

export default Notification;
