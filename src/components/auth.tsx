"use client";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Logo } from "./logo";
import { supabase, usernameEmail } from "../lib/supabase";
import { Button } from "./ui/button";
export function Auth() {
  const [register, setRegister] = useState(false),
    [role, setRole] = useState<"husband" | "wife" | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError("");
    try {
      const form = new FormData(event.currentTarget);
      const username = String(form.get("username")).trim().toLowerCase(),
        password = String(form.get("password"));
      const result = register
        ? await supabase.auth.signUp({
            email: usernameEmail(username),
            password,
            options: { data: { username, role } },
          })
        : await supabase.auth.signInWithPassword({
            email: usernameEmail(username),
            password,
          });
      if (result.error) throw result.error;
      if (register && !result.data.session)
        throw new Error(
          "Account setup requires email confirmation to be disabled in Supabase. See README.",
        );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-shell">
      <section className="auth-form">
        <h1 className="wordmark">
          <Logo />
        </h1>
        {register && (
          <div className="role-options">
            {(["husband", "wife"] as const).map((r) => (
              <Button
                key={r}
                variant={role === r ? "default" : "outline"}
                aria-pressed={role === r}
                onClick={() => setRole(r)}
              >
                I’m the {r} {r === "husband" ? "☀" : "❀"}
              </Button>
            ))}
          </div>
        )}
        {(!register || role) && (
          <form onSubmit={submit}>
            <Label>
              Username
              <Input
                name="username"
                autoComplete="username"
                required
                pattern="[a-zA-Z0-9_]{3,24}"
                title="3–24 letters, numbers, or underscores"
                maxLength={24}
                placeholder="Username"
              />
            </Label>
            <Label>
              Password
              <Input
                name="password"
                type="password"
                autoComplete={register ? "new-password" : "current-password"}
                minLength={12}
                maxLength={72}
                required
                placeholder="At least 12 characters"
              />
            </Label>
            <Button disabled={busy || !supabase}>
              {busy ? "One moment…" : register ? "Create account" : "Sign in"}
              <ArrowRight size={16} />
            </Button>
          </form>
        )}
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <p className="muted">
          <button
            className="text-link"
            onClick={() => {
              setRegister(!register);
              setError("");
            }}
          >
            {register ? "Sign in" : "Create account"}
          </button>
        </p>
      </section>
    </main>
  );
}
