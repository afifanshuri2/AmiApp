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

test("partner gestures use safe notification text and open the dashboard", async () => {
  const handlers = {},
    shown = [],
    opened = [];
  const self = {
    addEventListener: (name, fn) => (handlers[name] = fn),
    registration: { showNotification: async (...args) => shown.push(args) },
    navigator: { setAppBadge: async () => {} },
    location: { origin: "https://amiapp.test" },
    clients: {
      matchAll: async () => [],
      openWindow: async (url) => opened.push(url),
    },
  };
  vm.runInNewContext(readFileSync("public/sw.js", "utf8"), { self, URL });
  let work;
  for (const kind of ["poke", "nudge", "kiss"]) {
    handlers.push({
      data: {
        json: () => ({
          type: "gesture",
          kind,
          body: "untrusted private content",
          url: "https://malicious.test",
          unread: 4,
        }),
      },
      waitUntil: (p) => (work = p),
    });
    await work;
    const notification = shown.at(-1)[1];
    assert.ok(!notification.body.includes("untrusted"));
    assert.equal(notification.data.url, "/");
    handlers.notificationclick({
      notification: { close() {}, data: notification.data },
      waitUntil: (p) => (work = p),
    });
    await work;
    assert.equal(opened.at(-1), "https://amiapp.test/");
  }
  handlers.push({
    data: {
      json: () => ({ type: "gesture", kind: "__proto__", body: "untrusted" }),
    },
    waitUntil: (p) => (work = p),
  });
  await work;
  assert.equal(shown.at(-1)[1].body, "Your person left you a ShortNote.");
  handlers.notificationclick({
    notification: { close() {}, data: { url: "https://malicious.test" } },
    waitUntil: (p) => (work = p),
  });
  await work;
  assert.equal(opened.at(-1), "https://amiapp.test/?view=ShortNotes");
});
