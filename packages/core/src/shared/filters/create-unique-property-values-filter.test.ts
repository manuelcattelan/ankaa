import { describe, expect, it } from "@effect/vitest";
import * as Schema from "effect/Schema";

import { createUniquePropertyValuesFilter } from "./create-unique-property-values-filter.ts";

const decodeSets = Schema.decodeUnknownSync(
  Schema.Array(Schema.Struct({ position: Schema.Number })).check(
    createUniquePropertyValuesFilter({ propertyKey: "position" }),
  ),
);

describe("createUniquePropertyValuesFilter", () => {
  it("accepts records whose property values are all different", () => {
    expect(decodeSets([{ position: 0 }, { position: 1 }])).toStrictEqual([
      { position: 0 },
      { position: 1 },
    ]);
  });

  it("rejects two records with the same property value", () => {
    expect(() =>
      decodeSets([{ position: 0 }, { position: 1 }, { position: 0 }]),
    ).toThrow("Must be unique");
  });
});
