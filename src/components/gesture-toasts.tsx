"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { gestures, type PartnerGesture } from "../lib/avatars";
import {
  coupleInteractions,
  type CoupleInteractionStore,
} from "../lib/couple-interactions";
import type { Profile } from "../lib/types";

export function GestureToasts({
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
  const [queue, setQueue] = useState<(PartnerGesture & { sent?: boolean })[]>(
      [],
    ),
    [visible, setVisible] = useState(false),
    [paused, setPaused] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const seen = useRef(new Set<string>()),
    alive = useRef(false),
    acknowledging = useRef(false);
  const reduced = useReducedMotion(),
    current = queue[0];
  useEffect(() => {
    alive.current = true;
    let active = true,
      fetching = false;
    async function refresh() {
      const foreground = document.visibilityState === "visible";
      setVisible(foreground);
      if (!foreground || fetching) return;
      fetching = true;
      try {
        const { inbox } = await store.load(profile.id);
        if (!active) return;
        const incoming = inbox
          .filter(
            (item) =>
              item.recipient_id === profile.id &&
              item.sender_id === partner.id &&
              Object.hasOwn(gestures, item.kind) &&
              !seen.current.has(item.id),
          )
          .reverse();
        if (incoming.length) {
          incoming.forEach((item) => seen.current.add(item.id));
          setQueue((previous) => [...previous, ...incoming]);
        }
      } catch {
        /* Keep unread actions on the server for the next successful opening. */
      } finally {
        fetching = false;
      }
    }
    function sent(event: Event) {
      const detail = (event as CustomEvent).detail;
      if (
        detail?.userId !== profile.id ||
        !Object.hasOwn(gestures, detail?.kind)
      )
        return;
      setQueue((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          sender_id: profile.id,
          recipient_id: partner.id,
          kind: detail.kind,
          created_at: new Date().toISOString(),
          sent: true,
        },
      ]);
    }
    window.addEventListener("ami-gesture-sent", sent);
    void refresh();
    const timer = window.setInterval(() => {
      void refresh();
    }, 10000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("ami-gesture-sent", sent);
      active = false;
      alive.current = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [store, profile.id, partner.id]);
  const dismiss = useCallback(async () => {
    if (!current || acknowledging.current) return;
    acknowledging.current = true;
    setBusy(true);
    setError("");
    try {
      if (!current.sent) await store.acknowledge(current.id);
      if (alive.current) {
        setQueue((previous) =>
          previous.filter((item) => item.id !== current.id),
        );
        if (!current.sent)
          window.dispatchEvent(new Event("ami-gestures-changed"));
      }
    } catch {
      if (alive.current)
        setError("Couldn’t tuck this away. Tap × to try again.");
    } finally {
      acknowledging.current = false;
      if (alive.current) setBusy(false);
    }
  }, [current, store]);
  useEffect(() => {
    setPaused(false);
    setError("");
  }, [current?.id]);
  useEffect(() => {
    if (!current || !visible || paused || busy || error) return;
    const timer = window.setTimeout(() => {
      void dismiss();
    }, 6000);
    return () => window.clearTimeout(timer);
  }, [current, visible, paused, busy, error, dismiss]);
  return (
    <div
      className="gesture-toast-region"
      data-theme={theme}
      aria-live="polite"
      aria-atomic="true"
      aria-label="Little love from your person"
    >
      <AnimatePresence mode="wait">
        {current && visible && (
          <motion.div
            key={current.id}
            className="gesture-toast"
            role="status"
            initial={reduced ? false : { opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduced ? 0 : 12 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget))
                setPaused(false);
            }}
          >
            <span className="gesture-emoji" aria-hidden="true">
              {gestures[current.kind].emoji}
            </span>
            <div className="gesture-toast-copy">
              <h3>
                {current.sent
                  ? `${gestures[current.kind].label} sent to ${partner.username}`
                  : gestures[current.kind].received}
              </h3>
              <p>
                {current.sent
                  ? "A little love is on its way!"
                  : `From ${partner.username} ♡ ${gestures[current.kind].detail}`}
              </p>
              {queue.length > 1 && (
                <small>{queue.length - 1} more little hellos waiting</small>
              )}
              {error && <p role="alert">{error}</p>}
            </div>
            <Button
              variant="ghost"
              size="icon"
              disabled={busy}
              aria-label="Dismiss little love"
              onClick={() => void dismiss()}
            >
              <X size={16} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
