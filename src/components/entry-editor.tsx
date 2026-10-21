"use client";
import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { foodCategories, type Entry, type Kind } from "../lib/types";
export type EntryInput = Pick<
  Entry,
  | "title"
  | "detail"
  | "due_date"
  | "progress"
  | "category"
  | "place_name"
  | "location"
>;
export function EntryEditor({
  kind,
  entry,
  busy,
  save,
  close,
}: {
  kind: Kind;
  entry?: Entry;
  busy: boolean;
  save: (data: EntryInput) => Promise<void>;
  close: () => void;
}) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  return (
    <div className="modal-backdrop">
      <dialog
        ref={dialog}
        aria-modal="true"
        aria-labelledby={id}
        onCancel={(e) => {
          e.preventDefault();
          if (!busy) close();
        }}
      >
        <div className="section-heading">
          <h2 id={id}>
            {entry ? "Edit a little thing" : "Make room for something good"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close editor"
            disabled={busy}
            onClick={close}
          >
            <X size={18} />
          </Button>
        </div>
        <p className="eyebrow">{kind === "FoodToTry" ? "Food to try" : kind}</p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const category = String(form.get("category") || "").trim();
            await save({
              title: String(form.get("title")).trim(),
              detail: String(form.get("detail") || "").trim(),
              due_date: String(form.get("due_date") || "") || null,
              progress: Number(form.get("progress") || 0),
              category:
                foodCategories.find(
                  (c) => c.toLowerCase() === category.toLowerCase(),
                ) || category,
              place_name: String(form.get("place_name") || "").trim(),
              location: String(form.get("location") || "").trim(),
            });
          }}
        >
          <label>
            {kind === "FoodToTry" ? "Food or dish to try" : "Title"}
            <input
              name="title"
              defaultValue={entry?.title}
              required
              maxLength={160}
              placeholder={
                kind === "ShortNotes"
                  ? "A little thought for you…"
                  : "Something we’ll do together…"
              }
            />
          </label>
          {kind === "FoodToTry" && (
            <>
              <label>
                Category
                <input
                  name="category"
                  list="food-categories"
                  maxLength={40}
                  defaultValue={entry?.category || ""}
                  placeholder="Choose or type a category"
                  required
                />
                <datalist id="food-categories">
                  {foodCategories.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </label>
              <label>
                Place / restaurant name
                <input
                  name="place_name"
                  defaultValue={entry?.place_name || ""}
                  maxLength={160}
                  required
                  placeholder="Where should we try it?"
                />
              </label>
              <label>
                Location / address
                <input
                  name="location"
                  defaultValue={entry?.location || ""}
                  maxLength={500}
                  required
                  placeholder="Address, town, or area"
                />
              </label>
            </>
          )}
          <label>
            {kind === "Places"
              ? "Address or a little detail"
              : "A little more (optional)"}
            <textarea
              name="detail"
              defaultValue={entry?.detail}
              maxLength={4000}
              rows={4}
            />
          </label>
          {![
            "ShortNotes",
            "Groceries",
            "Goals",
            "Places",
            "FoodToTry",
          ].includes(kind) && (
            <label>
              {kind === "Ambitions" ? "Finish by" : "Date"}
              <input
                name="due_date"
                type="date"
                required={kind === "Countdowns" || kind === "Ambitions"}
                defaultValue={
                  entry?.due_date ||
                  (kind === "Ambitions"
                    ? `${new Date().getFullYear()}-12-31`
                    : "")
                }
              />
            </label>
          )}
          {kind === "Ambitions" && (
            <label>
              Progress (%)
              <input
                name="progress"
                type="number"
                min={0}
                max={100}
                defaultValue={entry?.progress || 0}
                required
              />
            </label>
          )}
          <Button disabled={busy}>
            {busy ? "Saving…" : "Save to our space ♡"}
          </Button>
        </form>
      </dialog>
    </div>
  );
}
