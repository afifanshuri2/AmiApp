"use client";
import { Card } from "./ui/card";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  enableNotifications,
  disableNotifications,
} from "../lib/notifications";
import { Button } from "./ui/button";
export function NotificationSettings({ userId }: { userId: string }) {
  const [enabled, setEnabled] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  useEffect(() => {
    let active = true;
    void (async () => {
      if (!("serviceWorker" in navigator) || !supabase) return;
      const registration = await navigator.serviceWorker.getRegistration("/");
      const subscription = await registration?.pushManager.getSubscription();
      if (!subscription) return;
      const { data } = await supabase
        .from("push_subscriptions")
        .select("id")
        .eq("user_id", userId)
        .eq("endpoint", subscription.endpoint)
        .maybeSingle();
      if (active) setEnabled(!!data);
    })().catch(() => {});
    return () => {
      active = false;
    };
  }, [userId]);
  async function toggle() {
    setBusy(true);
    setMessage("");
    try {
      if (enabled) await disableNotifications(userId);
      else await enableNotifications(userId);
      setEnabled(!enabled);
      setMessage(
        enabled
          ? "Notifications disabled on this device."
          : "Notifications enabled on this device. ♡",
      );
    } catch (e) {
      setMessage(
        e && typeof e === "object" && "message" in e
          ? String(e.message)
          : "Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Card className="card notification-settings">
      <h2>Notes from your person</h2>
      <p className="muted">
        Get a push alert and an unread badge when your partner leaves a
        ShortNote. The note itself stays private.
      </p>
      <p className="muted">
        On iPhone: add AmiApp to your Home Screen, open it from its icon, then
        enable notifications here. Requires iOS 16.4 or later.
      </p>
      <Button disabled={busy} onClick={toggle}>
        {busy
          ? "One moment…"
          : enabled
            ? "Disable notifications"
            : "Enable notifications"}
      </Button>
      {message && <p role="status">{message}</p>}
    </Card>
  );
}
