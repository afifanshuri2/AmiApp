"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlarmClock,
  Check,
  ChevronRight,
  ListChecks,
  Plus,
} from "lucide-react";
import { itemMotion } from "./motion-presets";
import { reminderTime, timeLeft } from "../lib/everyday";
import type { Entry } from "../lib/types";

const SHOWN = 3;

/** The first thing on Home: what still needs doing, soonest first. */
export function TodoFocus({
  todos,
  busy,
  onToggle,
  onAdd,
  onOpenAll,
}: {
  todos: Entry[];
  busy: boolean;
  onToggle: (todo: Entry) => void;
  onAdd: () => void;
  onOpenAll: () => void;
}) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);
  const time = (todo: Entry) => {
    const value = reminderTime(todo);
    return value && Number.isFinite(Date.parse(value))
      ? Date.parse(value)
      : Infinity;
  };
  const open = todos
    .filter((todo) => !todo.done)
    .sort((a, b) => time(a) - time(b));
  const overdue =
    now === null ? 0 : open.filter((todo) => time(todo) < now).length;
  return (
    <section
      className={`todo-focus ${overdue ? "has-overdue" : ""}`}
      aria-label="To-dos"
    >
      <header>
        <span className="chip k3">
          <ListChecks size={22} aria-hidden="true" />
        </span>
        <h2>
          {open.length ? `${open.length} to do` : "All done"}
          {overdue > 0 && <small>{overdue} overdue</small>}
        </h2>
        <button
          type="button"
          className="todo-add"
          aria-label="Add a to-do"
          onClick={onAdd}
        >
          <Plus size={20} aria-hidden="true" />
        </button>
      </header>
      {open.length === 0 ? (
        <p className="todo-clear">
          <Check size={18} aria-hidden="true" />
          Nothing waiting. Enjoy the day.
        </p>
      ) : (
        <ul>
          <AnimatePresence initial={false} mode="popLayout">
            {open.slice(0, SHOWN).map((todo) => {
              const late = now !== null && time(todo) < now;
              return (
                <motion.li key={todo.id} {...itemMotion}>
                  <button
                    type="button"
                    className="checkbox"
                    disabled={busy}
                    aria-pressed={false}
                    aria-label={`Complete: ${todo.detail || todo.title}`}
                    onClick={() => onToggle(todo)}
                  />
                  <span className="todo-text">{todo.detail || todo.title}</span>
                  {Number.isFinite(time(todo)) && now !== null && (
                    <span className={`todo-time ${late ? "late" : ""}`}>
                      <AlarmClock size={14} aria-hidden="true" />
                      {timeLeft(reminderTime(todo), now)}
                    </span>
                  )}
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
      {open.length > SHOWN && (
        <button type="button" className="see-more" onClick={onOpenAll}>
          See {open.length - SHOWN} more to-dos
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      )}
    </section>
  );
}
