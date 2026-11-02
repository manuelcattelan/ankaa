import { describe, expect, it } from "vitest";

import { isWorkoutExerciseDone } from "#/features/workout/core/is-workout-exercise-done.ts";

describe("isWorkoutExerciseDone", () => {
  it("tells that a Workout exercise with every planned Working set recorded is done, whatever its Warm-up sets", () => {
    expect(
      isWorkoutExerciseDone({
        plannedSets: [{ type: "warm_up" }, { type: "working" }],
        recordedSetCount: 2,
        skipReason: null,
      }),
    ).toBe(true);
  });

  it("tells that a Workout exercise with fewer recorded Working sets than planned isn't done", () => {
    expect(
      isWorkoutExerciseDone({
        plannedSets: [{ type: "warm_up" }, { type: "working" }],
        recordedSetCount: 1,
        skipReason: null,
      }),
    ).toBe(false);
  });

  it("tells that a Workout exercise with a Skip is done, whatever it recorded", () => {
    expect(
      isWorkoutExerciseDone({
        plannedSets: [{ type: "working" }],
        recordedSetCount: 0,
        skipReason: "pain",
      }),
    ).toBe(true);
  });
});
