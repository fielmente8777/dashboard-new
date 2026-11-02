import {
  getPushPublicKey,
  subscribePush,
} from "../services/api/notification.api";

// Browser (Chrome) push notifications via our own backend — no Firebase.

const SW_URL = "/notification-sw.js";

export const isPushSupported = () =>
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

export const getPushPermission = () =>
  isPushSupported() ? Notification.permission : "unsupported";

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
};

// Registers the service worker, subscribes this browser and saves it on the backend.
// Safe to call on every page load — it reuses the existing subscription.
export const ensurePushSubscription = async () => {
  if (!isPushSupported() || Notification.permission !== "granted") return null;

  const config = await getPushPublicKey();
  const publicKey = config?.result?.publicKey;
  if (!config?.result?.enabled || !publicKey) {
    console.warn("🔔 [push] disabled on backend (VAPID keys missing)");
    return null;
  }

  const registration = await navigator.serviceWorker.register(SW_URL);
  await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();

  // backend keys changed -> old subscription can't receive pushes anymore
  if (subscription) {
    const currentKey = subscription.options?.applicationServerKey;
    const expected = urlBase64ToUint8Array(publicKey);
    const same =
      currentKey &&
      new Uint8Array(currentKey).every((b, i) => b === expected[i]);
    if (!same) {
      await subscription.unsubscribe();
      subscription = null;
    }
  }

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  const res = await subscribePush(subscription.toJSON());
  console.log("🔔 [push] subscription saved:", res);
  return subscription;
};

// Must be called from a user click (Chrome blocks/hides prompts otherwise).
export const enablePushNotifications = async () => {
  if (!isPushSupported()) return "unsupported";
  const permission = await Notification.requestPermission();
  if (permission === "granted") await ensurePushSubscription();
  return permission;
};
