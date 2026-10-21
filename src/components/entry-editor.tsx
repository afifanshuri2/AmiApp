"use client";
import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import type { Entry, Kind } from "../lib/types";
export type EntryInput = Pick<
  Entry,
  "title" | "detail" | "due_date" | "progress"
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
        <p className="eyebrow">{kind}</p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            await save({
              title: String(form.get("title")).trim(),
              detail: String(form.get("detail") || "").trim(),
              due_date: String(form.get("due_date") || "") || null,
              progress: Number(form.get("progress") || 0),
            });
          }}
        >
          <label>
            Title
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
          {!["ShortNotes", "Groceries", "Goals", "Places"].includes(kind) && (
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
