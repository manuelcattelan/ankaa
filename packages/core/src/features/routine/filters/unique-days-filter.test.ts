import * as Schema from "effect/Schema";
import { describe, expect, it } from "vitest";

import { uniqueDaysFilter } from "#/features/routine/filters/unique-days-filter.ts";

const decodeDays = Schema.decodeUnknownSync(
  Schema.Array(Schema.String).check(uniqueDaysFilter),
);

describe("uniqueDaysFilter", () => {
  it("accepts days that are each named once", () => {
    expect(decodeDays(["monday", "thursday"])).toStrictEqual([
      "monday",
      "thursday",
    ]);
  });

  it("rejects a day named twice", () => {
    expect(() => decodeDays(["monday", "monday"])).toThrow(
      "Expected an array with unique items",
    );
  });
});
