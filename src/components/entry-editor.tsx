"use client";
import { useState } from "react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { NativeSelect, NativeSelectOption } from "./ui/native-select";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { foodCategories, type Entry, type Kind } from "../lib/types";
import { goalProgress, reminderTime, validEmoji } from "../lib/everyday";
export type EntryInput = Pick<
  Entry,
  | "title"
  | "detail"
  | "due_date"
  | "progress"
  | "category"
  | "place_name"
  | "location"
  | "due_at"
  | "emoji"
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
  const [foodCategory, setFoodCategory] = useState(
    entry?.category && !foodCategories.includes(entry.category)
      ? "custom"
      : entry?.category || foodCategories[0],
  );
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
        <p className="eyebrow">
          {kind === "FoodToTry"
            ? "Food to try"
            : kind === "Ambitions"
              ? "Goals & ambitions"
              : kind === "Todos"
                ? "A little to-do"
                : kind}
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const category = String(
              form.get(
                foodCategory === "custom" ? "custom_category" : "category",
              ) || "",
            ).trim();
            const detail = String(form.get("detail") || "").trim();
            const dateTime = String(form.get("due_at") || "");
            const emoji = String(form.get("emoji") || "📍").trim();
            if (kind === "Places" && !validEmoji(emoji)) {
              const input = e.currentTarget.querySelector<HTMLInputElement>(
                'input[name="emoji"]',
              );
              input?.setCustomValidity("Choose one emoji, such as 🇲🇾 or ☕.");
              input?.reportValidity();
              return;
            }
            await save({
              title:
                kind === "Todos"
                  ? Array.from(detail).slice(0, 160).join("")
                  : kind === "FoodToTry"
                    ? String(form.get("place_name") || "").trim()
                    : String(form.get("title")).trim(),
              detail,
              due_date:
                kind === "Todos"
                  ? dateTime.slice(0, 10)
                  : String(form.get("due_date") || "") || null,
              ...(kind === "Todos"
                ? { due_at: new Date(dateTime).toISOString() }
                : {}),
              ...(kind === "Places" ? { emoji } : {}),
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
          {kind !== "Todos" && kind !== "FoodToTry" && (
            <Label>
              {kind === "Places"
                ? "Place name"
                : kind === "Ambitions"
                  ? "Goal or ambition"
                  : "Title"}
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
          )}
          {kind === "Places" && (
            <Label>
              Emoji
              <Input
                name="emoji"
                defaultValue={entry?.emoji || "📍"}
                required
                maxLength={32}
                placeholder="🇲🇾"
                onChange={(event) => event.currentTarget.setCustomValidity("")}
                onBlur={(event) =>
                  event.currentTarget.setCustomValidity(
                    validEmoji(event.currentTarget.value.trim())
                      ? ""
                      : "Choose one emoji, such as 🇲🇾 or ☕.",
                  )
                }
              />
              <small className="muted">
                Use your emoji keyboard. Any emoji or country flag works.
              </small>
            </Label>
          )}
          {kind === "FoodToTry" && (
            <>
              <Label>
                Category
                <NativeSelect
                  name="category"
                  value={foodCategory}
                  onChange={(event) => setFoodCategory(event.target.value)}
                  required
                >
                  {foodCategories.map((category) => (
                    <NativeSelectOption key={category} value={category}>
                      {category}
                    </NativeSelectOption>
                  ))}
                  <NativeSelectOption value="custom">
                    Custom category…
                  </NativeSelectOption>
                </NativeSelect>
              </Label>
              {foodCategory === "custom" && (
                <Label>
                  Custom category
                  <Input
                    name="custom_category"
                    defaultValue={entry?.category || ""}
                    maxLength={40}
                    required
                    placeholder="e.g. Melayu"
                  />
                </Label>
              )}
              <Label>
                Restaurant name
                <Input
                  name="place_name"
                  defaultValue={entry?.place_name || entry?.title || ""}
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
            {kind === "Places" || kind === "Todos"
              ? "Description"
              : "A little more (optional)"}
            <Textarea
              name="detail"
              defaultValue={
                kind === "Todos" ? entry?.detail || entry?.title : entry?.detail
              }
              required={kind === "Todos"}
              maxLength={4000}
              rows={4}
            />
          </Label>
          {kind === "Todos" && (
            <Label>
              Date & time
              <Input
                type="datetime-local"
                name="due_at"
                required
                defaultValue={
                  entry && reminderTime(entry)
                    ? (() => {
                        const date = new Date(reminderTime(entry)!);
                        return new Date(
                          date.getTime() - date.getTimezoneOffset() * 60000,
                        )
                          .toISOString()
                          .slice(0, 16);
                      })()
                    : ""
                }
              />
            </Label>
          )}
          {![
            "ShortNotes",
            "Groceries",
            "Goals",
            "Places",
            "FoodToTry",
            "Todos",
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
                defaultValue={entry ? goalProgress(entry) : 0}
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
