import { SegmentCountInvalidError } from "@ankaa/core/features/workout/errors/segment-count-invalid-error";
import { SegmentWeightNotAllowedError } from "@ankaa/core/features/workout/errors/segment-weight-not-allowed-error";
import { WorkoutNotFoundError } from "@ankaa/core/features/workout/errors/workout-not-found-error";
import { describe, expect, it } from "vitest";

import { decideRecordedSetSave } from "#/features/workout/core/decide-recorded-set-save.ts";

const WORKOUT_EXERCISE = {
  plannedSets: [
    {
      intensityTechnique: null,
      isToFailure: false,
      tempo: null,
      type: "working" as const,
    },
    {
      intensityTechnique: {
        _tag: "DropSet" as const,
        segmentCount: 3,
        weightPercentage: 20,
      },
      isToFailure: false,
      tempo: null,
      type: "working" as const,
    },
  ],
  recordedSets: [{ id: "set-1", position: 0 }],
  weightType: "total" as const,
  workout: { endedAt: null, userId: "user-1" },
};

const SEGMENT = { amount: 8, weight: 60 };

describe("decideRecordedSetSave", () => {
  it("allows the Save of a new Set at the position after the recorded Sets", () => {
    expect(
      decideRecordedSetSave({
        input: { id: "set-2", segments: [SEGMENT, SEGMENT, SEGMENT] },
        userId: "user-1",
        workoutExercise: WORKOUT_EXERCISE,
      }),
    ).toStrictEqual({ _tag: "RecordedSetSaveAllowed", position: 1 });
  });

  it("allows the Save of a recorded Set again at its own position", () => {
    expect(
      decideRecordedSetSave({
        input: { id: "set-1", segments: [SEGMENT] },
        userId: "user-1",
        workoutExercise: WORKOUT_EXERCISE,
      }),
    ).toStrictEqual({ _tag: "RecordedSetSaveAllowed", position: 0 });
  });

  it("allows a Set with an Intensity technique to have fewer Segments than planned", () => {
    expect(
      decideRecordedSetSave({
        input: { id: "set-2", segments: [SEGMENT] },
        userId: "user-1",
        workoutExercise: WORKOUT_EXERCISE,
      }),
    ).toStrictEqual({ _tag: "RecordedSetSaveAllowed", position: 1 });
  });

  it("allows a Set without weights in a Workout exercise whose Weight type is none", () => {
    expect(
      decideRecordedSetSave({
        input: { id: "set-2", segments: [{ amount: 15, weight: null }] },
        userId: "user-1",
        workoutExercise: {
          ...WORKOUT_EXERCISE,
          plannedSets: [],
          weightType: "none",
        },
      }),
    ).toStrictEqual({ _tag: "RecordedSetSaveAllowed", position: 1 });
  });

  it("fails with SegmentCountInvalidError for a Set with more Segments than its planned Intensity technique", () => {
    expect(
      decideRecordedSetSave({
        input: {
          id: "set-2",
          segments: [SEGMENT, SEGMENT, SEGMENT, SEGMENT],
        },
        userId: "user-1",
        workoutExercise: WORKOUT_EXERCISE,
      }),
    ).toStrictEqual(new SegmentCountInvalidError());
  });

  it("fails with SegmentCountInvalidError for a Set with two Segments and no planned Intensity technique", () => {
    expect(
      decideRecordedSetSave({
        input: { id: "set-1", segments: [SEGMENT, SEGMENT] },
        userId: "user-1",
        workoutExercise: WORKOUT_EXERCISE,
      }),
    ).toStrictEqual(new SegmentCountInvalidError());
  });

  it("fails with SegmentCountInvalidError for a Set with no Segments", () => {
    expect(
      decideRecordedSetSave({
        input: { id: "set-2", segments: [] },
        userId: "user-1",
        workoutExercise: WORKOUT_EXERCISE,
      }),
    ).toStrictEqual(new SegmentCountInvalidError());
  });

  it("fails with SegmentWeightNotAllowedError for a weight in a Workout exercise whose Weight type is none", () => {
    expect(
      decideRecordedSetSave({
        input: { id: "set-2", segments: [{ amount: 15, weight: 5 }] },
        userId: "user-1",
        workoutExercise: { ...WORKOUT_EXERCISE, weightType: "none" },
      }),
    ).toStrictEqual(new SegmentWeightNotAllowedError());
  });

  it("fails with WorkoutNotFoundError for a Workout exercise that doesn't exist", () => {
    expect(
      decideRecordedSetSave({
        input: { id: "set-2", segments: [SEGMENT] },
        userId: "user-1",
        workoutExercise: null,
      }),
    ).toStrictEqual(new WorkoutNotFoundError());
  });

  it("fails with WorkoutNotFoundError for a Workout exercise of another User's Workout", () => {
    expect(
      decideRecordedSetSave({
        input: { id: "set-2", segments: [SEGMENT] },
        userId: "user-2",
        workoutExercise: WORKOUT_EXERCISE,
      }),
    ).toStrictEqual(new WorkoutNotFoundError());
  });

  it("fails with WorkoutNotFoundError for a Workout exercise of a stopped Workout", () => {
    expect(
      decideRecordedSetSave({
        input: { id: "set-2", segments: [SEGMENT] },
        userId: "user-1",
        workoutExercise: {
          ...WORKOUT_EXERCISE,
          workout: {
            endedAt: new Date("2026-10-29T10:00:00.000Z"),
            userId: "user-1",
          },
        },
      }),
    ).toStrictEqual(new WorkoutNotFoundError());
  });
});
