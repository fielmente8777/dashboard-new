/* Eazotel dashboard: browser push notifications.
 *
 * Only handles push; it does not cache anything, so it never serves an old
 * version of the dashboard. Registered by src/utils/webPush.js.
 *
 * gian sends: { title, body, icon?, tag, renotify, data: { link, type, ... } }
 */

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: "Eazotel", body: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "Eazotel";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: payload.body || "",
      icon: payload.icon || "/logo192.png",
      badge: "/logo192.png",
      tag: payload.tag,
      renotify: Boolean(payload.tag && payload.renotify),
      data: payload.data || {},
    }),
  );
});

// Focus an open dashboard tab and take it to the notification's page, or
// open a new tab when none is open.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const link = event.notification.data?.link || "/";
  const url = new URL(link, self.location.origin).href;

  event.waitUntil(
    (async () => {
      const tabs = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const tab = tabs.find((client) => new URL(client.url).origin === self.location.origin);
      if (tab) {
        await tab.focus();
        if ("navigate" in tab) return tab.navigate(url);
        return undefined;
      }
      return self.clients.openWindow(url);
    })(),
  );
});
