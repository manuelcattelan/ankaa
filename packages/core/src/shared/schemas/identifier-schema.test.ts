import { describe, expect, it } from "@effect/vitest";
import * as Schema from "effect/Schema";

import { identifierSchema } from "./identifier-schema.ts";

const decodeIdentifier = Schema.decodeUnknownSync(identifierSchema);

describe("identifierSchema", () => {
  it("accepts a UUID v7", () => {
    expect(decodeIdentifier("019a0000-0000-7000-8000-000000000001")).toBe(
      "019a0000-0000-7000-8000-000000000001",
    );
  });

  it("rejects a UUID v4", () => {
    expect(() =>
      decodeIdentifier("019a0000-0000-4000-8000-000000000001"),
    ).toThrow("Expected a UUID v7");
  });
});
