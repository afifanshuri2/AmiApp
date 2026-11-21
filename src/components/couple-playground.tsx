"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CalendarPlus } from "lucide-react";
import { CountUp } from "./motion-bits";
import {
  Angry,
  BellRing,
  CalendarHeart,
  Crown,
  Flower2,
  Frown,
  Glasses,
  Heart,
  Laugh,
  Meh,
  Moon,
  Pencil,
  PartyPopper,
  Pointer,
  RefreshCw,
  Smile,
  SmilePlus,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { NativeSelect, NativeSelectOption } from "./ui/native-select";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { CoupleAvatar } from "./couple-avatar";
import {
  avatarConfig,
  avatarOptions,
  gestures,
  moodEmoji,
  type AvatarConfig,
  type AvatarRecord,
  type GestureKind,
} from "../lib/avatars";
import {
  coupleInteractions,
  type CoupleInteractionStore,
} from "../lib/couple-interactions";
import {
  daysTogether,
  relationshipDuration,
  todayDate,
} from "../lib/relationship";
import type { Entry, Profile } from "../lib/types";

const fieldLabels: Record<keyof AvatarConfig, string> = {
  skin: "Skin tone",
  hair: "Hairstyle",
  hair_color: "Hair color",
  headwear: "Headwear",
  glasses: "Glasses",
  outfit: "Outfit color",
  eyes: "Eye style",
  nose: "Nose",
  facial_hair: "Facial hair",
  mood: "Mood",
  clothing: "Clothing",
  accessory: "Accessory",
};
const fieldGroups: { title: string; keys: (keyof AvatarConfig)[] }[] = [
  { title: "Face", keys: ["skin", "eyes", "nose", "facial_hair"] },
  { title: "Hair and headwear", keys: ["hair", "hair_color", "headwear"] },
  {
    title: "Style",
    keys: ["clothing", "outfit", "glasses", "accessory"],
  },
];
const moodIcons: Record<AvatarConfig["mood"], LucideIcon> = {
  happy: Smile,
  neutral: Meh,
  angry: Angry,
  sad: Frown,
  sleepy: Moon,
  love: Heart,
  surprised: Sparkles,
  excited: PartyPopper,
  wink: SmilePlus,
  cool: Glasses,
  shy: Flower2,
  proud: Crown,
  silly: Laugh,
};
const gestureIcons: Record<GestureKind, LucideIcon> = {
  poke: Pointer,
  nudge: BellRing,
  kiss: Heart,
};
function AvatarEditor({
  initial,
  name,
  save,
  close,
}: {
  initial: AvatarConfig;
  name: string;
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
          <fieldset className="mood-picker" disabled={busy}>
            <legend>Mood</legend>
            {(Object.keys(avatarOptions.mood) as AvatarConfig["mood"][]).map(
              (mood) => (
                <button
                  key={mood}
                  type="button"
                  aria-pressed={draft.mood === mood}
                  onClick={() => setDraft((current) => ({ ...current, mood }))}
                >
                  <span aria-hidden="true">{moodEmoji[mood]}</span>
                  {avatarOptions.mood[mood]}
                </button>
              ),
            )}
          </fieldset>
          {fieldGroups.map((group) => (
            <fieldset
              key={group.title}
              className="avatar-group"
              disabled={busy}
            >
              <legend>{group.title}</legend>
              <div className="avatar-fields">
                {group.keys.map((key) => (
                  <div key={key}>
                    <Label htmlFor={`avatar-${key}`}>{fieldLabels[key]}</Label>
                    <NativeSelect
                      id={`avatar-${key}`}
                      value={draft[key]}
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
                ))}
              </div>
            </fieldset>
          ))}
          {error && (
            <p className="playground-error" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" disabled={busy}>
            {busy ? "Saving your look…" : "Save my avatar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// A small shower of the gesture's emoji, rising from the button that was tapped.
function Burst({ kind }: { kind: GestureKind }) {
  return (
    <span className="burst" aria-hidden="true">
      {[-34, -18, 0, 18, 34].map((x, i) => (
        <motion.span
          key={x}
          initial={{ opacity: 1, y: 0, x: 0, scale: 0.6 }}
          animate={{ opacity: 0, y: -70 - (i % 2) * 18, x, scale: 1.1 }}
          transition={{ duration: 0.9, delay: i * 0.04, ease: "easeOut" }}
        >
          {gestures[kind].emoji}
        </motion.span>
      ))}
    </span>
  );
}

function Person({
  name,
  config,
  onEdit,
}: {
  name: string;
  config: AvatarConfig;
  onEdit?: () => void;
}) {
  const Mood = moodIcons[config.mood],
    mood = avatarOptions.mood[config.mood];
  const portrait = (
    <>
      <CoupleAvatar config={config} name={name} />
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={config.mood}
          className="mood"
          title={mood}
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0 }}
          transition={{ type: "spring", stiffness: 520, damping: 20 }}
        >
          <Mood size={15} aria-hidden="true" />
          <span className="sr-only">{mood}</span>
        </motion.span>
      </AnimatePresence>
      {onEdit && (
        <span className="edit-badge" aria-hidden="true">
          <Pencil size={12} />
        </span>
      )}
    </>
  );
  return (
    <div className="person">
      {onEdit ? (
        <motion.button
          type="button"
          className="portrait"
          aria-label="Edit my avatar"
          whileHover={{ scale: 1.05, rotate: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={onEdit}
        >
          {portrait}
        </motion.button>
      ) : (
        <div className="portrait">{portrait}</div>
      )}
      <strong>{name}</strong>
    </div>
  );
}

const MAX_DATES = 3;
function daysUntil(date: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round(
    (new Date(date + "T00:00:00").getTime() - today.getTime()) / 86400000,
  );
}

export function CouplePlayground({
  profile,
  partner,
  togetherSince,
  dates = [],
  onAddDate,
  onSeeDates,
  store = coupleInteractions,
}: {
  profile: Profile;
  partner: Profile;
  togetherSince: string | null;
  /** Upcoming important dates, soonest first. */
  dates?: Entry[];
  onAddDate?: () => void;
  onSeeDates?: () => void;
  store?: CoupleInteractionStore;
}) {
  const [avatars, setAvatars] = useState<AvatarRecord[]>([]);
  const [editing, setEditing] = useState(false),
    [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [cooldown, setCooldown] = useState(false),
    [today, setToday] = useState(todayDate),
    [burst, setBurst] = useState<{ id: number; kind: GestureKind } | null>(
      null,
    );
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
        const data = await store.loadAvatars();
        if (!active) return;
        // Avoid re-rendering the hero when nothing about the avatars changed.
        setAvatars((current) =>
          JSON.stringify(current) === JSON.stringify(data) ? current : data,
        );
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
    // Avatars rarely change; focus and visibility refresh them promptly.
    const interval = window.setInterval(() => void refresh(), 60000);
    const day = window.setInterval(() => setToday(todayDate()), 60000);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      mounted.current = false;
      retry.current = () => {};
      window.clearInterval(interval);
      window.clearInterval(day);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [store]);
  useEffect(() => {
    if (!burst) return;
    const timer = window.setTimeout(() => setBurst(null), 1200);
    return () => window.clearTimeout(timer);
  }, [burst]);
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
    try {
      await store.send(kind);
      if (mounted.current) {
        window.dispatchEvent(
          new CustomEvent("ami-gesture-sent", {
            detail: { userId: profile.id, kind },
          }),
        );
        setCooldown(true);
        setBurst({ id: Date.now(), kind });
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
  const duration = togetherSince
    ? relationshipDuration(togetherSince, today)
    : "";
  return (
    <section className="hero" aria-label="Our little world">
      <div className="hero-pair">
        <Person
          name={profile.username}
          config={mine}
          onEdit={() => setEditing(true)}
        />
        <motion.span
          className="hero-heart"
          aria-hidden="true"
          animate={{ scale: [1, 1.22, 1, 1.12, 1] }}
          transition={{
            duration: 1.4,
            times: [0, 0.15, 0.3, 0.45, 1],
            repeat: Infinity,
            repeatDelay: 1.2,
          }}
        >
          <Heart size={26} />
        </motion.span>
        <Person name={partner.username} config={theirs} />
      </div>
      {togetherSince && (
        <div className="hero-days">
          <strong>
            <CountUp
              value={daysTogether(togetherSince, today)}
              duration={1.2}
            />
          </strong>
          <span>
            <CalendarHeart size={16} aria-hidden="true" />
            days together
          </span>
          {duration && <small>{duration}</small>}
        </div>
      )}
      {(dates.length > 0 || onAddDate) && (
        <ul
          className="hero-dates"
          aria-label="Important dates"
          style={
            {
              "--n": Math.min(dates.length, MAX_DATES) || 1,
            } as React.CSSProperties
          }
        >
          {dates.slice(0, MAX_DATES).map((entry) => {
            const days = daysUntil(entry.due_date!);
            return (
              <li key={entry.id}>
                <span
                  className="date-ring"
                  style={
                    {
                      "--fill": Math.max(0.06, 1 - Math.min(days, 90) / 90),
                    } as React.CSSProperties
                  }
                >
                  <svg viewBox="0 0 44 44" aria-hidden="true">
                    <circle cx="22" cy="22" r="19" pathLength="1" />
                    <circle cx="22" cy="22" r="19" pathLength="1" />
                  </svg>
                  {days === 0 ? (
                    <Heart size={20} aria-label="Today" />
                  ) : (
                    <b>{days}</b>
                  )}
                </span>
                <span className="date-name">{entry.title}</span>
                <small>
                  {days === 0
                    ? "Today"
                    : days === 1
                      ? "day to go"
                      : "days to go"}
                </small>
              </li>
            );
          })}
          {dates.length > MAX_DATES ? (
            <li className="more">
              <button type="button" onClick={onSeeDates}>
                See {dates.length - MAX_DATES} more date
                {dates.length - MAX_DATES === 1 ? "" : "s"}
              </button>
            </li>
          ) : (
            dates.length === 0 && (
              <li className="more">
                <button type="button" onClick={onAddDate}>
                  <CalendarPlus size={14} aria-hidden="true" />
                  Add an important date
                </button>
              </li>
            )
          )}
        </ul>
      )}
      <div
        className="gestures"
        role="group"
        aria-label={`Send a little love to ${partner.username}`}
      >
        {(Object.keys(gestures) as GestureKind[]).map((kind) => {
          const Icon = gestureIcons[kind];
          return (
            <motion.button
              key={kind}
              type="button"
              disabled={!ready || busy || cooldown}
              whileTap={{ scale: 0.88 }}
              transition={{ type: "spring", stiffness: 500, damping: 18 }}
              onClick={() => void send(kind)}
            >
              <Icon size={22} aria-hidden="true" />
              {gestures[kind].label}
              <AnimatePresence>
                {burst?.kind === kind && <Burst key={burst.id} kind={kind} />}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
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
