import { describe, expect, it } from "@effect/vitest";
import * as Schema from "effect/Schema";

import { weightValueFilter } from "./weight-value-filter.ts";

const decodeWeightValue = Schema.decodeUnknownSync(
  Schema.Number.check(weightValueFilter),
);

describe("weightValueFilter", () => {
  it("accepts the smallest weight of 0.01", () => {
    expect(decodeWeightValue(0.01)).toBe(0.01);
  });

  it("accepts the largest weight of 9,999.99", () => {
    expect(decodeWeightValue(9_999.99)).toBe(9_999.99);
  });

  it("accepts a multiple of 0.01 that carries a floating-point rounding error", () => {
    expect(decodeWeightValue(0.30000000000000004)).toBe(0.30000000000000004);
  });

  it("rejects a weight of 0 as less than 0.01", () => {
    expect(() => decodeWeightValue(0)).toThrow(
      "Expected a value between 0.01 and 9999.99",
    );
  });

  it("rejects a weight of 10,000 as more than 9,999.99", () => {
    expect(() => decodeWeightValue(10_000)).toThrow(
      "Expected a value between 0.01 and 9999.99",
    );
  });

  it("rejects a weight that isn't a multiple of 0.01", () => {
    expect(() => decodeWeightValue(72.505)).toThrow(
      "Expected a value that is a multiple of 0.01",
    );
  });
});
