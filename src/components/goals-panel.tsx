"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { EverydayCard } from "./everyday-card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { goalHistory, type GoalHistoryStore } from "../lib/goal-history";
import { goalProgress } from "../lib/everyday";
import type { Entry, GoalUpdate, Profile } from "../lib/types";

export function GoalsPanel({
  goals,
  compact,
  loading,
  busy,
  onOpen,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
}: {
  goals: Entry[];
  compact: boolean;
  loading: boolean;
  busy: boolean;
  onOpen: () => void;
  onSelect: (goal: Entry) => void;
  onAdd: () => void;
  onEdit: (goal: Entry) => void;
  onDelete: (goal: Entry) => void;
}) {
  return (
    <EverydayCard
      kind="Ambitions"
      className="goals-panel"
      aria-label="Goals & ambitions"
      onOpen={compact ? onOpen : undefined}
    >
      <div className="section-heading">
        <h2>
          <Sparkles size={18} />
          Goals & ambitions
        </h2>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Add goal or ambition"
          onClick={onAdd}
        >
          <Plus size={19} />
        </Button>
      </div>
      <p className="section-hint muted">
        Little steps toward our shared dreams.
      </p>
      {goals.length ? (
        <div className="entry-list goal-list">
          {(compact ? goals.slice(0, 3) : goals).map((goal) => (
            <div className="goal-item" key={goal.id}>
              {compact ? (
                <h3>{goal.title}</h3>
              ) : (
                <button className="goal-open" onClick={() => onSelect(goal)}>
                  <h3>{goal.title}</h3>
                  <span>View updates →</span>
                </button>
              )}
              <div className="progress-row">
                <progress
                  max={100}
                  value={goalProgress(goal)}
                  aria-label={`${goal.title} progress`}
                />
                <span>{goalProgress(goal)}%</span>
              </div>
              {!compact && (
                <div className="goal-actions">
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    aria-label={`Edit ${goal.title}`}
                    onClick={() => onEdit(goal)}
                  >
                    <Pencil size={13} />
                  </Button>
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    disabled={busy}
                    aria-label={`Delete ${goal.title}`}
                    onClick={() => onDelete(goal)}
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Button variant="ghost" className="empty-state" onClick={onAdd}>
          {loading ? "Gathering your dreams…" : "+ Add a goal or ambition"}
        </Button>
      )}
      {compact && goals.length > 3 && (
        <Button variant="ghost" className="view-all" onClick={onOpen}>
          See all {goals.length} goals
        </Button>
      )}
    </EverydayCard>
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
          if (active) setUpdates(data);
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
    }, 20000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [goal.id, revision, store]);
  return (
    <section className="goal-detail card">
      <Button variant="ghost" onClick={onBack} disabled={saving}>
        <ArrowLeft size={16} />
        All goals & ambitions
      </Button>
      <h2>{goal.title}</h2>
      {goal.detail && <p className="handwritten">{goal.detail}</p>}
      <div className="progress-row">
        <progress
          max={100}
          value={goalProgress(goal)}
          aria-label={`${goal.title} progress`}
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
      <h3>Our progress diary</h3>
      {loading ? (
        <p role="status">Gathering your updates…</p>
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
