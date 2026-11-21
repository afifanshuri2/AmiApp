"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";
import { updateAppBadge } from "./notifications";

const POLL_MS = 30000;

export function useNoteBadge(
  userId: string,
  visibleNotes: string[],
  reading: boolean,
) {
  const [unread, setUnread] = useState(0);
  const noteIds = visibleNotes.join(",");
  // Read the latest values inside one long-lived poller, so a new note or a
  // tab change never tears down the timers and listeners.
  const latest = useRef({ noteIds, reading });
  latest.current = { noteIds, reading };
  const refreshRef = useRef<() => Promise<void>>(async () => {});
  useEffect(() => {
    if ("serviceWorker" in navigator)
      void navigator.serviceWorker
        .getRegistration("/")
        .then((registration) => registration?.update())
        .catch(() => {});
  }, []);
  useEffect(() => {
    let active = true,
      running = false;
    async function refresh() {
      if (!supabase || running || document.visibilityState !== "visible")
        return;
      running = true;
      try {
        const { noteIds: ids, reading: isReading } = latest.current;
        if (isReading && ids) {
          const { error } = await supabase
            .from("note_notifications")
            .update({ read_at: new Date().toISOString() })
            .eq("user_id", userId)
            .is("read_at", null)
            .in("entry_id", ids.split(","));
          if (error) return;
        }
        const [notes, gestures] = await Promise.all([
          supabase
            .from("note_notifications")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
            .is("read_at", null),
          supabase
            .from("partner_gestures")
            .select("id", { count: "exact", head: true })
            .eq("recipient_id", userId)
            .is("read_at", null),
        ]);
        if (!active || notes.error) return;
        setUnread(notes.count || 0);
        await updateAppBadge((notes.count || 0) + (gestures.count || 0));
      } finally {
        running = false;
      }
    }
    refreshRef.current = refresh;
    void refresh();
    const timer = window.setInterval(() => void refresh(), POLL_MS);
    const onChange = () => void refresh();
    window.addEventListener("ami-gestures-changed", onChange);
    document.addEventListener("visibilitychange", onChange);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("ami-gestures-changed", onChange);
      document.removeEventListener("visibilitychange", onChange);
    };
  }, [userId]);
  // Opening the notes view, or receiving new notes while reading, marks them read.
  useEffect(() => {
    if (reading) void refreshRef.current();
  }, [reading, noteIds]);
  return unread;
}
