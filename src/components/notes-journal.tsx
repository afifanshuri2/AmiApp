"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BookHeart, Pencil, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { itemMotion } from "./motion-presets";
import type { Entry, Profile } from "../lib/types";

const monthKey = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

/** ShortNotes as a shared journal: dated pages, newest first. */
export function NotesJournal({
  notes,
  profile,
  partner,
  loading,
  busy,
  onWrite,
  onEdit,
  onDelete,
}: {
  notes: Entry[];
  profile: Profile;
  partner: Profile;
  loading: boolean;
  busy: boolean;
  onWrite: (title: string, body: string) => Promise<boolean>;
  onEdit: (note: Entry) => void;
  onDelete: (note: Entry) => void;
}) {
  const [title, setTitle] = useState(""),
    [body, setBody] = useState("");
  const pages = [...notes].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  );
  const canSave = (title.trim() || body.trim()) && !busy;
  return (
    <section className="journal" aria-label="Journal">
      <form
        className="journal-compose"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!canSave) return;
          if (await onWrite(title.trim(), body.trim())) {
            setTitle("");
            setBody("");
          }
        }}
      >
        <input
          value={title}
          maxLength={160}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Today I…"
          aria-label="Entry title"
        />
        <textarea
          value={body}
          maxLength={4000}
          rows={3}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Write about your day, a memory, or something you want to remember."
          aria-label="Write your entry"
        />
        <Button disabled={!canSave}>
          <BookHeart size={18} aria-hidden="true" />
          Add to journal
        </Button>
      </form>
      {pages.length === 0 ? (
        <div className="empty-state" role="status">
          <span className="chip k1">
            <BookHeart size={22} aria-hidden="true" />
          </span>
          {loading
            ? "Loading…"
            : "Your journal is empty. Write the first page."}
        </div>
      ) : (
        <div className="journal-pages">
          <AnimatePresence initial={false} mode="popLayout">
            {pages.map((note, index) => {
              const mine = note.created_by === profile.id,
                date = new Date(note.created_at),
                newMonth =
                  index === 0 ||
                  monthKey(pages[index - 1].created_at) !==
                    monthKey(note.created_at);
              return (
                <motion.div key={note.id} {...itemMotion}>
                  {newMonth && (
                    <h2 className="journal-month">
                      {monthKey(note.created_at)}
                    </h2>
                  )}
                  <article className={`page-entry ${mine ? "mine" : "theirs"}`}>
                    <div className="entry-date" aria-hidden="true">
                      <b>{date.getDate()}</b>
                      <span>
                        {date.toLocaleDateString(undefined, {
                          weekday: "short",
                        })}
                      </span>
                    </div>
                    <div className="entry-body">
                      <h3>{note.title}</h3>
                      {note.detail && <p>{note.detail}</p>}
                      <footer>
                        <span className="author">
                          {mine ? "You" : partner.username}
                        </span>
                        <time dateTime={note.created_at}>
                          {date.toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </time>
                        <span className="entry-tools">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Edit ${note.title}`}
                            onClick={() => onEdit(note)}
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={busy}
                            aria-label={`Delete ${note.title}`}
                            onClick={() => onDelete(note)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </span>
                      </footer>
                    </div>
                  </article>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
