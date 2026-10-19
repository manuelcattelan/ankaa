import { getWorkoutDocumentExerciseSetSegmentValidationErrorMessages } from "@/features/workout/core/get-workout-document-exercise-set-segment-validation-error-messages";

describe("getWorkoutDocumentExerciseSetSegmentValidationErrorMessages", () => {
  it("returns no messages for a valid Segment", () => {
    expect(
      getWorkoutDocumentExerciseSetSegmentValidationErrorMessages({
        _tag: "WorkoutDocumentExerciseSetSegmentValid",
      }),
    ).toBe(undefined);
  });

  it("returns the message of each field of a Segment that isn't valid", () => {
    expect(
      getWorkoutDocumentExerciseSetSegmentValidationErrorMessages({
        _tag: "WorkoutDocumentExerciseSetSegmentInvalid",
        amount: { _tag: "WholeNumberBelowMinimum", minimum: 1 },
        weightValue: { _tag: "WeightValueOutOfRange" },
      }),
    ).toEqual({
      amount: "This number isn't valid: enter a whole number of at least 1.",
      weightValue:
        "This weight isn't valid: enter a number from 0.01 to 9999.99, with at most two decimal places.",
    });
  });

  it("returns no weight message for a Segment with a valid weight and an Amount that isn't valid", () => {
    expect(
      getWorkoutDocumentExerciseSetSegmentValidationErrorMessages({
        _tag: "WorkoutDocumentExerciseSetSegmentInvalid",
        amount: { _tag: "WholeNumberBelowMinimum", minimum: 1 },
        weightValue: { _tag: "WeightValueValid" },
      }),
    ).toEqual({
      amount: "This number isn't valid: enter a whole number of at least 1.",
      weightValue: undefined,
    });
  });

  it("returns no Amount message for a Segment with a valid Amount and a weight that isn't valid", () => {
    expect(
      getWorkoutDocumentExerciseSetSegmentValidationErrorMessages({
        _tag: "WorkoutDocumentExerciseSetSegmentInvalid",
        amount: { _tag: "WholeNumberValid" },
        weightValue: { _tag: "WeightValueOutOfRange" },
      }),
    ).toEqual({
      amount: undefined,
      weightValue:
        "This weight isn't valid: enter a number from 0.01 to 9999.99, with at most two decimal places.",
    });
  });
});
