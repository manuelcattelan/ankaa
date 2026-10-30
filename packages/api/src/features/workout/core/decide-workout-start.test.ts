import { RoutineNotFoundError } from "@ankaa/core/shared/errors/routine-not-found-error";
import { describe, expect, it } from "vitest";

import { decideWorkoutStart } from "#/features/workout/core/decide-workout-start.ts";

describe("decideWorkoutStart", () => {
  it("allows the start of a Workout from a live Routine of the User", () => {
    expect(
      decideWorkoutStart({
        routine: { deletedAt: null, userId: "user-1" },
        userId: "user-1",
        workout: null,
      }),
    ).toStrictEqual({
      _tag: "WorkoutStartAllowed",
      routine: { deletedAt: null, userId: "user-1" },
    });
  });

  it("decides that a Workout the User already started with the same id needs no start", () => {
    expect(
      decideWorkoutStart({
        routine: {
          deletedAt: new Date("2026-10-29T10:00:00.000Z"),
          userId: "user-1",
        },
        userId: "user-1",
        workout: { userId: "user-1" },
      }),
    ).toStrictEqual({ _tag: "WorkoutAlreadyStarted" });
  });

  it("decides that another User already started a Workout with the same id", () => {
    expect(
      decideWorkoutStart({
        routine: { deletedAt: null, userId: "user-1" },
        userId: "user-1",
        workout: { userId: "user-2" },
      }),
    ).toStrictEqual({ _tag: "WorkoutStartedByAnotherUser" });
  });

  it("fails with RoutineNotFoundError for a Routine that doesn't exist", () => {
    expect(
      decideWorkoutStart({ routine: null, userId: "user-1", workout: null }),
    ).toStrictEqual(new RoutineNotFoundError());
  });

  it("fails with RoutineNotFoundError for a Routine of another User", () => {
    expect(
      decideWorkoutStart({
        routine: { deletedAt: null, userId: "user-2" },
        userId: "user-1",
        workout: null,
      }),
    ).toStrictEqual(new RoutineNotFoundError());
  });

  it("fails with RoutineNotFoundError for a Routine the User deleted", () => {
    expect(
      decideWorkoutStart({
        routine: {
          deletedAt: new Date("2026-10-29T10:00:00.000Z"),
          userId: "user-1",
        },
        userId: "user-1",
        workout: null,
      }),
    ).toStrictEqual(new RoutineNotFoundError());
  });
});
