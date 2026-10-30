import * as Schema from "effect/Schema";

import { createNullableTextSchema } from "#/shared/core/create-nullable-text-schema.ts";

const nullableTextSchema = createNullableTextSchema(Schema.String);

describe("createNullableTextSchema", () => {
  it("decodes blank text to null", () => {
    expect(Schema.decodeUnknownSync(nullableTextSchema)("  ")).toBeNull();
  });

  it("decodes text to its value, trimming the spaces around it", () => {
    expect(
      Schema.decodeUnknownSync(nullableTextSchema)(" Pause at the chest "),
    ).toBe("Pause at the chest");
  });

  it("encodes null to empty text", () => {
    expect(Schema.encodeSync(nullableTextSchema)(null)).toBe("");
  });
});
