import * as Schema from "effect/Schema";

import { createWholeNumberTextSchema } from "#/shared/core/create-whole-number-text-schema.ts";

const decodeWholeNumberText = Schema.decodeUnknownSync(
  createWholeNumberTextSchema({
    filter: Schema.isGreaterThanOrEqualTo(1),
    message: "Enter a whole number of at least 1.",
  }),
);

describe("createWholeNumberTextSchema", () => {
  it("decodes a whole number, trimming the spaces around it", () => {
    expect(decodeWholeNumberText(" 8 ")).toBe(8);
  });

  it("decodes the largest PostgreSQL integer", () => {
    expect(decodeWholeNumberText("2147483647")).toBe(2_147_483_647);
  });

  it("rejects a number that isn't whole with the message", () => {
    expect(() => decodeWholeNumberText("8.5")).toThrow(
      "Enter a whole number of at least 1.",
    );
  });

  it("rejects a number too large to store with the message", () => {
    expect(() => decodeWholeNumberText("2147483648")).toThrow(
      "Enter a whole number of at least 1.",
    );
  });

  it("rejects a number that the filter rejects with the message", () => {
    expect(() => decodeWholeNumberText("0")).toThrow(
      "Enter a whole number of at least 1.",
    );
  });
});
