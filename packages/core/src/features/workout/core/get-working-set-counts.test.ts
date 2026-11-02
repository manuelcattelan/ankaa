import { describe, expect, it } from "vitest";

import { getWorkingSetCounts } from "#/features/workout/core/get-working-set-counts.ts";

describe("getWorkingSetCounts", () => {
  it("counts the recorded Working sets as done and the other planned Working sets as left, leaving out Warm-up sets", () => {
    expect(
      getWorkingSetCounts({
        plannedSets: [
          { type: "warm_up" },
          { type: "working" },
          { type: "working" },
          { type: "working" },
        ],
        recordedSetCount: 2,
      }),
    ).toStrictEqual({ doneCount: 1, leftCount: 2 });
  });

  it("doesn't count a recorded Set past the last planned Set as done", () => {
    expect(
      getWorkingSetCounts({
        plannedSets: [{ type: "working" }],
        recordedSetCount: 3,
      }),
    ).toStrictEqual({ doneCount: 1, leftCount: 0 });
  });
});
