import type { RoutineSaveInput } from "@ankaa/core/features/routine/schemas/routine-save-input-schema";

import { describe, expect, it } from "@effect/vitest";

import { buildRoutineSaveRows } from "./build-routine-save-rows.ts";

const ROUTINE_EXERCISE_SET: RoutineSaveInput["exercises"][number]["sets"][number] =
  {
    amount: 8,
    dropSetSegmentCount: null,
    dropSetWeightPercentage: null,
    id: "019a0000-0000-7000-8000-000000000031",
    isToFailure: false,
    position: 0,
    restPauseRestSeconds: null,
    restPauseSegmentCount: null,
    restSeconds: 120,
    setType: "working",
    tempo: "3-0-1-2",
    variation: null,
  };

const ROUTINE_SAVE_INPUT: RoutineSaveInput = {
  days: ["thursday", "monday"],
  exercises: [
    {
      exerciseId: "019a0000-0000-7000-8000-000000000021",
      id: "019a0000-0000-7000-8000-000000000011",
      note: "Pause on the chest",
      position: 0,
      section: "main",
      sets: [
        ROUTINE_EXERCISE_SET,
        {
          ...ROUTINE_EXERCISE_SET,
          dropSetSegmentCount: 3,
          dropSetWeightPercentage: 20,
          id: "019a0000-0000-7000-8000-000000000032",
          isToFailure: true,
          position: 1,
          variation: "drop_set",
        },
      ],
      superset: null,
      warmUpForRoutineExerciseId: null,
    },
    {
      exerciseId: "019a0000-0000-7000-8000-000000000022",
      id: "019a0000-0000-7000-8000-000000000012",
      note: null,
      position: 1,
      section: "cool_down",
      sets: [
        {
          ...ROUTINE_EXERCISE_SET,
          amount: 30,
          id: "019a0000-0000-7000-8000-000000000033",
          restSeconds: null,
          setType: "warm_up",
          tempo: null,
        },
      ],
      superset: 1,
      warmUpForRoutineExerciseId: "019a0000-0000-7000-8000-000000000011",
    },
  ],
  id: "019a0000-0000-7000-8000-000000000001",
  name: "Push",
};

describe("buildRoutineSaveRows", () => {
  it("builds one day row for each day of the Routine, in the order given", () => {
    const routineSaveRows = buildRoutineSaveRows({
      routineSaveInput: ROUTINE_SAVE_INPUT,
    });

    expect(routineSaveRows.routineDayRows).toStrictEqual([
      {
        dayOfWeek: "thursday",
        routineId: "019a0000-0000-7000-8000-000000000001",
      },
      {
        dayOfWeek: "monday",
        routineId: "019a0000-0000-7000-8000-000000000001",
      },
    ]);
  });

  it("builds one Routine exercise row for each Routine exercise, without its Sets", () => {
    const routineSaveRows = buildRoutineSaveRows({
      routineSaveInput: ROUTINE_SAVE_INPUT,
    });

    expect(routineSaveRows.routineExerciseRows).toStrictEqual([
      {
        exerciseId: "019a0000-0000-7000-8000-000000000021",
        id: "019a0000-0000-7000-8000-000000000011",
        note: "Pause on the chest",
        position: 0,
        routineId: "019a0000-0000-7000-8000-000000000001",
        section: "main",
        superset: null,
        warmUpForRoutineExerciseId: null,
      },
      {
        exerciseId: "019a0000-0000-7000-8000-000000000022",
        id: "019a0000-0000-7000-8000-000000000012",
        note: null,
        position: 1,
        routineId: "019a0000-0000-7000-8000-000000000001",
        section: "cool_down",
        superset: 1,
        warmUpForRoutineExerciseId: "019a0000-0000-7000-8000-000000000011",
      },
    ]);
  });

  it("builds one Set row for each Set of every Routine exercise, linked to its Routine exercise", () => {
    const routineSaveRows = buildRoutineSaveRows({
      routineSaveInput: ROUTINE_SAVE_INPUT,
    });

    expect(routineSaveRows.routineExerciseSetRows).toStrictEqual([
      {
        amount: 8,
        dropSetSegmentCount: null,
        dropSetWeightPercentage: null,
        id: "019a0000-0000-7000-8000-000000000031",
        isToFailure: false,
        position: 0,
        restPauseRestSeconds: null,
        restPauseSegmentCount: null,
        restSeconds: 120,
        routineExerciseId: "019a0000-0000-7000-8000-000000000011",
        setType: "working",
        tempo: "3-0-1-2",
        variation: null,
      },
      {
        amount: 8,
        dropSetSegmentCount: 3,
        dropSetWeightPercentage: 20,
        id: "019a0000-0000-7000-8000-000000000032",
        isToFailure: true,
        position: 1,
        restPauseRestSeconds: null,
        restPauseSegmentCount: null,
        restSeconds: 120,
        routineExerciseId: "019a0000-0000-7000-8000-000000000011",
        setType: "working",
        tempo: "3-0-1-2",
        variation: "drop_set",
      },
      {
        amount: 30,
        dropSetSegmentCount: null,
        dropSetWeightPercentage: null,
        id: "019a0000-0000-7000-8000-000000000033",
        isToFailure: false,
        position: 0,
        restPauseRestSeconds: null,
        restPauseSegmentCount: null,
        restSeconds: null,
        routineExerciseId: "019a0000-0000-7000-8000-000000000012",
        setType: "warm_up",
        tempo: null,
        variation: null,
      },
    ]);
  });
});
