import { Mic, PhoneOff } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import { Field } from "../../../components/ui/Field";
import Icon from "../../../components/ui/Icon";
import { Skeleton } from "../../../components/ui/States";
import Switch from "../../../components/ui/Switch";
import { useApiAction } from "../../../hooks/useApiAction";
import { hasTenant } from "../../../hooks/useTenant";
import {
  useAddVoiceRuleMutation,
  useDeleteVoiceRuleMutation,
  useGetVoiceRulesQuery,
  useGetVoiceSettingsQuery,
  useUpdateVoiceRuleMutation,
  useUpdateVoiceSettingsMutation,
} from "../../../redux/api/aiTrainingApi";
import { RulesList } from "./CustomRulesTab";

const VOICE_RULES = {
  useRules: useGetVoiceRulesQuery,
  useAdd: useAddVoiceRuleMutation,
  useUpdate: useUpdateVoiceRuleMutation,
  useDelete: useDeleteVoiceRuleMutation,
};

const MESSAGE_LIMIT = 300;

const SettingRow = ({ title, hint, checked, onChange }) => (
  <div className="flex items-start justify-between gap-4 py-3 first:pt-0">
    <div className="min-w-0">
      <p className="text-sm font-medium text-app-text">{title}</p>
      <p className="mt-0.5 text-xs text-app-text-muted">{hint}</p>
    </div>
    <Switch label={title} checked={checked} onChange={onChange} />
  </div>
);

// On / off switches for the phone assistant and what it says when it is off.
const VoiceSettingsCard = ({ tenant }) => {
  const run = useApiAction();
  const settings = useGetVoiceSettingsQuery(tenant, { skip: !hasTenant(tenant) });
  const [update, { isLoading: saving }] = useUpdateVoiceSettingsMutation();
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (settings.data) setMessage(settings.data.defaultMessage || "");
  }, [settings.data]);

  if (settings.error?.status === 404) {
    return (
      <Card title="Voice AI">
        <p className="text-sm text-app-text-muted">Voice AI settings arrive with the next server update.</p>
      </Card>
    );
  }
  if (!settings.data) return <Skeleton className="h-56 rounded-xl" />;

  const save = (changes, success) => run(update({ ...tenant, ...changes }), { success, error: "Could not save." });
  const { voiceEnabled, whatsappIntegrationEnabled, defaultMessage } = settings.data;
  const messageChanged = message.trim() && message.trim() !== defaultMessage;

  return (
    <Card
      title="Voice AI"
      description="The AI that answers your phone calls."
      actions={
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
            voiceEnabled ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-app-surface-secondary text-app-text-muted"
          }`}
        >
          <Icon icon={voiceEnabled ? Mic : PhoneOff} size="sm" />
          {voiceEnabled ? "Answering calls" : "Off"}
        </span>
      }
    >
      <div className="divide-y divide-app-border!">
        <SettingRow
          title="Answer calls with Voice AI"
          hint="When off, callers hear the message below instead."
          checked={voiceEnabled}
          onChange={(on) => save({ voiceEnabled: on }, on ? "Voice AI is on" : "Voice AI is off")}
        />
        <SettingRow
          title="Continue on WhatsApp"
          hint="Lets the voice assistant send callers to your WhatsApp chat."
          checked={whatsappIntegrationEnabled}
          onChange={(on) => save({ whatsappIntegrationEnabled: on })}
        />
      </div>

      <Field
        label="Message when Voice AI is unavailable"
        hint={`${message.length}/${MESSAGE_LIMIT}`}
        className="mt-4"
      >
        <textarea
          value={message}
          maxLength={MESSAGE_LIMIT}
          rows={3}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full resize-y rounded-lg border border-app-border! bg-app-surface px-3 py-2 text-sm text-app-text outline-none focus:border-blue-500! focus:ring-1 focus:ring-blue-500"
        />
      </Field>
      {messageChanged && (
        <div className="mt-3 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setMessage(defaultMessage)}>
            Cancel
          </Button>
          <Button size="sm" loading={saving} onClick={() => save({ defaultMessage: message.trim() }, "Message saved")}>
            Save message
          </Button>
        </div>
      )}
    </Card>
  );
};

const VoiceAiTab = ({ tenant }) => (
  <div className="space-y-5">
    <VoiceSettingsCard tenant={tenant} />
    <RulesList
      tenant={tenant}
      api={VOICE_RULES}
      fileName="voice"
      emptyTitle="No voice rules yet"
      intro="Rules for phone calls only, e.g. how to greet callers or when to transfer to staff. Your WhatsApp rules don't apply to calls."
    />
  </div>
);

export default VoiceAiTab;
