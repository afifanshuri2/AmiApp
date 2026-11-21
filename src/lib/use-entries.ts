"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";
import type { Entry } from "./types";

const POLL_MS = 30000;

/**
 * Shared entries, kept fresh while the tab is visible.
 * - Only the newest request may update state, so a slow poll never overwrites a newer save.
 * - Identical payloads keep the previous array, so idle polls do not re-render the app.
 * - Refetches never flip `loading`, so lists do not flash an empty state after a save.
 */
export function useEntries() {
  const [entries, setEntries] = useState<Entry[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const signature = useRef(""),
    latest = useRef(0);
  const reload = useCallback(async () => {
    if (!supabase) return;
    const ticket = ++latest.current;
    const { data, error } = await supabase
      .from("entries")
      .select("*")
      .order("created_at", { ascending: false });
    if (ticket !== latest.current) return;
    if (error) setError(error.message);
    else {
      const next = JSON.stringify(data);
      if (next !== signature.current) {
        signature.current = next;
        setEntries(data || []);
      }
      setError("");
    }
    setLoading(false);
  }, []);
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") void reload();
    };
    refresh();
    const timer = window.setInterval(refresh, POLL_MS);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [reload]);
  return { entries, loading, error, reload };
}
