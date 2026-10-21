"use client";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { NativeSelectOption } from "./ui/native-select";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
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
  theme,
  entry,
  busy,
  save,
  close,
}: {
  kind: Kind;
  theme: string;
  entry?: Entry;
  busy: boolean;
  save: (data: EntryInput) => Promise<void>;
  close: () => void;
}) {
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) close();
      }}
    >
      <DialogContent
        className="entry-dialog"
        data-theme={theme}
        showCloseButton={false}
        aria-describedby={undefined}
      >
        <div className="section-heading">
          <DialogTitle asChild>
            <h2>
              {entry ? "Edit a little thing" : "Make room for something good"}
            </h2>
          </DialogTitle>
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
          <Label>
            {kind === "FoodToTry" ? "Food or dish to try" : "Title"}
            <Input
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
          </Label>
          {kind === "FoodToTry" && (
            <>
              <Label>
                Category
                <Input
                  name="category"
                  list="food-categories"
                  maxLength={40}
                  defaultValue={entry?.category || ""}
                  placeholder="Choose or type a category"
                  required
                />
                <datalist id="food-categories">
                  {foodCategories.map((category) => (
                    <NativeSelectOption key={category} value={category} />
                  ))}
                </datalist>
              </Label>
              <Label>
                Place / restaurant name
                <Input
                  name="place_name"
                  defaultValue={entry?.place_name || ""}
                  maxLength={160}
                  required
                  placeholder="Where should we try it?"
                />
              </Label>
              <Label>
                Location / address
                <Input
                  name="location"
                  defaultValue={entry?.location || ""}
                  maxLength={500}
                  required
                  placeholder="Address, town, or area"
                />
              </Label>
            </>
          )}
          <Label>
            {kind === "Places"
              ? "Address or a little detail"
              : "A little more (optional)"}
            <Textarea
              name="detail"
              defaultValue={entry?.detail}
              maxLength={4000}
              rows={4}
            />
          </Label>
          {![
            "ShortNotes",
            "Groceries",
            "Goals",
            "Places",
            "FoodToTry",
          ].includes(kind) && (
            <Label>
              {kind === "Ambitions" ? "Finish by" : "Date"}
              <Input
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
            </Label>
          )}
          {kind === "Ambitions" && (
            <Label>
              Progress (%)
              <Input
                name="progress"
                type="number"
                min={0}
                max={100}
                defaultValue={entry?.progress || 0}
                required
              />
            </Label>
          )}
          <Button disabled={busy}>
            {busy ? "Saving…" : "Save to our space ♡"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
