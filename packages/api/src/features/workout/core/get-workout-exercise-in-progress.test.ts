import { describe, expect, it } from "vitest";

import { getWorkoutExerciseInProgress } from "#/features/workout/core/get-workout-exercise-in-progress.ts";

describe("getWorkoutExerciseInProgress", () => {
  it("gives a Workout exercise of the User's Workout in progress", () => {
    expect(
      getWorkoutExerciseInProgress({
        userId: "user-1",
        workoutExercise: { workout: { endedAt: null, userId: "user-1" } },
      }),
    ).toStrictEqual({ workout: { endedAt: null, userId: "user-1" } });
  });

  it("gives null for a Workout exercise that doesn't exist", () => {
    expect(
      getWorkoutExerciseInProgress({ userId: "user-1", workoutExercise: null }),
    ).toBeNull();
  });

  it("gives null for a Workout exercise of another User's Workout", () => {
    expect(
      getWorkoutExerciseInProgress({
        userId: "user-2",
        workoutExercise: { workout: { endedAt: null, userId: "user-1" } },
      }),
    ).toBeNull();
  });

  it("gives null for a Workout exercise of a stopped Workout", () => {
    expect(
      getWorkoutExerciseInProgress({
        userId: "user-1",
        workoutExercise: {
          workout: {
            endedAt: new Date("2026-10-29T10:00:00.000Z"),
            userId: "user-1",
          },
        },
      }),
    ).toBeNull();
  });
});
