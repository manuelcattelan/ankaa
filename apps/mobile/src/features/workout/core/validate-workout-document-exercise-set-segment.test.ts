import type { WorkoutDocumentExerciseSetSegment } from "@/features/workout/core/workout-document-schema";

import { validateWorkoutDocumentExerciseSetSegment } from "@/features/workout/core/validate-workout-document-exercise-set-segment";

const WORKOUT_DOCUMENT_EXERCISE_SET_SEGMENT: WorkoutDocumentExerciseSetSegment =
  {
    amount: "8",
    id: "019a0000-0000-7000-8000-000000000701",
    weightUnit: "kilogram",
    weightValue: "80",
  };

describe("validateWorkoutDocumentExerciseSetSegment", () => {
  it("accepts a Segment with a valid Amount and weight", () => {
    expect(
      validateWorkoutDocumentExerciseSetSegment(
        WORKOUT_DOCUMENT_EXERCISE_SET_SEGMENT,
      ),
    ).toEqual({ _tag: "WorkoutDocumentExerciseSetSegmentValid" });
  });

  it("accepts a Segment whose Amount and weight aren't entered yet", () => {
    expect(
      validateWorkoutDocumentExerciseSetSegment({
        ...WORKOUT_DOCUMENT_EXERCISE_SET_SEGMENT,
        amount: "",
        weightValue: " ",
      }),
    ).toEqual({ _tag: "WorkoutDocumentExerciseSetSegmentValid" });
  });

  it("rejects a Segment with an Amount below the minimum", () => {
    expect(
      validateWorkoutDocumentExerciseSetSegment({
        ...WORKOUT_DOCUMENT_EXERCISE_SET_SEGMENT,
        amount: "0",
      }),
    ).toEqual({
      _tag: "WorkoutDocumentExerciseSetSegmentInvalid",
      amount: { _tag: "WholeNumberBelowMinimum", minimum: 1 },
      weightValue: { _tag: "WeightValueValid" },
    });
  });

  it("rejects a Segment with a weight out of range", () => {
    expect(
      validateWorkoutDocumentExerciseSetSegment({
        ...WORKOUT_DOCUMENT_EXERCISE_SET_SEGMENT,
        weightValue: "80.125",
      }),
    ).toEqual({
      _tag: "WorkoutDocumentExerciseSetSegmentInvalid",
      amount: { _tag: "WholeNumberValid" },
      weightValue: { _tag: "WeightValueOutOfRange" },
    });
  });
});
