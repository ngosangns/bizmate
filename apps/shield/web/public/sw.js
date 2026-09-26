/* Shield Service Worker — local notifications stub (NOT a push gateway).
 * Honesty: shows Notification API alerts when the page posts shield:show-notify.
 * No remote push subscription. Cache = offline demo shell only.
 */
const CACHE = "shield-pwa-v1";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  event.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).catch(() => caches.match("./index.html")))
  );
});

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || data.type !== "shield:show-notify" || !data.payload) return;
  const p = data.payload;
  const title = p.title || "Shield";
  const options = {
    body: p.body || "",
    tag: p.tag || "shield",
    icon: "./icon-192.png",
    badge: "./icon-192.png",
    data: {
      honesty: p.honesty || "local-sw-stub",
      action: p.action,
      messageId: p.messageId,
    },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const c of clients) {
        if ("focus" in c) return c.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow("./");
    })
  );
});
