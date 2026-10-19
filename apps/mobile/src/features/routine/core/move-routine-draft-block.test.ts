import type { RoutineDraftBlock } from "@/features/routine/core/routine-draft-reducer";

import { moveRoutineDraftBlock } from "@/features/routine/core/move-routine-draft-block";

const BENCH_PRESS_ROUTINE_DRAFT_BLOCK: RoutineDraftBlock = {
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
};

const PUSH_UP_ROUTINE_DRAFT_BLOCK: RoutineDraftBlock = {
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
};

const PULL_UP_ROUTINE_DRAFT_BLOCK: RoutineDraftBlock = {
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
};

const ROUTINE_DRAFT_BLOCKS = [
  BENCH_PRESS_ROUTINE_DRAFT_BLOCK,
  PUSH_UP_ROUTINE_DRAFT_BLOCK,
  PULL_UP_ROUTINE_DRAFT_BLOCK,
];

describe("moveRoutineDraftBlock", () => {
  it("swaps a block moved up with the block before it", () => {
    expect(
      moveRoutineDraftBlock({
        routineDraftBlockId: "019b0000-0000-7000-8000-000000000002",
        routineDraftBlockMoveDirection: "up",
        routineDraftBlocks: ROUTINE_DRAFT_BLOCKS,
      }),
    ).toEqual([
      PUSH_UP_ROUTINE_DRAFT_BLOCK,
      BENCH_PRESS_ROUTINE_DRAFT_BLOCK,
      PULL_UP_ROUTINE_DRAFT_BLOCK,
    ]);
  });

  it("swaps a block moved down with the block after it", () => {
    expect(
      moveRoutineDraftBlock({
        routineDraftBlockId: "019b0000-0000-7000-8000-000000000002",
        routineDraftBlockMoveDirection: "down",
        routineDraftBlocks: ROUTINE_DRAFT_BLOCKS,
      }),
    ).toEqual([
      BENCH_PRESS_ROUTINE_DRAFT_BLOCK,
      PULL_UP_ROUTINE_DRAFT_BLOCK,
      PUSH_UP_ROUTINE_DRAFT_BLOCK,
    ]);
  });

  it("keeps the blocks in place when the first block is moved up", () => {
    expect(
      moveRoutineDraftBlock({
        routineDraftBlockId: "019b0000-0000-7000-8000-000000000001",
        routineDraftBlockMoveDirection: "up",
        routineDraftBlocks: ROUTINE_DRAFT_BLOCKS,
      }),
    ).toEqual([
      BENCH_PRESS_ROUTINE_DRAFT_BLOCK,
      PUSH_UP_ROUTINE_DRAFT_BLOCK,
      PULL_UP_ROUTINE_DRAFT_BLOCK,
    ]);
  });

  it("keeps the blocks in place when the last block is moved down", () => {
    expect(
      moveRoutineDraftBlock({
        routineDraftBlockId: "019b0000-0000-7000-8000-000000000003",
        routineDraftBlockMoveDirection: "down",
        routineDraftBlocks: ROUTINE_DRAFT_BLOCKS,
      }),
    ).toEqual([
      BENCH_PRESS_ROUTINE_DRAFT_BLOCK,
      PUSH_UP_ROUTINE_DRAFT_BLOCK,
      PULL_UP_ROUTINE_DRAFT_BLOCK,
    ]);
  });

  it("keeps the blocks in place when no block has the identifier", () => {
    expect(
      moveRoutineDraftBlock({
        routineDraftBlockId: "019b0000-0000-7000-8000-000000000004",
        routineDraftBlockMoveDirection: "down",
        routineDraftBlocks: ROUTINE_DRAFT_BLOCKS,
      }),
    ).toEqual([
      BENCH_PRESS_ROUTINE_DRAFT_BLOCK,
      PUSH_UP_ROUTINE_DRAFT_BLOCK,
      PULL_UP_ROUTINE_DRAFT_BLOCK,
    ]);
  });
});
