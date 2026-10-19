import { describe, expect, it } from "@effect/vitest";

import { buildRoutineList } from "./build-routine-list.ts";

const ROUTINE_ROWS = [
  {
    id: "019a0000-0000-7000-8000-000000000001",
    name: "Pull",
    routineDays: [
      { dayOfWeek: "sunday" as const },
      { dayOfWeek: "monday" as const },
      { dayOfWeek: "wednesday" as const },
    ],
    routineExercises: [
      {
        exerciseId: "019a0000-0000-7000-8000-000000000021",
        id: "019a0000-0000-7000-8000-000000000011",
        routineExerciseSets: [
          { id: "019a0000-0000-7000-8000-000000000031", position: 0 },
          { id: "019a0000-0000-7000-8000-000000000032", position: 1 },
        ],
      },
      {
        exerciseId: "019a0000-0000-7000-8000-000000000022",
        id: "019a0000-0000-7000-8000-000000000012",
        routineExerciseSets: [],
      },
    ],
  },
  {
    id: "019a0000-0000-7000-8000-000000000002",
    name: "Push",
    routineDays: [],
    routineExercises: [],
  },
];

describe("buildRoutineList", () => {
  it("orders the days of each Routine from Monday to Sunday", () => {
    const routines = buildRoutineList(ROUTINE_ROWS);

    expect(routines).toMatchObject([
      { days: ["monday", "wednesday", "sunday"] },
      { days: [] },
    ]);
  });

  it("returns each Routine with its id, its name and its Routine exercises, each with its Sets", () => {
    const routines = buildRoutineList(ROUTINE_ROWS);

    expect(routines).toStrictEqual([
      {
        days: ["monday", "wednesday", "sunday"],
        exercises: [
          {
            exerciseId: "019a0000-0000-7000-8000-000000000021",
            id: "019a0000-0000-7000-8000-000000000011",
            sets: [
              { id: "019a0000-0000-7000-8000-000000000031", position: 0 },
              { id: "019a0000-0000-7000-8000-000000000032", position: 1 },
            ],
          },
          {
            exerciseId: "019a0000-0000-7000-8000-000000000022",
            id: "019a0000-0000-7000-8000-000000000012",
            sets: [],
          },
        ],
        id: "019a0000-0000-7000-8000-000000000001",
        name: "Pull",
      },
      {
        days: [],
        exercises: [],
        id: "019a0000-0000-7000-8000-000000000002",
        name: "Push",
      },
    ]);
  });
});
