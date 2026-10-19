import { describe, expect, it } from "@effect/vitest";
import * as Schema from "effect/Schema";

import { amountFilter } from "./amount-filter.ts";

const decodeAmount = Schema.decodeUnknownSync(
  Schema.Number.check(amountFilter),
);

describe("amountFilter", () => {
  it("accepts an Amount of 1", () => {
    expect(decodeAmount(1)).toBe(1);
  });

  it("rejects an Amount of 0 as less than 1", () => {
    expect(() => decodeAmount(0)).toThrow(
      "Expected a value greater than or equal to 1",
    );
  });
});
