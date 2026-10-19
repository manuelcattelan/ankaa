import { describe, expect, it } from "@effect/vitest";
import * as Schema from "effect/Schema";

import { routineNameFilter } from "./routine-name-filter.ts";

const decodeRoutineName = Schema.decodeUnknownSync(
  Schema.String.check(routineNameFilter),
);

describe("routineNameFilter", () => {
  it("accepts a name of one character", () => {
    expect(decodeRoutineName("A")).toBe("A");
  });

  it("rejects an empty name", () => {
    expect(() => decodeRoutineName("")).toThrow(
      "Expected a value with a length of at least 1",
    );
  });
});
