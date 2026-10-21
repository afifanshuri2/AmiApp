"use client";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import type { Profile } from "../lib/types";
import { Button } from "./ui/button";
import { signOut } from "../lib/notifications";
export function Pair({
  profile,
  refresh,
}: {
  profile: Profile;
  refresh: () => Promise<void>;
}) {
  const [key, setKey] = useState(""),
    [generated, setGenerated] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function pair(generate: boolean) {
    if (!supabase) return;
    setBusy(true);
    setMessage("");
    try {
      const { data, error } = await supabase.rpc(
        generate ? "generate_pair_key" : "join_pair",
        generate ? {} : { pair_key: key },
      );
      if (error) throw error;
      if (generate) {
        if (data) setGenerated(data);
        else setMessage("Too many invitations. Try again in 15 minutes.");
      } else if (!data)
        setMessage(
          "That key is unavailable or you have tried too often. Check with your person and try again later.",
        );
      await refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="pair-shell">
      <div className="mini-heart">♡</div>
      <p className="eyebrow">TWO HEARTS, ONE LITTLE SPACE</p>
      <h1>Find your {profile.role === "husband" ? "wife" : "husband"}.</h1>
      <p className="muted">
        Share a key or enter theirs. Your story opens when you’re both here.
      </p>
      <section className="card pair-card">
        <h2>A little key to us</h2>
        <p>Generate a private invitation for your person.</p>
        <Button disabled={busy} onClick={() => pair(true)}>
          {generated ? "Replace invitation key" : "Generate our key"}
        </Button>
        {generated && (
          <>
            <output className="pair-key">{generated}</output>
            <p className="muted">Expires in 15 minutes. Share it privately.</p>
            <Button variant="outline" disabled={busy} onClick={refresh}>
              My person has joined · Check again
            </Button>
          </>
        )}
        <div className="divider">or join your person</div>
        <label>
          6-digit invitation
          <input
            aria-label="6-digit invitation"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            value={key}
            onChange={(e) => setKey(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
          />
        </label>
        <Button disabled={busy || key.length !== 6} onClick={() => pair(false)}>
          Bring us together ♡
        </Button>
        {message && (
          <p role="alert" className="error">
            {message}
          </p>
        )}
      </section>
      <Button variant="ghost" onClick={signOut}>
        Log out
      </Button>
    </main>
  );
}
