import * as Schema from "effect/Schema";
import { describe, expect, it } from "vitest";

import { weightStepFilter } from "#/features/workout/filters/weight-step-filter.ts";

const decodeWeight = Schema.decodeUnknownSync(
  Schema.Number.check(weightStepFilter),
);

describe("weightStepFilter", () => {
  it("accepts a weight of 22.55, a multiple of 0.01", () => {
    expect(decodeWeight(22.55)).toBe(22.55);
  });

  it("rejects a weight of 22.555, which isn't a multiple of 0.01", () => {
    expect(() => decodeWeight(22.555)).toThrow(
      "Expected a value that is a multiple of 0.01",
    );
  });
});
