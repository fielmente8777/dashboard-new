import { Mail, MessageCircle } from "lucide-react";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import SaveBar from "../../../components/ui/SaveBar";
import Icon from "../../../components/ui/Icon";
import Switch from "../../../components/ui/Switch";
import { ErrorState, Skeleton } from "../../../components/ui/States";
import CallFollowUp from "./components/CallFollowUp";
import SourceAlertList from "./components/SourceAlertList";
import { useNotificationSettings } from "./hooks/useNotificationSettings";

const CardTitle = ({ icon, children }) => (
  <span className="flex items-center gap-2">
    <Icon icon={icon} tone="muted" />
    {children}
  </span>
);

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
      <div className="space-y-4">
        <Skeleton className="h-72" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const whatsAppOff = !whatsApp.enabled;

  return (
    <div className="space-y-4">
      {whatsApp.available && (
        <Card
          title={<CardTitle icon={MessageCircle}>WhatsApp alerts</CardTitle>}
          description="Tell your team on WhatsApp the moment a new lead comes in."
          actions={
            <div className="flex items-center gap-2">
              {!whatsApp.loading && !whatsApp.connected ? (
                <Badge tone="amber">WhatsApp not connected</Badge>
              ) : (
                <span className="text-xs text-app-text-muted">
                  {whatsApp.enabled ? "On" : "Off"}
                </span>
              )}
              <Switch
                label="WhatsApp alerts"
                checked={whatsApp.enabled}
                disabled={!whatsApp.connected}
                onChange={whatsApp.toggle}
              />
            </div>
          }
        >
          <div className="space-y-4">
            {whatsAppOff && whatsApp.connected && (
              <p className="rounded-lg bg-app-surface-secondary px-3 py-2 text-xs text-app-text-muted">
                WhatsApp alerts are off. Turn them on above to choose who gets them. This switch
                saves straight away.
              </p>
            )}

            <SourceAlertList
              channel="phone"
              config={n.draft.config}
              options={n.recipients.phone}
              disabled={whatsAppOff}
              onChange={n.setSource}
            />

            <CallFollowUp
              callConfig={n.draft.callConfig}
              templates={whatsApp.templates}
              disabled={whatsAppOff}
              onToggle={n.setCallEnabled}
              onChange={n.setCallStatus}
            />
          </div>
        </Card>
      )}

      <Card
        title={<CardTitle icon={Mail}>Email alerts</CardTitle>}
        description="Send an email to the chosen team members for every new lead."
      >
        <SourceAlertList
          channel="email"
          config={n.draft.config}
          options={n.recipients.email}
          onChange={n.setSource}
        />
      </Card>

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
