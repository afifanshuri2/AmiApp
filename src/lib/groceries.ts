import type { Entry } from "./types";

export type GroceryLine = { text: string; done: boolean };

const DONE = /^\[x\]\s*/i;

/** A grocery list is one entry: its title plus one item per line of its text. */
export function groceryLines(entry: Pick<Entry, "title" | "detail">) {
  const lines = (entry.detail || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map<GroceryLine>((line) => ({
      done: DONE.test(line),
      text: line.replace(DONE, ""),
    }));
  return lines;
}
/** Writes items back as lines, marking ticked ones with "[x] ". */
export function serializeGrocery(lines: GroceryLine[]) {
  return lines.map((l) => (l.done ? `[x] ${l.text}` : l.text)).join("\n");
}
/** The newest grocery list, which is the one the fridge note shows. */
export function latestGroceryList(entries: Entry[]) {
  return entries
    .filter((e) => e.kind === "Groceries")
    .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
}
/** Readable text for list views: ticked lines show a check mark. */
export function displayGrocery(detail: string) {
  return detail.replace(/^\[x\]\s*/gim, "✓ ");
}
