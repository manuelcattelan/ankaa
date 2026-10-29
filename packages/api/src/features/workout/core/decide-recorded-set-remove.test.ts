import { WorkoutNotFoundError } from "@ankaa/core/features/workout/errors/workout-not-found-error";
import { describe, expect, it } from "vitest";

import { decideRecordedSetRemove } from "#/features/workout/core/decide-recorded-set-remove.ts";

describe("decideRecordedSetRemove", () => {
  it("allows the removal of the last recorded Set of a Workout exercise", () => {
    expect(
      decideRecordedSetRemove({
        userId: "user-1",
        workoutExercise: {
          recordedSets: [
            { id: "set-1", position: 0 },
            { id: "set-2", position: 1 },
          ],
          workout: { endedAt: null, userId: "user-1" },
        },
      }),
    ).toStrictEqual({ _tag: "RecordedSetRemoveAllowed", id: "set-2" });
  });

  it("decides that a Workout exercise with no recorded Set needs no removal", () => {
    expect(
      decideRecordedSetRemove({
        userId: "user-1",
        workoutExercise: {
          recordedSets: [],
          workout: { endedAt: null, userId: "user-1" },
        },
      }),
    ).toStrictEqual({ _tag: "NoRecordedSetToRemove" });
  });

  it("fails with WorkoutNotFoundError for a Workout exercise that doesn't exist", () => {
    expect(
      decideRecordedSetRemove({ userId: "user-1", workoutExercise: null }),
    ).toStrictEqual(new WorkoutNotFoundError());
  });

  it("fails with WorkoutNotFoundError for a Workout exercise of another User's Workout", () => {
    expect(
      decideRecordedSetRemove({
        userId: "user-2",
        workoutExercise: {
          recordedSets: [{ id: "set-1", position: 0 }],
          workout: { endedAt: null, userId: "user-1" },
        },
      }),
    ).toStrictEqual(new WorkoutNotFoundError());
  });

  it("fails with WorkoutNotFoundError for a Workout exercise of a stopped Workout", () => {
    expect(
      decideRecordedSetRemove({
        userId: "user-1",
        workoutExercise: {
          recordedSets: [{ id: "set-1", position: 0 }],
          workout: {
            endedAt: new Date("2026-10-29T10:00:00.000Z"),
            userId: "user-1",
          },
        },
      }),
    ).toStrictEqual(new WorkoutNotFoundError());
  });
});
