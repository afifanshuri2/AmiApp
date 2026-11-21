"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { itemMotion } from "./motion-presets";
import { Check, ListChecks, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { reminderTime, timeLeft } from "../lib/everyday";
import type { Entry } from "../lib/types";

export function ReminderStrip({
  todos,
  busy,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
}: {
  todos: Entry[];
  busy: boolean;
  onAdd: () => void;
  onEdit: (todo: Entry) => void;
  onDelete: (todo: Entry) => void;
  onToggle: (todo: Entry) => void;
}) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 15000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <section className="reminders-section" aria-label="To-dos">
      <button type="button" className="add-row" onClick={onAdd}>
        <span className="chip k3">
          <Plus size={20} aria-hidden="true" />
        </span>
        Add a to-do
      </button>
      <div className="reminder-strip">
        {todos.length === 0 && (
          <div className="empty-state" role="status">
            <span className="chip k3">
              <ListChecks size={22} aria-hidden="true" />
            </span>
            Nothing to do. Add a thought with a date.
          </div>
        )}
        <AnimatePresence initial={false} mode="popLayout">
          {todos.map((todo) => (
            <motion.article
              className={`reminder-note ${todo.done ? "is-done" : ""}`}
              key={todo.id}
              {...itemMotion}
            >
              <div className="reminder-top">
                <button
                  className="checkbox"
                  disabled={busy}
                  aria-label={`${todo.done ? "Mark incomplete" : "Complete"}: ${todo.detail || todo.title}`}
                  aria-pressed={todo.done}
                  onClick={() => onToggle(todo)}
                >
                  {todo.done && <Check size={14} />}
                </button>
                <time dateTime={reminderTime(todo) || undefined}>
                  {todo.done
                    ? "Done"
                    : now === null
                      ? ""
                      : timeLeft(reminderTime(todo), now)}
                </time>
                <div>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Edit ${todo.title}`}
                    onClick={() => onEdit(todo)}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={busy}
                    aria-label={`Delete ${todo.title}`}
                    onClick={() => onDelete(todo)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              <p>{todo.detail || todo.title}</p>
              {reminderTime(todo) && (
                <small>
                  {new Date(reminderTime(todo)!).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </small>
              )}
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
