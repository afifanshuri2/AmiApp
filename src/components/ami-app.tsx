"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Profile } from "../lib/types";
import { Auth } from "./auth";
import { Pair } from "./pair";
import { Dashboard } from "./dashboard";
import { Button } from "./ui/button";
export function AmiApp() {
  const [profile, setProfile] = useState<Profile | null>(null),
    [partner, setPartner] = useState<Profile | null>(null),
    [loading, setLoading] = useState(!!supabase),
    [error, setError] = useState("");
  const refresh = useCallback(async () => {
    if (!supabase) return;
    setError("");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (!user) {
      setProfile(null);
      setPartner(null);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.from("profiles").select("*");
    if (error || authError)
      setError(
        error?.message || authError?.message || "Unable to load your space.",
      );
    else {
      setProfile(data?.find((p) => p.id === user.id) || null);
      setPartner(data?.find((p) => p.id !== user.id) || null);
      if (!data?.some((p) => p.id === user.id))
        setError(
          "Profile missing. Apply the Supabase migration before creating accounts.",
        );
    }
    setLoading(false);
  }, []);
  useEffect(() => {
    if (!supabase) return;
    let active = true;
    void refresh();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      if (active)
        window.setTimeout(() => {
          if (active) void refresh();
        }, 0);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [refresh]);
  if (loading)
    return (
      <main className="pair-shell">
        <div className="mini-heart">♡</div>
        <p>Opening our little space…</p>
      </main>
    );
  if (error)
    return (
      <main className="pair-shell">
        <p role="alert" className="error">
          {error}
        </p>
        <Button onClick={refresh}>Try again</Button>
        <Button variant="ghost" onClick={() => supabase?.auth.signOut()}>
          Log out
        </Button>
      </main>
    );
  if (!profile) return <Auth />;
  if (!profile.couple_id || !partner)
    return <Pair profile={profile} refresh={refresh} />;
  return <Dashboard profile={profile} partner={partner} />;
}
