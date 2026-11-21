"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Profile } from "../lib/types";
import { Dashboard } from "./dashboard";
import { RelationshipForm } from "./relationship-form";
import { Button } from "./ui/button";
type Settings = { together_since: string | null };
export function CoupleSpace({
  profile,
  partner,
}: {
  profile: Profile;
  partner: Profile;
}) {
  const [settings, setSettings] = useState<Settings | null | undefined>(),
    [error, setError] = useState("");
  const load = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("couple_settings")
      .select("together_since")
      .eq("couple_id", profile.couple_id!)
      .maybeSingle();
    if (error) setError(error.message);
    else {
      setSettings(data);
      setError("");
    }
  }, [profile.couple_id]);
  // The date changes rarely, so load it once and again when the app returns to
  // the foreground, instead of polling every few seconds.
  useEffect(() => {
    void load();
    const onVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [load]);
  if (settings === undefined)
    return (
      <main className="pair-shell">
        <p>{error || "Opening our little space…"}</p>
        {error && <Button onClick={load}>Try again</Button>}
      </main>
    );
  if (settings === null)
    return (
      <main className="pair-shell">
        <RelationshipForm
          initialDate={null}
          onboarding
          onSaved={async (date) => {
            setSettings({ together_since: date });
          }}
        />
      </main>
    );
  return (
    <Dashboard
      profile={profile}
      partner={partner}
      togetherSince={settings.together_since}
      onRelationshipSaved={async (date) => {
        setSettings({ together_since: date });
      }}
    />
  );
}
