import * as Schema from "effect/Schema";
import { describe, expect, it } from "vitest";

import { pauseSecondsFilter } from "#/features/routine/filters/pause-seconds-filter.ts";

const decodePauseSeconds = Schema.decodeUnknownSync(
  Schema.Number.check(pauseSecondsFilter),
);

describe("pauseSecondsFilter", () => {
  it("accepts a Pause of 1 second", () => {
    expect(decodePauseSeconds(1)).toBe(1);
  });

  it("rejects a Pause of 0 seconds", () => {
    expect(() => decodePauseSeconds(0)).toThrow(
      "Expected a value greater than or equal to 1",
    );
  });
});
