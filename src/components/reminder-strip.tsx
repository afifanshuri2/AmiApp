"use client";
import { useEffect, useState } from "react";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
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
    <section className="reminders-section" aria-label="To-dos & reminders">
      <div className="section-heading">
        <h2>Little things to do</h2>
        <span className="muted">A thought, a date, done.</span>
      </div>
      <div className="reminder-strip">
        <Button
          variant="outline"
          className="reminder-add"
          aria-label="Add to-do"
          onClick={onAdd}
        >
          <Plus size={25} />
          <span>Add a to-do</span>
        </Button>
        {todos.map((todo) => (
          <article
            className={`reminder-note ${todo.done ? "is-done" : ""}`}
            key={todo.id}
          >
            <div className="reminder-top">
              <button
                className="checkbox"
                disabled={busy}
                aria-label={`${todo.done ? "Mark incomplete" : "Complete"}: ${todo.detail || todo.title}`}
                aria-pressed={todo.done}
                onClick={() => onToggle(todo)}
              >
                {todo.done && <Check size={13} />}
              </button>
              <time dateTime={reminderTime(todo) || undefined}>
                {todo.done
                  ? "Done together ♡"
                  : now === null
                    ? "Checking time…"
                    : timeLeft(reminderTime(todo), now)}
              </time>
              <div>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  aria-label={`Edit ${todo.title}`}
                  onClick={() => onEdit(todo)}
                >
                  <Pencil size={13} />
                </Button>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  disabled={busy}
                  aria-label={`Delete ${todo.title}`}
                  onClick={() => onDelete(todo)}
                >
                  <Trash2 size={13} />
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
          </article>
        ))}
      </div>
    </section>
  );
}
