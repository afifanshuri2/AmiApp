"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  NotebookPen,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "./ui/button";
import type { Entry, Profile } from "../lib/types";
import { FeatureCard } from "./feature-card";

export function ShortNotesNotebook({
  notes,
  profile,
  partner,
  compact = false,
  loading = false,
  busy = false,
  onAdd,
  onEdit,
  onDelete,
  onOpen,
}: {
  notes: Entry[];
  profile: Profile;
  partner: Profile;
  compact?: boolean;
  loading?: boolean;
  busy?: boolean;
  onAdd: () => void;
  onEdit: (note: Entry) => void;
  onDelete: (note: Entry) => void;
  onOpen?: () => void;
}) {
  const [position, setPosition] = useState({ page: 0, direction: 1 });
  const [turning, setTurning] = useState(false);
  const reduced = useReducedMotion();
  const sorted = [...notes].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  );
  const pages = Math.max(1, Math.ceil(sorted.length / 3));
  const page = compact ? 0 : Math.min(position.page, pages - 1);
  function turn(direction: number) {
    const next = page + direction;
    if (turning || next < 0 || next >= pages) return;
    setTurning(true);
    setPosition({ page: next, direction });
  }
  return (
    <FeatureCard
      className={`shortnotes-notebook ${compact ? "notebook-compact" : ""}`}
      aria-label="ShortNotes notebook"
      onOpen={compact ? onOpen : undefined}
    >
      <div className="notebook-cover">
        <div className="notebook-binding" aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => (
            <i key={i} />
          ))}
        </div>
        <div
          className="notebook-stage"
          tabIndex={compact ? undefined : 0}
          aria-label={
            compact
              ? undefined
              : "Notebook pages. Use left and right arrow keys to turn pages."
          }
          onKeyDown={(e) => {
            if (e.target !== e.currentTarget) return;
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
              e.preventDefault();
              turn(e.key === "ArrowRight" ? 1 : -1);
            }
          }}
        >
          <AnimatePresence
            initial={false}
            mode="wait"
            custom={position.direction}
          >
            <motion.div
              key={page}
              className="notebook-page"
              custom={position.direction}
              variants={{
                enter: (d: number) => ({
                  opacity: reduced ? 1 : 0.4,
                  rotateY: reduced ? 0 : d * 65,
                  x: reduced ? 0 : d * 18,
                }),
                visible: { opacity: 1, rotateY: 0, x: 0 },
                leave: (d: number) => ({
                  opacity: 0,
                  rotateY: reduced ? 0 : -d * 65,
                  x: reduced ? 0 : -d * 18,
                }),
              }}
              initial="enter"
              animate="visible"
              exit="leave"
              transition={{ duration: reduced ? 0 : 0.25, ease: "easeInOut" }}
              onAnimationComplete={(definition) => {
                if (definition === "visible") setTurning(false);
              }}
              drag={compact || pages === 1 ? false : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.12}
              dragMomentum={false}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.x) > 45)
                  turn(info.offset.x < 0 ? 1 : -1);
              }}
            >
              <div className="section-heading notebook-heading">
                <div>
                  <h2>
                    <NotebookPen size={18} />
                    ShortNotes
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Add ShortNotes"
                  onClick={onAdd}
                >
                  <Plus size={19} />
                </Button>
              </div>
              <div className="notebook-page-label">
                <span>
                  {compact || page === 0
                    ? "The latest little things"
                    : "More little things worth keeping"}
                </span>
                <span aria-hidden="true">♡</span>
              </div>
              <div className="notebook-notes">
                {loading && !sorted.length ? (
                  <p className="notebook-empty" role="status">
                    Gathering your little love notes…
                  </p>
                ) : sorted.length ? (
                  sorted.slice(page * 3, page * 3 + 3).map((note) => (
                    <article className="notebook-note" key={note.id}>
                      <div className="notebook-note-heading">
                        <h3>{note.title}</h3>
                        <div className="notebook-note-actions">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            aria-label={`Edit ${note.title}`}
                            onClick={() => onEdit(note)}
                          >
                            <Pencil size={13} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            disabled={busy}
                            aria-label={`Delete ${note.title}`}
                            onClick={() => onDelete(note)}
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </div>
                      {note.detail && <p>{note.detail}</p>}
                      <footer>
                        <span>
                          with love,{" "}
                          {note.created_by === profile.id
                            ? profile.username
                            : partner.username}{" "}
                          ♡
                        </span>
                        <time dateTime={note.created_at}>
                          {new Date(note.created_at).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric" },
                          )}
                        </time>
                      </footer>
                    </article>
                  ))
                ) : (
                  <div className="notebook-empty">
                    <span aria-hidden="true">♡</span>
                    <p>A fresh page for the two of us.</p>
                    <Button variant="ghost" onClick={onAdd}>
                      Write your first note
                    </Button>
                  </div>
                )}
              </div>
              <div className="notebook-page-number">— {page + 1} —</div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div className="notebook-controls">
        {compact ? (
          <>
            <span>Three little notes, one little page.</span>
            <Button variant="ghost" onClick={onOpen}>
              Open notebook <ArrowRight size={15} />
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Previous notebook page"
              disabled={page === 0 || turning}
              onClick={() => turn(-1)}
            >
              <ArrowLeft size={17} />
            </Button>
            <span role="status" aria-live="polite">
              Page {page + 1} of {pages}
              <small>
                {pages > 1
                  ? "Swipe to turn a page"
                  : "A little more love with every note"}
              </small>
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Next notebook page"
              disabled={page === pages - 1 || turning}
              onClick={() => turn(1)}
            >
              <ArrowRight size={17} />
            </Button>
          </>
        )}
      </div>
    </FeatureCard>
  );
}
