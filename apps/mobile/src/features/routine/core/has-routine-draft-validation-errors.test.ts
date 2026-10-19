import type {
  RoutineDraft,
  RoutineDraftExercise,
  RoutineDraftExerciseSet,
} from "@/features/routine/core/routine-draft-reducer";

import { hasRoutineDraftValidationErrors } from "@/features/routine/core/has-routine-draft-validation-errors";

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
  tempo: "",
  variation: undefined,
};

const INVALID_ROUTINE_DRAFT_EXERCISE_SET: RoutineDraftExerciseSet = {
  ...ROUTINE_DRAFT_EXERCISE_SET,
  amount: "0",
  id: "019c0000-0000-7000-8000-000000000002",
};

const BENCH_PRESS_ROUTINE_DRAFT_EXERCISE: RoutineDraftExercise = {
  exerciseId: "019a0000-0000-7000-8000-000000000001",
  id: "019b0000-0000-7000-8000-000000000001",
  note: "",
  sets: [ROUTINE_DRAFT_EXERCISE_SET],
};

const ROUTINE_DRAFT: RoutineDraft = {
  days: [],
  id: undefined,
  name: "Push Day",
  sections: {
    cool_down: [],
    main: [
      {
        exercises: [BENCH_PRESS_ROUTINE_DRAFT_EXERCISE],
        id: "019b0000-0000-7000-8000-000000000001",
        warmUpExercises: [],
      },
    ],
    warm_up: [],
  },
};

describe("hasRoutineDraftValidationErrors", () => {
  it("returns false for a Routine draft with a name and valid Sets", () => {
    expect(hasRoutineDraftValidationErrors(ROUTINE_DRAFT)).toBe(false);
  });

  it("returns true for a Routine draft whose name is empty", () => {
    expect(
      hasRoutineDraftValidationErrors({ ...ROUTINE_DRAFT, name: " " }),
    ).toBe(true);
  });

  it("returns true for a Routine draft with an invalid Set", () => {
    expect(
      hasRoutineDraftValidationErrors({
        ...ROUTINE_DRAFT,
        sections: {
          cool_down: [],
          main: [
            {
              exercises: [
                {
                  ...BENCH_PRESS_ROUTINE_DRAFT_EXERCISE,
                  sets: [
                    ROUTINE_DRAFT_EXERCISE_SET,
                    INVALID_ROUTINE_DRAFT_EXERCISE_SET,
                  ],
                },
              ],
              id: "019b0000-0000-7000-8000-000000000001",
              warmUpExercises: [],
            },
          ],
          warm_up: [],
        },
      }),
    ).toBe(true);
  });

  it("returns true for a Routine draft with an invalid Set in a Warm-up exercise", () => {
    expect(
      hasRoutineDraftValidationErrors({
        ...ROUTINE_DRAFT,
        sections: {
          cool_down: [],
          main: [
            {
              exercises: [BENCH_PRESS_ROUTINE_DRAFT_EXERCISE],
              id: "019b0000-0000-7000-8000-000000000001",
              warmUpExercises: [
                {
                  exerciseId: "019a0000-0000-7000-8000-000000000002",
                  id: "019b0000-0000-7000-8000-000000000002",
                  note: "",
                  sets: [INVALID_ROUTINE_DRAFT_EXERCISE_SET],
                  warmUpForRoutineExerciseId:
                    "019b0000-0000-7000-8000-000000000001",
                },
              ],
            },
          ],
          warm_up: [],
        },
      }),
    ).toBe(true);
  });
});
