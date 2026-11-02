// Browser push for dashboard notifications (Web Push with VAPID keys from
// gian; no Firebase). The service worker is public/sw-push.js.

const WORKER_URL = "/sw-push.js";

export const isPushSupported = () =>
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

// "granted" | "denied" | "default" | "unsupported"
export const pushPermission = () => (isPushSupported() ? Notification.permission : "unsupported");

// VAPID public key (base64url) -> the bytes PushManager wants
const keyToBytes = (base64url) => {
  const padding = "=".repeat((4 - (base64url.length % 4)) % 4);
  const base64 = (base64url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
};

const getRegistration = async () =>
  (await navigator.serviceWorker.getRegistration(WORKER_URL)) ||
  navigator.serviceWorker.register(WORKER_URL);

// this browser's current subscription, or null
export const getPushSubscription = async () => {
  if (!isPushSupported()) return null;
  const registration = await navigator.serviceWorker.getRegistration(WORKER_URL);
  return registration ? registration.pushManager.getSubscription() : null;
};

// Asks for permission (must run from a click) and subscribes this browser.
// Resolves with the subscription JSON to send to gian. Throws with a message
// the page can show.
export const subscribeBrowser = async (publicKey) => {
  if (!isPushSupported()) throw new Error("This browser does not support push notifications.");
  if (!publicKey) throw new Error("Push notifications are not set up on the server yet.");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error(
      permission === "denied"
        ? "Notifications are blocked for this site. Allow them in the browser's site settings, then try again."
        : "Permission was not given.",
    );
  }

  const registration = await getRegistration();
  await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  const subscription =
    existing ||
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: keyToBytes(publicKey),
    }));
  return subscription.toJSON();
};

// Unsubscribes this browser; resolves with the endpoint gian should forget.
export const unsubscribeBrowser = async () => {
  const subscription = await getPushSubscription();
  if (!subscription) return null;
  const { endpoint } = subscription;
  await subscription.unsubscribe();
  return endpoint;
};
