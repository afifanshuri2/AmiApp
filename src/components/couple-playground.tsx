"use client";
import { useEffect, useRef, useState } from "react";
import { Heart, Pencil, RefreshCw, X } from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { NativeSelect, NativeSelectOption } from "./ui/native-select";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { CoupleAvatar } from "./couple-avatar";
import {
  avatarConfig,
  avatarOptions,
  gestures,
  type AvatarConfig,
  type AvatarRecord,
  type GestureKind,
} from "../lib/avatars";
import {
  coupleInteractions,
  type CoupleInteractionStore,
} from "../lib/couple-interactions";
import type { Profile } from "../lib/types";

const fieldLabels: Record<keyof AvatarConfig, string> = {
  skin: "Skin tone",
  hair: "Hairstyle",
  hair_color: "Hair color",
  headwear: "Headwear",
  glasses: "Glasses",
  outfit: "Outfit color",
};
function AvatarEditor({
  initial,
  name,
  theme,
  save,
  close,
}: {
  initial: AvatarConfig;
  name: string;
  theme: string;
  save: (avatar: AvatarConfig) => Promise<void>;
  close: () => void;
}) {
  const [draft, setDraft] = useState(initial),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) close();
      }}
    >
      <DialogContent
        className="entry-dialog avatar-dialog"
        data-theme={theme}
        showCloseButton={false}
        aria-describedby={undefined}
      >
        <div className="section-heading">
          <DialogTitle asChild>
            <h2>A little more you</h2>
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            disabled={busy}
            aria-label="Close avatar editor"
            onClick={close}
          >
            <X size={18} />
          </Button>
        </div>
        <div className="avatar-editor-preview">
          <CoupleAvatar name={name} config={draft} />
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            try {
              await save(draft);
              close();
            } catch (err) {
              setError(
                err instanceof Error
                  ? err.message
                  : "Could not save. Try again.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="avatar-fields">
            {(Object.keys(avatarOptions) as (keyof AvatarConfig)[]).map(
              (key) => (
                <div key={key}>
                  <Label htmlFor={`avatar-${key}`}>{fieldLabels[key]}</Label>
                  <NativeSelect
                    id={`avatar-${key}`}
                    value={draft[key]}
                    disabled={busy}
                    onChange={(e) =>
                      setDraft((current) => ({
                        ...current,
                        [key]: e.target.value,
                      }))
                    }
                  >
                    {Object.entries(avatarOptions[key]).map(
                      ([value, label]) => (
                        <NativeSelectOption key={value} value={value}>
                          {label}
                        </NativeSelectOption>
                      ),
                    )}
                  </NativeSelect>
                </div>
              ),
            )}
          </div>
          {error && (
            <p className="playground-error" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" disabled={busy}>
            {busy ? "Saving your look…" : "Save my avatar ♡"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CouplePlayground({
  profile,
  partner,
  theme,
  store = coupleInteractions,
}: {
  profile: Profile;
  partner: Profile;
  theme: string;
  store?: CoupleInteractionStore;
}) {
  const [avatars, setAvatars] = useState<AvatarRecord[]>([]);
  const [editing, setEditing] = useState(false),
    [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [cooldown, setCooldown] = useState(false);
  const mounted = useRef(false),
    sending = useRef(false),
    retry = useRef<() => void>(() => {});
  useEffect(() => {
    mounted.current = true;
    let active = true,
      fetching = false;
    async function refresh() {
      if (fetching || document.visibilityState !== "visible") return;
      fetching = true;
      try {
        const data = await store.load(profile.id);
        if (!active) return;
        setAvatars(data.avatars);
        setReady(true);
        setError("");
      } catch (err) {
        if (active)
          setError(
            err instanceof Error
              ? err.message
              : "Could not open your little space.",
          );
      } finally {
        fetching = false;
      }
    }
    retry.current = () => {
      void refresh();
    };
    void refresh();
    const interval = window.setInterval(() => {
      void refresh();
    }, 10000);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      mounted.current = false;
      retry.current = () => {};
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [store, profile.id]);
  useEffect(() => {
    if (!cooldown) return;
    const timer = window.setTimeout(() => setCooldown(false), 10000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);
  async function send(kind: GestureKind) {
    if (sending.current || cooldown || !ready) return;
    sending.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await store.send(kind);
      if (mounted.current) {
        setMessage(
          `${gestures[kind].emoji} ${gestures[kind].label} sent to ${partner.username}. A little love is on its way!`,
        );
        setCooldown(true);
      }
    } catch (err) {
      if (mounted.current)
        setError(
          err instanceof Error
            ? err.message
            : "Could not send. Please try again.",
        );
    } finally {
      sending.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  const mine = avatarConfig(avatars.find((a) => a.user_id === profile.id)),
    theirs = avatarConfig(avatars.find((a) => a.user_id === partner.id));
  return (
    <section className="couple-playground" aria-label="Our little world">
      <div className="playground-heading">
        <span className="pill">♡ JUST THE TWO OF US</span>
        <h2>Our little world</h2>
        <p>A tiny hello, just for your person.</p>
      </div>
      <div className="avatar-pair">
        <div className="avatar-person">
          <CoupleAvatar config={mine} name={profile.username} />
          <strong>{profile.username}</strong>
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
            <Pencil size={12} />
            My avatar
          </Button>
        </div>
        <Heart className="avatar-between" size={25} aria-hidden="true" />
        <div className="avatar-person">
          <CoupleAvatar config={theirs} name={partner.username} />
          <strong>{partner.username}</strong>
          <span className="avatar-caption">your favorite person</span>
        </div>
      </div>
      <div
        className="gesture-actions"
        aria-label={`Send a little love to ${partner.username}`}
      >
        {(Object.keys(gestures) as GestureKind[]).map((kind) => (
          <Button
            key={kind}
            variant="outline"
            disabled={!ready || busy || cooldown}
            onClick={() => void send(kind)}
          >
            <span aria-hidden="true">{gestures[kind].emoji}</span>
            {gestures[kind].label}
          </Button>
        ))}
      </div>
      <p className="gesture-status" role="status">
        {message ||
          (cooldown
            ? "Let that little love land ♡"
            : "A little tap can make their day.")}
      </p>
      {error && (
        <div className="playground-error" role="status">
          <span>{error}</span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Retry loading our little world"
            onClick={() => retry.current()}
          >
            <RefreshCw size={14} />
          </Button>
        </div>
      )}
      {editing && (
        <AvatarEditor
          initial={mine}
          name={profile.username}
          theme={theme}
          close={() => setEditing(false)}
          save={async (avatar) => {
            await store.saveAvatar(profile.id, avatar);
            if (mounted.current)
              setAvatars((current) => [
                ...current.filter((a) => a.user_id !== profile.id),
                { user_id: profile.id, ...avatar },
              ]);
          }}
        />
      )}
    </section>
  );
}
