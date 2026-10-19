import type {
  RoutineDraft,
  RoutineDraftBlock,
  RoutineDraftExercise,
  RoutineDraftExerciseSet,
  RoutineDraftWarmUpExercise,
} from "@/features/routine/core/routine-draft-reducer";

import { routineDraftReducer } from "@/features/routine/core/routine-draft-reducer";

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

const SECOND_ROUTINE_DRAFT_EXERCISE_SET: RoutineDraftExerciseSet = {
  ...ROUTINE_DRAFT_EXERCISE_SET,
  amount: "6",
  id: "019c0000-0000-7000-8000-000000000002",
};

const BENCH_PRESS_ROUTINE_DRAFT_EXERCISE: RoutineDraftExercise = {
  exerciseId: "019a0000-0000-7000-8000-000000000001",
  id: "019b0000-0000-7000-8000-000000000001",
  note: "",
  sets: [ROUTINE_DRAFT_EXERCISE_SET, SECOND_ROUTINE_DRAFT_EXERCISE_SET],
};

const PULL_UP_ROUTINE_DRAFT_EXERCISE: RoutineDraftExercise = {
  exerciseId: "019a0000-0000-7000-8000-000000000002",
  id: "019b0000-0000-7000-8000-000000000002",
  note: "",
  sets: [],
};

const ROW_ROUTINE_DRAFT_EXERCISE: RoutineDraftExercise = {
  exerciseId: "019a0000-0000-7000-8000-000000000003",
  id: "019b0000-0000-7000-8000-000000000003",
  note: "",
  sets: [],
};

const PUSH_UP_ROUTINE_DRAFT_WARM_UP_EXERCISE: RoutineDraftWarmUpExercise = {
  exerciseId: "019a0000-0000-7000-8000-000000000004",
  id: "019b0000-0000-7000-8000-000000000004",
  note: "",
  sets: [],
  warmUpForRoutineExerciseId: "019b0000-0000-7000-8000-000000000001",
};

const SCAPULAR_PULL_UP_ROUTINE_DRAFT_WARM_UP_EXERCISE: RoutineDraftWarmUpExercise =
  {
    exerciseId: "019a0000-0000-7000-8000-000000000005",
    id: "019b0000-0000-7000-8000-000000000005",
    note: "",
    sets: [],
    warmUpForRoutineExerciseId: "019b0000-0000-7000-8000-000000000003",
  };

const BENCH_PRESS_ROUTINE_DRAFT_BLOCK: RoutineDraftBlock = {
  exercises: [BENCH_PRESS_ROUTINE_DRAFT_EXERCISE],
  id: "019b0000-0000-7000-8000-000000000001",
  warmUpExercises: [PUSH_UP_ROUTINE_DRAFT_WARM_UP_EXERCISE],
};

const SUPERSET_ROUTINE_DRAFT_BLOCK: RoutineDraftBlock = {
  exercises: [PULL_UP_ROUTINE_DRAFT_EXERCISE, ROW_ROUTINE_DRAFT_EXERCISE],
  id: "019b0000-0000-7000-8000-000000000002",
  warmUpExercises: [SCAPULAR_PULL_UP_ROUTINE_DRAFT_WARM_UP_EXERCISE],
};

const ROUTINE_DRAFT: RoutineDraft = {
  days: ["monday"],
  id: undefined,
  name: "Upper Body",
  sections: {
    cool_down: [],
    main: [BENCH_PRESS_ROUTINE_DRAFT_BLOCK, SUPERSET_ROUTINE_DRAFT_BLOCK],
    warm_up: [],
  },
};

