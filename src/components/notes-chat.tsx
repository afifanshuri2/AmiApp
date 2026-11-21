"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Pencil, SendHorizontal, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import type { Entry, Profile } from "../lib/types";

const dayKey = (iso: string) => new Date(iso).toDateString();
function dayLabel(iso: string) {
  const date = new Date(iso),
    today = new Date(),
    yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/** ShortNotes as a conversation: oldest first, newest at the bottom. */
export function NotesChat({
  notes,
  profile,
  partner,
  loading,
  busy,
  onSend,
  onEdit,
  onDelete,
}: {
  notes: Entry[];
  profile: Profile;
  partner: Profile;
  loading: boolean;
  busy: boolean;
  onSend: (text: string) => Promise<boolean>;
  onEdit: (note: Entry) => void;
  onDelete: (note: Entry) => void;
}) {
  const [text, setText] = useState(""),
    [selected, setSelected] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const ordered = [...notes].sort((a, b) =>
    a.created_at.localeCompare(b.created_at),
  );
  const lastId = ordered.at(-1)?.id;
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [lastId]);
  return (
    <section className="chat" aria-label={`Notes with ${partner.username}`}>
      <div className="chat-log" role="log" aria-live="polite">
        {ordered.length === 0 && (
          <p className="chat-empty" role="status">
            {loading
              ? "Loading…"
              : `Say something small to ${partner.username}.`}
          </p>
        )}
        <AnimatePresence initial={false}>
          {ordered.map((note, index) => {
            const mine = note.created_by === profile.id,
              newDay =
                index === 0 ||
                dayKey(ordered[index - 1].created_at) !==
                  dayKey(note.created_at);
            return (
              <motion.div
                key={note.id}
                className="chat-row"
                initial={{ opacity: 0, scale: 0.85, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
                style={{
                  transformOrigin: mine ? "bottom right" : "bottom left",
                }}
              >
                {newDay && (
                  <div className="chat-day">{dayLabel(note.created_at)}</div>
                )}
                <div className={`bubble-wrap ${mine ? "mine" : "theirs"}`}>
                  <button
                    type="button"
                    className={`bubble ${mine ? "me" : "them"}`}
                    aria-expanded={selected === note.id}
                    onClick={() =>
                      setSelected(selected === note.id ? null : note.id)
                    }
                  >
                    <b>{note.title}</b>
                    {note.detail && <span>{note.detail}</span>}
                    <time dateTime={note.created_at}>
                      {new Date(note.created_at).toLocaleTimeString(undefined, {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </time>
                  </button>
                  <AnimatePresence initial={false}>
                    {selected === note.id && (
                      <motion.div
                        className="bubble-actions"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.16 }}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${note.title}`}
                          onClick={() => {
                            setSelected(null);
                            onEdit(note);
                          }}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={busy}
                          aria-label={`Delete ${note.title}`}
                          onClick={() => {
                            setSelected(null);
                            onDelete(note);
                          }}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={endRef} />
      </div>
      <form
        className="composer"
        onSubmit={async (event) => {
          event.preventDefault();
          const value = text.trim();
          if (!value || busy) return;
          if (await onSend(value)) setText("");
        }}
      >
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={4000}
          placeholder="Write a note"
          aria-label="Write a note"
        />
        <motion.button
          type="submit"
          aria-label="Send note"
          disabled={busy || !text.trim()}
          animate={{ scale: text.trim() ? 1 : 0.88 }}
          whileTap={{ scale: 0.82, rotate: -12 }}
          transition={{ type: "spring", stiffness: 500, damping: 22 }}
        >
          <SendHorizontal size={20} aria-hidden="true" />
        </motion.button>
      </form>
    </section>
  );
}
