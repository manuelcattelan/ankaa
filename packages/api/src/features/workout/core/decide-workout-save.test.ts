import type { WorkoutSaveInput } from "@ankaa/core/features/workout/schemas/workout-save-input-schema";

import { describe, expect, it } from "@effect/vitest";

import { decideWorkoutSave } from "./decide-workout-save.ts";

const WORKOUT_SAVE_INPUT: WorkoutSaveInput = {
  endedAt: null,
  exercises: [],
  id: "019a0000-0000-7000-8000-000000000001",
  routineId: "019a0000-0000-7000-8000-000000000002",
  startedAt: "2026-10-19T08:30:00Z",
  version: 2,
};

const WORKOUT_ROUTINE = { id: "019a0000-0000-7000-8000-000000000002" };

describe("decideWorkoutSave", () => {
  it("allows the Save of a new Workout", () => {
    expect(
      decideWorkoutSave({
        userId: "user-1",
        workoutInProgress: undefined,
        workoutRoutine: WORKOUT_ROUTINE,
        workoutSaveInput: WORKOUT_SAVE_INPUT,
        workoutWithSameId: undefined,
      }),
    ).toEqual({ _tag: "WorkoutSaveAllowed" });
  });

  it("allows the Save of a newer version of the person's Workout", () => {
    expect(
      decideWorkoutSave({
        userId: "user-1",
        workoutInProgress: undefined,
        workoutRoutine: WORKOUT_ROUTINE,
        workoutSaveInput: WORKOUT_SAVE_INPUT,
        workoutWithSameId: { userId: "user-1", version: 1 },
      }),
    ).toEqual({ _tag: "WorkoutSaveAllowed" });
  });

  it("skips the Save of a version already saved as WorkoutVersionAlreadySaved", () => {
    expect(
      decideWorkoutSave({
        userId: "user-1",
        workoutInProgress: undefined,
        workoutRoutine: WORKOUT_ROUTINE,
        workoutSaveInput: WORKOUT_SAVE_INPUT,
        workoutWithSameId: { userId: "user-1", version: 2 },
      }),
    ).toEqual({ _tag: "WorkoutVersionAlreadySaved" });
  });

  it("skips the Save of a version older than the one saved as WorkoutVersionAlreadySaved", () => {
    expect(
      decideWorkoutSave({
        userId: "user-1",
        workoutInProgress: undefined,
        workoutRoutine: WORKOUT_ROUTINE,
        workoutSaveInput: WORKOUT_SAVE_INPUT,
        workoutWithSameId: { userId: "user-1", version: 3 },
      }),
    ).toEqual({ _tag: "WorkoutVersionAlreadySaved" });
  });

  it("rejects the Save of another person's Workout as WorkoutNotFound", () => {
    expect(
      decideWorkoutSave({
        userId: "user-1",
        workoutInProgress: undefined,
        workoutRoutine: WORKOUT_ROUTINE,
        workoutSaveInput: WORKOUT_SAVE_INPUT,
        workoutWithSameId: { userId: "user-2", version: 1 },
      }),
    ).toEqual({ _tag: "WorkoutNotFound" });
  });

  it("rejects the Save of a Workout in progress while another Workout is in progress as WorkoutInProgressConflict", () => {
    expect(
      decideWorkoutSave({
        userId: "user-1",
        workoutInProgress: { id: "019a0000-0000-7000-8000-000000000003" },
        workoutRoutine: WORKOUT_ROUTINE,
        workoutSaveInput: WORKOUT_SAVE_INPUT,
        workoutWithSameId: undefined,
      }),
    ).toEqual({ _tag: "WorkoutInProgressConflict" });
  });

  it("allows the Save of an ended Workout while another Workout is in progress", () => {
    expect(
      decideWorkoutSave({
        userId: "user-1",
        workoutInProgress: { id: "019a0000-0000-7000-8000-000000000003" },
        workoutRoutine: WORKOUT_ROUTINE,
        workoutSaveInput: {
          ...WORKOUT_SAVE_INPUT,
          endedAt: "2026-10-19T09:30:00Z",
        },
        workoutWithSameId: undefined,
      }),
    ).toEqual({ _tag: "WorkoutSaveAllowed" });
  });

  it("rejects the Save of a Workout whose Routine the person doesn't have as RoutineNotFound", () => {
    expect(
      decideWorkoutSave({
        userId: "user-1",
        workoutInProgress: undefined,
        workoutRoutine: undefined,
        workoutSaveInput: WORKOUT_SAVE_INPUT,
        workoutWithSameId: undefined,
      }),
    ).toEqual({ _tag: "RoutineNotFound" });
  });
});
