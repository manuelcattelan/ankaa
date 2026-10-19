import type {
  RoutineDraftBlock,
  RoutineDraftExercise,
  RoutineDraftWarmUpExercise,
} from "@/features/routine/core/routine-draft-reducer";

import { joinRoutineDraftBlockWithNextBlock } from "@/features/routine/core/join-routine-draft-block-with-next-block";

const BENCH_PRESS_ROUTINE_DRAFT_EXERCISE: RoutineDraftExercise = {
  exerciseId: "019a0000-0000-7000-8000-000000000001",
  id: "019b0000-0000-7000-8000-000000000001",
  note: "",
  sets: [],
};

const PUSH_UP_ROUTINE_DRAFT_EXERCISE: RoutineDraftExercise = {
  exerciseId: "019a0000-0000-7000-8000-000000000002",
  id: "019b0000-0000-7000-8000-000000000002",
  note: "",
  sets: [],
};

const PULL_UP_ROUTINE_DRAFT_EXERCISE: RoutineDraftExercise = {
  exerciseId: "019a0000-0000-7000-8000-000000000003",
  id: "019b0000-0000-7000-8000-000000000003",
  note: "",
  sets: [],
};

const PLANK_ROUTINE_DRAFT_EXERCISE: RoutineDraftExercise = {
  exerciseId: "019a0000-0000-7000-8000-000000000004",
  id: "019b0000-0000-7000-8000-000000000004",
  note: "",
  sets: [],
};

const PUSH_UP_ROUTINE_DRAFT_WARM_UP_EXERCISE: RoutineDraftWarmUpExercise = {
  exerciseId: "019a0000-0000-7000-8000-000000000002",
  id: "019b0000-0000-7000-8000-000000000005",
  note: "",
  sets: [],
  warmUpForRoutineExerciseId: "019b0000-0000-7000-8000-000000000001",
};

const PULL_UP_ROUTINE_DRAFT_WARM_UP_EXERCISE: RoutineDraftWarmUpExercise = {
  exerciseId: "019a0000-0000-7000-8000-000000000003",
  id: "019b0000-0000-7000-8000-000000000006",
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
  exercises: [PUSH_UP_ROUTINE_DRAFT_EXERCISE, PULL_UP_ROUTINE_DRAFT_EXERCISE],
  id: "019b0000-0000-7000-8000-000000000002",
  warmUpExercises: [PULL_UP_ROUTINE_DRAFT_WARM_UP_EXERCISE],
};

const PLANK_ROUTINE_DRAFT_BLOCK: RoutineDraftBlock = {
  exercises: [PLANK_ROUTINE_DRAFT_EXERCISE],
  id: "019b0000-0000-7000-8000-000000000004",
  warmUpExercises: [],
};

const ROUTINE_DRAFT_BLOCKS = [
  BENCH_PRESS_ROUTINE_DRAFT_BLOCK,
  SUPERSET_ROUTINE_DRAFT_BLOCK,
  PLANK_ROUTINE_DRAFT_BLOCK,
];

describe("joinRoutineDraftBlockWithNextBlock", () => {
  it("joins a block with the next one into a Superset that keeps the identifier of the first, followed by the exercises and the Warm-up exercises of the second", () => {
    expect(
      joinRoutineDraftBlockWithNextBlock({
        routineDraftBlockId: "019b0000-0000-7000-8000-000000000001",
        routineDraftBlocks: ROUTINE_DRAFT_BLOCKS,
      }),
    ).toEqual([
      {
        exercises: [
          BENCH_PRESS_ROUTINE_DRAFT_EXERCISE,
          PUSH_UP_ROUTINE_DRAFT_EXERCISE,
          PULL_UP_ROUTINE_DRAFT_EXERCISE,
        ],
        id: "019b0000-0000-7000-8000-000000000001",
        warmUpExercises: [
          PUSH_UP_ROUTINE_DRAFT_WARM_UP_EXERCISE,
          PULL_UP_ROUTINE_DRAFT_WARM_UP_EXERCISE,
        ],
      },
      PLANK_ROUTINE_DRAFT_BLOCK,
    ]);
  });

  it("keeps the blocks before the joined block in place", () => {
    expect(
      joinRoutineDraftBlockWithNextBlock({
        routineDraftBlockId: "019b0000-0000-7000-8000-000000000002",
        routineDraftBlocks: ROUTINE_DRAFT_BLOCKS,
      }),
    ).toEqual([
      BENCH_PRESS_ROUTINE_DRAFT_BLOCK,
      {
        exercises: [
          PUSH_UP_ROUTINE_DRAFT_EXERCISE,
          PULL_UP_ROUTINE_DRAFT_EXERCISE,
          PLANK_ROUTINE_DRAFT_EXERCISE,
        ],
        id: "019b0000-0000-7000-8000-000000000002",
        warmUpExercises: [PULL_UP_ROUTINE_DRAFT_WARM_UP_EXERCISE],
      },
    ]);
  });

  it("keeps the blocks unchanged when the last block is joined", () => {
    expect(
      joinRoutineDraftBlockWithNextBlock({
        routineDraftBlockId: "019b0000-0000-7000-8000-000000000004",
        routineDraftBlocks: ROUTINE_DRAFT_BLOCKS,
      }),
    ).toEqual([
      BENCH_PRESS_ROUTINE_DRAFT_BLOCK,
      SUPERSET_ROUTINE_DRAFT_BLOCK,
      PLANK_ROUTINE_DRAFT_BLOCK,
    ]);
  });

  it("keeps the blocks unchanged when no block has the identifier", () => {
    expect(
      joinRoutineDraftBlockWithNextBlock({
        routineDraftBlockId: "019b0000-0000-7000-8000-000000000007",
        routineDraftBlocks: ROUTINE_DRAFT_BLOCKS,
      }),
    ).toEqual([
      BENCH_PRESS_ROUTINE_DRAFT_BLOCK,
      SUPERSET_ROUTINE_DRAFT_BLOCK,
      PLANK_ROUTINE_DRAFT_BLOCK,
    ]);
  });
});
