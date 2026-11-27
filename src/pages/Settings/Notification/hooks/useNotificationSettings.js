import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useApiAction } from "../../../../hooks/useApiAction";
import { useIntegrationStatus } from "../../../../hooks/useIntegrationStatus";
import { useTenant } from "../../../../hooks/useTenant";
import { useGetWhatsAppTemplatesQuery } from "../../../../redux/api/callsApi";
import {
  useGetNotificationSettingsQuery,
  useSetWhatsAppAlertsMutation,
  useUpdateNotificationSettingsMutation,
} from "../../../../redux/api/notificationApi";
import { useGetSuggestionsQuery } from "../../../../redux/api/suggestionsApi";
import { useGetTeamUsersQuery } from "../../../../redux/api/usersApi";
import { useGetWhatsAppAccountQuery } from "../../../../redux/api/whatsappApi";
import { EMPTY_SETTINGS, normalizeSettings } from "../notificationUtils";

// A WhatsApp number as gian sends alerts to it: digits with the country code (a 10-digit
// number is taken as Indian), or null when it can't be one.
const toAlertPhone = (raw) => {
  let digits = String(raw || "").replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 10) digits = `91${digits}`;
  return /^[1-9]\d{10,14}$/.test(digits) ? digits : null;
};

// Loads the notification settings into an editable draft. Changes stay in
// the draft until save(); the WhatsApp on/off switch is the exception and is
// saved straight away (it lives on the WhatsApp account, not in these settings).
export const useNotificationSettings = () => {
  const run = useApiAction();
  const { hid } = useTenant();
  const hasWhatsApp = Boolean(
    useSelector((state) => state.subscription?.subscription?.appAccess?.whatsapp),
  );

  // missed-call follow-ups need Exotel: calls only reach us through it
  const { integrationStatus, isLoadingIntegrationStatus } = useIntegrationStatus();

  const settings = useGetNotificationSettingsQuery(hid, { skip: !hid });
  const users = useGetTeamUsersQuery();
  // the hotel's own email and phone (profile), team and sender addresses, as gian suggests them
  const ownEmails = useGetSuggestionsQuery({ type: "email", q: "", hid }, { skip: !hid });
  const ownPhones = useGetSuggestionsQuery({ type: "phone", q: "", hid }, { skip: !hid });
  // people added here who are not on the team: choosable in every source until the page closes
  const [added, setAdded] = useState({ phone: [], email: [] });
  const addRecipient = (kind, raw) => {
    const value = kind === "phone" ? toAlertPhone(raw) : String(raw || "").trim().toLowerCase();
    if (!value) return null;
    setAdded((prev) => (prev[kind].includes(value) ? prev : { ...prev, [kind]: [...prev[kind], value] }));
    return value;
  };
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

  // who can receive each kind of alert: the team, the hotel's own email / phone, and anyone
  // added by hand. Numbers are compared as digits, so one number shows once.
  const recipients = useMemo(() => {
    const list = users.data || [];
    const key = (kind, value) =>
      kind === "phone" ? String(value).replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "") : String(value).toLowerCase();
    const build = (kind, field, suggested) => {
      const out = [];
      const seen = new Set();
      const push = (value, label) => {
        if (!value || seen.has(key(kind, value))) return;
        seen.add(key(kind, value));
        out.push({ value, label: label && label !== value ? `${label} · ${value}` : value });
      };
      list.filter((user) => user?.[field]).forEach((user) => push(user[field], user.displayName || user.userName));
      (suggested || []).forEach((s) => push(s.value, s.label));
      added[kind].forEach((value) => push(value, "Added by you"));
      return out;
    };
    return {
      phone: build("phone", "phone", ownPhones.data),
      email: build("email", "emailId", ownEmails.data),
    };
  }, [users.data, ownPhones.data, ownEmails.data, added]);

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
    addRecipient,
    exotel: {
      loading: isLoadingIntegrationStatus,
      connected: Boolean(integrationStatus?.exotel),
    },
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
