import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useApiAction } from "../../../../hooks/useApiAction";
import { useTenant } from "../../../../hooks/useTenant";
import { useGetWhatsAppTemplatesQuery } from "../../../../redux/api/callsApi";
import {
  useGetNotificationSettingsQuery,
  useSetWhatsAppAlertsMutation,
  useUpdateNotificationSettingsMutation,
} from "../../../../redux/api/notificationApi";
import { useGetTeamUsersQuery } from "../../../../redux/api/usersApi";
import { useGetWhatsAppAccountQuery } from "../../../../redux/api/whatsappApi";
import { EMPTY_SETTINGS, normalizeSettings } from "../notificationUtils";

// Loads the notification settings into an editable draft. Changes stay in
// the draft until save(); the WhatsApp on/off switch is the exception and is
// saved straight away (it lives on the WhatsApp account, not in these settings).
export const useNotificationSettings = () => {
  const run = useApiAction();
  const { hid } = useTenant();
  const hasWhatsApp = Boolean(
    useSelector((state) => state.subscription?.subscription?.appAccess?.whatsapp),
  );

  const settings = useGetNotificationSettingsQuery(hid, { skip: !hid });
  const users = useGetTeamUsersQuery();
  const account = useGetWhatsAppAccountQuery(hid, { skip: !hid || !hasWhatsApp });
  const templates = useGetWhatsAppTemplatesQuery(hid, { skip: !hid || !hasWhatsApp });
  const [updateSettings, { isLoading: isSaving }] = useUpdateNotificationSettingsMutation();
  const [setWhatsAppAlerts] = useSetWhatsAppAlertsMutation();

  const saved = useMemo(
    () => (settings.data ? normalizeSettings(settings.data) : EMPTY_SETTINGS),
    [settings.data],
  );
  const [draft, setDraft] = useState(saved);

  // start again from the server copy whenever it (re)loads
  useEffect(() => setDraft(saved), [saved]);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const setSource = (source, changes) =>
    setDraft((prev) => ({
      ...prev,
      config: { ...prev.config, [source]: { ...prev.config[source], ...changes } },
    }));

  const setCallEnabled = (enabled) =>
    setDraft((prev) => ({ ...prev, callConfig: { ...prev.callConfig, enabled } }));

  const setCallStatus = (status, changes) =>
    setDraft((prev) => ({
      ...prev,
      callConfig: {
        ...prev.callConfig,
        configs: {
          ...prev.callConfig.configs,
          [status]: { ...prev.callConfig.configs[status], ...changes },
        },
      },
    }));

  const save = () =>
    run(updateSettings({ hid, ...draft }), {
      success: "Notification settings saved",
      error: "Could not save the notification settings.",
    });

  const discard = () => setDraft(saved);

  const whatsAppEnabled = Boolean(account.data?.notification?.enable);
  const phoneNumberId = account.data?.phoneNumber?.id;

  const toggleWhatsApp = (enable) =>
    run(setWhatsAppAlerts({ hid, phoneNumberId, enable }), {
      success: enable ? "WhatsApp alerts turned on" : "WhatsApp alerts turned off",
      error: "Could not change WhatsApp alerts.",
    });

  // the team members who can receive each kind of alert
  const recipients = useMemo(() => {
    const list = users.data || [];
    const options = (field) =>
      list
        .filter((user) => user?.[field])
        .map((user) => ({
          value: user[field],
          label: user.displayName || user.userName || user[field],
        }));
    return { phone: options("phone"), email: options("emailId") };
  }, [users.data]);

  return {
    settings,
    draft,
    isDirty,
    isSaving,
    setSource,
    setCallEnabled,
    setCallStatus,
    save,
    discard,
    recipients,
    whatsApp: {
      available: hasWhatsApp,
      loading: account.isLoading,
      connected: Boolean(phoneNumberId),
      enabled: whatsAppEnabled,
      toggle: toggleWhatsApp,
      templates: templates.data || [],
    },
  };
};
