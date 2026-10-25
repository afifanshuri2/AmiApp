import test from "node:test";
import assert from "node:assert/strict";
import {
  timeLeft,
  reminderTime,
  foodIcon,
  validEmoji,
  goalProgress,
} from "../src/lib/everyday.ts";
test("reminders use real timestamps and readable relative times", () => {
  const now = Date.parse("2026-10-25T08:00:00Z");
  assert.equal(timeLeft("2026-10-25T08:12:00Z", now), "12 minutes left");
  assert.equal(timeLeft("2026-10-25T09:30:00Z", now), "1h 30m left");
  assert.equal(timeLeft("2026-10-26T10:00:00Z", now), "1 day 2h left");
  assert.equal(timeLeft("2026-10-25T07:55:00Z", now), "5 minutes overdue");
  assert.equal(timeLeft(null, now), "No time set");
  assert.equal(timeLeft("bad date", now), "No time set");
  assert.equal(reminderTime({ due_date: "2026-10-25" }), "2026-10-25T00:00:00");
  assert.equal(
    reminderTime({ due_at: "2026-10-25T08:00:00Z", due_date: "2026-10-24" }),
    "2026-10-25T08:00:00Z",
  );
});
test("place emojis, cuisine icons, and legacy goal progress stay compatible", () => {
  for (const value of ["🇲🇾", "☕", "🏝️", "👨‍👩‍👧‍👦", "1️⃣"])
    assert.equal(validEmoji(value), true);
  for (const value of ["", "Malaysia", "☕☕"])
    assert.equal(validEmoji(value), false);
  assert.equal(foodIcon("Melayu"), foodIcon("Malay"));
  assert.notEqual(foodIcon("Western"), foodIcon("Malay"));
  assert.equal(foodIcon("Custom cuisine"), "🍽️");
  assert.equal(goalProgress({ kind: "Goals", done: true, progress: 0 }), 100);
});
