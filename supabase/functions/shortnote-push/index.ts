import { createClient } from "npm:@supabase/supabase-js@2.118.0";
import webpush from "npm:web-push@3.6.7";
const project = Deno.env.get("SUPABASE_URL")!;
const secret =
  JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}").default ||
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(project, secret, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const cors = {
  "Access-Control-Allow-Origin": "https://amiapp-afifanshuri2.netlify.app",
  "Access-Control-Allow-Headers":
    "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const reply = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: cors });
const allowedEndpoint = (endpoint: string) =>
  /^https:\/\/(web\.push\.apple\.com|fcm\.googleapis\.com|[a-z0-9.-]+\.push\.services\.mozilla\.com)\//.test(
    endpoint,
  );
async function credentials(initialize = false) {
  const keys = initialize ? webpush.generateVAPIDKeys() : null;
  const { data, error } = await admin.rpc(
    "push_credentials",
    keys ? { new_public: keys.publicKey, new_private: keys.privateKey } : {},
  );
  if (error) throw error;
  return data;
}
Deno.serve(async (request) => {
  if (request.method === "OPTIONS")
    return new Response(null, { headers: cors });
  if (request.method !== "POST")
    return reply({ error: "Method not allowed" }, 405);
  try {
    const hook = request.headers.get("x-ami-push-secret");
    if (!hook) {
      const token = request.headers
        .get("Authorization")
        ?.replace(/^Bearer\s+/i, "");
      if (!token) return reply({ error: "Login required" }, 401);
      const {
        data: { user },
        error,
      } = await admin.auth.getUser(token);
      if (error || !user) return reply({ error: "Login required" }, 401);
      const { data: profile } = await admin
        .from("profiles")
        .select("couple_id")
        .eq("id", user.id)
        .single();
      if (!profile?.couple_id) return reply({ error: "Pair first" }, 403);
      const config = await credentials(true);
      return reply({ publicKey: config.publicKey });
    }
    const config = await credentials();
    // Compare fixed-length digests so supplied webhook values do not leak timing.
    const digest = async (value: string) =>
      new Uint8Array(
        await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
      );
    const [actual, expected] = await Promise.all([
      digest(hook),
      digest(config.webhookSecret),
    ]);
    let difference = 0;
    for (let i = 0; i < actual.length; i++)
      difference |= actual[i] ^ expected[i];
    if (difference) return reply({ error: "Unauthorized" }, 401);
    const { notificationId, gestureId } = await request.json();
    if (notificationId && gestureId)
      return reply({ error: "Invalid request" }, 400);
    const isGesture = typeof gestureId === "string";
    const recordId = isGesture ? gestureId : notificationId;
    const table = isGesture ? "partner_gestures" : "note_notifications";
    if (typeof recordId !== "string" || !/^[0-9a-f-]{36}$/i.test(recordId))
      return reply({ error: "Invalid request" }, 400);
    const { data: notification, error } = await admin
      .from(table)
      .select("*")
      .eq("id", recordId)
      .maybeSingle();
    if (error) throw error;
    if (!notification || notification.read_at || notification.dispatched_at)
      return reply({ ok: true });
    const userId = isGesture ? notification.recipient_id : notification.user_id;
    const [notes, gestures] = await Promise.all([
      admin
        .from("note_notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .is("read_at", null),
      admin
        .from("partner_gestures")
        .select("id", { count: "exact", head: true })
        .eq("recipient_id", userId)
        .is("read_at", null),
    ]);
    if (notes.error || gestures.error)
      throw new Error("Could not count unread");
    const count = (notes.count || 0) + (gestures.count || 0);
    const { data: subscriptions, error: subscriptionError } = await admin
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", userId);
    if (subscriptionError) throw subscriptionError;
    const payload = JSON.stringify({
      title: "AmiApp ♡",
      type: isGesture ? "gesture" : "shortnote",
      kind: isGesture ? notification.kind : undefined,
      unread: count || 1,
      tag: notification.id,
    });
    let failed = false;
    await Promise.all(
      (subscriptions || []).map(async (sub) => {
        if (!allowedEndpoint(sub.endpoint)) return;
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            payload,
            {
              TTL: 86400,
              urgency: "normal",
              vapidDetails: {
                subject: "https://amiapp-afifanshuri2.netlify.app",
                publicKey: config.publicKey,
                privateKey: config.privateKey,
              },
              timeout: 8000,
            },
          );
        } catch (error) {
          const status = (error as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410)
            await admin.from("push_subscriptions").delete().eq("id", sub.id);
          else failed = true;
        }
      }),
    );
    if (!failed)
      await admin
        .from(table)
        .update({ dispatched_at: new Date().toISOString() })
        .eq("id", notification.id);
    return reply({ ok: !failed }, failed ? 502 : 200);
  } catch {
    return reply({ error: "Could not process notification" }, 500);
  }
});
