import type {
  WorkoutDocument,
  WorkoutDocumentExercise,
  WorkoutDocumentExerciseSet,
} from "@/features/workout/core/workout-document-schema";

import { hasWorkoutDocumentValidationErrors } from "@/features/workout/core/has-workout-document-validation-errors";

const WORKOUT_DOCUMENT_EXERCISE_SET: WorkoutDocumentExerciseSet = {
  id: "019a0000-0000-7000-8000-000000000601",
  isToFailure: false,
  segments: [
    {
      amount: "8",
      id: "019a0000-0000-7000-8000-000000000701",
      weightUnit: "kilogram",
      weightValue: "80",
    },
    {
      amount: "6",
      id: "019a0000-0000-7000-8000-000000000702",
      weightUnit: "kilogram",
      weightValue: "60",
    },
  ],
  setType: "working",
};

const WORKOUT_DOCUMENT_EXERCISE: WorkoutDocumentExercise = {
  amountUnit: "repetition",
  exerciseId: "019a0000-0000-7000-8000-000000000001",
  id: "019a0000-0000-7000-8000-000000000501",
  note: "",
  routineExerciseSets: [],
  section: "main",
  sets: [WORKOUT_DOCUMENT_EXERCISE_SET],
  skipReasonNote: "",
  weightType: "total",
};

const WORKOUT_DOCUMENT: WorkoutDocument = {
  exercises: [WORKOUT_DOCUMENT_EXERCISE],
  id: "019a0000-0000-7000-8000-000000000301",
  routineId: "019a0000-0000-7000-8000-000000000201",
  startedAt: "2026-10-19T08:00:00.000Z",
  syncedVersion: 0,
  userId: "019a0000-0000-7000-8000-000000000401",
  version: 1,
};

describe("hasWorkoutDocumentValidationErrors", () => {
  it("finds no validation errors when every Segment is valid", () => {
    expect(hasWorkoutDocumentValidationErrors(WORKOUT_DOCUMENT)).toBe(false);
  });

  it("finds a validation error when one Segment of a Set isn't valid", () => {
    expect(
      hasWorkoutDocumentValidationErrors({
        ...WORKOUT_DOCUMENT,
        exercises: [
          {
            ...WORKOUT_DOCUMENT_EXERCISE,
            sets: [
              {
                ...WORKOUT_DOCUMENT_EXERCISE_SET,
                segments: [
                  {
                    amount: "8",
                    id: "019a0000-0000-7000-8000-000000000701",
                    weightUnit: "kilogram",
                    weightValue: "80",
                  },
                  {
                    amount: "0",
                    id: "019a0000-0000-7000-8000-000000000702",
                    weightUnit: "kilogram",
                    weightValue: "60",
                  },
                ],
              },
            ],
          },
        ],
      }),
    ).toBe(true);
  });
});
