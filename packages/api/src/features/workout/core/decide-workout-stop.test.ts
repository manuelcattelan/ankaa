import { WorkoutNotFoundError } from "@ankaa/core/features/workout/errors/workout-not-found-error";
import { describe, expect, it } from "vitest";

import { decideWorkoutStop } from "#/features/workout/core/decide-workout-stop.ts";

describe("decideWorkoutStop", () => {
  it("allows the stop of the User's Workout in progress", () => {
    expect(
      decideWorkoutStop({
        userId: "user-1",
        workout: { endedAt: null, userId: "user-1" },
      }),
    ).toStrictEqual({ _tag: "WorkoutStopAllowed" });
  });

  it("decides that a Workout the User already stopped needs no stop", () => {
    expect(
      decideWorkoutStop({
        userId: "user-1",
        workout: {
          endedAt: new Date("2026-10-29T10:00:00.000Z"),
          userId: "user-1",
        },
      }),
    ).toStrictEqual({ _tag: "WorkoutAlreadyStopped" });
  });

  it("fails with WorkoutNotFoundError for a Workout that doesn't exist", () => {
    expect(
      decideWorkoutStop({ userId: "user-1", workout: null }),
    ).toStrictEqual(new WorkoutNotFoundError());
  });

  it("fails with WorkoutNotFoundError for a Workout of another User", () => {
    expect(
      decideWorkoutStop({
        userId: "user-1",
        workout: { endedAt: null, userId: "user-2" },
      }),
    ).toStrictEqual(new WorkoutNotFoundError());
  });
});
