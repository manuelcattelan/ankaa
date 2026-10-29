import { WorkoutNotFoundError } from "@ankaa/core/features/workout/errors/workout-not-found-error";
import { describe, expect, it } from "vitest";

import { decideWorkoutExerciseUpdate } from "#/features/workout/core/decide-workout-exercise-update.ts";

describe("decideWorkoutExerciseUpdate", () => {
  it("allows the update of a Workout exercise of the User's Workout in progress", () => {
    expect(
      decideWorkoutExerciseUpdate({
        userId: "user-1",
        workoutExercise: { workout: { endedAt: null, userId: "user-1" } },
      }),
    ).toStrictEqual({ _tag: "WorkoutExerciseUpdateAllowed" });
  });

  it("fails with WorkoutNotFoundError for a Workout exercise that doesn't exist", () => {
    expect(
      decideWorkoutExerciseUpdate({ userId: "user-1", workoutExercise: null }),
    ).toStrictEqual(new WorkoutNotFoundError());
  });

  it("fails with WorkoutNotFoundError for a Workout exercise of another User's Workout", () => {
    expect(
      decideWorkoutExerciseUpdate({
        userId: "user-2",
        workoutExercise: { workout: { endedAt: null, userId: "user-1" } },
      }),
    ).toStrictEqual(new WorkoutNotFoundError());
  });

  it("fails with WorkoutNotFoundError for a Workout exercise of a stopped Workout", () => {
    expect(
      decideWorkoutExerciseUpdate({
        userId: "user-1",
        workoutExercise: {
          workout: {
            endedAt: new Date("2026-10-29T10:00:00.000Z"),
            userId: "user-1",
          },
        },
      }),
    ).toStrictEqual(new WorkoutNotFoundError());
  });
});
