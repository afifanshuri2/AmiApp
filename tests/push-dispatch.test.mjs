import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { webcrypto } from "node:crypto";
import vm from "node:vm";
import { stripTypeScriptTypes } from "node:module";

test("push dispatch authenticates the hook, routes only to the recorded recipient, and combines unread counts", async () => {
  let handler;
  const sent = [],
    queries = [];
  const id = "00000000-0000-4000-8000-000000000001";
  let delivered = false;
  const admin = {
    rpc: async () => ({
      data: {
        publicKey: "public",
        privateKey: "private",
        webhookSecret: "hook-secret",
      },
    }),
    auth: { getUser: async () => ({ data: { user: null }, error: true }) },
    from(table) {
      const query = { table, filters: {}, update: null, head: false };
      queries.push(query);
      const builder = {
        select(_, options) {
          query.head = !!options?.head;
          return builder;
        },
        eq(key, value) {
          query.filters[key] = value;
          return builder;
        },
        is(key, value) {
          query.filters[key] = value;
          return builder;
        },
        update(value) {
          query.update = value;
          return builder;
        },
        delete() {
          return builder;
        },
        maybeSingle: async () => ({
          data: {
            id,
            recipient_id: "partner",
            user_id: "partner",
            kind: "kiss",
            dispatched_at: delivered ? "already sent" : null,
          },
        }),
        then(resolve, reject) {
          return Promise.resolve(
            query.head
              ? { count: table === "partner_gestures" ? 3 : 2 }
              : table === "push_subscriptions"
                ? {
                    data: [
                      {
                        id: "subscription",
                        endpoint: "https://web.push.apple.com/test",
                        p256dh: "key",
                        auth: "auth",
                      },
                    ],
                  }
                : { data: null },
          ).then(resolve, reject);
        },
      };
      return builder;
    },
  };
  const source = readFileSync(
    "supabase/functions/shortnote-push/index.ts",
    "utf8",
  ).replace(/^import .*;\r?\n/gm, "");
  const js = stripTypeScriptTypes(source);
  vm.runInNewContext(js, {
    createClient: () => admin,
    webpush: {
      sendNotification: async (subscription, payload) =>
        sent.push({ subscription, payload: JSON.parse(payload) }),
    },
    Deno: {
      env: { get: (key) => (key === "SUPABASE_SECRET_KEYS" ? "{}" : "test") },
      serve: (fn) => {
        handler = fn;
      },
    },
    Response,
    TextEncoder,
    crypto: webcrypto,
  });
  const request = (body, hook = "hook-secret") =>
    new Request("https://amiapp.test/push", {
      method: "POST",
      headers: {
        "x-ami-push-secret": hook,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  assert.equal(
    (await handler(request({ gestureId: id }, "forged"))).status,
    401,
  );
  assert.equal(sent.length, 0);
  assert.equal(
    (await handler(request({ gestureId: id, notificationId: id }))).status,
    400,
  );
  assert.equal(
    (await handler(request({ gestureId: id, recipient_id: "outsider" })))
      .status,
    200,
  );
  assert.equal(sent.length, 1);
  assert.equal(sent[0].payload.type, "gesture");
  assert.equal(sent[0].payload.kind, "kiss");
  assert.equal(sent[0].payload.unread, 5);
  assert.ok(
    queries.some(
      (q) =>
        q.table === "push_subscriptions" && q.filters.user_id === "partner",
    ),
  );
  assert.ok(
    !queries.some((q) => Object.values(q.filters).includes("outsider")),
  );
  assert.ok(
    queries.some(
      (q) => q.table === "partner_gestures" && q.update?.dispatched_at,
    ),
  );
  delivered = true;
  await handler(request({ gestureId: id }));
  assert.equal(sent.length, 1);
  delivered = false;
  await handler(request({ notificationId: id }));
  assert.equal(sent[1].payload.type, "shortnote");
});
