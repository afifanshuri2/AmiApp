"use client";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { todayDate } from "../lib/relationship";
import { Button } from "./ui/button";
export function RelationshipForm({
  initialDate,
  onboarding = false,
  onSaved,
}: {
  initialDate: string | null;
  onboarding?: boolean;
  onSaved: (date: string | null) => Promise<void>;
}) {
  const [date, setDate] = useState(initialDate || ""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  async function save(value: string | null) {
    if (!supabase) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const { data, error } = await supabase.rpc("save_relationship_date", {
        start_date: value,
        only_if_missing: onboarding,
      });
      if (error) throw error;
      await onSaved(data);
      setDate(data || "");
      setMessage("Saved for both of you ♡");
    } catch (e) {
      setError(
        e && typeof e === "object" && "message" in e
          ? String(e.message)
          : "Could not save. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="card relationship-form">
      <p className="eyebrow">OUR STORY</p>
      <h2>
        {onboarding ? "When did your story begin?" : "Relationship settings"}
      </h2>
      <p className="muted">
        {onboarding
          ? "Optional — add the day you got together, or save it for later."
          : "This date is shared with your person. Either of you can change it."}
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void save(date || null);
        }}
      >
        <label>
          Together since
          <input
            type="date"
            value={date}
            max={todayDate()}
            disabled={busy}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <Button disabled={busy}>
          {busy ? "Saving…" : onboarding ? "Continue ♡" : "Save changes"}
        </Button>
        {onboarding ? (
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => save(null)}
          >
            Skip for now
          </Button>
        ) : (
          date && (
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() => save(null)}
            >
              Remove date
            </Button>
          )
        )}
      </form>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="muted">
          {message}
        </p>
      )}
    </section>
  );
}
