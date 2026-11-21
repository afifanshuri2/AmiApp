"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { kindMeta } from "./kind-meta";
import { goalHistory, type GoalHistoryStore } from "../lib/goal-history";
import { goalProgress } from "../lib/everyday";
import { ProgressBar } from "./motion-bits";
import { itemMotion } from "./motion-presets";
import type { Entry, GoalUpdate, Profile } from "../lib/types";

export function GoalsPanel({
  goals,
  loading,
  busy,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
}: {
  goals: Entry[];
  loading: boolean;
  busy: boolean;
  onSelect: (goal: Entry) => void;
  onAdd: () => void;
  onEdit: (goal: Entry) => void;
  onDelete: (goal: Entry) => void;
}) {
  const { Icon, tone } = kindMeta.Ambitions;
  return (
    <section className="collection goals-panel" aria-label="Goals">
      <button type="button" className="add-row" onClick={onAdd}>
        <span className={`chip k${tone}`}>
          <Plus size={20} aria-hidden="true" />
        </span>
        Add a goal
      </button>
      {goals.length ? (
        <div className="entry-list">
          <AnimatePresence initial={false} mode="popLayout">
            {goals.map((goal) => (
              <motion.article
                className="entry goal-item"
                key={goal.id}
                {...itemMotion}
              >
                <button
                  className="goal-open"
                  onClick={() => onSelect(goal)}
                  aria-label={`Open ${goal.title}`}
                >
                  <h3>{goal.title}</h3>
                  <span className="progress-row">
                    <ProgressBar
                      value={goalProgress(goal)}
                      label={`${goal.title} progress`}
                    />
                    <span>{goalProgress(goal)}%</span>
                  </span>
                </button>
                <div className="entry-actions">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Edit ${goal.title}`}
                    onClick={() => onEdit(goal)}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={busy}
                    aria-label={`Delete ${goal.title}`}
                    onClick={() => onDelete(goal)}
                  >
                    <Trash2 size={16} />
                  </Button>
                  <ChevronRight
                    size={18}
                    className="entry-go"
                    aria-hidden="true"
                  />
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="empty-state" role="status">
          <span className={`chip k${tone}`}>
            <Icon size={22} aria-hidden="true" />
          </span>
          {loading ? "Loading…" : "Nothing here yet. Add the first goal."}
        </div>
      )}
    </section>
  );
}

export function GoalDetail({
  goal,
  profile,
  partner,
  onBack,
  onSaved,
  store = goalHistory,
}: {
  goal: Entry;
  profile: Profile;
  partner: Profile;
  onBack: () => void;
  onSaved: () => Promise<void>;
  store?: GoalHistoryStore;
}) {
  const [updates, setUpdates] = useState<GoalUpdate[]>([]),
    [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [error, setError] = useState(""),
    [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setUpdates([]);
    setError("");
    const refresh = () =>
      void store
        .load(goal.id)
        .then((data) => {
          if (!active) return;
          setUpdates((current) =>
            JSON.stringify(current) === JSON.stringify(data) ? current : data,
          );
          setError("");
        })
        .catch((error) => {
          if (active)
            setError(
              error instanceof Error
                ? error.message
                : "Could not load updates. Please try again.",
            );
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    refresh();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, 30000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [goal.id, revision, store]);
  return (
    <section className="goal-detail">
      <Button variant="ghost" onClick={onBack} disabled={saving}>
        <ArrowLeft size={16} />
        All goals
      </Button>
      <h2>{goal.title}</h2>
      {goal.detail && <p className="goal-note">{goal.detail}</p>}
      <div className="progress-row">
        <ProgressBar
          value={goalProgress(goal)}
          label={`${goal.title} progress`}
        />
        <span>{goalProgress(goal)}%</span>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <form
        key={goal.id}
        onSubmit={async (event) => {
          event.preventDefault();
          if (saving) return;
          const form = event.currentTarget,
            data = new FormData(form);
          setSaving(true);
          setError("");
          try {
            await store.add(
              goal.id,
              String(data.get("description") || "").trim(),
              Number(data.get("progress")),
            );
            await onSaved();
            form.reset();
            setRevision((value) => value + 1);
          } catch (error) {
            setError(
              error instanceof Error
                ? error.message
                : "Could not save. Please try again.",
            );
          } finally {
            setSaving(false);
          }
        }}
      >
        <Label>
          Add an update
          <Textarea
            name="description"
            required
            maxLength={4000}
            placeholder="What did we do? How are we getting closer?"
          />
        </Label>
        <Label>
          Progress (%)
          <Input
            name="progress"
            type="number"
            min={0}
            max={100}
            step={1}
            required
            defaultValue={goalProgress(goal)}
          />
        </Label>
        <Button disabled={saving}>{saving ? "Saving…" : "Add update"}</Button>
      </form>
      <h3>Progress diary</h3>
      {loading ? (
        <p role="status">Loading updates…</p>
      ) : updates.length ? (
        <ol className="goal-timeline">
          {updates.map((update) => (
            <li key={update.id}>
              <div>
                <strong>{update.progress}%</strong>
                <time dateTime={update.created_at}>
                  {new Date(update.created_at).toLocaleString()}
                </time>
              </div>
              <p>{update.description}</p>
              <small>
                By{" "}
                {update.created_by === profile.id
                  ? profile.username
                  : update.created_by === partner.id
                    ? partner.username
                    : "your person"}
              </small>
            </li>
          ))}
        </ol>
      ) : (
        !error && <p className="muted">Your first little step belongs here.</p>
      )}
    </section>
  );
}
