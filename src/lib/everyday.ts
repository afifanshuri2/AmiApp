import type { Entry } from "./types";

export function goalProgress(entry: Entry) {
  return entry.kind === "Goals" && entry.done && entry.progress === 0
    ? 100
    : entry.progress;
}
export function reminderTime(entry: Pick<Entry, "due_at" | "due_date">) {
  return entry.due_at || (entry.due_date ? `${entry.due_date}T00:00:00` : null);
}
export function timeLeft(value: string | null, now: number) {
  if (!value || !Number.isFinite(Date.parse(value))) return "No time set";
  const difference = Date.parse(value) - now;
  const minutes = Math.ceil(Math.abs(difference) / 60000);
  if (!minutes) return "Due now";
  const days = Math.floor(minutes / 1440),
    hours = Math.floor((minutes % 1440) / 60),
    mins = minutes % 60;
  const amount = days
    ? `${days} day${days === 1 ? "" : "s"}${hours ? ` ${hours}h` : ""}`
    : hours
      ? `${hours}h${mins ? ` ${mins}m` : ""}`
      : `${minutes} minute${minutes === 1 ? "" : "s"}`;
  return `${amount} ${difference < 0 ? "overdue" : "left"}`;
}
export function foodIcon(category: string) {
  const icons: Record<string, string> = {
    malay: "🍛",
    melayu: "🍛",
    kampung: "🌾",
    western: "🍔",
    chinese: "🥟",
    indian: "🫓",
    japanese: "🍣",
    korean: "🍲",
    thai: "🍜",
    indonesian: "🍢",
    "middle eastern": "🥙",
    seafood: "🦐",
    desserts: "🍰",
    other: "🍽️",
  };
  return icons[category.toLowerCase()] || "🍽️";
}
export function validEmoji(value: string) {
  return (
    [
      ...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(
        value,
      ),
    ].length === 1 &&
    /\p{Extended_Pictographic}|\p{Regional_Indicator}|\u20e3/u.test(value)
  );
}
