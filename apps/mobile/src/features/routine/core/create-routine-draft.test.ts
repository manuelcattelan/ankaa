import type { Routine } from "@/shared/interactors/list-routines";

import { createRoutineDraft } from "@/features/routine/core/create-routine-draft";

type RoutineExercise = Routine["exercises"][number];

type RoutineExerciseSet = RoutineExercise["sets"][number];

const ROUTINE_EXERCISE_SET: RoutineExerciseSet = {
  amount: null,
  dropSetSegmentCount: null,
  dropSetWeightPercentage: null,
  id: "019c0000-0000-7000-8000-000000000001",
  isToFailure: false,
  position: 0,
  restPauseRestSeconds: null,
  restPauseSegmentCount: null,
  restSeconds: null,
  setType: "working",
  tempo: null,
  variation: null,
};

const JUMPING_JACK_ROUTINE_EXERCISE: RoutineExercise = {
  exerciseId: "019a0000-0000-7000-8000-000000000001",
  id: "019b0000-0000-7000-8000-000000000001",
  note: null,
  position: 0,
  section: "warm_up",
  sets: [],
  superset: null,
  warmUpForRoutineExerciseId: null,
};

const BENCH_PRESS_ROUTINE_EXERCISE: RoutineExercise = {
  ...JUMPING_JACK_ROUTINE_EXERCISE,
  exerciseId: "019a0000-0000-7000-8000-000000000002",
  id: "019b0000-0000-7000-8000-000000000002",
  position: 1,
  section: "main",
};

const PUSH_UP_ROUTINE_EXERCISE: RoutineExercise = {
  ...JUMPING_JACK_ROUTINE_EXERCISE,
  exerciseId: "019a0000-0000-7000-8000-000000000003",
  id: "019b0000-0000-7000-8000-000000000003",
  position: 2,
  section: "main",
};

const PULL_UP_ROUTINE_EXERCISE: RoutineExercise = {
  ...JUMPING_JACK_ROUTINE_EXERCISE,
  exerciseId: "019a0000-0000-7000-8000-000000000004",
  id: "019b0000-0000-7000-8000-000000000004",
  position: 3,
  section: "main",
};

const PLANK_ROUTINE_EXERCISE: RoutineExercise = {
  ...JUMPING_JACK_ROUTINE_EXERCISE,
  exerciseId: "019a0000-0000-7000-8000-000000000005",
  id: "019b0000-0000-7000-8000-000000000005",
  position: 4,
  section: "cool_down",
};

const ROUTINE: Routine = {
  days: ["monday", "thursday"],
  exercises: [],
  id: "019d0000-0000-7000-8000-000000000001",
  name: "Push Day",
};

