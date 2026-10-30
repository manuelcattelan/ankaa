import { WorkoutNotFoundError } from "@ankaa/core/features/workout/errors/workout-not-found-error";
import { describe, expect, it } from "vitest";

import { decideRecordedSetRemove } from "#/features/workout/core/decide-recorded-set-remove.ts";

describe("decideRecordedSetRemove", () => {
  it("allows the removal of a recorded Set, moving each recorded Set after it up one position", () => {
    expect(
      decideRecordedSetRemove({
        input: { id: "set-2" },
        userId: "user-1",
        workoutExercise: {
          recordedSets: [
            { id: "set-1", position: 0 },
            { id: "set-2", position: 1 },
            { id: "set-3", position: 2 },
            { id: "set-4", position: 3 },
          ],
          workout: { endedAt: null, userId: "user-1" },
        },
      }),
    ).toStrictEqual({
      _tag: "RecordedSetRemoveAllowed",
      id: "set-2",
      movedRecordedSets: [
        { id: "set-3", position: 1 },
        { id: "set-4", position: 2 },
      ],
    });
  });

  it("allows the removal of the last recorded Set, moving no other Set", () => {
    expect(
      decideRecordedSetRemove({
        input: { id: "set-2" },
        userId: "user-1",
        workoutExercise: {
          recordedSets: [
            { id: "set-1", position: 0 },
            { id: "set-2", position: 1 },
          ],
          workout: { endedAt: null, userId: "user-1" },
        },
      }),
    ).toStrictEqual({
      _tag: "RecordedSetRemoveAllowed",
      id: "set-2",
      movedRecordedSets: [],
    });
  });

  it("decides that a Set the Workout exercise no longer records needs no removal", () => {
    expect(
      decideRecordedSetRemove({
        input: { id: "set-2" },
        userId: "user-1",
        workoutExercise: {
          recordedSets: [{ id: "set-1", position: 0 }],
          workout: { endedAt: null, userId: "user-1" },
        },
      }),
    ).toStrictEqual({ _tag: "RecordedSetAlreadyRemoved" });
  });

  it("fails with WorkoutNotFoundError for a Workout exercise that doesn't exist", () => {
    expect(
      decideRecordedSetRemove({
        input: { id: "set-1" },
        userId: "user-1",
        workoutExercise: null,
      }),
    ).toStrictEqual(new WorkoutNotFoundError());
  });

  it("fails with WorkoutNotFoundError for a Workout exercise of another User's Workout", () => {
    expect(
      decideRecordedSetRemove({
        input: { id: "set-1" },
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
        input: { id: "set-1" },
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
