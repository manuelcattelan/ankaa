import { describe, expect, it } from "vitest";

import { getMatchingPlannedSet } from "#/features/workout/get-matching-planned-set.ts";

const WARM_UP_PLANNED_SET = {
  intensityTechnique: null,
  isToFailure: false,
  tempo: null,
  type: "warm_up" as const,
};

const DROP_SET_PLANNED_SET = {
  intensityTechnique: {
    _tag: "DropSet" as const,
    segmentCount: 3,
    weightPercentage: 20,
  },
  isToFailure: true,
  tempo: "3-0-1-2",
  type: "working" as const,
};

describe("getMatchingPlannedSet", () => {
  it("matches a recorded Set with the planned Set at its position", () => {
    expect(
      getMatchingPlannedSet({
        plannedSets: [WARM_UP_PLANNED_SET, DROP_SET_PLANNED_SET],
        position: 0,
      }),
    ).toStrictEqual({
      intensityTechnique: null,
      isToFailure: false,
      tempo: null,
      type: "warm_up",
    });
  });

  it("matches a recorded Set past the end of the plan with the last planned Set", () => {
    expect(
      getMatchingPlannedSet({
        plannedSets: [WARM_UP_PLANNED_SET, DROP_SET_PLANNED_SET],
        position: 3,
      }),
    ).toStrictEqual({
      intensityTechnique: {
        _tag: "DropSet",
        segmentCount: 3,
        weightPercentage: 20,
      },
      isToFailure: true,
      tempo: "3-0-1-2",
      type: "working",
    });
  });

  it("matches a recorded Set of a Workout exercise with no planned Sets with a plain Working set", () => {
    expect(
      getMatchingPlannedSet({ plannedSets: [], position: 0 }),
    ).toStrictEqual({
      intensityTechnique: null,
      isToFailure: false,
      tempo: null,
      type: "working",
    });
  });
});
