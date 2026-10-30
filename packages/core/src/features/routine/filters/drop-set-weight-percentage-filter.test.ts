import * as Schema from "effect/Schema";
import { describe, expect, it } from "vitest";

import { dropSetWeightPercentageFilter } from "#/features/routine/filters/drop-set-weight-percentage-filter.ts";

const decodeWeightPercentage = Schema.decodeUnknownSync(
  Schema.Number.check(dropSetWeightPercentageFilter),
);

describe("dropSetWeightPercentageFilter", () => {
  it("accepts a weight percentage of 1", () => {
    expect(decodeWeightPercentage(1)).toBe(1);
  });

  it("accepts a weight percentage of 99", () => {
    expect(decodeWeightPercentage(99)).toBe(99);
  });

  it("rejects a weight percentage of 0", () => {
    expect(() => decodeWeightPercentage(0)).toThrow(
      "Expected a value between 1 and 99",
    );
  });

  it("rejects a weight percentage of 100", () => {
    expect(() => decodeWeightPercentage(100)).toThrow(
      "Expected a value between 1 and 99",
    );
  });
});
