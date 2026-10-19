import type { WorkoutDocumentExercise } from "@/features/workout/core/workout-document-schema";

import { getWorkoutDocumentExerciseRestSeconds } from "@/features/workout/core/get-workout-document-exercise-rest-seconds";

const WORKOUT_DOCUMENT_EXERCISE: WorkoutDocumentExercise = {
  amountUnit: "repetition",
  exerciseId: "019a0000-0000-7000-8000-000000000001",
  id: "019a0000-0000-7000-8000-000000000501",
  note: "",
  routineExerciseSets: [
    { amount: 12, isToFailure: false, restSeconds: 60, setType: "warm_up" },
    { amount: 8, isToFailure: false, restSeconds: 120, setType: "working" },
  ],
  section: "main",
  sets: [
    {
      id: "019a0000-0000-7000-8000-000000000601",
      isToFailure: false,
      segments: [
        {
          amount: "12",
          id: "019a0000-0000-7000-8000-000000000701",
          weightUnit: "kilogram",
          weightValue: "40",
        },
      ],
      setType: "warm_up",
    },
  ],
  skipReasonNote: "",
  weightType: "total",
};

describe("getWorkoutDocumentExerciseRestSeconds", () => {
  it("returns the Rest that the Routine plans for the next Set of the last exercise of a round", () => {
    expect(
      getWorkoutDocumentExerciseRestSeconds({
        isLastExerciseOfRound: true,
        workoutDocumentExercise: WORKOUT_DOCUMENT_EXERCISE,
      }),
    ).toBe(120);
  });

  it("returns no Rest for an exercise of a Superset that isn't the last of its round", () => {
    expect(
      getWorkoutDocumentExerciseRestSeconds({
        isLastExerciseOfRound: false,
        workoutDocumentExercise: WORKOUT_DOCUMENT_EXERCISE,
      }),
    ).toBe(undefined);
  });
});
