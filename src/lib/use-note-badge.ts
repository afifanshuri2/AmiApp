"use client";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { updateAppBadge } from "./notifications";
export function useNoteBadge(
  userId: string,
  visibleNotes: string[],
  reading: boolean,
) {
  const [unread, setUnread] = useState(0);
  const noteIds = visibleNotes.join(",");
  useEffect(() => {
    let active = true;
    async function refresh() {
      if (!supabase || document.visibilityState !== "visible") return;
      if (reading && noteIds) {
        const { error } = await supabase
          .from("note_notifications")
          .update({ read_at: new Date().toISOString() })
          .eq("user_id", userId)
          .is("read_at", null)
          .in("entry_id", noteIds.split(","));
        if (error) return;
      }
      const { count, error } = await supabase
        .from("note_notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .is("read_at", null);
      if (!active || error) return;
      setUnread(count || 0);
      const gestures = await supabase
        .from("partner_gestures")
        .select("id", { count: "exact", head: true })
        .eq("recipient_id", userId)
        .is("read_at", null);
      if (active) await updateAppBadge((count || 0) + (gestures.count || 0));
    }
    void refresh();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 20000);
    window.addEventListener("ami-gestures-changed", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      active = false;
      window.removeEventListener("ami-gestures-changed", refresh);
      document.removeEventListener("visibilitychange", refresh);
      window.clearInterval(timer);
    };
  }, [userId, noteIds, reading]);
  return unread;
}
