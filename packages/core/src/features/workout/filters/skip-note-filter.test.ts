import * as Schema from "effect/Schema";
import { describe, expect, it } from "vitest";

import { skipNoteFilter } from "#/features/workout/filters/skip-note-filter.ts";

const decodeSkip = Schema.decodeUnknownSync(
  Schema.Struct({
    note: Schema.NullOr(Schema.String),
    reason: Schema.NullOr(Schema.String),
  }).check(skipNoteFilter),
);

describe("skipNoteFilter", () => {
  it("accepts a note with a reason", () => {
    expect(decodeSkip({ note: "Sore shoulder", reason: "pain" })).toStrictEqual(
      { note: "Sore shoulder", reason: "pain" },
    );
  });

  it("rejects a note with no reason", () => {
    expect(() => decodeSkip({ note: "Sore shoulder", reason: null })).toThrow(
      "Expected a skip reason with a note",
    );
  });
});
