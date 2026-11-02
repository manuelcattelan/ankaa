import * as Schema from "effect/Schema";
import { describe, expect, it } from "vitest";

import { calendarDateFilter } from "#/features/absence/filters/calendar-date-filter.ts";

const decodeDate = Schema.decodeUnknownSync(
  Schema.String.check(calendarDateFilter),
);

describe("calendarDateFilter", () => {
  it("accepts a calendar date written as YYYY-MM-DD", () => {
    expect(decodeDate("2028-02-29")).toBe("2028-02-29");
  });

  it("rejects a day that its month doesn't have", () => {
    expect(() => decodeDate("2026-02-29")).toThrow(
      "Expected a calendar date written as YYYY-MM-DD",
    );
  });

  it("rejects a date with a time", () => {
    expect(() => decodeDate("2026-11-02T00:00:00.000Z")).toThrow(
      "Expected a calendar date written as YYYY-MM-DD",
    );
  });
});
