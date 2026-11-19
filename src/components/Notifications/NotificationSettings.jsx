import { BellRing, Play, Send, Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";
import { useApiAction } from "../../hooks/useApiAction";
import { useTenant } from "../../hooks/useTenant";
import { useToast } from "../../context/ToastContext";
import {
  useGetNotificationPreferencesQuery,
  useGetPushConfigQuery,
  useSendTestPushMutation,
  useSubscribePushMutation,
  useUnsubscribePushMutation,
  useUpdateNotificationPreferencesMutation,
} from "../../redux/api/notificationsApi";
import {
  getPushSubscription,
  isPushSupported,
  pushPermission,
  subscribeBrowser,
  unsubscribeBrowser,
} from "../../utils/webPush";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Icon from "../ui/Icon";
import { Skeleton } from "../ui/States";
import Switch from "../ui/Switch";
import { NOTIFICATION_TYPE_LABELS } from "./notificationKinds";
import { isSoundOn, playNotificationSound, setSoundOn } from "./notificationAlert";

// Browser push for this device: on, off, or why it can't be turned on.
const PushCard = ({ pushOn, onPushOnChange }) => {
  const { showToast } = useToast();
  const run = useApiAction();
  const config = useGetPushConfigQuery();
  const [subscribe] = useSubscribePushMutation();
  const [unsubscribe] = useUnsubscribePushMutation();
  const [sendTest, { isLoading: testing }] = useSendTestPushMutation();
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getPushSubscription()
      .then((sub) => setSubscribed(Boolean(sub)))
      .catch(() => setSubscribed(false));
  }, []);

  const turnOn = async () => {
    setBusy(true);
    try {
      const subscription = await subscribeBrowser(config.data?.publicKey);
      await subscribe(subscription).unwrap();
      setSubscribed(true);
      if (!pushOn) onPushOnChange(true);
      showToast({ message: "Push notifications are on for this browser" });
    } catch (error) {
      showToast({ message: error?.message || "Could not turn on push notifications.", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const turnOff = async () => {
    setBusy(true);
    try {
      const endpoint = await unsubscribeBrowser();
      if (endpoint) await unsubscribe(endpoint).unwrap();
      setSubscribed(false);
      showToast({ message: "Push notifications are off for this browser" });
    } catch {
      showToast({ message: "Could not turn off push notifications.", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const permission = pushPermission();
  const reason = !isPushSupported()
    ? "This browser can't receive push notifications. On iPhone, add the dashboard to your Home Screen first."
    : config.isSuccess && !config.data.enabled
      ? "Push isn't set up on the server yet. Ask your Eazotel team to add the push keys."
      : permission === "denied"
        ? "Notifications are blocked for this site. Allow them in the browser's site settings."
        : null;

  return (
    <Card
      title="Push notifications on this device"
      description="Get alerts even when the dashboard tab is closed."
    >
      <div className="flex flex-col gap-3 rounded-xl bg-app-bg p-4 sm:flex-row sm:items-center">
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
            subscribed ? "bg-emerald-500/12 text-emerald-600" : "bg-app-surface-secondary text-app-text-muted"
          }`}
        >
          <Icon icon={BellRing} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-app-text">
            {subscribed ? "On for this browser" : "Off for this browser"}
          </p>
          <p className="mt-0.5 text-xs text-app-text-muted">
            {reason || (subscribed ? "You'll get alerts for the types switched on below." : "Turn it on to get alerts on this device.")}
          </p>
        </div>
        <div className="flex gap-2">
          {subscribed && (
            <Button
              variant="secondary"
              size="sm"
              icon={Send}
              loading={testing}
              onClick={() => run(sendTest(), { success: "Test sent. It should appear in a few seconds." })}
            >
              Test
            </Button>
          )}
          {subscribed ? (
            <Button variant="ghost" size="sm" loading={busy} onClick={turnOff}>
              Turn off
            </Button>
          ) : (
            <Button size="sm" loading={busy || config.isLoading} disabled={Boolean(reason)} onClick={turnOn}>
              Turn on
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

// The chime for new notifications while the dashboard is open. Kept per
// browser: a shared front-desk PC can be quiet while a phone still rings.
const SoundCard = () => {
  const [on, setOn] = useState(isSoundOn);

  const change = (next) => {
    setSoundOn(next);
    setOn(next);
    if (next) playNotificationSound();
  };

  return (
    <Card title="Sound" description="Plays when a notification arrives while the dashboard is open.">
      <div className="flex flex-col gap-3 rounded-xl bg-app-bg p-4 sm:flex-row sm:items-center">
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
            on ? "bg-blue-500/12 text-blue-600 dark:text-blue-400" : "bg-app-surface-secondary text-app-text-muted"
          }`}
        >
          <Icon icon={on ? Volume2 : VolumeX} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-app-text">{on ? "Sound on" : "Sound off"}</p>
          <p className="mt-0.5 text-xs text-app-text-muted">
            For this browser. Types switched off for the dashboard below stay quiet.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" icon={Play} onClick={playNotificationSound}>
            Preview
          </Button>
          <Switch label="Notification sound" checked={on} onChange={change} />
        </div>
      </div>
    </Card>
  );
};

// Which notification types show in the dashboard and which come as push.
const NotificationSettings = () => {
  const { hid } = useTenant();
  const prefs = useGetNotificationPreferencesQuery(hid, { skip: !hid });
  const [update] = useUpdateNotificationPreferencesMutation();
  const run = useApiAction();

  if (prefs.error?.status === 404) {
    return (
      <Card title="Notification settings">
        <p className="text-sm text-app-text-muted">
          Settings for dashboard and push notifications arrive with the next server update.
        </p>
      </Card>
    );
  }
  if (!prefs.data) return <Skeleton className="h-64 rounded-xl" />;

  const { preferences, availableTypes = [] } = prefs.data;
  const inAppMuted = preferences?.inApp?.mutedTypes || [];
  const pushMuted = preferences?.push?.mutedTypes || [];
  const pushOn = preferences?.push?.enabled !== false;
  const types = availableTypes.filter((type) => type !== "system.test");

  const toggle = (channel, type, on) => {
    const current = channel === "inApp" ? inAppMuted : pushMuted;
    const mutedTypes = on ? current.filter((t) => t !== type) : [...new Set([...current, type])];
    run(update({ hid, [channel]: { mutedTypes } }), { error: "Could not save the setting." });
  };

  return (
    <div className="space-y-5">
      <PushCard
        pushOn={pushOn}
        onPushOnChange={(enabled) => run(update({ hid, push: { enabled } }))}
      />

      <SoundCard />

      <Card title="What to notify me about" description="Saved for your login, on every device.">
        <div className="-mx-1 overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-app-text-muted">
                <th className="px-1 pb-2 font-semibold">Notification</th>
                <th className="w-24 px-1 pb-2 text-center font-semibold">Dashboard</th>
                <th className="w-24 px-1 pb-2 text-center font-semibold">Push</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border!">
              {types.map((type) => {
                const info = NOTIFICATION_TYPE_LABELS[type] || { label: type };
                return (
                  <tr key={type}>
                    <td className="px-1 py-3">
                      <p className="font-medium text-app-text">{info.label}</p>
                      {info.hint && <p className="mt-0.5 text-xs text-app-text-muted">{info.hint}</p>}
                    </td>
                    <td className="px-1 py-3">
                      <div className="flex justify-center">
                        <Switch
                          label={`${info.label} in the dashboard`}
                          checked={!inAppMuted.includes(type)}
                          onChange={(on) => toggle("inApp", type, on)}
                        />
                      </div>
                    </td>
                    <td className="px-1 py-3">
                      <div className="flex justify-center">
                        <Switch
                          label={`${info.label} as push`}
                          checked={pushOn && !pushMuted.includes(type)}
                          disabled={!pushOn}
                          onChange={(on) => toggle("push", type, on)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-app-border! pt-4">
          <div>
            <p className="text-sm font-medium text-app-text">All push notifications</p>
            <p className="text-xs text-app-text-muted">Off stops push on every device, without changing the list above.</p>
          </div>
          <Switch
            label="All push notifications"
            checked={pushOn}
            onChange={(enabled) => run(update({ hid, push: { enabled } }))}
          />
        </div>
      </Card>
    </div>
  );
};

export default NotificationSettings;
