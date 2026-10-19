import { getRoutineDraftExerciseSetValidationErrorMessages } from "@/features/routine/core/get-routine-draft-exercise-set-validation-error-messages";

describe("getRoutineDraftExerciseSetValidationErrorMessages", () => {
  it("returns no messages for a valid Set", () => {
    expect(
      getRoutineDraftExerciseSetValidationErrorMessages({
        _tag: "RoutineDraftExerciseSetValid",
      }),
    ).toBe(undefined);
  });

  it("returns the below minimum message for the Amount of an invalid Set, and no message for its valid fields", () => {
    expect(
      getRoutineDraftExerciseSetValidationErrorMessages({
        _tag: "RoutineDraftExerciseSetInvalid",
        amount: { _tag: "WholeNumberBelowMinimum", minimum: 1 },
        dropSetSegmentCount: undefined,
        dropSetWeightPercentage: undefined,
        restPauseRestSeconds: undefined,
        restPauseSegmentCount: undefined,
        restSeconds: { _tag: "WholeNumberValid" },
        tempo: { _tag: "TempoValid" },
      }),
    ).toEqual({
      amount: "This number isn't valid: enter a whole number of at least 1.",
      dropSetSegmentCount: undefined,
      dropSetWeightPercentage: undefined,
      restPauseRestSeconds: undefined,
      restPauseSegmentCount: undefined,
      restSeconds: undefined,
      tempo: undefined,
    });
  });

  it("returns the below minimum message for the Rest of an invalid Set", () => {
    expect(
      getRoutineDraftExerciseSetValidationErrorMessages({
        _tag: "RoutineDraftExerciseSetInvalid",
        amount: { _tag: "WholeNumberValid" },
        dropSetSegmentCount: undefined,
        dropSetWeightPercentage: undefined,
        restPauseRestSeconds: undefined,
        restPauseSegmentCount: undefined,
        restSeconds: { _tag: "WholeNumberBelowMinimum", minimum: 1 },
        tempo: { _tag: "TempoValid" },
      }),
    ).toEqual({
      amount: undefined,
      dropSetSegmentCount: undefined,
      dropSetWeightPercentage: undefined,
      restPauseRestSeconds: undefined,
      restPauseSegmentCount: undefined,
      restSeconds:
        "This number isn't valid: enter a whole number of at least 1.",
      tempo: undefined,
    });
  });

  it("returns the invalid format message for the Tempo of an invalid Set", () => {
    expect(
      getRoutineDraftExerciseSetValidationErrorMessages({
        _tag: "RoutineDraftExerciseSetInvalid",
        amount: { _tag: "WholeNumberValid" },
        dropSetSegmentCount: undefined,
        dropSetWeightPercentage: undefined,
        restPauseRestSeconds: undefined,
        restPauseSegmentCount: undefined,
        restSeconds: { _tag: "WholeNumberValid" },
        tempo: { _tag: "TempoFormatInvalid" },
      }),
    ).toEqual({
      amount: undefined,
      dropSetSegmentCount: undefined,
      dropSetWeightPercentage: undefined,
      restPauseRestSeconds: undefined,
      restPauseSegmentCount: undefined,
      restSeconds: undefined,
      tempo:
        "This tempo isn't valid: enter four numbers separated by hyphens, like 3-0-1-2, with X allowed only as the third.",
    });
  });

  it("returns the message of the number of Segments and of the weight percentage of an invalid Drop set", () => {
    expect(
      getRoutineDraftExerciseSetValidationErrorMessages({
        _tag: "RoutineDraftExerciseSetInvalid",
        amount: { _tag: "WholeNumberValid" },
        dropSetSegmentCount: { _tag: "WholeNumberBelowMinimum", minimum: 2 },
        dropSetWeightPercentage: {
          _tag: "WholeNumberOutOfRange",
          maximum: 99,
          minimum: 1,
        },
        restPauseRestSeconds: undefined,
        restPauseSegmentCount: undefined,
        restSeconds: { _tag: "WholeNumberValid" },
        tempo: { _tag: "TempoValid" },
      }),
    ).toEqual({
      amount: undefined,
      dropSetSegmentCount:
        "This number isn't valid: enter a whole number of at least 2.",
      dropSetWeightPercentage:
        "This number isn't valid: enter a whole number from 1 to 99.",
      restPauseRestSeconds: undefined,
      restPauseSegmentCount: undefined,
      restSeconds: undefined,
      tempo: undefined,
    });
  });

  it("returns the message of the seconds between Segments and of the number of Segments of an invalid Rest-pause set", () => {
    expect(
      getRoutineDraftExerciseSetValidationErrorMessages({
        _tag: "RoutineDraftExerciseSetInvalid",
        amount: { _tag: "WholeNumberValid" },
        dropSetSegmentCount: undefined,
        dropSetWeightPercentage: undefined,
        restPauseRestSeconds: { _tag: "WholeNumberBelowMinimum", minimum: 1 },
        restPauseSegmentCount: { _tag: "WholeNumberBelowMinimum", minimum: 2 },
        restSeconds: { _tag: "WholeNumberValid" },
        tempo: { _tag: "TempoValid" },
      }),
    ).toEqual({
      amount: undefined,
      dropSetSegmentCount: undefined,
      dropSetWeightPercentage: undefined,
      restPauseRestSeconds:
        "This number isn't valid: enter a whole number of at least 1.",
      restPauseSegmentCount:
        "This number isn't valid: enter a whole number of at least 2.",
      restSeconds: undefined,
      tempo: undefined,
    });
  });
});
