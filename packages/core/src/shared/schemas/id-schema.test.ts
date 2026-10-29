import * as Schema from "effect/Schema";
import { describe, expect, it } from "vitest";

import { idSchema } from "#/shared/schemas/id-schema.ts";

const decodeId = Schema.decodeUnknownSync(idSchema);

describe("idSchema", () => {
  it("accepts a UUID v7", () => {
    expect(decodeId("019a0000-0000-7000-8000-000000000001")).toBe(
      "019a0000-0000-7000-8000-000000000001",
    );
  });

  it("rejects a UUID of another version", () => {
    expect(() => decodeId("019a0000-0000-4000-8000-000000000001")).toThrow(
      "Expected a UUID v7",
    );
  });
});
