import * as Schema from "effect/Schema";
import { describe, expect, it } from "vitest";

import { maximumIntegerFilter } from "#/shared/filters/maximum-integer-filter.ts";

const decodeInteger = Schema.decodeUnknownSync(
  Schema.Number.check(maximumIntegerFilter),
);

describe("maximumIntegerFilter", () => {
  it("accepts the largest PostgreSQL integer", () => {
    expect(decodeInteger(2_147_483_647)).toBe(2_147_483_647);
  });

  it("rejects a number larger than the largest PostgreSQL integer", () => {
    expect(() => decodeInteger(2_147_483_648)).toThrow(
      "Expected a value less than or equal to 2147483647",
    );
  });
});
