self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim()),
);
// No fetch handler: authenticated pages and couple data are never cached.
self.addEventListener("push", (event) => {
  event.waitUntil(
    (async () => {
      let payload = {};
      try {
        payload = event.data?.json() || {};
      } catch {}
      const unread =
        Number.isSafeInteger(payload.unread) && payload.unread > 0
          ? payload.unread
          : 1;
      const gestureBodies = {
        poke: "Your person sent you a little poke 👉",
        nudge: "A little nudge from your person 🫶",
        kiss: "Your person sent you a kiss 💋",
      };
      const gesture =
        payload.type === "gesture" &&
        Object.hasOwn(gestureBodies, payload.kind);
      await Promise.all([
        self.registration.showNotification("AmiApp ♡", {
          body: gesture
            ? gestureBodies[payload.kind]
            : "Your person left you a ShortNote.",
          icon: "/icons/icon-192.png",
          badge: "/icons/icon-192.png",
          tag: payload.tag || "amiapp-shortnote",
          data: { url: gesture ? "/" : "/?view=ShortNotes" },
        }),
        self.navigator.setAppBadge?.(unread).catch(() => {}),
      ]);
    })(),
  );
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      const target =
        event.notification.data?.url === "/" ? "/" : "/?view=ShortNotes";
      const url = new URL(target, self.location.origin).href;
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      const existing = windows.find(
        (client) => new URL(client.url).origin === self.location.origin,
      );
      if (existing) {
        await existing.navigate(url);
        await existing.focus();
      } else await self.clients.openWindow(url);
    })(),
  );
});