describe("routineDraftReducer", () => {
  it("adds an exercise without Sets in a block of its own at the end of its Section", () => {
    expect(
      routineDraftReducer(ROUTINE_DRAFT, {
        exerciseId: "019a0000-0000-7000-8000-000000000006",
        routineDraftBlockId: "019b0000-0000-7000-8000-000000000007",
        routineExerciseId: "019b0000-0000-7000-8000-000000000006",
        section: "main",
        type: "addedExercise",
      }).sections,
    ).toEqual({
      cool_down: [],
      main: [
        BENCH_PRESS_ROUTINE_DRAFT_BLOCK,
        SUPERSET_ROUTINE_DRAFT_BLOCK,
        {
          exercises: [
            {
              exerciseId: "019a0000-0000-7000-8000-000000000006",
              id: "019b0000-0000-7000-8000-000000000006",
              note: "",
              sets: [],
            },
          ],
          id: "019b0000-0000-7000-8000-000000000007",
          warmUpExercises: [],
        },
      ],
      warm_up: [],
    });
  });

  it("adds a Warm-up exercise without Sets at the end of the Warm-up exercises of the block of the exercise it prepares for", () => {
    expect(
      routineDraftReducer(ROUTINE_DRAFT, {
        exerciseId: "019a0000-0000-7000-8000-000000000006",
        routineExerciseId: "019b0000-0000-7000-8000-000000000006",
        type: "addedWarmUpExercise",
        warmUpForRoutineExerciseId: "019b0000-0000-7000-8000-000000000002",
      }).sections.main,
    ).toEqual([
      BENCH_PRESS_ROUTINE_DRAFT_BLOCK,
      {
        ...SUPERSET_ROUTINE_DRAFT_BLOCK,
        warmUpExercises: [
          SCAPULAR_PULL_UP_ROUTINE_DRAFT_WARM_UP_EXERCISE,
          {
            exerciseId: "019a0000-0000-7000-8000-000000000006",
            id: "019b0000-0000-7000-8000-000000000006",
            note: "",
            sets: [],
            warmUpForRoutineExerciseId: "019b0000-0000-7000-8000-000000000002",
          },
        ],
      },
    ]);
  });

  it("assigns the identifier of the Routine", () => {
    expect(
      routineDraftReducer(ROUTINE_DRAFT, {
        id: "019d0000-0000-7000-8000-000000000001",
        type: "assignedId",
      }).id,
    ).toBe("019d0000-0000-7000-8000-000000000001");
  });

  it("changes the name", () => {
    expect(
      routineDraftReducer(ROUTINE_DRAFT, {
        name: "Pull Day",
        type: "changedName",
      }).name,
    ).toBe("Pull Day");
  });

  it("changes the days", () => {
    expect(
      routineDraftReducer(ROUTINE_DRAFT, {
        days: ["tuesday", "friday"],
        type: "changedDays",
      }).days,
    ).toEqual(["tuesday", "friday"]);
  });

  it("changes the note of an exercise", () => {
    expect(
      routineDraftReducer(ROUTINE_DRAFT, {
        note: "Pause at the bottom",
        routineExerciseId: "019b0000-0000-7000-8000-000000000001",
        type: "changedExerciseNote",
      }).sections.main,
    ).toEqual([
      {
        ...BENCH_PRESS_ROUTINE_DRAFT_BLOCK,
        exercises: [
          {
            ...BENCH_PRESS_ROUTINE_DRAFT_EXERCISE,
            note: "Pause at the bottom",
          },
        ],
      },
      SUPERSET_ROUTINE_DRAFT_BLOCK,
    ]);
  });

  it("changes the note of a Warm-up exercise", () => {
    expect(
      routineDraftReducer(ROUTINE_DRAFT, {
        note: "Slow and controlled",
        routineExerciseId: "019b0000-0000-7000-8000-000000000004",
        type: "changedExerciseNote",
      }).sections.main,
    ).toEqual([
      {
        ...BENCH_PRESS_ROUTINE_DRAFT_BLOCK,
        warmUpExercises: [
          {
            ...PUSH_UP_ROUTINE_DRAFT_WARM_UP_EXERCISE,
            note: "Slow and controlled",
          },
        ],
      },
      SUPERSET_ROUTINE_DRAFT_BLOCK,
    ]);
  });

  it("adds an empty working Set at the end of the Sets of an exercise", () => {
    expect(
      routineDraftReducer(ROUTINE_DRAFT, {
        routineExerciseId: "019b0000-0000-7000-8000-000000000001",
        routineExerciseSetId: "019c0000-0000-7000-8000-000000000003",
        type: "addedSet",
      }).sections.main,
    ).toEqual([
      {
        ...BENCH_PRESS_ROUTINE_DRAFT_BLOCK,
        exercises: [
          {
            ...BENCH_PRESS_ROUTINE_DRAFT_EXERCISE,
            sets: [
              ROUTINE_DRAFT_EXERCISE_SET,
              SECOND_ROUTINE_DRAFT_EXERCISE_SET,
              {
                amount: "",
                dropSetSegmentCount: "",
                dropSetWeightPercentage: "",
                id: "019c0000-0000-7000-8000-000000000003",
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
      },
      SUPERSET_ROUTINE_DRAFT_BLOCK,
    ]);
  });

  it("changes the Set with the identifier of the changed Set", () => {
    expect(
      routineDraftReducer(ROUTINE_DRAFT, {
        routineDraftExerciseSet: {
          ...SECOND_ROUTINE_DRAFT_EXERCISE_SET,
          amount: "5",
          isToFailure: true,
        },
        routineExerciseId: "019b0000-0000-7000-8000-000000000001",
        type: "changedSet",
      }).sections.main,
    ).toEqual([
      {
        ...BENCH_PRESS_ROUTINE_DRAFT_BLOCK,
        exercises: [
          {
            ...BENCH_PRESS_ROUTINE_DRAFT_EXERCISE,
            sets: [
              ROUTINE_DRAFT_EXERCISE_SET,
              {
                ...SECOND_ROUTINE_DRAFT_EXERCISE_SET,
                amount: "5",
                isToFailure: true,
              },
            ],
          },
        ],
      },
      SUPERSET_ROUTINE_DRAFT_BLOCK,
    ]);
  });

  it("removes a Set from an exercise", () => {
    expect(
      routineDraftReducer(ROUTINE_DRAFT, {
        routineExerciseId: "019b0000-0000-7000-8000-000000000001",
        routineExerciseSetId: "019c0000-0000-7000-8000-000000000001",
        type: "removedSet",
      }).sections.main,
    ).toEqual([
      {
        ...BENCH_PRESS_ROUTINE_DRAFT_BLOCK,
        exercises: [
          {
            ...BENCH_PRESS_ROUTINE_DRAFT_EXERCISE,
            sets: [SECOND_ROUTINE_DRAFT_EXERCISE_SET],
          },
        ],
      },
      SUPERSET_ROUTINE_DRAFT_BLOCK,
    ]);
  });

  it("moves a block of a Section", () => {
    expect(
      routineDraftReducer(ROUTINE_DRAFT, {
        routineDraftBlockId: "019b0000-0000-7000-8000-000000000002",
        routineDraftBlockMoveDirection: "up",
        section: "main",
        type: "movedBlock",
      }).sections.main,
    ).toEqual([SUPERSET_ROUTINE_DRAFT_BLOCK, BENCH_PRESS_ROUTINE_DRAFT_BLOCK]);
  });

  it("joins a block of a Section with the next block into a Superset", () => {
    expect(
      routineDraftReducer(ROUTINE_DRAFT, {
        routineDraftBlockId: "019b0000-0000-7000-8000-000000000001",
        section: "main",
        type: "joinedSupersetWithNextBlock",
      }).sections.main,
    ).toEqual([
      {
        exercises: [
          BENCH_PRESS_ROUTINE_DRAFT_EXERCISE,
          PULL_UP_ROUTINE_DRAFT_EXERCISE,
          ROW_ROUTINE_DRAFT_EXERCISE,
        ],
        id: "019b0000-0000-7000-8000-000000000001",
        warmUpExercises: [
          PUSH_UP_ROUTINE_DRAFT_WARM_UP_EXERCISE,
          SCAPULAR_PULL_UP_ROUTINE_DRAFT_WARM_UP_EXERCISE,
        ],
      },
    ]);
  });

  it("moves an exercise that leaves its Superset into a new block right after it, with the Warm-up exercises that prepare for it", () => {
    expect(
      routineDraftReducer(ROUTINE_DRAFT, {
        routineDraftBlockId: "019b0000-0000-7000-8000-000000000007",
        routineExerciseId: "019b0000-0000-7000-8000-000000000003",
        section: "main",
        type: "leftSuperset",
      }).sections.main,
    ).toEqual([
      BENCH_PRESS_ROUTINE_DRAFT_BLOCK,
      {
        exercises: [PULL_UP_ROUTINE_DRAFT_EXERCISE],
        id: "019b0000-0000-7000-8000-000000000002",
        warmUpExercises: [],
      },
      {
        exercises: [ROW_ROUTINE_DRAFT_EXERCISE],
        id: "019b0000-0000-7000-8000-000000000007",
        warmUpExercises: [SCAPULAR_PULL_UP_ROUTINE_DRAFT_WARM_UP_EXERCISE],
      },
    ]);
  });

  it("removes an exercise from its Superset, with the Warm-up exercises that prepare for it", () => {
    expect(
      routineDraftReducer(ROUTINE_DRAFT, {
        routineExerciseId: "019b0000-0000-7000-8000-000000000003",
        type: "removedExercise",
      }).sections.main,
    ).toEqual([
      BENCH_PRESS_ROUTINE_DRAFT_BLOCK,
      {
        exercises: [PULL_UP_ROUTINE_DRAFT_EXERCISE],
        id: "019b0000-0000-7000-8000-000000000002",
        warmUpExercises: [],
      },
    ]);
  });

  it("removes the block that a removed exercise leaves empty", () => {
    expect(
      routineDraftReducer(ROUTINE_DRAFT, {
        routineExerciseId: "019b0000-0000-7000-8000-000000000001",
        type: "removedExercise",
      }).sections.main,
    ).toEqual([SUPERSET_ROUTINE_DRAFT_BLOCK]);
  });

  it("removes a Warm-up exercise", () => {
    expect(
      routineDraftReducer(ROUTINE_DRAFT, {
        routineExerciseId: "019b0000-0000-7000-8000-000000000004",
        type: "removedExercise",
      }).sections.main,
    ).toEqual([
      { ...BENCH_PRESS_ROUTINE_DRAFT_BLOCK, warmUpExercises: [] },
      SUPERSET_ROUTINE_DRAFT_BLOCK,
    ]);
  });
});
