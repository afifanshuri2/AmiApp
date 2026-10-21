import { supabase } from "./supabase";
export async function enableNotifications(userId: string) {
  if (
    !supabase ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window) ||
    !("Notification" in window)
  )
    throw new Error(
      "On iPhone, add AmiApp to your Home Screen in Safari, then open it from its icon to enable notifications.",
    );
  // Ask in direct response to the Settings button, before network requests.
  const permission = await Notification.requestPermission();
  if (permission !== "granted")
    throw new Error(
      "Notifications are not allowed. You can change this in your device settings.",
    );
  const { data, error } = await supabase.functions.invoke("shortnote-push", {
    body: { action: "publicKey" },
  });
  if (error || !data?.publicKey)
    throw new Error("Could not enable notifications. Please try again.");
  await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  const registration = await navigator.serviceWorker.ready;
  const base64 = data.publicKey.replace(/-/g, "+").replace(/_/g, "/");
  const applicationServerKey = Uint8Array.from(
    atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")),
    (c) => c.charCodeAt(0),
  );
  const subscription =
    (await registration.pushManager.getSubscription()) ||
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    }));
  const serialized = subscription.toJSON();
  const { error: deleteError } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", userId)
    .eq("endpoint", subscription.endpoint);
  if (deleteError) throw deleteError;
  const { error: saveError } = await supabase
    .from("push_subscriptions")
    .insert({
      user_id: userId,
      endpoint: subscription.endpoint,
      p256dh: serialized.keys?.p256dh,
      auth: serialized.keys?.auth,
    });
  if (saveError) {
    await subscription.unsubscribe();
    throw saveError;
  }
}
export async function disableNotifications(userId?: string) {
  if (!("serviceWorker" in navigator)) return;
  const registration = await navigator.serviceWorker.getRegistration("/");
  const subscription = await registration?.pushManager.getSubscription();
  if (subscription) {
    try {
      if (supabase && userId) {
        const { error } = await supabase
          .from("push_subscriptions")
          .delete()
          .eq("user_id", userId)
          .eq("endpoint", subscription.endpoint);
        if (error) throw error;
      }
    } finally {
      await subscription.unsubscribe();
    }
  }
  await updateAppBadge(0);
}
export async function updateAppBadge(count: number) {
  const badgeNavigator = navigator as Navigator & {
    setAppBadge?: (count: number) => Promise<void>;
    clearAppBadge?: () => Promise<void>;
  };
  try {
    if (count > 0) await badgeNavigator.setAppBadge?.(count);
    else await badgeNavigator.clearAppBadge?.();
  } catch {}
}
export async function signOut() {
  if (!supabase) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  try {
    await disableNotifications(user?.id);
  } catch {
    /* Unsubscribe is still attempted when the network is unavailable. */
  }
  await supabase.auth.signOut();
}
