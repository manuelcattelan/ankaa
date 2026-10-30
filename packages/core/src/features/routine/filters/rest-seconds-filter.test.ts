import * as Schema from "effect/Schema";
import { describe, expect, it } from "vitest";

import { restSecondsFilter } from "#/features/routine/filters/rest-seconds-filter.ts";

const decodeRestSeconds = Schema.decodeUnknownSync(
  Schema.Number.check(restSecondsFilter),
);

describe("restSecondsFilter", () => {
  it("accepts a Rest of 1 second", () => {
    expect(decodeRestSeconds(1)).toBe(1);
  });

  it("rejects a Rest of 0 seconds", () => {
    expect(() => decodeRestSeconds(0)).toThrow(
      "Expected a value greater than or equal to 1",
    );
  });
});
