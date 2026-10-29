import * as Schema from "effect/Schema";
import { describe, expect, it } from "vitest";

import { segmentCountFilter } from "#/features/routine/filters/segment-count-filter.ts";

const decodeSegmentCount = Schema.decodeUnknownSync(
  Schema.Number.check(segmentCountFilter),
);

describe("segmentCountFilter", () => {
  it("accepts 2 Segments", () => {
    expect(decodeSegmentCount(2)).toBe(2);
  });

  it("rejects 1 Segment", () => {
    expect(() => decodeSegmentCount(1)).toThrow(
      "Expected a value greater than or equal to 2",
    );
  });
});
