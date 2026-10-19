import type { Exercise } from "@/shared/interactors/list-exercises";
import type { Routine } from "@/shared/interactors/list-routines";

import { buildWorkoutDocument } from "@/features/workout/core/build-workout-document";

const BENCH_PRESS_EXERCISE: Exercise = {
  amountUnit: "repetition",
  exerciseEquipment: [{ equipment: "barbell" }, { equipment: "bench" }],
  exerciseMuscleGroups: [{ muscleGroup: "chest", muscleGroupRole: "primary" }],
  id: "019a0000-0000-7000-8000-000000000001",
  name: "Bench Press (Barbell)",
  weightType: "total",
};

const PUSH_UP_EXERCISE: Exercise = {
  amountUnit: "repetition",
  exerciseEquipment: [],
  exerciseMuscleGroups: [{ muscleGroup: "chest", muscleGroupRole: "primary" }],
  id: "019a0000-0000-7000-8000-000000000004",
  name: "Push-up",
  weightType: "bodyweight",
};

const PUSH_DAY_ROUTINE: Routine = {
  days: ["monday", "thursday"],
  exercises: [
    {
      exerciseId: "019a0000-0000-7000-8000-000000000004",
      id: "019a0000-0000-7000-8000-000000000101",
      note: null,
      position: 0,
      section: "main",
      sets: [
        {
          amount: 10,
          dropSetSegmentCount: null,
          dropSetWeightPercentage: null,
          id: "019a0000-0000-7000-8000-000000000111",
          isToFailure: false,
          position: 0,
          restPauseRestSeconds: null,
          restPauseSegmentCount: null,
          restSeconds: null,
          setType: "warm_up",
          tempo: null,
          variation: null,
        },
      ],
      superset: null,
      warmUpForRoutineExerciseId: "019a0000-0000-7000-8000-000000000102",
    },
    {
      exerciseId: "019a0000-0000-7000-8000-000000000001",
      id: "019a0000-0000-7000-8000-000000000102",
      note: "Pause on the chest",
      position: 1,
      section: "main",
      sets: [
        {
          amount: 8,
          dropSetSegmentCount: 3,
          dropSetWeightPercentage: 20,
          id: "019a0000-0000-7000-8000-000000000112",
          isToFailure: true,
          position: 0,
          restPauseRestSeconds: 15,
          restPauseSegmentCount: 4,
          restSeconds: 120,
          setType: "working",
          tempo: "3-1-X-0",
          variation: "drop_set",
        },
      ],
      superset: 1,
      warmUpForRoutineExerciseId: null,
    },
  ],
  id: "019a0000-0000-7000-8000-000000000201",
  name: "Push day",
};

describe("buildWorkoutDocument", () => {
  it("starts a Workout document that copies each Routine exercise with its planned Sets, with no Set recorded and no Save yet", () => {
    expect(
      buildWorkoutDocument({
        exercises: [BENCH_PRESS_EXERCISE, PUSH_UP_EXERCISE],
        routine: PUSH_DAY_ROUTINE,
        startedAt: "2026-10-19T08:00:00.000Z",
        userId: "019a0000-0000-7000-8000-000000000401",
        workoutExerciseIds: [
          "019a0000-0000-7000-8000-000000000501",
          "019a0000-0000-7000-8000-000000000502",
        ],
        workoutId: "019a0000-0000-7000-8000-000000000301",
      }),
    ).toEqual({
      exercises: [
        {
          amountUnit: "repetition",
          exerciseId: "019a0000-0000-7000-8000-000000000004",
          id: "019a0000-0000-7000-8000-000000000501",
          note: "",
          routineExerciseNote: undefined,
          routineExerciseSets: [
            {
              amount: 10,
              dropSetSegmentCount: undefined,
              dropSetWeightPercentage: undefined,
              isToFailure: false,
              restPauseRestSeconds: undefined,
              restPauseSegmentCount: undefined,
              restSeconds: undefined,
              setType: "warm_up",
              tempo: undefined,
              variation: undefined,
            },
          ],
          section: "main",
          sets: [],
          skipReasonNote: "",
          superset: undefined,
          warmUpForWorkoutExerciseId: "019a0000-0000-7000-8000-000000000502",
          weightType: "bodyweight",
        },
        {
          amountUnit: "repetition",
          exerciseId: "019a0000-0000-7000-8000-000000000001",
          id: "019a0000-0000-7000-8000-000000000502",
          note: "",
          routineExerciseNote: "Pause on the chest",
          routineExerciseSets: [
            {
              amount: 8,
              dropSetSegmentCount: 3,
              dropSetWeightPercentage: 20,
              isToFailure: true,
              restPauseRestSeconds: 15,
              restPauseSegmentCount: 4,
              restSeconds: 120,
              setType: "working",
              tempo: "3-1-X-0",
              variation: "drop_set",
            },
          ],
          section: "main",
          sets: [],
          skipReasonNote: "",
          superset: 1,
          warmUpForWorkoutExerciseId: undefined,
          weightType: "total",
        },
      ],
      id: "019a0000-0000-7000-8000-000000000301",
      routineId: "019a0000-0000-7000-8000-000000000201",
      startedAt: "2026-10-19T08:00:00.000Z",
      syncedVersion: 0,
      userId: "019a0000-0000-7000-8000-000000000401",
      version: 1,
    });
  });

  it("leaves out a Routine exercise whose Exercise isn't in the library", () => {
    expect(
      buildWorkoutDocument({
        exercises: [BENCH_PRESS_EXERCISE],
        routine: PUSH_DAY_ROUTINE,
        startedAt: "2026-10-19T08:00:00.000Z",
        userId: "019a0000-0000-7000-8000-000000000401",
        workoutExerciseIds: [
          "019a0000-0000-7000-8000-000000000501",
          "019a0000-0000-7000-8000-000000000502",
        ],
        workoutId: "019a0000-0000-7000-8000-000000000301",
      }).exercises,
    ).toMatchObject([
      {
        exerciseId: "019a0000-0000-7000-8000-000000000001",
        id: "019a0000-0000-7000-8000-000000000502",
      },
    ]);
  });
});
