import { getWorkingSetCounts } from "#/features/workout/core/get-working-set-counts.ts";

const WARM_UP_PLANNED_SET = {
  intensityTechnique: null,
  isToFailure: false,
  tempo: null,
  type: "warm_up" as const,
};

const WORKING_PLANNED_SET = {
  ...WARM_UP_PLANNED_SET,
  type: "working" as const,
};

describe("getWorkingSetCounts", () => {
  it("counts the recorded Working sets as done and the other planned Working sets as left, leaving out Warm-up sets", () => {
    expect(
      getWorkingSetCounts({
        plannedSets: [
          WARM_UP_PLANNED_SET,
          WORKING_PLANNED_SET,
          WORKING_PLANNED_SET,
          WORKING_PLANNED_SET,
        ],
        recordedSetCount: 2,
      }),
    ).toStrictEqual({ doneCount: 1, leftCount: 2 });
  });

  it("doesn't count a recorded Set past the last planned Set as done", () => {
    expect(
      getWorkingSetCounts({
        plannedSets: [WORKING_PLANNED_SET],
        recordedSetCount: 3,
      }),
    ).toStrictEqual({ doneCount: 1, leftCount: 0 });
  });
});
