/* eslint-disable no-restricted-globals */
// Eazotel Web Push service worker.
// Receives pushes from the backend (VAPID) and shows the OS / Chrome notification,
// even when the dashboard tab is closed.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim()),
);

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: "Eazotel", body: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "Eazotel";
  const options = {
    body: payload.body || "",
    icon: payload.icon || "/EAZOTEL_LOGO.png",
    badge: "/logo192.png",
    tag: payload.tag, // same tag replaces the previous popup (e.g. same chat)
    renotify: Boolean(payload.tag && payload.renotify),
    data: payload.data || {},
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const link = event.notification.data?.link || "/";
  const targetUrl = new URL(link, self.location.origin).href;

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      // reuse an open dashboard tab if there is one
      for (const client of windows) {
        if (new URL(client.url).origin === self.location.origin) {
          await client.focus();
          if ("navigate" in client) return client.navigate(targetUrl);
          return undefined;
        }
      }
      return self.clients.openWindow(targetUrl);
    })(),
  );
});