describe("createRoutineDraft", () => {
  it("creates an empty Routine draft without a Routine", () => {
    expect(createRoutineDraft(undefined)).toEqual({
      days: [],
      id: undefined,
      name: "",
      sections: { cool_down: [], main: [], warm_up: [] },
    });
  });

  it("copies the days, the identifier and the name of the Routine", () => {
    expect(createRoutineDraft(ROUTINE)).toEqual({
      days: ["monday", "thursday"],
      id: "019d0000-0000-7000-8000-000000000001",
      name: "Push Day",
      sections: { cool_down: [], main: [], warm_up: [] },
    });
  });

  it("puts each Routine exercise in a block of its own in its Section, identified by the Routine exercise", () => {
    expect(
      createRoutineDraft({
        ...ROUTINE,
        exercises: [
          JUMPING_JACK_ROUTINE_EXERCISE,
          BENCH_PRESS_ROUTINE_EXERCISE,
          PUSH_UP_ROUTINE_EXERCISE,
          PLANK_ROUTINE_EXERCISE,
        ],
      }).sections,
    ).toEqual({
      cool_down: [
        {
          exercises: [
            {
              exerciseId: "019a0000-0000-7000-8000-000000000005",
              id: "019b0000-0000-7000-8000-000000000005",
              note: "",
              sets: [],
            },
          ],
          id: "019b0000-0000-7000-8000-000000000005",
          warmUpExercises: [],
        },
      ],
      main: [
        {
          exercises: [
            {
              exerciseId: "019a0000-0000-7000-8000-000000000002",
              id: "019b0000-0000-7000-8000-000000000002",
              note: "",
              sets: [],
            },
          ],
          id: "019b0000-0000-7000-8000-000000000002",
          warmUpExercises: [],
        },
        {
          exercises: [
            {
              exerciseId: "019a0000-0000-7000-8000-000000000003",
              id: "019b0000-0000-7000-8000-000000000003",
              note: "",
              sets: [],
            },
          ],
          id: "019b0000-0000-7000-8000-000000000003",
          warmUpExercises: [],
        },
      ],
      warm_up: [
        {
          exercises: [
            {
              exerciseId: "019a0000-0000-7000-8000-000000000001",
              id: "019b0000-0000-7000-8000-000000000001",
              note: "",
              sets: [],
            },
          ],
          id: "019b0000-0000-7000-8000-000000000001",
          warmUpExercises: [],
        },
      ],
    });
  });

  it("puts the consecutive Routine exercises of one Superset in one block, identified by the first of them", () => {
    expect(
      createRoutineDraft({
        ...ROUTINE,
        exercises: [
          { ...BENCH_PRESS_ROUTINE_EXERCISE, superset: 1 },
          { ...PUSH_UP_ROUTINE_EXERCISE, superset: 1 },
          { ...PULL_UP_ROUTINE_EXERCISE, superset: 2 },
        ],
      }).sections.main,
    ).toEqual([
      {
        exercises: [
          {
            exerciseId: "019a0000-0000-7000-8000-000000000002",
            id: "019b0000-0000-7000-8000-000000000002",
            note: "",
            sets: [],
          },
          {
            exerciseId: "019a0000-0000-7000-8000-000000000003",
            id: "019b0000-0000-7000-8000-000000000003",
            note: "",
            sets: [],
          },
        ],
        id: "019b0000-0000-7000-8000-000000000002",
        warmUpExercises: [],
      },
      {
        exercises: [
          {
            exerciseId: "019a0000-0000-7000-8000-000000000004",
            id: "019b0000-0000-7000-8000-000000000004",
            note: "",
            sets: [],
          },
        ],
        id: "019b0000-0000-7000-8000-000000000004",
        warmUpExercises: [],
      },
    ]);
  });

  it("puts each Warm-up exercise in the block of the Routine exercise it prepares for, and not in a block of its own", () => {
    expect(
      createRoutineDraft({
        ...ROUTINE,
        exercises: [
          {
            ...PUSH_UP_ROUTINE_EXERCISE,
            position: 0,
            section: "warm_up",
            warmUpForRoutineExerciseId: "019b0000-0000-7000-8000-000000000002",
          },
          BENCH_PRESS_ROUTINE_EXERCISE,
        ],
      }).sections,
    ).toEqual({
      cool_down: [],
      main: [
        {
          exercises: [
            {
              exerciseId: "019a0000-0000-7000-8000-000000000002",
              id: "019b0000-0000-7000-8000-000000000002",
              note: "",
              sets: [],
            },
          ],
          id: "019b0000-0000-7000-8000-000000000002",
          warmUpExercises: [
            {
              exerciseId: "019a0000-0000-7000-8000-000000000003",
              id: "019b0000-0000-7000-8000-000000000003",
              note: "",
              sets: [],
              warmUpForRoutineExerciseId:
                "019b0000-0000-7000-8000-000000000002",
            },
          ],
        },
      ],
      warm_up: [],
    });
  });

  it("writes the note and the numbers of a Routine exercise and its Sets as text", () => {
    expect(
      createRoutineDraft({
        ...ROUTINE,
        exercises: [
          {
            ...BENCH_PRESS_ROUTINE_EXERCISE,
            note: "Pause at the bottom",
            sets: [
              {
                ...ROUTINE_EXERCISE_SET,
                amount: 8,
                dropSetSegmentCount: 3,
                dropSetWeightPercentage: 20,
                isToFailure: true,
                restPauseRestSeconds: 15,
                restPauseSegmentCount: 4,
                restSeconds: 90,
                setType: "warm_up",
                tempo: "3-0-X-2",
                variation: "drop_set",
              },
            ],
          },
        ],
      }).sections.main,
    ).toEqual([
      {
        exercises: [
          {
            exerciseId: "019a0000-0000-7000-8000-000000000002",
            id: "019b0000-0000-7000-8000-000000000002",
            note: "Pause at the bottom",
            sets: [
              {
                amount: "8",
                dropSetSegmentCount: "3",
                dropSetWeightPercentage: "20",
                id: "019c0000-0000-7000-8000-000000000001",
                isToFailure: true,
                restPauseRestSeconds: "15",
                restPauseSegmentCount: "4",
                restSeconds: "90",
                setType: "warm_up",
                tempo: "3-0-X-2",
                variation: "drop_set",
              },
            ],
          },
        ],
        id: "019b0000-0000-7000-8000-000000000002",
        warmUpExercises: [],
      },
    ]);
  });

  it("writes the missing values of a Set as empty text, and its missing Intensity technique as undefined", () => {
    expect(
      createRoutineDraft({
        ...ROUTINE,
        exercises: [
          { ...BENCH_PRESS_ROUTINE_EXERCISE, sets: [ROUTINE_EXERCISE_SET] },
        ],
      }).sections.main,
    ).toEqual([
      {
        exercises: [
          {
            exerciseId: "019a0000-0000-7000-8000-000000000002",
            id: "019b0000-0000-7000-8000-000000000002",
            note: "",
            sets: [
              {
                amount: "",
                dropSetSegmentCount: "",
                dropSetWeightPercentage: "",
                id: "019c0000-0000-7000-8000-000000000001",
                isToFailure: false,
                restPauseRestSeconds: "",
                restPauseSegmentCount: "",
                restSeconds: "",
                setType: "working",
                tempo: "",
                variation: undefined,
              },
            ],
          },
        ],
        id: "019b0000-0000-7000-8000-000000000002",
        warmUpExercises: [],
      },
    ]);
  });
});
