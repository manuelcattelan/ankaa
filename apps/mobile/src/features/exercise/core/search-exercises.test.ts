import type { Exercise } from "#/shared/exercise-application-service.ts";

import { searchExercises } from "#/features/exercise/core/search-exercises.ts";

const BENCH_PRESS_EXERCISE: Exercise = {
  amountUnit: "repetition",
  equipment: [
    { equipment: "barbell" },
    { equipment: "bench" },
    { equipment: "rack" },
  ],
  id: "019a0000-0000-7000-8000-000000000001",
  muscleGroups: [
    { muscleGroup: "chest", role: "primary" },
    { muscleGroup: "front_deltoid", role: "secondary" },
    { muscleGroup: "triceps", role: "secondary" },
  ],
  name: "Bench Press (Barbell)",
  weightType: "total",
};

const CLOSE_GRIP_BENCH_PRESS_EXERCISE: Exercise = {
  ...BENCH_PRESS_EXERCISE,
  id: "019a0000-0000-7000-8000-000000000002",
  muscleGroups: [
    { muscleGroup: "chest", role: "secondary" },
    { muscleGroup: "triceps", role: "primary" },
  ],
  name: "Close-Grip Bench Press (Barbell)",
};

const OVERHEAD_PRESS_EXERCISE: Exercise = {
  ...BENCH_PRESS_EXERCISE,
  equipment: [{ equipment: "barbell" }, { equipment: "rack" }],
  id: "019a0000-0000-7000-8000-000000000003",
  muscleGroups: [
    { muscleGroup: "front_deltoid", role: "primary" },
    { muscleGroup: "triceps", role: "secondary" },
  ],
  name: "Overhead Press (Barbell)",
};

const PUSH_UP_EXERCISE: Exercise = {
  ...BENCH_PRESS_EXERCISE,
  equipment: [],
  id: "019a0000-0000-7000-8000-000000000004",
  muscleGroups: [
    { muscleGroup: "chest", role: "primary" },
    { muscleGroup: "triceps", role: "secondary" },
  ],
  name: "Push-up",
  weightType: "bodyweight",
};

const EXERCISES = [
  BENCH_PRESS_EXERCISE,
  CLOSE_GRIP_BENCH_PRESS_EXERCISE,
  OVERHEAD_PRESS_EXERCISE,
  PUSH_UP_EXERCISE,
];

const EXERCISE_SEARCH = {
  equipmentSelection: [],
  exerciseNameSearchText: "",
  exercises: EXERCISES,
  muscleGroupSelection: [],
};

describe("searchExercises", () => {
  it("returns every Exercise for an empty search", () => {
    expect(searchExercises(EXERCISE_SEARCH)).toEqual(EXERCISES);
  });

  it("returns the Exercises whose name contains every word of the search text, in any order and case", () => {
    expect(
      searchExercises({
        ...EXERCISE_SEARCH,
        exerciseNameSearchText: "press BENCH",
      }),
    ).toEqual([BENCH_PRESS_EXERCISE, CLOSE_GRIP_BENCH_PRESS_EXERCISE]);
  });

  it("returns no Exercise when a word of the search text matches no name", () => {
    expect(
      searchExercises({
        ...EXERCISE_SEARCH,
        exerciseNameSearchText: "bench squat",
      }),
    ).toEqual([]);
  });

  it("returns the Exercises that train a selected Muscle group, as primary or secondary", () => {
    expect(
      searchExercises({
        ...EXERCISE_SEARCH,
        muscleGroupSelection: ["front_deltoid"],
      }),
    ).toEqual([BENCH_PRESS_EXERCISE, OVERHEAD_PRESS_EXERCISE]);
  });

  it("returns the Exercises that use any selected Equipment, even when they also use Equipment that isn't selected", () => {
    expect(
      searchExercises({
        ...EXERCISE_SEARCH,
        equipmentSelection: ["barbell"],
      }),
    ).toEqual([
      BENCH_PRESS_EXERCISE,
      CLOSE_GRIP_BENCH_PRESS_EXERCISE,
      OVERHEAD_PRESS_EXERCISE,
    ]);
  });

  it("returns the Exercises that match the search text, the Muscle groups and the Equipment together", () => {
    expect(
      searchExercises({
        equipmentSelection: ["barbell", "bench", "rack"],
        exerciseNameSearchText: "press",
        exercises: EXERCISES,
        muscleGroupSelection: ["chest"],
      }),
    ).toEqual([BENCH_PRESS_EXERCISE, CLOSE_GRIP_BENCH_PRESS_EXERCISE]);
  });
});
