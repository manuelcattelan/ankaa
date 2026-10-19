import type { WorkoutSaveInput } from "@ankaa/core/features/workout/schemas/workout-save-input-schema";

import { describe, expect, it } from "@effect/vitest";

import { buildWorkoutSaveRows } from "./build-workout-save-rows.ts";

const WORKOUT_SAVE_INPUT: WorkoutSaveInput = {
  endedAt: null,
  exercises: [
    {
      amountUnit: "repetition",
      exerciseId: "019a0000-0000-7000-8000-000000000021",
      id: "019a0000-0000-7000-8000-000000000011",
      note: null,
      position: 0,
      section: "main",
      sets: [
        {
          id: "019a0000-0000-7000-8000-000000000031",
          isToFailure: false,
          position: 0,
          segments: [
            {
              amount: 10,
              id: "019a0000-0000-7000-8000-000000000041",
              position: 0,
              weightUnit: null,
              weightValue: null,
            },
          ],
          setType: "warm_up",
          tempo: null,
          variation: null,
        },
      ],
      skipReason: null,
      skipReasonNote: null,
      superset: null,
      warmUpForWorkoutExerciseId: "019a0000-0000-7000-8000-000000000012",
      weightType: "bodyweight",
    },
    {
      amountUnit: "repetition",
      exerciseId: "019a0000-0000-7000-8000-000000000022",
      id: "019a0000-0000-7000-8000-000000000012",
      note: "Pause at the chest",
      position: 1,
      section: "main",
      sets: [
        {
          id: "019a0000-0000-7000-8000-000000000032",
          isToFailure: false,
          position: 0,
          segments: [
            {
              amount: 8,
              id: "019a0000-0000-7000-8000-000000000042",
              position: 0,
              weightUnit: "kilogram",
              weightValue: 80,
            },
          ],
          setType: "working",
          tempo: "3-0-1-2",
          variation: null,
        },
        {
          id: "019a0000-0000-7000-8000-000000000033",
          isToFailure: true,
          position: 1,
          segments: [
            {
              amount: 6,
              id: "019a0000-0000-7000-8000-000000000043",
              position: 0,
              weightUnit: "kilogram",
              weightValue: 80,
            },
            {
              amount: 4,
              id: "019a0000-0000-7000-8000-000000000044",
              position: 1,
              weightUnit: "kilogram",
              weightValue: 62.5,
            },
          ],
          setType: "working",
          tempo: null,
          variation: "drop_set",
        },
      ],
      skipReason: "low_on_time",
      skipReasonNote: "The gym was closing",
      superset: null,
      warmUpForWorkoutExerciseId: null,
      weightType: "total",
    },
  ],
  id: "019a0000-0000-7000-8000-000000000001",
  routineId: "019a0000-0000-7000-8000-000000000002",
  startedAt: "2026-10-19T08:30:00Z",
  version: 3,
};

describe("buildWorkoutSaveRows", () => {
  it("builds the Workout row of a Workout in progress for the person, with its start as a date and no end", () => {
    expect(
      buildWorkoutSaveRows({
        userId: "user-1",
        workoutSaveInput: WORKOUT_SAVE_INPUT,
      }).workoutRow,
    ).toStrictEqual({
      endedAt: null,
      id: "019a0000-0000-7000-8000-000000000001",
      routineId: "019a0000-0000-7000-8000-000000000002",
      startedAt: new Date("2026-10-19T08:30:00Z"),
      userId: "user-1",
      version: 3,
    });
  });

  it("builds the end of an ended Workout as a date", () => {
    expect(
      buildWorkoutSaveRows({
        userId: "user-1",
        workoutSaveInput: {
          ...WORKOUT_SAVE_INPUT,
          endedAt: "2026-10-19T09:45:00Z",
        },
      }).workoutRow.endedAt,
    ).toStrictEqual(new Date("2026-10-19T09:45:00Z"));
  });

  it("builds a row for each Workout exercise, linked to the Workout", () => {
    expect(
      buildWorkoutSaveRows({
        userId: "user-1",
        workoutSaveInput: WORKOUT_SAVE_INPUT,
      }).workoutExerciseRows,
    ).toStrictEqual([
      {
        amountUnit: "repetition",
        exerciseId: "019a0000-0000-7000-8000-000000000021",
        id: "019a0000-0000-7000-8000-000000000011",
        note: null,
        position: 0,
        section: "main",
        skipReason: null,
        skipReasonNote: null,
        superset: null,
        warmUpForWorkoutExerciseId: "019a0000-0000-7000-8000-000000000012",
        weightType: "bodyweight",
        workoutId: "019a0000-0000-7000-8000-000000000001",
      },
      {
        amountUnit: "repetition",
        exerciseId: "019a0000-0000-7000-8000-000000000022",
        id: "019a0000-0000-7000-8000-000000000012",
        note: "Pause at the chest",
        position: 1,
        section: "main",
        skipReason: "low_on_time",
        skipReasonNote: "The gym was closing",
        superset: null,
        warmUpForWorkoutExerciseId: null,
        weightType: "total",
        workoutId: "019a0000-0000-7000-8000-000000000001",
      },
    ]);
  });

  it("builds a row for each Set of every Workout exercise, linked to its Workout exercise", () => {
    expect(
      buildWorkoutSaveRows({
        userId: "user-1",
        workoutSaveInput: WORKOUT_SAVE_INPUT,
      }).workoutExerciseSetRows,
    ).toStrictEqual([
      {
        id: "019a0000-0000-7000-8000-000000000031",
        isToFailure: false,
        position: 0,
        setType: "warm_up",
        tempo: null,
        variation: null,
        workoutExerciseId: "019a0000-0000-7000-8000-000000000011",
      },
      {
        id: "019a0000-0000-7000-8000-000000000032",
        isToFailure: false,
        position: 0,
        setType: "working",
        tempo: "3-0-1-2",
        variation: null,
        workoutExerciseId: "019a0000-0000-7000-8000-000000000012",
      },
      {
        id: "019a0000-0000-7000-8000-000000000033",
        isToFailure: true,
        position: 1,
        setType: "working",
        tempo: null,
        variation: "drop_set",
        workoutExerciseId: "019a0000-0000-7000-8000-000000000012",
      },
    ]);
  });

  it("builds a row for each Segment of every Set, linked to its Set", () => {
    expect(
      buildWorkoutSaveRows({
        userId: "user-1",
        workoutSaveInput: WORKOUT_SAVE_INPUT,
      }).workoutExerciseSetSegmentRows,
    ).toStrictEqual([
      {
        amount: 10,
        id: "019a0000-0000-7000-8000-000000000041",
        position: 0,
        weightUnit: null,
        weightValue: null,
        workoutExerciseSetId: "019a0000-0000-7000-8000-000000000031",
      },
      {
        amount: 8,
        id: "019a0000-0000-7000-8000-000000000042",
        position: 0,
        weightUnit: "kilogram",
        weightValue: 80,
        workoutExerciseSetId: "019a0000-0000-7000-8000-000000000032",
      },
      {
        amount: 6,
        id: "019a0000-0000-7000-8000-000000000043",
        position: 0,
        weightUnit: "kilogram",
        weightValue: 80,
        workoutExerciseSetId: "019a0000-0000-7000-8000-000000000033",
      },
      {
        amount: 4,
        id: "019a0000-0000-7000-8000-000000000044",
        position: 1,
        weightUnit: "kilogram",
        weightValue: 62.5,
        workoutExerciseSetId: "019a0000-0000-7000-8000-000000000033",
      },
    ]);
  });
});
