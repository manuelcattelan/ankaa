import type { Exercise } from "@/shared/exercise-application-service";

import { searchExercises } from "@/features/exercise/core/search-exercises";

const BENCH_PRESS_EXERCISE: Exercise = {
  amountUnit: "repetition",
  exerciseEquipment: [
    { equipment: "barbell" },
    { equipment: "bench" },
    { equipment: "rack" },
  ],
  exerciseMuscleGroups: [
    { muscleGroup: "chest", muscleGroupRole: "primary" },
    { muscleGroup: "front_deltoid", muscleGroupRole: "secondary" },
    { muscleGroup: "triceps", muscleGroupRole: "secondary" },
  ],
  id: "019a0000-0000-7000-8000-000000000001",
  name: "Bench Press (Barbell)",
  weightType: "total",
};

const CLOSE_GRIP_BENCH_PRESS_EXERCISE: Exercise = {
  ...BENCH_PRESS_EXERCISE,
  exerciseMuscleGroups: [
    { muscleGroup: "chest", muscleGroupRole: "secondary" },
    { muscleGroup: "triceps", muscleGroupRole: "primary" },
  ],
  id: "019a0000-0000-7000-8000-000000000002",
  name: "Close-Grip Bench Press (Barbell)",
};

const OVERHEAD_PRESS_EXERCISE: Exercise = {
  ...BENCH_PRESS_EXERCISE,
  exerciseEquipment: [{ equipment: "barbell" }, { equipment: "rack" }],
  exerciseMuscleGroups: [
    { muscleGroup: "front_deltoid", muscleGroupRole: "primary" },
    { muscleGroup: "triceps", muscleGroupRole: "secondary" },
  ],
  id: "019a0000-0000-7000-8000-000000000003",
  name: "Overhead Press (Barbell)",
};

const PUSH_UP_EXERCISE: Exercise = {
  ...BENCH_PRESS_EXERCISE,
  exerciseEquipment: [],
  exerciseMuscleGroups: [
    { muscleGroup: "chest", muscleGroupRole: "primary" },
    { muscleGroup: "triceps", muscleGroupRole: "secondary" },
  ],
  id: "019a0000-0000-7000-8000-000000000004",
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

  it("returns the Exercises whose every Equipment is selected, including those that need none", () => {
    expect(
      searchExercises({
        ...EXERCISE_SEARCH,
        equipmentSelection: ["barbell", "rack"],
      }),
    ).toEqual([OVERHEAD_PRESS_EXERCISE, PUSH_UP_EXERCISE]);
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
