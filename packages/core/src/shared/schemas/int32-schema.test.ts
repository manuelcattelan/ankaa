import { describe, expect, it } from "@effect/vitest";
import * as Schema from "effect/Schema";

import { int32Schema } from "./int32-schema.ts";

const decodeInt32 = Schema.decodeUnknownSync(int32Schema);

describe("int32Schema", () => {
  it("accepts the largest 32-bit integer", () => {
    expect(decodeInt32(2_147_483_647)).toBe(2_147_483_647);
  });

  it("accepts the smallest 32-bit integer", () => {
    expect(decodeInt32(-2_147_483_648)).toBe(-2_147_483_648);
  });

  it("rejects an integer above the largest 32-bit integer", () => {
    expect(() => decodeInt32(2_147_483_648)).toThrow(
      "Expected a value between -2147483648 and 2147483647",
    );
  });

  it("rejects an integer below the smallest 32-bit integer", () => {
    expect(() => decodeInt32(-2_147_483_649)).toThrow(
      "Expected a value between -2147483648 and 2147483647",
    );
  });

  it("rejects a number that isn't an integer", () => {
    expect(() => decodeInt32(1.5)).toThrow("Expected an integer");
  });
});
