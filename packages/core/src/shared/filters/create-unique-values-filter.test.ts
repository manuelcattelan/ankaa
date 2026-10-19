import { describe, expect, it } from "@effect/vitest";
import * as Schema from "effect/Schema";

import { createUniqueValuesFilter } from "./create-unique-values-filter.ts";

const decodeNames = Schema.decodeUnknownSync(
  Schema.Array(Schema.String).check(
    createUniqueValuesFilter({
      getValues: (names: readonly string[]) => names,
    }),
  ),
);

describe("createUniqueValuesFilter", () => {
  it("accepts values that are all different", () => {
    expect(decodeNames(["Push", "Pull"])).toStrictEqual(["Push", "Pull"]);
  });

  it("rejects a value that appears twice", () => {
    expect(() => decodeNames(["Push", "Pull", "Push"])).toThrow(
      "Must be unique",
    );
  });
});
