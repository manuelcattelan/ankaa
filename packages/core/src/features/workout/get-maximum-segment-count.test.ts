import { describe, expect, it } from "vitest";

import { getMaximumSegmentCount } from "#/features/workout/get-maximum-segment-count.ts";

describe("getMaximumSegmentCount", () => {
  it("gives the Segment count of the planned Set's Intensity technique", () => {
    expect(
      getMaximumSegmentCount({ intensityTechnique: { segmentCount: 3 } }),
    ).toBe(3);
  });

  it("gives 1 for a planned Set without an Intensity technique", () => {
    expect(getMaximumSegmentCount({ intensityTechnique: null })).toBe(1);
  });
});
