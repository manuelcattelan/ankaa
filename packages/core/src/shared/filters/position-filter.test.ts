import { describe, expect, it } from "@effect/vitest";
import * as Schema from "effect/Schema";

import { positionFilter } from "./position-filter.ts";

const decodePosition = Schema.decodeUnknownSync(
  Schema.Number.check(positionFilter),
);

describe("positionFilter", () => {
  it("accepts a position of 0", () => {
    expect(decodePosition(0)).toBe(0);
  });

  it("rejects a position of -1 as less than 0", () => {
    expect(() => decodePosition(-1)).toThrow(
      "Expected a value greater than or equal to 0",
    );
  });
});
