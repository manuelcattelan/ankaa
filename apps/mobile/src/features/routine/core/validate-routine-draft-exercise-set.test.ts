import type { RoutineDraftExerciseSet } from "@/features/routine/core/routine-draft-reducer";

import { validateRoutineDraftExerciseSet } from "@/features/routine/core/validate-routine-draft-exercise-set";

const ROUTINE_DRAFT_EXERCISE_SET: RoutineDraftExerciseSet = {
  amount: "8",
  dropSetSegmentCount: "",
  dropSetWeightPercentage: "",
  id: "019c0000-0000-7000-8000-000000000001",
  isToFailure: false,
  restPauseRestSeconds: "",
  restPauseSegmentCount: "",
  restSeconds: "90",
  setType: "working",
  tempo: "3-0-1-2",
  variation: undefined,
};

const DROP_SET_ROUTINE_DRAFT_EXERCISE_SET: RoutineDraftExerciseSet = {
  ...ROUTINE_DRAFT_EXERCISE_SET,
  dropSetSegmentCount: "3",
  dropSetWeightPercentage: "20",
  variation: "drop_set",
};

const REST_PAUSE_ROUTINE_DRAFT_EXERCISE_SET: RoutineDraftExerciseSet = {
  ...ROUTINE_DRAFT_EXERCISE_SET,
  restPauseRestSeconds: "15",
  restPauseSegmentCount: "3",
  variation: "rest_pause",
};

