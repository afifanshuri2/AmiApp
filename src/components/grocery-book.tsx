"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { GroceryNote } from "./grocery-note";
import type { Entry } from "../lib/types";

/** Every grocery list is a page; the newest is first, older ones are behind it. */
export function GroceryBook({
  lists,
  busy,
  onToggleLine,
  onAddLine,
  onNewList,
  onEdit,
  onDelete,
}: {
  lists: Entry[];
  busy: boolean;
  onToggleLine: (list: Entry, index: number) => void;
  onAddLine: (text: string, list?: Entry) => Promise<boolean>;
  onNewList: () => void;
  onEdit: (list: Entry) => void;
  onDelete: (list: Entry) => void;
}) {
  const pages = [...lists].sort((a, b) =>
      b.created_at.localeCompare(a.created_at),
    ),
    [rawPage, setPage] = useState(0),
    [dir, setDir] = useState(1);
  const page = Math.min(rawPage, Math.max(pages.length - 1, 0)),
    list = pages[page];
  const flip = (to: number) => {
    setDir(to > page ? 1 : -1);
    setPage(to);
  };
  return (
    <section className="grocery-book" aria-label="Grocery lists">
      <div className="book-bar">
        <Button
          variant="ghost"
          size="icon"
          disabled={page >= pages.length - 1}
          aria-label="Older list"
          onClick={() => flip(page + 1)}
        >
          <ChevronLeft size={22} />
        </Button>
        <div className="book-title" aria-live="polite">
          {list ? (
            <>
              <b>{page === 0 ? "Latest list" : "Older list"}</b>
              <span>
                {page + 1} of {pages.length} ·{" "}
                {new Date(list.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </>
          ) : (
            <b>No lists yet</b>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          disabled={page <= 0}
          aria-label="Newer list"
          onClick={() => flip(page - 1)}
        >
          <ChevronRight size={22} />
        </Button>
      </div>
      <AnimatePresence initial={false} mode="wait" custom={dir}>
        <motion.div
          key={list?.id ?? "empty"}
          custom={dir}
          initial={{ opacity: 0, x: dir * 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: dir * -60 }}
          transition={{ duration: 0.18 }}
        >
          <GroceryNote
            list={list}
            totalLists={pages.length}
            busy={busy}
            showAll
            onToggleLine={onToggleLine}
            onAddLine={(text) => onAddLine(text, list)}
            onNewList={onNewList}
            onOpenAll={() => {}}
            footer={
              list && (
                <>
                  <button
                    type="button"
                    className="note-more"
                    onClick={() => onEdit(list)}
                  >
                    <Pencil size={14} aria-hidden="true" />
                    &nbsp;Edit
                  </button>
                  <button
                    type="button"
                    className="note-more"
                    disabled={busy}
                    onClick={() => onDelete(list)}
                  >
                    <Trash2 size={14} aria-hidden="true" />
                    &nbsp;Delete
                  </button>
                </>
              )
            }
          />
        </motion.div>
      </AnimatePresence>
      <Button className="book-new" variant="ghost" onClick={onNewList}>
        <Plus size={18} aria-hidden="true" />
        New list
      </Button>
    </section>
  );
}
