import type {
  RoutineDraft,
  RoutineDraftExercise,
  RoutineDraftWarmUpExercise,
} from "@/features/routine/core/routine-draft-reducer";

import { getRoutineDraftPlacedExercises } from "@/features/routine/core/get-routine-draft-placed-exercises";

const JUMPING_JACK_ROUTINE_DRAFT_EXERCISE: RoutineDraftExercise = {
  exerciseId: "019a0000-0000-7000-8000-000000000001",
  id: "019b0000-0000-7000-8000-000000000001",
  note: "",
  sets: [],
};

const BENCH_PRESS_ROUTINE_DRAFT_EXERCISE: RoutineDraftExercise = {
  exerciseId: "019a0000-0000-7000-8000-000000000002",
  id: "019b0000-0000-7000-8000-000000000002",
  note: "",
  sets: [],
};

const PUSH_UP_ROUTINE_DRAFT_EXERCISE: RoutineDraftExercise = {
  exerciseId: "019a0000-0000-7000-8000-000000000003",
  id: "019b0000-0000-7000-8000-000000000003",
  note: "",
  sets: [],
};

const PULL_UP_ROUTINE_DRAFT_EXERCISE: RoutineDraftExercise = {
  exerciseId: "019a0000-0000-7000-8000-000000000004",
  id: "019b0000-0000-7000-8000-000000000004",
  note: "",
  sets: [],
};

const PLANK_ROUTINE_DRAFT_EXERCISE: RoutineDraftExercise = {
  exerciseId: "019a0000-0000-7000-8000-000000000005",
  id: "019b0000-0000-7000-8000-000000000005",
  note: "",
  sets: [],
};

const PUSH_UP_ROUTINE_DRAFT_WARM_UP_EXERCISE: RoutineDraftWarmUpExercise = {
  exerciseId: "019a0000-0000-7000-8000-000000000003",
  id: "019b0000-0000-7000-8000-000000000006",
  note: "",
  sets: [],
  warmUpForRoutineExerciseId: "019b0000-0000-7000-8000-000000000002",
};

const ROUTINE_DRAFT: RoutineDraft = {
  days: [],
  id: undefined,
  name: "Push Day",
  sections: { cool_down: [], main: [], warm_up: [] },
};

describe("getRoutineDraftPlacedExercises", () => {
  it("returns no exercise for a Routine draft without exercises", () => {
    expect(getRoutineDraftPlacedExercises(ROUTINE_DRAFT)).toEqual([]);
  });

  it("returns the exercises of the warm-up, main and cool-down Sections in this order, each in the Section of its block", () => {
    expect(
      getRoutineDraftPlacedExercises({
        ...ROUTINE_DRAFT,
        sections: {
          cool_down: [
            {
              exercises: [PLANK_ROUTINE_DRAFT_EXERCISE],
              id: "019b0000-0000-7000-8000-000000000005",
              warmUpExercises: [],
            },
          ],
          main: [
            {
              exercises: [BENCH_PRESS_ROUTINE_DRAFT_EXERCISE],
              id: "019b0000-0000-7000-8000-000000000002",
              warmUpExercises: [],
            },
          ],
          warm_up: [
            {
              exercises: [JUMPING_JACK_ROUTINE_DRAFT_EXERCISE],
              id: "019b0000-0000-7000-8000-000000000001",
              warmUpExercises: [],
            },
          ],
        },
      }),
    ).toEqual([
      {
        routineDraftExercise: JUMPING_JACK_ROUTINE_DRAFT_EXERCISE,
        section: "warm_up",
        superset: undefined,
        warmUpForRoutineExerciseId: undefined,
      },
      {
        routineDraftExercise: BENCH_PRESS_ROUTINE_DRAFT_EXERCISE,
        section: "main",
        superset: undefined,
        warmUpForRoutineExerciseId: undefined,
      },
      {
        routineDraftExercise: PLANK_ROUTINE_DRAFT_EXERCISE,
        section: "cool_down",
        superset: undefined,
        warmUpForRoutineExerciseId: undefined,
      },
    ]);
  });

  it("numbers the Superset of a block of two exercises after the position of the block among the blocks of every Section", () => {
    expect(
      getRoutineDraftPlacedExercises({
        ...ROUTINE_DRAFT,
        sections: {
          cool_down: [],
          main: [
            {
              exercises: [BENCH_PRESS_ROUTINE_DRAFT_EXERCISE],
              id: "019b0000-0000-7000-8000-000000000002",
              warmUpExercises: [],
            },
            {
              exercises: [
                PUSH_UP_ROUTINE_DRAFT_EXERCISE,
                PULL_UP_ROUTINE_DRAFT_EXERCISE,
              ],
              id: "019b0000-0000-7000-8000-000000000003",
              warmUpExercises: [],
            },
          ],
          warm_up: [
            {
              exercises: [JUMPING_JACK_ROUTINE_DRAFT_EXERCISE],
              id: "019b0000-0000-7000-8000-000000000001",
              warmUpExercises: [],
            },
          ],
        },
      }),
    ).toEqual([
      {
        routineDraftExercise: JUMPING_JACK_ROUTINE_DRAFT_EXERCISE,
        section: "warm_up",
        superset: undefined,
        warmUpForRoutineExerciseId: undefined,
      },
      {
        routineDraftExercise: BENCH_PRESS_ROUTINE_DRAFT_EXERCISE,
        section: "main",
        superset: undefined,
        warmUpForRoutineExerciseId: undefined,
      },
      {
        routineDraftExercise: PUSH_UP_ROUTINE_DRAFT_EXERCISE,
        section: "main",
        superset: 2,
        warmUpForRoutineExerciseId: undefined,
      },
      {
        routineDraftExercise: PULL_UP_ROUTINE_DRAFT_EXERCISE,
        section: "main",
        superset: 2,
        warmUpForRoutineExerciseId: undefined,
      },
    ]);
  });

  it("places each Warm-up exercise right before the exercises of its block, in the warm-up Section, linked to the exercise it prepares for", () => {
    expect(
      getRoutineDraftPlacedExercises({
        ...ROUTINE_DRAFT,
        sections: {
          cool_down: [],
          main: [
            {
              exercises: [BENCH_PRESS_ROUTINE_DRAFT_EXERCISE],
              id: "019b0000-0000-7000-8000-000000000002",
              warmUpExercises: [PUSH_UP_ROUTINE_DRAFT_WARM_UP_EXERCISE],
            },
          ],
          warm_up: [],
        },
      }),
    ).toEqual([
      {
        routineDraftExercise: PUSH_UP_ROUTINE_DRAFT_WARM_UP_EXERCISE,
        section: "warm_up",
        superset: undefined,
        warmUpForRoutineExerciseId: "019b0000-0000-7000-8000-000000000002",
      },
      {
        routineDraftExercise: BENCH_PRESS_ROUTINE_DRAFT_EXERCISE,
        section: "main",
        superset: undefined,
        warmUpForRoutineExerciseId: undefined,
      },
    ]);
  });
});
