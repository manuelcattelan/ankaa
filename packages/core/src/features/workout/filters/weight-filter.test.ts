import * as Schema from "effect/Schema";
import { describe, expect, it } from "vitest";

import { weightFilter } from "#/features/workout/filters/weight-filter.ts";

const decodeWeight = Schema.decodeUnknownSync(
  Schema.Number.check(weightFilter),
);

describe("weightFilter", () => {
  it("accepts a weight of 0.01", () => {
    expect(decodeWeight(0.01)).toBe(0.01);
  });

  it("accepts a weight of 9999.99", () => {
    expect(decodeWeight(9999.99)).toBe(9999.99);
  });

  it("rejects a weight of 0", () => {
    expect(() => decodeWeight(0)).toThrow(
      "Expected a value between 0.01 and 9999.99",
    );
  });

  it("rejects a weight of 10000", () => {
    expect(() => decodeWeight(10_000)).toThrow(
      "Expected a value between 0.01 and 9999.99",
    );
  });
});
