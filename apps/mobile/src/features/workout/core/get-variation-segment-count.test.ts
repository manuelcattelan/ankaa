import type { WorkoutDocumentRoutineExerciseSet } from "@/features/workout/core/workout-document-schema";

import { getVariationSegmentCount } from "@/features/workout/core/get-variation-segment-count";

const WORKOUT_DOCUMENT_ROUTINE_EXERCISE_SET: WorkoutDocumentRoutineExerciseSet =
  {
    amount: 8,
    dropSetSegmentCount: 3,
    isToFailure: true,
    restPauseSegmentCount: 4,
    setType: "working",
  };

describe("getVariationSegmentCount", () => {
  it("returns the planned Segment count of a Rest-pause set", () => {
    expect(
      getVariationSegmentCount({
        variation: "rest_pause",
        workoutDocumentRoutineExerciseSet:
          WORKOUT_DOCUMENT_ROUTINE_EXERCISE_SET,
      }),
    ).toBe(4);
  });

  it("returns the planned Segment count of a Drop set", () => {
    expect(
      getVariationSegmentCount({
        variation: "drop_set",
        workoutDocumentRoutineExerciseSet:
          WORKOUT_DOCUMENT_ROUTINE_EXERCISE_SET,
      }),
    ).toBe(3);
  });

  it("returns no Segment count for a Set without an Intensity technique", () => {
    expect(
      getVariationSegmentCount({
        variation: undefined,
        workoutDocumentRoutineExerciseSet:
          WORKOUT_DOCUMENT_ROUTINE_EXERCISE_SET,
      }),
    ).toBe(undefined);
  });

  it("returns no Segment count when the Routine plans no Set for it", () => {
    expect(
      getVariationSegmentCount({
        variation: "drop_set",
        workoutDocumentRoutineExerciseSet: undefined,
      }),
    ).toBe(undefined);
  });
});
