"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronRight, Plus } from "lucide-react";
import { itemMotion } from "./motion-presets";
import { groceryLines } from "../lib/groceries";
import type { Entry } from "../lib/types";

const SHOWN = 7;

/** The newest grocery list, as a sticky note stuck to the fridge. */
export function GroceryNote({
  list,
  totalLists,
  busy,
  onToggleLine,
  onAddLine,
  onNewList,
  onOpenAll,
}: {
  list: Entry | undefined;
  totalLists: number;
  busy: boolean;
  onToggleLine: (list: Entry, index: number) => void;
  onAddLine: (text: string) => Promise<boolean>;
  onNewList: () => void;
  onOpenAll: () => void;
}) {
  const [text, setText] = useState("");
  // A list with no item lines is a single item named by its title.
  const lines = list
    ? groceryLines(list).length
      ? groceryLines(list)
      : [{ text: list.title, done: list.done }]
    : [];
  const single = !!list && groceryLines(list).length === 0;
  const left = lines.filter((line) => !line.done).length;
  return (
    <motion.section
      className="fridge-note"
      aria-label="Grocery list"
      initial={{ rotate: -4, y: -12, opacity: 0 }}
      animate={{ rotate: -1.4, y: 0, opacity: 1 }}
      whileHover={{ rotate: 0, y: -2 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
    >
      <span className="magnet" aria-hidden="true" />
      <header>
        <h2>
          {list && !single && list.title !== lines[0]?.text
            ? list.title
            : "Groceries"}
        </h2>
        {list && <span className="note-count">{left} left</span>}
      </header>
      <ul>
        <AnimatePresence initial={false} mode="popLayout">
          {lines.slice(0, SHOWN).map((line, index) => (
            <motion.li
              key={`${list!.id}-${index}-${line.text}`}
              {...itemMotion}
              className={line.done ? "done" : ""}
            >
              <button
                type="button"
                disabled={busy}
                aria-pressed={line.done}
                aria-label={`${line.done ? "Put back" : "Got it"}: ${line.text}`}
                onClick={() => onToggleLine(list!, index)}
              >
                <span className="note-box">
                  {line.done && <Check size={14} aria-hidden="true" />}
                </span>
                <span className="note-text">{line.text}</span>
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {!list && <p className="note-empty">No list yet. Start one below.</p>}
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          const value = text.trim();
          if (!value || busy) return;
          if (await onAddLine(value)) setText("");
        }}
      >
        <Plus size={16} aria-hidden="true" />
        <input
          value={text}
          maxLength={160}
          onChange={(event) => setText(event.target.value)}
          placeholder="Add something"
          aria-label="Add a grocery item"
        />
      </form>
      <div className="note-foot">
        {lines.length > SHOWN && (
          <button type="button" className="note-more" onClick={onOpenAll}>
            See {lines.length - SHOWN} more
            <ChevronRight size={14} aria-hidden="true" />
          </button>
        )}
        <button type="button" className="note-more" onClick={onNewList}>
          New list
        </button>
        {totalLists > 1 && (
          <button type="button" className="note-more" onClick={onOpenAll}>
            Older lists
            <ChevronRight size={14} aria-hidden="true" />
          </button>
        )}
      </div>
    </motion.section>
  );
}