describe("validateRoutineDraftExerciseSet", () => {
  it("accepts a Set whose Amount, Rest and Tempo are valid", () => {
    expect(validateRoutineDraftExerciseSet(ROUTINE_DRAFT_EXERCISE_SET)).toEqual(
      { _tag: "RoutineDraftExerciseSetValid" },
    );
  });

  it("accepts a Set whose Amount, Rest and Tempo are empty", () => {
    expect(
      validateRoutineDraftExerciseSet({
        ...ROUTINE_DRAFT_EXERCISE_SET,
        amount: "",
        restSeconds: "",
        tempo: "",
      }),
    ).toEqual({ _tag: "RoutineDraftExerciseSetValid" });
  });

  it("accepts a Tempo written in lowercase and surrounded by spaces", () => {
    expect(
      validateRoutineDraftExerciseSet({
        ...ROUTINE_DRAFT_EXERCISE_SET,
        tempo: " 3-0-x-2 ",
      }),
    ).toEqual({ _tag: "RoutineDraftExerciseSetValid" });
  });

  it("rejects an Amount of 0 as below the minimum of 1", () => {
    expect(
      validateRoutineDraftExerciseSet({
        ...ROUTINE_DRAFT_EXERCISE_SET,
        amount: "0",
      }),
    ).toEqual({
      _tag: "RoutineDraftExerciseSetInvalid",
      amount: { _tag: "WholeNumberBelowMinimum", minimum: 1 },
      dropSetSegmentCount: undefined,
      dropSetWeightPercentage: undefined,
      restPauseRestSeconds: undefined,
      restPauseSegmentCount: undefined,
      restSeconds: { _tag: "WholeNumberValid" },
      tempo: { _tag: "TempoValid" },
    });
  });

  it("rejects a Rest of 0 seconds as below the minimum of 1", () => {
    expect(
      validateRoutineDraftExerciseSet({
        ...ROUTINE_DRAFT_EXERCISE_SET,
        restSeconds: "0",
      }),
    ).toEqual({
      _tag: "RoutineDraftExerciseSetInvalid",
      amount: { _tag: "WholeNumberValid" },
      dropSetSegmentCount: undefined,
      dropSetWeightPercentage: undefined,
      restPauseRestSeconds: undefined,
      restPauseSegmentCount: undefined,
      restSeconds: { _tag: "WholeNumberBelowMinimum", minimum: 1 },
      tempo: { _tag: "TempoValid" },
    });
  });

  it("rejects a Tempo of three numbers as an invalid format", () => {
    expect(
      validateRoutineDraftExerciseSet({
        ...ROUTINE_DRAFT_EXERCISE_SET,
        tempo: "3-0-1",
      }),
    ).toEqual({
      _tag: "RoutineDraftExerciseSetInvalid",
      amount: { _tag: "WholeNumberValid" },
      dropSetSegmentCount: undefined,
      dropSetWeightPercentage: undefined,
      restPauseRestSeconds: undefined,
      restPauseSegmentCount: undefined,
      restSeconds: { _tag: "WholeNumberValid" },
      tempo: { _tag: "TempoFormatInvalid" },
    });
  });

  it("accepts a Drop set with a number of Segments and a weight percentage", () => {
    expect(
      validateRoutineDraftExerciseSet(DROP_SET_ROUTINE_DRAFT_EXERCISE_SET),
    ).toEqual({ _tag: "RoutineDraftExerciseSetValid" });
  });

  it("accepts a Drop set without a weight percentage", () => {
    expect(
      validateRoutineDraftExerciseSet({
        ...DROP_SET_ROUTINE_DRAFT_EXERCISE_SET,
        dropSetWeightPercentage: "",
      }),
    ).toEqual({ _tag: "RoutineDraftExerciseSetValid" });
  });

  it("rejects a Drop set without a number of Segments as below the minimum of 2", () => {
    expect(
      validateRoutineDraftExerciseSet({
        ...DROP_SET_ROUTINE_DRAFT_EXERCISE_SET,
        dropSetSegmentCount: "",
      }),
    ).toEqual({
      _tag: "RoutineDraftExerciseSetInvalid",
      amount: { _tag: "WholeNumberValid" },
      dropSetSegmentCount: { _tag: "WholeNumberBelowMinimum", minimum: 2 },
      dropSetWeightPercentage: { _tag: "WholeNumberValid" },
      restPauseRestSeconds: undefined,
      restPauseSegmentCount: undefined,
      restSeconds: { _tag: "WholeNumberValid" },
      tempo: { _tag: "TempoValid" },
    });
  });

  it("rejects a Drop set weight percentage of 100 as out of the range from 1 to 99", () => {
    expect(
      validateRoutineDraftExerciseSet({
        ...DROP_SET_ROUTINE_DRAFT_EXERCISE_SET,
        dropSetWeightPercentage: "100",
      }),
    ).toEqual({
      _tag: "RoutineDraftExerciseSetInvalid",
      amount: { _tag: "WholeNumberValid" },
      dropSetSegmentCount: { _tag: "WholeNumberValid" },
      dropSetWeightPercentage: {
        _tag: "WholeNumberOutOfRange",
        maximum: 99,
        minimum: 1,
      },
      restPauseRestSeconds: undefined,
      restPauseSegmentCount: undefined,
      restSeconds: { _tag: "WholeNumberValid" },
      tempo: { _tag: "TempoValid" },
    });
  });

  it("accepts a Rest-pause set with a number of Segments and the seconds between them", () => {
    expect(
      validateRoutineDraftExerciseSet(REST_PAUSE_ROUTINE_DRAFT_EXERCISE_SET),
    ).toEqual({ _tag: "RoutineDraftExerciseSetValid" });
  });

  it("rejects a Rest-pause set without the seconds between its Segments as below the minimum of 1", () => {
    expect(
      validateRoutineDraftExerciseSet({
        ...REST_PAUSE_ROUTINE_DRAFT_EXERCISE_SET,
        restPauseRestSeconds: "",
      }),
    ).toEqual({
      _tag: "RoutineDraftExerciseSetInvalid",
      amount: { _tag: "WholeNumberValid" },
      dropSetSegmentCount: undefined,
      dropSetWeightPercentage: undefined,
      restPauseRestSeconds: { _tag: "WholeNumberBelowMinimum", minimum: 1 },
      restPauseSegmentCount: { _tag: "WholeNumberValid" },
      restSeconds: { _tag: "WholeNumberValid" },
      tempo: { _tag: "TempoValid" },
    });
  });

  it("rejects a Rest-pause set without a number of Segments as below the minimum of 2", () => {
    expect(
      validateRoutineDraftExerciseSet({
        ...REST_PAUSE_ROUTINE_DRAFT_EXERCISE_SET,
        restPauseSegmentCount: "",
      }),
    ).toEqual({
      _tag: "RoutineDraftExerciseSetInvalid",
      amount: { _tag: "WholeNumberValid" },
      dropSetSegmentCount: undefined,
      dropSetWeightPercentage: undefined,
      restPauseRestSeconds: { _tag: "WholeNumberValid" },
      restPauseSegmentCount: { _tag: "WholeNumberBelowMinimum", minimum: 2 },
      restSeconds: { _tag: "WholeNumberValid" },
      tempo: { _tag: "TempoValid" },
    });
  });

  it("ignores the Drop set and Rest-pause set fields of a Set without an Intensity technique", () => {
    expect(
      validateRoutineDraftExerciseSet({
        ...ROUTINE_DRAFT_EXERCISE_SET,
        dropSetSegmentCount: "0",
        dropSetWeightPercentage: "100",
        restPauseRestSeconds: "0",
        restPauseSegmentCount: "0",
      }),
    ).toEqual({ _tag: "RoutineDraftExerciseSetValid" });
  });

  it("ignores the Drop set fields of a Rest-pause set", () => {
    expect(
      validateRoutineDraftExerciseSet({
        ...REST_PAUSE_ROUTINE_DRAFT_EXERCISE_SET,
        dropSetSegmentCount: "0",
        dropSetWeightPercentage: "100",
      }),
    ).toEqual({ _tag: "RoutineDraftExerciseSetValid" });
  });

  it("ignores the Rest-pause set fields of a Drop set", () => {
    expect(
      validateRoutineDraftExerciseSet({
        ...DROP_SET_ROUTINE_DRAFT_EXERCISE_SET,
        restPauseRestSeconds: "0",
        restPauseSegmentCount: "0",
      }),
    ).toEqual({ _tag: "RoutineDraftExerciseSetValid" });
  });
});
