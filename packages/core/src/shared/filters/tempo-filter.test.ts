import * as Schema from "effect/Schema";
import { describe, expect, it } from "vitest";

import { tempoFilter } from "#/shared/filters/tempo-filter.ts";

const decodeTempo = Schema.decodeUnknownSync(Schema.String.check(tempoFilter));

describe("tempoFilter", () => {
  it("accepts four numbers of one or two digits", () => {
    expect(decodeTempo("3-10-1-2")).toBe("3-10-1-2");
  });

  it("accepts an X in third place", () => {
    expect(decodeTempo("3-0-X-2")).toBe("3-0-X-2");
  });

  it("rejects an X outside the third place", () => {
    expect(() => decodeTempo("X-0-1-2")).toThrow(
      "Expected a string matching the RegExp",
    );
  });

  it("rejects three numbers", () => {
    expect(() => decodeTempo("3-0-1")).toThrow(
      "Expected a string matching the RegExp",
    );
  });
});
