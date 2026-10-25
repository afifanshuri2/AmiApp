import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
test("push shows a private visible notification, updates badge, and opens same-origin ShortNotes", async () => {
  const handlers = {},
    shown = [],
    badges = [],
    opened = [];
  const self = {
    addEventListener: (name, callback) => (handlers[name] = callback),
    registration: { showNotification: async (...args) => shown.push(args) },
    navigator: { setAppBadge: async (n) => badges.push(n) },
    location: { origin: "https://amiapp.test" },
    clients: {
      matchAll: async () => [],
      openWindow: async (url) => opened.push(url),
    },
  };
  vm.runInNewContext(readFileSync("public/sw.js", "utf8"), { self, URL });
  let work;
  handlers.push({
    data: {
      json: () => ({
        title: "Do not show private contents",
        body: "private note",
        unread: 3,
        url: "https://malicious.test",
      }),
    },
    waitUntil: (promise) => {
      work = promise;
    },
  });
  await work;
  assert.equal(shown[0][0], "AmiApp ♡");
  assert.equal(shown[0][1].body, "Your person left you a ShortNote.");
  assert.equal(badges[0], 3);
  assert.equal(handlers.fetch, undefined);
  handlers.notificationclick({
    notification: { close() {} },
    waitUntil: (promise) => {
      work = promise;
    },
  });
  await work;
  assert.deepEqual(opened, ["https://amiapp.test/?view=ShortNotes"]);
});
