"use client";
import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  MapPin,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { Label } from "./ui/label";
import { NativeSelect, NativeSelectOption } from "./ui/native-select";
import { Button } from "./ui/button";
import { EverydayCard } from "./everyday-card";
import { foodCategories, type Entry, type Kind } from "../lib/types";
import { foodIcon } from "../lib/everyday";

export function EntryCollection({
  kind,
  entries,
  label,
  hint,
  Icon,
  compact = false,
  loading,
  busy,
  foodCategory = "",
  setFoodCategory,
  onOpen,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
}: {
  kind: Exclude<Kind, "ShortNotes">;
  entries: Entry[];
  label: string;
  hint: string;
  Icon: LucideIcon;
  compact?: boolean;
  loading: boolean;
  busy: boolean;
  foodCategory?: string;
  setFoodCategory: (category: string) => void;
  onOpen: () => void;
  onAdd: () => void;
  onEdit: (entry: Entry) => void;
  onDelete: (entry: Entry) => void;
  onToggle: (entry: Entry) => void;
}) {
  const reduced = useReducedMotion();
  const filterId = useId();
  const list = entries.filter(
    (e) =>
      e.kind === kind &&
      (kind !== "FoodToTry" ||
        compact ||
        !foodCategory ||
        e.category === foodCategory),
  );
  return (
    <EverydayCard
      kind={kind}
      className={`${kind === "FoodToTry" ? "food-simple" : ""} ${kind === "Places" ? "pinned-places" : ""} ${compact ? "collection-preview" : ""}`}
      key={kind}
      aria-label={compact ? `Open ${label}` : undefined}
      onOpen={compact ? onOpen : undefined}
    >
      <div className="section-heading">
        <h2>
          <Icon size={18} />
          {label}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Add ${label}`}
          onClick={onAdd}
        >
          <Plus size={19} />
        </Button>
      </div>
      <p className="muted section-hint">{hint}</p>
      {kind === "FoodToTry" && !compact && (
        <div className="food-filter">
          <Label htmlFor={filterId}>Filter by category</Label>
          <NativeSelect
            id={filterId}
            value={foodCategory}
            onChange={(e) => setFoodCategory(e.target.value)}
          >
            <NativeSelectOption value="">All categories</NativeSelectOption>
            {Array.from(
              new Set([
                ...foodCategories,
                ...entries
                  .filter((e) => e.kind === "FoodToTry")
                  .map((e) => e.category),
              ]),
            )
              .sort()
              .map((category) => (
                <NativeSelectOption key={category}>
                  {category}
                </NativeSelectOption>
              ))}
          </NativeSelect>
        </div>
      )}
      {list.length || (kind === "Countdowns" && compact) ? (
        <div
          className={`entry-list ${kind === "Countdowns" && compact ? "countdown-slots" : ""}`}
        >
          {(compact ? list.slice(0, kind === "Countdowns" ? 4 : 3) : list).map(
            (e) => (
              <article
                key={e.id}
                className={`entry ${e.done ? "is-done" : ""}`}
              >
                <div className="entry-main">
                  {!["ShortNotes", "Countdowns", "Ambitions"].includes(kind) &&
                    !(kind === "Places" && compact) && (
                      <button
                        disabled={busy}
                        className="checkbox"
                        aria-label={`${e.done ? "Mark incomplete" : "Complete"}: ${e.title}`}
                        aria-pressed={e.done}
                        onClick={() => onToggle(e)}
                      >
                        {e.done && (
                          <motion.span
                            className="completion-tick"
                            initial={
                              reduced ? false : { scale: 0.6, opacity: 0 }
                            }
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.18 }}
                          >
                            <Check size={13} />
                          </motion.span>
                        )}
                      </button>
                    )}
                  {kind === "FoodToTry" && (
                    <span
                      className="food-icon"
                      role="img"
                      aria-label={e.category}
                      title={e.category}
                    >
                      {foodIcon(e.category)}
                    </span>
                  )}
                  <div className="entry-copy">
                    {kind === "Countdowns" && e.due_date && (
                      <div
                        className="calendar-count"
                        aria-label="Days remaining"
                      >
                        <strong>
                          {Math.max(
                            0,
                            Math.ceil(
                              (Date.parse(e.due_date + "T00:00:00") -
                                Date.now()) /
                                86400000,
                            ),
                          )}
                        </strong>
                        <span>days to go</span>
                      </div>
                    )}
                    <h3>
                      {kind === "Places" && (
                        <span
                          className="place-emoji"
                          role="img"
                          aria-label="Place emoji"
                        >
                          {e.emoji || "📍"}
                        </span>
                      )}
                      {e.title}
                    </h3>
                    {kind === "FoodToTry" && (
                      <div className="food-meta">
                        <p className="food-location">
                          <MapPin size={13} aria-hidden="true" />
                          {e.place_name}
                          {e.place_name && e.location ? " · " : ""}
                          {e.location}
                        </p>
                      </div>
                    )}
                    {e.detail && !(kind === "Places" && compact) && (
                      <p className="entry-detail">{e.detail}</p>
                    )}
                    {e.due_date && (
                      <p className="entry-date">
                        {new Date(e.due_date + "T00:00:00").toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric", year: "numeric" },
                        )}
                      </p>
                    )}
                    {kind === "Ambitions" && (
                      <div className="progress-row">
                        <progress
                          max={100}
                          value={e.progress}
                          aria-label={`${e.title} progress`}
                        />
                        <span>{e.progress}%</span>
                      </div>
                    )}
                  </div>
                </div>
                {!(kind === "Places" && compact) && (
                  <div className="entry-actions">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit ${e.title}`}
                      onClick={() => onEdit(e)}
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={busy}
                      aria-label={`Delete ${e.title}`}
                      onClick={() => onDelete(e)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                )}
              </article>
            ),
          )}
          {kind === "Countdowns" &&
            compact &&
            Array.from({ length: Math.max(0, 4 - list.length) }, (_, index) => (
              <Button
                variant="ghost"
                className="countdown-add"
                key={`empty-${index}`}
                aria-label="Add countdown"
                onClick={onAdd}
              >
                <Plus size={25} />
                <span>Add countdown</span>
              </Button>
            ))}
        </div>
      ) : (
        <button className="empty-state" onClick={onAdd}>
          <span>♡</span>
          {loading
            ? "Gathering your little things…"
            : "Your first little thing belongs here."}
          <small>{loading ? "One moment" : "+ Add something together"}</small>
        </button>
      )}
      {compact && list.length > (kind === "Countdowns" ? 4 : 3) && (
        <button className="text-link view-all" onClick={onOpen}>
          See all {list.length} <ArrowUpRight size={14} />
        </button>
      )}
    </EverydayCard>
  );
}
