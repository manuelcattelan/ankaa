import type { WorkoutDocumentExercise } from "@/features/workout/core/workout-document-schema";

import { getWorkoutDocumentRoutineExerciseSet } from "@/features/workout/core/get-workout-document-routine-exercise-set";

const WORKOUT_DOCUMENT_EXERCISE: WorkoutDocumentExercise = {
  amountUnit: "repetition",
  exerciseId: "019a0000-0000-7000-8000-000000000001",
  id: "019a0000-0000-7000-8000-000000000501",
  note: "",
  routineExerciseSets: [
    { amount: 12, isToFailure: false, restSeconds: 60, setType: "warm_up" },
    { amount: 8, isToFailure: false, restSeconds: 120, setType: "working" },
    { amount: 6, isToFailure: true, restSeconds: 180, setType: "working" },
  ],
  section: "main",
  sets: [],
  skipReasonNote: "",
  weightType: "total",
};

describe("getWorkoutDocumentRoutineExerciseSet", () => {
  it("returns the Set that the Routine plans at the position", () => {
    expect(
      getWorkoutDocumentRoutineExerciseSet({
        position: 1,
        workoutDocumentExercise: WORKOUT_DOCUMENT_EXERCISE,
      }),
    ).toEqual({
      amount: 8,
      isToFailure: false,
      restSeconds: 120,
      setType: "working",
    });
  });

  it("returns the last Set that the Routine plans for a position past the planned Sets", () => {
    expect(
      getWorkoutDocumentRoutineExerciseSet({
        position: 5,
        workoutDocumentExercise: WORKOUT_DOCUMENT_EXERCISE,
      }),
    ).toEqual({
      amount: 6,
      isToFailure: true,
      restSeconds: 180,
      setType: "working",
    });
  });

  it("returns no Set when the Routine plans none", () => {
    expect(
      getWorkoutDocumentRoutineExerciseSet({
        position: 0,
        workoutDocumentExercise: {
          ...WORKOUT_DOCUMENT_EXERCISE,
          routineExerciseSets: [],
        },
      }),
    ).toBe(undefined);
  });
});
