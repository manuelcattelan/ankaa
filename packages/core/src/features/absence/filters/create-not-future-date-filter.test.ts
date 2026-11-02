import * as Schema from "effect/Schema";
import { describe, expect, it } from "vitest";

import { createNotFutureDateFilter } from "#/features/absence/filters/create-not-future-date-filter.ts";

const decodeDate = Schema.decodeUnknownSync(
  Schema.String.check(createNotFutureDateFilter({ today: "2026-11-02" })),
);

describe("createNotFutureDateFilter", () => {
  it("accepts today", () => {
    expect(decodeDate("2026-11-02")).toBe("2026-11-02");
  });

  it("rejects the day after today", () => {
    expect(() => decodeDate("2026-11-03")).toThrow(
      "Expected a date that isn't after today",
    );
  });
});
