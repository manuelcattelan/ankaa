import type { RoutineDraftBlock } from "@/features/routine/core/routine-draft-reducer";

import { createRoutineDraftSections } from "@/features/routine/core/create-routine-draft-sections";

const JUMPING_JACK_ROUTINE_DRAFT_BLOCK: RoutineDraftBlock = {
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

const BENCH_PRESS_ROUTINE_DRAFT_BLOCK: RoutineDraftBlock = {
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

const PLANK_ROUTINE_DRAFT_BLOCK: RoutineDraftBlock = {
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

const ROUTINE_DRAFT_BLOCKS_BY_SECTION = {
  cool_down: [PLANK_ROUTINE_DRAFT_BLOCK],
  main: [BENCH_PRESS_ROUTINE_DRAFT_BLOCK],
  warm_up: [JUMPING_JACK_ROUTINE_DRAFT_BLOCK],
};

describe("createRoutineDraftSections", () => {
  it("fills each Section with the blocks returned for it", () => {
    expect(
      createRoutineDraftSections(
        (section) => ROUTINE_DRAFT_BLOCKS_BY_SECTION[section],
      ),
    ).toEqual({
      cool_down: [PLANK_ROUTINE_DRAFT_BLOCK],
      main: [BENCH_PRESS_ROUTINE_DRAFT_BLOCK],
      warm_up: [JUMPING_JACK_ROUTINE_DRAFT_BLOCK],
    });
  });
});
