import type { Exercise } from "#/shared/exercise-application-service.ts";

import { getExerciseSearchOptions } from "#/features/exercise/core/get-exercise-search-options.ts";

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
    { muscleGroup: "triceps", role: "secondary" },
  ],
  name: "Bench Press (Barbell)",
  weightType: "total",
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

describe("getExerciseSearchOptions", () => {
  it("returns each Equipment and each Muscle group of the Exercises once, in the order they first appear", () => {
    expect(
      getExerciseSearchOptions([OVERHEAD_PRESS_EXERCISE, BENCH_PRESS_EXERCISE]),
    ).toEqual({
      equipment: ["barbell", "rack", "bench"],
      muscleGroups: ["front_deltoid", "triceps", "chest"],
    });
  });

  it("returns no option for no Exercise", () => {
    expect(getExerciseSearchOptions([])).toEqual({
      equipment: [],
      muscleGroups: [],
    });
  });
});
