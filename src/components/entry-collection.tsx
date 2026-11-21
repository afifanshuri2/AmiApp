"use client";
import { useId } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { itemMotion } from "./motion-presets";
import { Check, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { Label } from "./ui/label";
import { NativeSelect, NativeSelectOption } from "./ui/native-select";
import { Button } from "./ui/button";
import { kindMeta } from "./kind-meta";
import { foodCategories, type Entry, type Kind } from "../lib/types";
import { foodIcon } from "../lib/everyday";
import { displayGrocery } from "../lib/groceries";

const addText: Partial<Record<Kind, string>> = {
  Groceries: "Add a grocery item",
  Places: "Add a place",
  FoodToTry: "Add a food to try",
  Countdowns: "Add a countdown",
  Todos: "Add a to-do",
};
const toggles: Kind[] = ["Groceries", "FoodToTry", "Todos", "Goals"];

function daysLeft(date: string) {
  const target = new Date(date + "T00:00:00"),
    today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(
    0,
    Math.round((target.getTime() - today.getTime()) / 86400000),
  );
}

export function EntryCollection({
  kind,
  entries,
  loading,
  busy,
  foodCategory = "",
  setFoodCategory,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
}: {
  kind: Exclude<Kind, "ShortNotes">;
  entries: Entry[];
  loading: boolean;
  busy: boolean;
  foodCategory?: string;
  setFoodCategory: (category: string) => void;
  onAdd: () => void;
  onEdit: (entry: Entry) => void;
  onDelete: (entry: Entry) => void;
  onToggle: (entry: Entry) => void;
}) {
  const reduced = useReducedMotion();
  const filterId = useId();
  const { label, Icon, tone } = kindMeta[kind];
  const all = entries.filter((e) => e.kind === kind);
  const list =
    kind === "FoodToTry" && foodCategory
      ? all.filter((e) => e.category === foodCategory)
      : all;
  const sorted =
    kind === "Countdowns"
      ? [...list].sort((a, b) =>
          (a.due_date || "").localeCompare(b.due_date || ""),
        )
      : list;
  const categories =
    kind === "FoodToTry"
      ? Array.from(new Set([...foodCategories, ...all.map((e) => e.category)]))
          .filter(Boolean)
          .sort()
      : [];
  return (
    <section className={`collection kind-${kind}`} aria-label={label}>
      <button type="button" className="add-row" onClick={onAdd}>
        <span className={`chip k${tone}`}>
          <Plus size={20} aria-hidden="true" />
        </span>
        {addText[kind] || `Add ${label.toLowerCase()}`}
      </button>
      {kind === "FoodToTry" && (
        <div className="food-filter">
          <Label htmlFor={filterId}>Filter by category</Label>
          <NativeSelect
            id={filterId}
            value={foodCategory}
            onChange={(e) => setFoodCategory(e.target.value)}
          >
            <NativeSelectOption value="">All categories</NativeSelectOption>
            {categories.map((category) => (
              <NativeSelectOption key={category}>{category}</NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      )}
      {sorted.length ? (
        <div className="entry-list">
          <AnimatePresence initial={false} mode="popLayout">
            {sorted.map((e) => (
              <motion.article
                key={e.id}
                className={`entry ${e.done ? "is-done" : ""}`}
                {...itemMotion}
              >
                {toggles.includes(kind) && (
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
                        initial={reduced ? false : { scale: 0, rotate: -40 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 18,
                        }}
                      >
                        <Check size={14} />
                      </motion.span>
                    )}
                  </button>
                )}
                {kind === "FoodToTry" && (
                  <span
                    className="entry-emoji"
                    role="img"
                    aria-label={e.category}
                    title={e.category}
                  >
                    {foodIcon(e.category)}
                  </span>
                )}
                {kind === "Places" && (
                  <span className="entry-emoji" role="img" aria-label="Place">
                    {e.emoji || "📍"}
                  </span>
                )}
                {kind === "Countdowns" && e.due_date && (
                  <div className="count-badge" aria-label="Days to go">
                    <strong>{daysLeft(e.due_date)}</strong>
                    <span>days</span>
                  </div>
                )}
                <div className="entry-copy">
                  <h3>
                    {kind === "FoodToTry" ? e.place_name || e.title : e.title}
                  </h3>
                  {kind === "FoodToTry" && e.location && (
                    <p className="entry-meta">
                      <MapPin size={13} aria-hidden="true" />
                      {e.location}
                    </p>
                  )}
                  {e.detail && (
                    <p className="entry-detail">
                      {kind === "Groceries"
                        ? displayGrocery(e.detail)
                        : e.detail}
                    </p>
                  )}
                  {e.due_date && kind !== "Todos" && (
                    <p className="entry-meta">
                      {new Date(e.due_date + "T00:00:00").toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric", year: "numeric" },
                      )}
                    </p>
                  )}
                </div>
                <div className="entry-actions">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${e.title}`}
                    onClick={() => onEdit(e)}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={busy}
                    aria-label={`Delete ${e.title}`}
                    onClick={() => onDelete(e)}
                  >
                    <Trash2 size={16} />
                  </Button>
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
          {loading
            ? "Loading…"
            : foodCategory
              ? "Nothing in this category yet."
              : "Nothing here yet. Add the first one."}
        </div>
      )}
    </section>
  );
}
