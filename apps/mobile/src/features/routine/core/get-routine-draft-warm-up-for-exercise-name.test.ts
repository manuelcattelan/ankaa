import type {
  RoutineDraftBlock,
  RoutineDraftWarmUpExercise,
} from "@/features/routine/core/routine-draft-reducer";

import { getRoutineDraftWarmUpForExerciseName } from "@/features/routine/core/get-routine-draft-warm-up-for-exercise-name";

const PUSH_UP_ROUTINE_DRAFT_WARM_UP_EXERCISE: RoutineDraftWarmUpExercise = {
  exerciseId: "019a0000-0000-7000-8000-000000000002",
  id: "019b0000-0000-7000-8000-000000000003",
  note: "",
  sets: [],
  warmUpForRoutineExerciseId: "019b0000-0000-7000-8000-000000000002",
};

const ROUTINE_DRAFT_BLOCK: RoutineDraftBlock = {
  exercises: [
    {
      exerciseId: "019a0000-0000-7000-8000-000000000003",
      id: "019b0000-0000-7000-8000-000000000001",
      note: "",
      sets: [],
    },
    {
      exerciseId: "019a0000-0000-7000-8000-000000000001",
      id: "019b0000-0000-7000-8000-000000000002",
      note: "",
      sets: [],
    },
  ],
  id: "019b0000-0000-7000-8000-000000000001",
  warmUpExercises: [PUSH_UP_ROUTINE_DRAFT_WARM_UP_EXERCISE],
};

const EXERCISE_NAMES = new Map([
  ["019a0000-0000-7000-8000-000000000001", "Bench Press (Barbell)"],
  ["019a0000-0000-7000-8000-000000000002", "Push-up"],
  ["019a0000-0000-7000-8000-000000000003", "Pull-up"],
]);

describe("getRoutineDraftWarmUpForExerciseName", () => {
  it("returns the name of the Exercise of the block exercise that the Warm-up exercise prepares for", () => {
    expect(
      getRoutineDraftWarmUpForExerciseName({
        exerciseNames: EXERCISE_NAMES,
        routineDraftBlock: ROUTINE_DRAFT_BLOCK,
        routineDraftWarmUpExercise: PUSH_UP_ROUTINE_DRAFT_WARM_UP_EXERCISE,
      }),
    ).toBe("Bench Press (Barbell)");
  });

  it("returns an empty name when the block holds no exercise that the Warm-up exercise prepares for", () => {
    expect(
      getRoutineDraftWarmUpForExerciseName({
        exerciseNames: EXERCISE_NAMES,
        routineDraftBlock: ROUTINE_DRAFT_BLOCK,
        routineDraftWarmUpExercise: {
          ...PUSH_UP_ROUTINE_DRAFT_WARM_UP_EXERCISE,
          warmUpForRoutineExerciseId: "019b0000-0000-7000-8000-000000000004",
        },
      }),
    ).toBe("");
  });

  it("returns an empty name while the names of the Exercises aren't loaded", () => {
    expect(
      getRoutineDraftWarmUpForExerciseName({
        exerciseNames: new Map(),
        routineDraftBlock: ROUTINE_DRAFT_BLOCK,
        routineDraftWarmUpExercise: PUSH_UP_ROUTINE_DRAFT_WARM_UP_EXERCISE,
      }),
    ).toBe("");
  });
});
