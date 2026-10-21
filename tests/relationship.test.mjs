import test from "node:test";
import assert from "node:assert/strict";
import { relationshipDuration, todayDate } from "../src/lib/relationship.ts";
test("calendar duration handles anniversaries, leap days, month ends and DST", () => {
  assert.equal(relationshipDuration("2020-10-21", "2026-10-21"), "6 years");
  assert.equal(
    relationshipDuration("2020-10-22", "2026-10-21"),
    "5 years, 11 months, 29 days",
  );
  assert.equal(relationshipDuration("2024-02-29", "2025-02-28"), "1 year");
  assert.equal(relationshipDuration("2026-01-31", "2026-02-28"), "1 month");
  assert.equal(relationshipDuration("2026-03-07", "2026-03-09"), "2 days");
  assert.equal(
    relationshipDuration("2026-10-21", "2026-10-21"),
    "Our first day",
  );
  assert.equal(relationshipDuration("2027-01-01", "2026-10-21"), "");
  assert.equal(todayDate(new Date(2026, 0, 2, 23, 30)), "2026-01-02");
});
