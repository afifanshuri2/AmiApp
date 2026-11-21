"use client";
import { ChevronRight, Flag, Plus } from "lucide-react";
import { ProgressBar } from "./motion-bits";
import { goalProgress } from "../lib/everyday";
import type { Entry } from "../lib/types";

const SHOWN = 2;

/** Two goals as progress bars; the rest are one tap away. */
export function GoalsCard({
  goals,
  onAdd,
  onOpenAll,
}: {
  goals: Entry[];
  onAdd: () => void;
  onOpenAll: () => void;
}) {
  // Unfinished first, then the nearest deadline.
  const ordered = [...goals].sort(
    (a, b) =>
      Number(goalProgress(a) >= 100) - Number(goalProgress(b) >= 100) ||
      (a.due_date || "9999").localeCompare(b.due_date || "9999"),
  );
  return (
    <section className="goals-card" aria-label="Goals">
      <header>
        <span className="chip k4">
          <Flag size={22} aria-hidden="true" />
        </span>
        <h2>Goals</h2>
        <button
          type="button"
          className="todo-add"
          aria-label="Add a goal"
          onClick={onAdd}
        >
          <Plus size={20} aria-hidden="true" />
        </button>
      </header>
      {ordered.length === 0 ? (
        <p className="muted">Pick something to work toward together.</p>
      ) : (
        <ul>
          {ordered.slice(0, SHOWN).map((goal) => (
            <li key={goal.id}>
              <div className="goal-row">
                <span>{goal.title}</span>
                <b>{goalProgress(goal)}%</b>
              </div>
              <ProgressBar
                value={goalProgress(goal)}
                label={`${goal.title} progress`}
              />
            </li>
          ))}
        </ul>
      )}
      {ordered.length > SHOWN && (
        <button type="button" className="see-more" onClick={onOpenAll}>
          See {ordered.length - SHOWN} more goal
          {ordered.length - SHOWN === 1 ? "" : "s"}
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      )}
    </section>
  );
}
